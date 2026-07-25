import PropTypes from 'prop-types';

const SIMPLE_ICONS_BASE = 'https://cdn.simpleicons.org';

export default function RealLogo({ slug, color = '7c3aed', size = 18, alt = '', className = '' }) {
  const src = `${SIMPLE_ICONS_BASE}/${slug}/${color}`;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable="false"
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
    />
  );
}

RealLogo.propTypes = {
  slug: PropTypes.string.isRequired,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  alt: PropTypes.string,
  className: PropTypes.string,
};
