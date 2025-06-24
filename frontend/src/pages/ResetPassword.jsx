import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AuthService from '../utils/auth'
import { toast } from 'react-toastify'
import ThemeToggle from '../components/ThemeToggle'
import { Lock } from 'lucide-react'

export default function ResetPassword() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }
    
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }
    
    try {
      await AuthService.resetPassword(uid, token, form.newPassword, form.confirmPassword)
      toast.success('Password reset successfully! You can now log in.')
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

      {/* Reset Password Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="max-w-md w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Create a new password for your account</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input 
                id="newPassword"
                type="password" 
                placeholder="Enter new password" 
                value={form.newPassword}
                className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
                onChange={(e) => setForm({...form, newPassword: e.target.value})} 
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters long</p>
            </div>
            
            <div className="space-y-3">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input 
                id="confirmPassword"
                type="password" 
                placeholder="Confirm new password" 
                value={form.confirmPassword}
                className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
                onChange={(e) => setForm({...form, confirmPassword: e.target.value})} 
                required
                minLength={8}
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
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
