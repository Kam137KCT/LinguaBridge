from rest_framework import serializers

from .models import Room, Message
from translation.models import Translation


class RoomMemberSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(source="username")
    language = serializers.CharField(source="preferred_language")


class RoomSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ["id", "name", "is_group", "invite_code", "members"]

    def get_members(self, room):
        users = [m.user for m in room.memberships.select_related("user").all()]
        return RoomMemberSerializer(users, many=True).data


class MessageSerializer(serializers.ModelSerializer):
    """Reuses the same translations/confidence dict shape the WebSocket
    consumer already broadcasts, so the frontend's normalizeMessage()
    doesn't need a separate code path for history vs. live messages."""

    roomId = serializers.IntegerField(source="room.id")
    senderId = serializers.IntegerField(source="sender.id")
    senderName = serializers.CharField(source="sender.username")
    originalLanguage = serializers.CharField(source="original_language")
    translations = serializers.SerializerMethodField()
    confidence = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source="created_at")

    class Meta:
        model = Message
        fields = [
            "id", "roomId", "senderId", "senderName", "text", "originalLanguage",
            "translations", "confidence", "timestamp",
        ]

    def get_translations(self, message):
        return {t.target_language: t.translated_text for t in message.translations.all()}

    def get_confidence(self, message):
        return {t.target_language: t.confidence for t in message.translations.all()}