import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../utils/auth'
import { toast } from 'react-toastify'
import ThemeToggle from '../components/ThemeToggle'

export default function Signup() {  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    // Client-side validation
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }
    
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }
    
    try {
      await AuthService.register(
        form.username, 
        form.email, 
        form.password, 
        form.confirmPassword,
        form.firstName,
        form.lastName
      )
      toast.success('Signup successful! Please log in.')
      navigate('/login')
    } catch (err) {
      console.error('Signup error:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Registration failed'
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

      {/* Signup Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Join CodeDocGen
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Create your account to get started</p>
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
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Registration Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name and Last Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <input 
                id="firstName"
                type="text" 
                placeholder="Enter your first name" 
                value={form.firstName}
                className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
                onChange={(e) => setForm({...form, firstName: e.target.value})} 
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <input 
                id="lastName"
                type="text" 
                placeholder="Enter your last name" 
                value={form.lastName}
                className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
                onChange={(e) => setForm({...form, lastName: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input 
              id="username"
              type="text" 
              placeholder="Choose a username" 
              value={form.username}
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
              onChange={(e) => setForm({...form, username: e.target.value})} 
              required
              minLength={3}
            />
          </div>
          
          <div className="space-y-3">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="Enter your email" 
              value={form.email}
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
              onChange={(e) => setForm({...form, email: e.target.value})} 
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
              placeholder="Choose a password" 
              value={form.password}
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
              onChange={(e) => setForm({...form, password: e.target.value})} 
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
              placeholder="Confirm your password" 
              value={form.confirmPassword}
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" 
              onChange={(e) => setForm({...form, confirmPassword: e.target.value})} 
              required
              minLength={8}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors" href="/login">
                Sign In
              </a>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}