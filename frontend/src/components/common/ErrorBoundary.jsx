import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;
    if (hasError) {
      return fallback || (
        <div className="p-6 max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong.</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 border-2 border-black hover:bg-[#23f47d]"
          >
            Reload
          </button>
        </div>
      );
    }
    return children;
  }
}

export default ErrorBoundary;
