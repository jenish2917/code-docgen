import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthService from '../utils/auth'
import GoogleAuthUtils from '../utils/googleAuth'
import { toast } from 'react-toastify'
import api from '../utils/api'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', code: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [require2FA, setRequire2FA] = useState(false)
  const [userId, setUserId] = useState(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [googleConfigured, setGoogleConfigured] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if Google OAuth is configured using the utility
    const checkGoogleConfig = async () => {
      try {
        const isConfigured = await GoogleAuthUtils.checkGoogleOAuthConfig();
        setGoogleConfigured(isConfigured);
        console.log('Google OAuth configured:', isConfigured);
      } catch (err) {
        console.error('Error checking Google OAuth config:', err);
      }
    }
    
    checkGoogleConfig()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      if (require2FA) {
        // Handle 2FA verification
        const success = await AuthService.verify2FA(userId, form.code)
        if (success) {
          navigate('/')
          toast.success('Login successful')
        } else {
          setError('Verification failed. Please check your code.')
        }
      } else {
        // Normal login
        const result = await AuthService.login(form.username, form.password, rememberMe)
        
        if (result === true) {
          // Regular login successful
          navigate('/')
          toast.success('Login successful')
        } else if (result?.require2FA) {
          // 2FA required
          setRequire2FA(true)
          setUserId(result.userId)
          setError('')
          toast.info('Please enter your verification code')
        } else {
          setError('Login failed. Please check your credentials.')
          toast.error('Login failed')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Invalid credentials'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">
          {require2FA ? 'Two-Factor Authentication' : 'Login'}
        </h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 rounded-lg relative">
            <span className="block">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!require2FA ? (
            <>
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username or Email
                </label>
                <input 
                  id="username"
                  type="text" 
                  placeholder="Enter your username or email" 
                  value={form.username}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  onChange={(e) => setForm({...form, username: e.target.value})} 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input 
                  id="password"
                  type="password" 
                  placeholder="Enter your password" 
                  value={form.password}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  onChange={(e) => setForm({...form, password: e.target.value})} 
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
                <Link to="/reset-password" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Please enter the verification code from your authenticator app.
              </p>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification Code
              </label>
              <input 
                id="code"
                type="text" 
                placeholder="Enter 6-digit code" 
                value={form.code}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                onChange={(e) => setForm({...form, code: e.target.value})} 
                required
                autoFocus
                maxLength="6"
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : require2FA ? 'Verify Code' : 'Sign In'}
          </button>
          
          {!require2FA && (
            <>
              {googleConfigured && (
                <div className="relative flex items-center justify-center mt-4">
                  <hr className="w-full border-t border-gray-300 dark:border-gray-600" />
                  <span className="px-2 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                    Or
                  </span>
                  <hr className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
              )}
              
              {googleConfigured && (
                <a 
                  href="/auth/login/google/" 
                  className="flex items-center justify-center w-full mt-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-3 rounded-lg font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M21.35,11.1H12.18V13.83H18.69C18.36,15.64 16.96,17.45 14.37,17.45C12.17,17.45 10.31,15.73 10.31,13.47C10.31,11.21 12.17,9.5 14.37,9.5C15.43,9.5 16.33,9.89 17.01,10.56L19.14,8.43C17.75,7.05 16.19,6.26 14.37,6.26C10.4,6.26 7.18,9.53 7.18,13.5C7.18,17.47 10.4,20.74 14.37,20.74C18.26,20.74 21.35,18.06 21.35,13.57C21.35,12.71 21.28,11.82 21.35,11.1Z"
                    />
                  </svg>
                  Sign in with Google
                </a>
              )}
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Sign up
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}