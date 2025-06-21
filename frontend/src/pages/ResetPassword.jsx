import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import AuthService from '../utils/auth'
import { toast } from 'react-toastify'
import api from '../utils/api'

export default function ResetPassword() {
  const [stage, setStage] = useState('request') // 'request', 'reset', 'success'
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const navigate = useNavigate()
  const { uid, token } = useParams()

  // Check if we have token and uid in the URL
  useEffect(() => {
    if (uid && token) {
      setStage('reset')
      verifyToken(uid, token)
    }
  }, [uid, token])

  // Verify token validity
  const verifyToken = async (uid, token) => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/password-reset/verify-token/', { uid, token })
      setIsTokenValid(response.data.valid)
      
      if (!response.data.valid) {
        setError('This password reset link is invalid or has expired.')
        toast.error('This password reset link is invalid or has expired.')
      }
    } catch (err) {
      console.error('Token verification error:', err)
      setError('Failed to verify reset token. Please try again.')
      toast.error('Failed to verify reset token.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!form.email) {
      setError('Email is required')
      toast.error('Email is required')
      return
    }
    
    setIsLoading(true)
    try {
      await api.post('/auth/password-reset/request/', { email: form.email })
      setStage('success')
      toast.success('If an account exists with this email, a password reset link has been sent.')
    } catch (err) {
      console.error('Request reset error:', err)
      const errorMessage = err.response?.data?.error || 'Failed to request password reset'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!form.password) {
      setError('Password is required')
      toast.error('Password is required')
      return
    }
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      toast.error('Passwords do not match')
      return
    }
    
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long')
      toast.error('Password must be at least 8 characters long')
      return
    }
    
    setIsLoading(true)
    try {
      await api.post('/auth/password-reset/reset/', {
        uid,
        token,
        password: form.password
      })
      
      toast.success('Password has been reset successfully!')
      navigate('/login')
    } catch (err) {
      console.error('Reset password error:', err)
      const errorMessage = err.response?.data?.error || 'Failed to reset password'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Render the request password reset form
  const renderRequestForm = () => (
    <form onSubmit={handleRequestReset} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={form.email}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => setForm({...form, email: e.target.value})}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Send Reset Link'}
      </button>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Remember your password? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log in</Link>
      </div>
    </form>
  )

  // Render the reset password form
  const renderResetForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter new password"
          value={form.password}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => setForm({...form, password: e.target.value})}
          required
          minLength={8}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters long</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
          required
          minLength={8}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
        disabled={isLoading || !isTokenValid}
      >
        {isLoading ? 'Processing...' : 'Reset Password'}
      </button>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Remember your password? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log in</Link>
      </div>
    </form>
  )

  // Render the success message
  const renderSuccessMessage = () => (
    <div className="space-y-6">
      <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-300 rounded-lg relative">
        <p className="text-center">A password reset link has been sent to your email address if it exists in our system.</p>
        <p className="text-center mt-2">Please check your inbox and follow the instructions to reset your password.</p>
      </div>

      <div className="text-center">
        <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">
          {stage === 'reset' ? 'Reset Password' : 'Forgot Password'}
        </h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 rounded-lg relative">
            <span className="block">{error}</span>
          </div>
        )}
        
        {stage === 'request' && renderRequestForm()}
        {stage === 'reset' && renderResetForm()}
        {stage === 'success' && renderSuccessMessage()}
      </div>
    </div>
  )
}
