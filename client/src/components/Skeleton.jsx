import PropTypes from 'prop-types';

export function Skeleton({ className = '', ...props }) {
  return <div className={`shimmer rounded-xl ${className}`} aria-hidden="true" {...props} />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${index === lines - 1 ? 'w-2/3' : index === 0 ? 'w-2/5' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-panel rounded-xl p-6 ${className}`} aria-hidden="true">
      <Skeleton className="mb-4 h-5 w-2/5" />
      <Skeleton className="mb-3 h-4 w-3/4" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    </div>
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
};

SkeletonText.propTypes = {
  lines: PropTypes.number,
  className: PropTypes.string,
};

SkeletonCard.propTypes = {
  className: PropTypes.string,
};
