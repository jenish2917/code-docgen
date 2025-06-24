import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../utils/auth'
import { toast } from 'react-toastify'

export default function Signup() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await AuthService.register(form.username, form.password)
      toast.success('Signup successful! Please log in.')
      navigate('/login')
    } catch (err) {
      console.error('Signup error:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Username already taken'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">Sign Up</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 rounded-lg relative">
            <span className="block">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input 
              id="username"
              type="text" 
              placeholder="Choose a username" 
              value={form.username}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              onChange={(e) => setForm({...form, username: e.target.value})} 
              required
              minLength={3}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input 
              id="password"
              type="password" 
              placeholder="Choose a password" 
              value={form.password}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              onChange={(e) => setForm({...form, password: e.target.value})} 
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters long</p>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all disabled:bg-green-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account? <a className="text-blue-600 dark:text-blue-400 hover:underline" href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  )
}