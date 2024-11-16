import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials } from '../../store/slices/authSlice'
import { toast } from 'react-hot-toast'

const PINTEREST_AUTH_URL = `https://www.pinterest.com/oauth/authorize?client_id=${
  import.meta.env.VITE_PINTEREST_CLIENT_ID
}&redirect_uri=${encodeURIComponent(
  import.meta.env.VITE_PINTEREST_REDIRECT_URI
)}&response_type=code&scope=boards:read,pins:read,pins:write`

export default function PinterestOAuth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')

    if (error) {
      toast.error('Failed to authenticate with Pinterest')
      navigate('/login')
      return
    }

    if (code) {
      handleAuthCode(code)
    }
  }, [])

  const handleAuthCode = async (code: string) => {
    setIsLoading(true)
    try {
      // In development, we'll use mock data
      if (import.meta.env.DEV) {
        dispatch(
          setCredentials({
            user: {
              id: 'mock-user-id',
              name: 'Test User',
              email: 'test@example.com',
              avatar: 'https://via.placeholder.com/150',
            },
            token: 'mock-token',
          })
        )
        toast.success('Successfully logged in')
        navigate('/')
        return
      }

      // For production, implement actual OAuth token exchange
      const response = await fetch('/api/auth/pinterest/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange auth code')
      }

      const data = await response.json()
      dispatch(setCredentials(data))
      toast.success('Successfully logged in')
      navigate('/')
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('Authentication failed')
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    if (import.meta.env.DEV) {
      // Use mock data in development
      handleAuthCode('mock-code')
      return
    }

    // Redirect to Pinterest OAuth in production
    window.location.href = PINTEREST_AUTH_URL
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/pinterest.svg"
            alt="Pinterest"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Pinterest Pin Scheduler
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Efficiently manage and schedule your Pinterest pins
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`
              w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white
              ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#E60023] hover:bg-[#ad081b]'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E60023]
            `}
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.63-.13-1.58.03-2.27.14-.62.92-3.97.92-3.97s-.24-.47-.24-1.16c0-1.09.63-1.9 1.42-1.9.67 0 1 .5 1 1.11 0 .68-.43 1.69-.66 2.62-.19.79.4 1.43 1.18 1.43 1.41 0 2.49-1.49 2.49-3.65 0-1.91-1.37-3.25-3.33-3.25-2.27 0-3.61 1.71-3.61 3.47 0 .69.27 1.43.6 1.83.07.08.08.15.06.24-.06.25-.2.79-.23.9-.04.15-.12.18-.28.11-1.04-.49-1.69-2.03-1.69-3.27 0-2.51 1.83-4.82 5.28-4.82 2.77 0 4.91 1.98 4.91 4.62 0 2.76-1.74 4.98-4.15 4.98-.81 0-1.57-.42-1.84-.92l-.5 1.9c-.18.7-.67 1.57-.99 2.09A12 12 0 1 0 12 0z" />
              </svg>
            )}
            {isLoading ? 'Connecting...' : 'Continue with Pinterest'}
          </button>
        </div>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Protected by Pinterest OAuth
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
