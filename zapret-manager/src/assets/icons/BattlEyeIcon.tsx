export interface BrandGlyphProps {
  className?: string;
}

export function BattlEyeIcon({ className }: BrandGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.5 20.5 5v6.6c0 4.6-3.5 8.4-8.5 9.9-5-1.5-8.5-5.3-8.5-9.9V5L12 2.5Zm0 3.1a2.6 2.6 0 0 0-1.2 4.95c.62.42.96 1.1.96 1.85v3.5h.48v-3.5c0-.75.34-1.43.96-1.85A2.6 2.6 0 0 0 12 5.6Zm0 2a.6.6 0 1 1 0 1.2.6.6 0 0 1 0-1.2Z"
      />
    </svg>
  );
}
