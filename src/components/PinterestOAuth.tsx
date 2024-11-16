import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/slices/authSlice'

const PINTEREST_CLIENT_ID = import.meta.env.VITE_PINTEREST_CLIENT_ID
const PINTEREST_REDIRECT_URI = import.meta.env.VITE_PINTEREST_REDIRECT_URI
const PINTEREST_SCOPE = import.meta.env.VITE_PINTEREST_SCOPE
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export default function PinterestOAuth() {
  const dispatch = useDispatch()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Handle OAuth callback
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        console.error('Pinterest OAuth error:', error)
        setError('Failed to authenticate with Pinterest')
        return
      }

      if (code) {
        setIsLoading(true)
        try {
          // Exchange code for access token
          const response = await fetch(`${API_URL}/oauth/pinterest/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          })

          if (!response.ok) {
            throw new Error('Failed to exchange code for token')
          }

          const { access_token, user } = await response.json()

          // Store credentials in Redux
          dispatch(
            setCredentials({
              token: access_token,
              user: {
                id: user.id,
                name: user.username,
                email: user.email,
              },
            })
          )

          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (error) {
          console.error('Failed to complete OAuth:', error)
          setError('Failed to complete authentication')
        } finally {
          setIsLoading(false)
        }
      }
    }

    handleCallback()
  }, [dispatch])

  const handleLogin = () => {
    if (!PINTEREST_CLIENT_ID || !PINTEREST_REDIRECT_URI) {
      setError('Pinterest OAuth credentials not configured')
      return
    }

    const authUrl = new URL('https://www.pinterest.com/oauth/')
    authUrl.searchParams.append('client_id', PINTEREST_CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', PINTEREST_REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', PINTEREST_SCOPE)

    window.location.href = authUrl.toString()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connect with Pinterest
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Authorize access to manage your Pinterest account
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-primary-500 group-hover:text-primary-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm-2-14v8l6-4z" />
              </svg>
            </span>
            {isLoading ? 'Connecting...' : 'Connect with Pinterest'}
          </button>
        </div>

        <div className="mt-6">
          <p className="text-center text-xs text-gray-500">
            By connecting, you agree to Pinterest's Terms of Service and Privacy
            Policy
          </p>
        </div>
      </div>
    </div>
  )
}
