export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Placeholder mark — swap the <svg> below for your real logo file */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="8" fill="var(--color-ink)" />
        <circle cx="14" cy="12" r="5" fill="var(--color-paper)" />
        <rect x="9" y="18" width="10" height="3" rx="1.5" fill="var(--color-paper)" />
      </svg>
      <span className="font-display font-semibold text-[17px] tracking-tight">
        GhostReveal
      </span>
    </div>
  );
}
