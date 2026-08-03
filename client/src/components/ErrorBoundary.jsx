import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import Badge from './Badge';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
          <div className="card-surface error-panel max-w-md">
            <div className="card-header">
              <div className="card-header__main">
                <span className="card-header__icon text-error" aria-hidden="true">
                  <AlertTriangle size={16} strokeWidth={1.8} />
                </span>
                <h2 className="card-title text-error">Something went wrong</h2>
              </div>
              <Badge status="soldOut">Error</Badge>
            </div>
            <div className="card-body">
              <p className="text-sm text-foreground-muted">
                {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
