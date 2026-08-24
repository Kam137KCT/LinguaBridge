from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Room, RoomMembership, Message
from .serializers import RoomSerializer, MessageSerializer
from translation.models import Translation
from translation.services import translate


class MessageHistoryPagination(PageNumberPagination):
    page_size = 30


class RoomListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        rooms = Room.objects.filter(memberships__user=request.user).distinct()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get("name", "").strip()
        is_group = bool(request.data.get("is_group", False) or request.data.get("isGroup", False))

        if not name:
            return Response(
                {"detail": "Name is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        room = Room.objects.create(name=name, is_group=is_group, created_by=request.user)
        RoomMembership.objects.create(room=room, user=request.user)

        serializer = RoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoomJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Safely check for either snake_case or camelCase
        raw_code = request.data.get("invite_code") or request.data.get("inviteCode", "")
        invite_code = raw_code.strip().upper()
        
        if not invite_code:
            return Response(
                {"detail": "Invite code is required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        room = Room.objects.filter(invite_code=invite_code).first()
        if not room:
            return Response(
                {"detail": "No room found with that code."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        RoomMembership.objects.get_or_create(room=room, user=request.user)
        serializer = RoomSerializer(room)
        return Response(serializer.data)


class MessageHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessageHistoryPagination

    def get(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)

        if not RoomMembership.objects.filter(room=room, user=request.user).exists():
            return Response(
                {"detail": "Not a member of this room."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        user_lang = request.user.preferred_language

        base_queryset = (
            Message.objects.filter(room=room)
            .select_related("sender")
            .order_by("-created_at")
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(base_queryset, request)
        if page is None:
            return Response([])

        page_ids = [msg.id for msg in page]

        # 1. Batch existence check to prevent N+1 queries
        existing_translation_msg_ids = set(
            Translation.objects.filter(
                message_id__in=page_ids, 
                target_language=user_lang
            ).values_list("message_id", flat=True)
        )

        # 2. Build missing translations in memory
        new_translations = []
        for msg in page:
            if msg.id not in existing_translation_msg_ids:
                translated_text, confidence = translate(
                    msg.text, msg.original_language, user_lang
                )
                new_translations.append(
                    Translation(
                        message=msg,
                        target_language=user_lang,
                        translated_text=translated_text,
                        confidence=confidence,
                    )
                )

        # 3. Bulk insert to reduce DB writes to 1 query
        if new_translations:
            Translation.objects.bulk_create(new_translations, ignore_conflicts=True)

        # 4. Re-fetch with prefetch so serializer sees up-to-date translations
        fresh_messages = (
            Message.objects.filter(id__in=page_ids)
            .select_related("sender")
            .prefetch_related("translations")
            .order_by("-created_at")
        )

        serializer = MessageSerializer(fresh_messages, many=True)
        return paginator.get_paginated_response(serializer.data)