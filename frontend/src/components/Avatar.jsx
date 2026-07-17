const PALETTE = ['#1F8A82', '#D4A017', '#6B5B95', '#C0392B', '#2E7D6B', '#8E5A2E'];

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

export default function Avatar({ name, size = 36, isGroup = false }) {
  const initials = isGroup
    ? '#'
    : name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const color = PALETTE[hashName(name) % PALETTE.length];

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-display font-600"
      style={{ width: size, height: size, background: color, color: 'white', fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}