"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
	hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error("ui_error_boundary_caught", { error, errorInfo });
	}

	render(): ReactNode {
		if (this.state.hasError) {
			return (
				<div className="rounded-md border border-danger/60 bg-red-100 p-4 text-danger">
					UI error occurred.
				</div>
			);
		}

		return this.props.children;
	}
}
