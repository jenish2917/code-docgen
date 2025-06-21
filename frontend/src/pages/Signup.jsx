import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthService from '../utils/auth'
import { toast } from 'react-toastify'
import api from '../utils/api'

export default function Signup() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [googleConfigured, setGoogleConfigured] = useState(false)
  const navigate = useNavigate()
  
  useEffect(() => {
    // Check if Google OAuth is configured
    const checkGoogleConfig = async () => {
      try {
        const response = await api.get('/auth/google/check-config/')
        setGoogleConfigured(response.data.is_configured)
      } catch (err) {
        console.error('Error checking Google OAuth config:', err)
      }
    }
    
    checkGoogleConfig()
  }, [])
    const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Debug: Log form data
    console.log('📝 Signup Form Data:', form)
    
    // Validate required fields
    if (!form.username || !form.email || !form.password || !form.confirm_password) {
      const errorMsg = 'All fields are required';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Validate form
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🚀 Sending registration request to API endpoint...');
      
      // Make the registration API call
      const result = await AuthService.register(form);
      
      console.log('✅ Registration successful:', result);
      toast.success('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error('❌ Signup error:', err);
      console.error('Error response data:', err.response?.data);
      
      // Get the exact error message from the response
      let errorMessage = 'Registration failed';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage = 'Username or email already taken';
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">Sign Up</h2>
          {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-lg relative">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Registration Error: </span>
              <span className="ml-1">{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>              <input 
                id="first_name"
                type="text" 
                placeholder="First name" 
                value={form.first_name}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                onChange={(e) => setForm({...form, first_name: e.target.value})} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>              <input 
                id="last_name"
                type="text" 
                placeholder="Last name" 
                value={form.last_name}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                onChange={(e) => setForm({...form, last_name: e.target.value})} 
                required
              />
            </div>
          </div>
          
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input 
              id="email"
              type="email" 
              placeholder="Your email address" 
              value={form.email}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              onChange={(e) => setForm({...form, email: e.target.value})} 
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
              placeholder="Choose a password" 
              value={form.password}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              onChange={(e) => setForm({...form, password: e.target.value})} 
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters long</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input 
              id="confirm_password"
              type="password" 
              placeholder="Confirm your password" 
              value={form.confirm_password}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              onChange={(e) => setForm({...form, confirm_password: e.target.value})} 
              required
              minLength={8}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all disabled:bg-green-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          {googleConfigured && (
            <>
              <div className="relative flex items-center justify-center mt-4">
                <hr className="w-full border-t border-gray-300 dark:border-gray-600" />
                <span className="px-2 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  Or
                </span>
                <hr className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              
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
                Sign up with Google
              </a>
            </>
          )}
          
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}