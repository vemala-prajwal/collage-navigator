const logoMap = {
  googlemaps: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6-5.27-6-10a6 6 0 1112 0c0 4.73-6 10-6 10z" />
      <circle cx="12" cy="10" r="2.5" fill="currentColor" />
    </svg>
  ),
  google: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M12 5h5a5 5 0 010 10h-5" />
      <path d="M12 15h-5a5 5 0 100 10h5" transform="translate(0 -6)" />
    </svg>
  ),
  googlestreetview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c3.31 0 6 2.69 6 6v7.5a3.5 3.5 0 11-7 0V9" />
      <circle cx="12" cy="9" r="2.5" fill="currentColor" />
    </svg>
  ),
};

function normalizeColor(color) {
  if (!color) return '#000';
  return color.startsWith('#') ? color : `#${color}`;
}

export default function RealLogo({ slug, color = '000', size = 18, alt }) {
  const logo = logoMap[slug?.toLowerCase()] ?? logoMap.google;
  const iconColor = normalizeColor(color);
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      role={alt ? 'img' : undefined}
      aria-label={alt}
      title={alt}
      className="inline-flex items-center justify-center"
      style={{ width: pixelSize, height: pixelSize, color: iconColor }}
    >
      {logo}
    </span>
  );
}
