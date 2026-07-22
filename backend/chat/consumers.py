import json

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

        # Reject if user is unauthenticated or anonymous
        if not self.user or getattr(self.user, "is_anonymous", False):
            await self.close()
            return

        valid = await self._connection_is_valid(self.room_id, self.user.id)
        if not valid:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        text = data.get("text", "").strip()
        if not text:
            return

        message_payload = await self._save_message_and_translate(self.room_id, self.user, text)

        # Broadcast payload containing all recipient translations
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
    def _save_message_and_translate(self, room_id, sender, text):
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
        target_languages = {m.user.preferred_language for m in other_members if m.user.preferred_language}

        translations = {}
        confidence = {}
        for lang in target_languages:
            translated_text, conf = translate(text, sender.preferred_language, lang)
            Translation.objects.create(
                message=msg,
                target_language=lang,
                translated_text=translated_text,
                confidence=conf,
            )
            translations[lang] = translated_text
            confidence[lang] = conf

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