import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthService from '../utils/auth'
import { toast } from 'react-toastify'
import ThemeToggle from '../components/ThemeToggle'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await AuthService.forgotPassword(email)
      setEmailSent(true)
      toast.success('Password reset link sent to your email')
    } catch (err) {
      console.error('Forgot password error:', err)
      const errorMessage = err.response?.data?.error || 'Failed to send reset email'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        {/* Modern Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CodeDocGen
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI-Powered Documentation Generator</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
          <div className="max-w-md w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-2xl font-semibold transition-all duration-200"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Modern Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CodeDocGen
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-Powered Documentation Generator</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Forgot Password Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="max-w-md w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Enter your email to receive a reset link</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input 
                id="email"
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-4 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center space-y-4">
            <Link 
              to="/login" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
