from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from .models import Room, RoomMembership, Message
from .serializers import RoomSerializer, MessageSerializer


def clean_int(value):
    """Safely converts input data to an integer or returns None if malformed."""
    try:
        return int(str(value))
    except (ValueError, TypeError):
        return None


class MessageHistoryPagination(PageNumberPagination):
    page_size = 30


class RoomListCreateView(APIView):
    """
    GET  /api/rooms/?user_id=<id>          -> rooms the user belongs to
    POST /api/rooms/  {user_id, name, is_group}  -> create room + membership

    TEMPORARY: user_id is a plain request param until JWT auth
    (Milestone 7) replaces it with request.user.
    """

    def get(self, request):
        user_id = clean_int(request.query_params.get("user_id"))
        if not user_id:
            return Response({"detail": "A valid numeric user_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        rooms = Room.objects.filter(memberships__user_id=user_id).distinct()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    def post(self, request):
        user_id = clean_int(request.data.get("user_id"))
        name = request.data.get("name", "").strip()
        is_group = bool(request.data.get("is_group", False))

        if not user_id or not name:
            return Response({"detail": "A valid numeric user_id and name are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)
        room = Room.objects.create(name=name, is_group=is_group, created_by=user)
        RoomMembership.objects.create(room=room, user=user)

        serializer = RoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoomJoinView(APIView):
    """POST /api/rooms/join/  {user_id, invite_code}"""

    def post(self, request):
        user_id = clean_int(request.data.get("user_id"))
        invite_code = request.data.get("invite_code", "").strip().upper()

        if not user_id or not invite_code:
            return Response({"detail": "A valid numeric user_id and invite_code are required"}, status=status.HTTP_400_BAD_REQUEST)

        room = Room.objects.filter(invite_code=invite_code).first()
        if not room:
            return Response({"detail": "No room found with that code."}, status=status.HTTP_404_NOT_FOUND)

        user = get_object_or_404(User, id=user_id)
        RoomMembership.objects.get_or_create(room=room, user=user)

        serializer = RoomSerializer(room)
        return Response(serializer.data)


class MessageHistoryView(APIView):
    """GET /api/rooms/<room_id>/messages/?user_id=<id>

    user_id is only used here to confirm membership (permission check),
    NOT to determine translation language — the message already carries
    translations for every language present in the room, and the
    frontend picks out its own language client-side, same as the live
    WebSocket payload.
    """

    pagination_class = MessageHistoryPagination

    def get(self, request, room_id):
        user_id = clean_int(request.query_params.get("user_id"))
        if not user_id:
            return Response({"detail": "A valid numeric user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        room = get_object_or_404(Room, id=room_id)
        is_member = RoomMembership.objects.filter(room=room, user_id=user_id).exists()
        if not is_member:
            return Response({"detail": "Not a member of this room."}, status=status.HTTP_403_FORBIDDEN)

        messages = (
            Message.objects.filter(room=room)
            .select_related("sender")
            .prefetch_related("translations")
            .order_by("-created_at")
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(messages, request)
        page.reverse()
        serializer = MessageSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)