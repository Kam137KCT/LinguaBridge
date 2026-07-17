// Postmark logo mark — used in LoginPage, RegisterPage, and the Sidebar header
export default function Postmark({ size = 44 }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full border-2 border-dashed"
      style={{
        width: size,
        height: size,
        borderColor: 'var(--color-bridge)',
        transform: 'rotate(-6deg)',
      }}
    >
      <span
        className="font-display font-600 leading-none"
        style={{ fontSize: size * 0.36, color: 'var(--color-bridge)' }}
      >
        LB
      </span>
    </div>
  );
}