import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import { BrainCircuit, Mail, Lock, ArrowRight, User } from 'lucide-react'
import { toast } from 'react-hot-toast'

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.register(username, email, password);
      toast.success("Registered successfully! Please login to continue.");
      navigate('/login');
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || "Registration failed. Try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50'>

      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30' />

      <div className='relative w-full max-w-md px-6'>
        <div className='bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10'>
          {/*Header  */}

          <div className='text-center mb-10'>
            <div className='inline-flex items-center justify-center w-14 h-16 rounded-2xl bg-linear-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6'>
              <BrainCircuit className='w-7 h-7 text-white' strokeWidth={2} />
            </div>
            <h1 className='text-2xl font-medium text-slate-800 tracking-tight mb-2'>
              Create Your Account</h1>
            <p className='text-slate-600 text-sm'>Start your journey with NeuroFlux today</p>
          </div>

          {/* Form  */}
          <div className='space-y-5'>
            {/*Username field  */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                UserName
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'username'
                  ? 'text-emerald-500'
                  : 'text-slate-400'}`}>
                  <User className='h-5 w-5' strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200S'
                  placeholder='yourusername'
                />
              </div>
            </div>

            {/*Email field  */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Email
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'email'
                  ? 'text-emerald-500'
                  : 'text-slate-400'}`}>
                  <Mail className='h-5 w-5' strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200'
                  placeholder='you@example.com'
                />
              </div>
            </div>

            {/*Password field  */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Password
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'password'
                  ? 'text-emerald-500'
                  : 'text-slate-400'}`}>
                  <Lock className='h-5 w-5' strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full pl-12 pr-4 h-12 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200'
                  placeholder='••••••••'
                />
              </div>
            </div>

            {/*Error Message  */}
            {error && (
              <div className='rounded-lg bg-red-50 border border-red-200 p-3'>
                <p className='text-red-500 text-sm text-center'>{error}</p>
              </div>
            )}

            {/*Submit Button  */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='group relative w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-md flex items-center justify-center hover:from-emerald-600 hover:to-teal-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <span className='relative z-10 flex items-center gap-2'>
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-200' strokeWidth={2} />
                  </>
                )}
              </span>
              <div className='absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md opacity-0 group-hover:opacity-10 transition-opacity duration-200' />
            </button>


            {/*Footer  */}
            <div className='mt-8 pt-6 border-t border-slate-200/60'>
              <p className='text-center text-sm text-slate-600'>
                Already have an account?{' '}
                <Link to="/login" className='font-semibold text-emerald-500 hover:text-emerald-600 transition-colors duration-200'>
                  Sign In
                </Link>
              </p>
            </div>
          </div>
          {/*Subtle footer text  */}
          <p className='text-center text-xs text-slate-500 mt-8'>© 2026 NeuroFlux. All rights reserved.</p>
        </div>
      </div>
      </div>
      )
}

      export default RegisterPage
