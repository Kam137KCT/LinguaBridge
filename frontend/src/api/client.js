const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const ACCESS_KEY = 'lb_access_token';
const REFRESH_KEY = 'lb_refresh_token';

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

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

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) return null;

    const data = await response.json();
    setTokens({ access: data.access, refresh: data.refresh });
    return data.access;
  } catch {
    return null;
  }
}

async function request(path, options = {}, retried = false) {
  const token = getAccessToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && !retried) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        headers['Authorization'] = `Bearer ${token}`;
        return fetch(`${API_BASE_URL}${path}`, { ...options, headers }).then(res => {
          if (!res.ok) throw new Error(`Request failed: ${res.status}`);
          return res.status === 204 ? null : res.json();
        });
      }).catch(err => {
        throw err;
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      if (newToken) {
        processQueue(null, newToken);
        return request(path, options, true);
      } else {
        processQueue(new Error('Session expired'));
        clearTokens();
        throw new Error('Session expired. Please log in again.');
      }
    } catch (err) {
      isRefreshing = false;
      processQueue(err);
      throw err;
    }
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

// --- Rooms ---
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