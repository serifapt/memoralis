/**
 * Ícone decorativo da cruz cristã — canto superior direito do frame A4-3.
 * Dimensões Figma: 51.727 × 79.239 px, cor #6c727f (opacidade reduzida).
 */
export function CrossSymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="52"
      height="80"
      viewBox="0 0 52 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Barra vertical */}
      <rect x="22" y="0" width="8" height="80" rx="2" fill="#6c727f" fillOpacity="0.45" />
      {/* Barra horizontal */}
      <rect x="0" y="18" width="52" height="8" rx="2" fill="#6c727f" fillOpacity="0.45" />
    </svg>
  );
}
