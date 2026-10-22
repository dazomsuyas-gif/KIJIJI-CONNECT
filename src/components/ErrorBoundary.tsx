import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('An application view failed to render.', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="route-not-found" role="alert">
          <span className="eyebrow">Something went wrong</span>
          <h1>This page could not be displayed.</h1>
          <p>Your browser-local demo data has not been intentionally changed.</p>
          <a className="primary-button" href="/">Return home</a>
        </main>
      )
    }

    return this.props.children
  }
}
