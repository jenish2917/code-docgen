import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../utils/auth'
import { toast } from 'react-toastify'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const result = await AuthService.login(form.username, form.password)
      if (result.success) {
        navigate('/')
      } else {
        const errorMessage = result.message || 'Invalid credentials'
        setError(errorMessage)
        toast.error(errorMessage)
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
              <a href="/" className="px-6 py-2.5 rounded-xl font-medium transition-all text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>
          </div>        
        {error && (
          <div className="mb-6 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Authentication Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input 
              id="username"
              type="text" 
              placeholder="Enter your username" 
              value={form.username}
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
              onChange={(e) => setForm({...form, username: e.target.value})} 
              required
            />
          </div>
          
          <div className="space-y-3">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input 
              id="password"
              type="password" 
              placeholder="Enter your password" 
              value={form.password}
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
              onChange={(e) => setForm({...form, password: e.target.value})} 
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}          </button>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <a 
                href="/forgot-password" 
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </a>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors" href="/signup">
                Create Account
              </a>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}