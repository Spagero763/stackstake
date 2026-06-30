import { Component } from 'react'

// Catch render errors in the tree below and show a fallback instead of
// a blank white screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <button type="button" onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
