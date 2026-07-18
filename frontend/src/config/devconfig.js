// TEMPORARY — replaced once real login (Milestone 7) and room
// selection (Milestone 6) exist. Fill these in with YOUR actual
// database IDs from /admin/ (they'll differ per machine).
//
// From your last shell dump:
//   alex   -> id=2, preferred_language='en'
//   priya  -> id=3, preferred_language='ne'
//   BCT Group room -> id=1

//export const DEV_CURRENT_USER_ID = 2;       // "alex"
//export const DEV_CURRENT_USER_LANGUAGE = 'en';
//export const DEV_ROOM_ID = 1;               // "BCT Group"

//export const WS_BASE_URL = 'ws://127.0.0.1:8000';

// src/config/devConfig.js
const params = new URLSearchParams(window.location.search);

export const DEV_CURRENT_USER_ID = Number(params.get('user_id')) || 2;   // default: alex
export const DEV_CURRENT_USER_LANGUAGE = params.get('user_id') === '3' ? 'ne' : 'en';
export const DEV_ROOM_ID = 1;

export const WS_BASE_URL = 'ws://127.0.0.1:8000';