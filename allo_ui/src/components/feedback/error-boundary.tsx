'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {}

  render(): ReactNode {
    if (this.state.hasError) {
      return <div className="rounded-md border border-danger/60 bg-red-100 p-4 text-danger">UI error occurred.</div>;
    }

    return this.props.children;
  }
}
