import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials } from '../store/slices/authSlice'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { RootState } from '../store'
import PinterestOAuth from '../components/PinterestOAuth'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handlePinterestLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      // TODO: Implement Pinterest OAuth flow
      const mockResponse = {
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        token: 'mock-token',
      }

      dispatch(setCredentials(mockResponse))
      navigate('/', { replace: true })
    } catch (err) {
      setError('Failed to authenticate with Pinterest')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/logo.svg"
            alt="Pinterest Bulk Scheduler"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div>
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <PinterestOAuth />
        </div>
      </div>
    </div>
  )
}
