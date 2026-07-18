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

export const ROOMS = [
  // TEMPORARY — id/name matched to the real backend Room for Milestone 5
  // testing. Real room data comes from the REST API in Milestone 6.
  {
    id: '1',
    name: 'BCT Group',
    isGroup: false,
    isOnline: true,
    members: [
      { id: 'alex', name: 'Alex Chen', language: 'en' },
      { id: 'priya', name: 'Priya Sharma', language: 'ne' },
    ],
    messages: [],
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
        text: 'Bonjour à tous ! Prêts pour le standup ?',
        translations: { en: 'Hello everyone! Ready for standup?', es: '¡Hola a todos! ¿Listos para el standup?' },
        originalLang: 'fr',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        confidence: { en: 'high', es: 'medium' },
      },
      {
        id: 'g2',
        senderId: 'sofia',
        text: '¡Sí, todo listo!',
        translations: { en: 'Yes, all ready!', fr: 'Oui, tout est prêt !' },
        originalLang: 'es',
        timestamp: new Date(Date.now() - 28 * 60 * 1000),
        confidence: { en: 'high', fr: 'high' },
      },
    ],
  },
];