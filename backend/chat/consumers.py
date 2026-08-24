import json
import asyncio

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Room, Message, RoomMembership
from translation.models import Translation
from translation.services import translate


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"
        self.user = self.scope.get("user")

        if not self.user or getattr(self.user, "is_anonymous", False):
            print("WS Reject: Invalid or missing User token")
            await self.accept()
            await self.close(code=4003)
            return

        valid = await self._connection_is_valid(self.room_id, self.user.id)
        if not valid:
            print(f"WS Reject: User {self.user.id} is not a member of Room {self.room_id}")
            await self.accept()
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        # Also includes the fix for Issue #4 (Unhandled Exception on Invalid JSON)
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        text = data.get("text", "").strip()
        if not text:
            return

        # 1. Save the initial message and determine required languages (Fast DB operation)
        msg_id, target_languages = await self._save_message_and_get_targets(
            self.room_id, self.user, text
        )

        # 2. Run heavy PyTorch translations concurrently in background threads
        tasks = [
            asyncio.to_thread(translate, text, self.user.preferred_language, lang)
            for lang in target_languages
        ]
        
        # Wait for all languages to finish translating simultaneously
        results = await asyncio.gather(*tasks) if tasks else []
        translation_results = dict(zip(target_languages, results))

        # 3. Save translations and get the final broadcast payload (Fast DB operation)
        message_payload = await self._save_translations_and_build_payload(
            self.room_id, self.user, text, msg_id, translation_results
        )

        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message_payload},
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def _connection_is_valid(self, room_id, user_id):
        if not user_id:
            return False
        return RoomMembership.objects.filter(room_id=room_id, user_id=user_id).exists()

    @database_sync_to_async
    def _save_message_and_get_targets(self, room_id, sender, text):
        room = Room.objects.get(id=room_id)

        msg = Message.objects.create(
            room=room,
            sender=sender,
            text=text,
            original_language=sender.preferred_language,
        )

        other_members = (
            RoomMembership.objects.filter(room=room)
            .exclude(user=sender)
            .select_related("user")
        )
        
        # Convert set to a list so order is preserved for dict(zip(...)) later
        target_languages = list({m.user.preferred_language for m in other_members if m.user.preferred_language})
        
        return msg.id, target_languages

    @database_sync_to_async
    def _save_translations_and_build_payload(self, room_id, sender, text, msg_id, translation_results):
        msg = Message.objects.get(id=msg_id)
        room = Room.objects.get(id=room_id)

        translations = {}
        confidence = {}
        db_translations = []

        for lang, (translated_text, conf) in translation_results.items():
            db_translations.append(
                Translation(
                    message=msg,
                    target_language=lang,
                    translated_text=translated_text,
                    confidence=conf,
                )
            )
            translations[lang] = translated_text
            confidence[lang] = conf

        # Use bulk_create for performance
        if db_translations:
            Translation.objects.bulk_create(db_translations, ignore_conflicts=True)

        return {
            "id": msg.id,
            "roomId": room.id,
            "senderId": sender.id,
            "senderName": sender.username,
            "text": text,
            "originalLanguage": sender.preferred_language,
            "translations": translations,
            "confidence": confidence,
            "timestamp": msg.created_at.isoformat(),
        }