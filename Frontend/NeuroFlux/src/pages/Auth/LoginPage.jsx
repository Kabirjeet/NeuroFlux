import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import {BrainCircuit, Mail, Lock, ArrowRight, Loader2} from 'lucide-react'
import { toast } from 'react-hot-toast'

const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const {login} = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
     const response = await authService.login(email, password);
     const { token, user } = response;
     login(user, token);
     toast.success("Welcome back! Login successful.");
     navigate('/dashboard');
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || "Login failed. Check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-dark-950 overflow-hidden relative'>

      {/* Animated Background */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000' />
      </div>

      {/* Grid Pattern */}
      <div className='absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30' />

      <div className='relative w-full max-w-md px-6'>
        <div className='bg-dark-800/80 backdrop-blur-xl border border-dark-700/60 rounded-3xl shadow-2xl shadow-black/50 p-10 fade-in'>
          {/*Header  */}
            
          <div className='text-center mb-10'>
             <div className='inline-flex items-center justify-center w-14 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6 group-hover:scale-110 transition-transform duration-300'>
              <BrainCircuit className='w-7 h-7 text-white' strokeWidth={2} />
             </div>
             <h1 className='text-2xl font-medium text-dark-100 tracking-tight mb-2'>
              Welcome Back</h1>
             <p className='text-dark-400 text-sm'>Sign in to continue your learning journey</p>
          </div>

          {/* Form  */}
          <div className='space-y-5'>
            {/*Email field  */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-dark-300 uppercase tracking-wide'>Email</label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-200 ${
                  focusedField === 'email' ?'text-emerald-400':'text-dark-500'
                  }`}>
                  <Mail className='h-5 w-5' strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full h-12 pl-12 pr-4 border-2 border-dark-600 rounded-xl bg-dark-800/50 text-dark-100 placeholder-dark-500 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:shadow-emerald-500/20 focus:ring-1 focus:ring-emerald-500/10'
                  placeholder="you@example.com"
                />  
              </div>
            </div>

            {/*Password field  */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-dark-300 uppercase tracking-wide'>Password</label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-200 ${
                  focusedField === 'password' ?'text-emerald-400':'text-dark-500'
                  }`}>
                  <Lock className='h-5 w-5' strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e)
                    }
                  }}
                  className='w-full h-12 pl-12 pr-4 border-2 border-dark-600 rounded-xl bg-dark-800/50 text-dark-100 placeholder-dark-500 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-dark-800 focus:shadow-lg focus:shadow-emerald-500/10'
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            {/*Error Message  */}
            {error && (
              <div className='rounded-lg bg-red-500/10 border border-red-500/20 p-3 fade-in'>
                <p className='text-xs text-red-400 font-medium text-center'>{error}</p>
              </div>
            )}

            {/*Submit Button  */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='group relative w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-emerald-500/25 overflow-hidden '
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                {loading ? (
                  <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Signing in...
                  </>
                ):(<>
                  Sign In <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-200' strokeWidth={2.5} />
                </>)}
              </span>
              <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
            </button>
            </div>

          {/*Footer  */}
          <div className='mt-8 pt-6 border-t border-dark-700/60'>
            <p className='text-center text-sm text-dark-400'>
              Don't have an account?{' '}
              <Link to="/register" className='font-semibold text-emerald-400 hover:text-emerald-300 transition-colors duration-200'>
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/*Subtle footer text  */}
        <p className='text-center text-xs text-dark-500 mt-8'>© 2026 NeuroFlux. All rights reserved.</p>
      </div>
      </div>
  )
}

export default LoginPage

