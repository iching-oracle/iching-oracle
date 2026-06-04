"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorFallback } from "@/components/errors/error-fallback";
import { reportClientError } from "@/lib/monitoring/report-error";

type Props = {
  children: ReactNode;
  /** Optional segment label for Sentry */
  segment?: string;
  title?: string;
  message?: string;
};

type State = { error: Error | null };

/**
 * Class error boundary for client segments (dashboard widgets, modals, etc.).
 */
export class ReactErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError(error, {
      component: this.props.segment ?? "react-error-boundary",
      path: info.componentStack?.slice(0, 200),
    });
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          title={this.props.title ?? "This section stumbled"}
          message={
            this.props.message ??
            "Something went wrong in this part of the page. The rest of the app should still work."
          }
          reset={() => this.setState({ error: null })}
          showHome={false}
        />
      );
    }
    return this.props.children;
  }
}
