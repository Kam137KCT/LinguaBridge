from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Room, RoomMembership, Message
from .serializers import RoomSerializer, MessageSerializer


class MessageHistoryPagination(PageNumberPagination):
    page_size = 30


class RoomListCreateView(APIView):
    """
    GET  /api/rooms/                  -> Get rooms the authenticated user belongs to
    POST /api/rooms/ {name, is_group} -> Create a new room + creator membership
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        rooms = Room.objects.filter(memberships__user=request.user).distinct()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get("name", "").strip()
        is_group = bool(request.data.get("is_group", False))

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
    """
    POST /api/rooms/join/ {invite_code} -> Join a room using an invite code
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        invite_code = request.data.get("invite_code", "").strip().upper()
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
    """
    GET /api/rooms/<room_id>/messages/ -> Fetch paginated chat history for a room
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessageHistoryPagination

    def get(self, request, room_id):
        room = get_object_or_404(Room, id=room_id)

        # Check membership against the authenticated user
        if not RoomMembership.objects.filter(room=room, user=request.user).exists():
            return Response(
                {"detail": "Not a member of this room."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        messages = (
            Message.objects.filter(room=room)
            .select_related("sender")
            .prefetch_related("translations")
            .order_by("-created_at")
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(messages, request)
        if page is not None:
            # Reverse the page list so newest batch displays chronologically (oldest -> newest)
            page.reverse()
            serializer = MessageSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)