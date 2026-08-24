export default function CampusLogoIcon({ className = '' }) {
  return (
    <svg
      className={`h-full w-full ${className}`}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Campus Navigator logo"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <rect width="64" height="64" rx="12" fill="currentColor" />
      <path
        d="M20 44c6-6.5 14-16 14-22 0-5-4-8-9-8s-9 3-9 8c0 6 8 15.5 14 22z"
        fill="#fff"
        opacity="0.96"
      />
      <path d="M33 26l8 5-8 5-8-5 8-5z" fill="#fff" opacity="0.96" />
      <circle cx="33" cy="29" r="3.2" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
