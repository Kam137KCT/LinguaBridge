const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${response.status}`);
  }
  return response.json();
}

export function listRooms(userId) {
  return request(`/rooms/?user_id=${userId}`);
}

export function createRoom(userId, name, isGroup) {
  return request('/rooms/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, name, is_group: isGroup }),
  });
}

export function joinRoom(userId, inviteCode) {
  return request('/rooms/join/', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, invite_code: inviteCode }),
  });
}

export function getMessageHistory(roomId, userId) {
  return request(`/rooms/${roomId}/messages/?user_id=${userId}`);
}