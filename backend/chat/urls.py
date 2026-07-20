from django.urls import path

from .views import RoomListCreateView, RoomJoinView, MessageHistoryView

urlpatterns = [
    path("rooms/", RoomListCreateView.as_view(), name="room-list-create"),
    path("rooms/join/", RoomJoinView.as_view(), name="room-join"),
    path("rooms/<int:room_id>/messages/", MessageHistoryView.as_view(), name="room-messages"),
]