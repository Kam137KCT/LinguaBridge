export const LANGUAGE_LABELS = {
  en: 'EN',
  ne: 'NE',
  fr: 'FR',
  es: 'ES',
};

export const LANGUAGE_NAMES = {
  en: 'English',
  ne: 'Nepali',
  fr: 'French',
  es: 'Spanish',
};

export const CURRENT_USER = {
  id: 'me',
  name: 'Alex Chen',
  language: 'en',
};

// Each room has its own list of members with their own language —
// this reflects the real per-recipient translation model, not a
// single "conversation language."
export const ROOMS = [
  {
    id: '1',
    name: 'Priya Sharma',
    isGroup: false,
    isOnline: true,
    members: [
      { id: 'me', name: 'Alex Chen', language: 'en' },
      { id: 'priya', name: 'Priya Sharma', language: 'ne' },
    ],
    messages: [
      {
        id: 'm1',
        senderId: 'priya',
        text: 'नमस्ते! भोलि भेटौं?',
        translations: { en: 'Hello! Shall we meet tomorrow?' },
        originalLang: 'ne',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        confidence: { en: 'high' },
      },
      {
        id: 'm2',
        senderId: 'me',
        text: "Sure! How about 3pm at the usual place?",
        translations: { ne: 'हुन्छ! सामान्य ठाउँमा ३ बजे कस्तो?' },
        originalLang: 'en',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        confidence: { ne: 'high' },
      },
      {
        id: 'm3',
        senderId: 'priya',
        text: 'एकदम राम्रो! त्यहाँ भेटौंला।',
        translations: { en: null }, // triggers "Translation unavailable"
        originalLang: 'ne',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        confidence: {},
      },
    ],
  },
  {
    id: '2',
    name: 'Project Team',
    isGroup: true,
    isOnline: true,
    members: [
      { id: 'me', name: 'Alex Chen', language: 'en' },
      { id: 'lucas', name: 'Lucas Martin', language: 'fr' },
      { id: 'sofia', name: 'Sofia Rodriguez', language: 'es' },
    ],
    messages: [
      {
        id: 'g1',
        senderId: 'lucas',
        text: 'Bonjour \u00e0 tous ! Pr\u00eats pour le standup ?',
        translations: { en: 'Hello everyone! Ready for standup?', es: '\u00a1Hola a todos! \u00bfListos para el standup?' },
        originalLang: 'fr',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        confidence: { en: 'high', es: 'medium' },
      },
      {
        id: 'g2',
        senderId: 'sofia',
        text: '\u00a1S\u00ed, todo listo!',
        translations: { en: 'Yes, all ready!', fr: 'Oui, tout est pr\u00eat !' },
        originalLang: 'es',
        timestamp: new Date(Date.now() - 28 * 60 * 1000),
        confidence: { en: 'high', fr: 'high' },
      },
    ],
  },
];