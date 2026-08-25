const PALETTE = ['#1F8A82', '#D4A017', '#6B5B95', '#C0392B', '#2E7D6B', '#8E5A2E'];

function hashName(name) {
  let hash = 0;
  const str = name || '';
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

export default function Avatar({ name = '', size = 36, isGroup = false }) {
  const safeName = name || '';
  const initials = isGroup
    ? '#'
    : safeName.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
  const color = PALETTE[hashName(safeName) % PALETTE.length];

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, background: color, color: 'white', fontSize: size * 0.4, fontFamily: 'var(--font-display, inherit)' }}
    >
      {initials}
    </div>
  );
}