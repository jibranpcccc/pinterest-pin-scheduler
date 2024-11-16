import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900">
                Something went wrong
              </h3>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {this.state.error?.message}
              </p>

              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-700 overflow-auto">
                  {this.state.error?.stack}
                </pre>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                Try Again
              </button>

              <a
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Return to home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900">
                  Component Stack
                </h4>
                <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
