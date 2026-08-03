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
    <div className={`card-surface skeleton-card ${className}`} aria-hidden="true">
      <div className="card-header">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <div className="card-body">
        <Skeleton className="h-4 w-3/4" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>
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
