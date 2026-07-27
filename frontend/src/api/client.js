const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ACCESS_KEY = 'lb_access_token';
const REFRESH_KEY = 'lb_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens({ access, refresh }) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) return null;

  const data = await response.json();
  // ROTATE_REFRESH_TOKENS is on server-side, so a new refresh token
  // comes back with every refresh — must be saved, or the next
  // refresh attempt uses an already-blacklisted token and fails.
  setTokens({ access: data.access, refresh: data.refresh });
  return data.access;
}

async function request(path, options = {}, retried = false) {
  const token = getAccessToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && !retried) {
    const newToken = await refreshAccessToken();
    if (newToken) return request(path, options, true);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

// --- Auth ---
export function register({ username, email, password, firstName, lastName, preferredLanguage }) {
  return request('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      username, email, password,
      first_name: firstName, last_name: lastName,
      preferred_language: preferredLanguage,
    }),
  });
}

export async function login(identifier, password) {
  const data = await request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username: identifier, password }),
  });
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export function getMe() {
  return request('/auth/me/');
}

export function updateMe(preferredLanguage) {
  return request('/auth/me/', {
    method: 'PATCH',
    body: JSON.stringify({ preferred_language: preferredLanguage }),
  });
}

// --- Rooms (identity comes from the JWT automatically — no user_id needed) ---
export function listRooms() {
  return request('/rooms/');
}

export function createRoom(name, isGroup) {
  return request('/rooms/', {
    method: 'POST',
    body: JSON.stringify({ name, is_group: isGroup }),
  });
}

export function joinRoom(inviteCode) {
  return request('/rooms/join/', {
    method: 'POST',
    body: JSON.stringify({ invite_code: inviteCode }),
  });
}

export function getMessageHistory(roomId) {
  return request(`/rooms/${roomId}/messages/`);
}