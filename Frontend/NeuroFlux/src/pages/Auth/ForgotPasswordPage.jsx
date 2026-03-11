import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import authService from '../../services/authService'
import { BrainCircuit, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setEmailSent(true)
      toast.success('If an account exists with this email, a password reset link has been sent')
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-dark-950 overflow-hidden relative'>
        {/* Animated Background */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000' />
        </div>

        {/* Grid Pattern */}
        <div className='absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30' />

        <div className='relative w-full max-w-md px-6'>
          <div className='bg-dark-800/80 backdrop-blur-xl border border-dark-700/60 rounded-3xl shadow-2xl shadow-black/50 p-10 fade-in'>
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-14 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6'>
                <CheckCircle className='w-7 h-7 text-white' strokeWidth={2} />
              </div>
              <h1 className='text-2xl font-medium text-dark-100 tracking-tight mb-2'>
                Check Your Email
              </h1>
              <p className='text-dark-400 text-sm mb-6'>
                If an account exists with <strong>{email}</strong>, we've sent password reset instructions.
              </p>
              <Link 
                to="/login" 
                className='inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
             <div className='inline-flex items-center justify-center w-14 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6'>
              <BrainCircuit className='w-7 h-7 text-white' strokeWidth={2} />
             </div>
             <h1 className='text-2xl font-medium text-dark-100 tracking-tight mb-2'>
              Forgot Password?</h1>
             <p className='text-dark-400 text-sm'>No worries, we'll send you reset instructions</p>
          </div>

          {/* Form  */}
          <form onSubmit={handleSubmit}>
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
                    placeholder="Enter your email"
                  />  
                </div>
              </div>

              {/*Submit Button  */}
              <button
                type="submit"
                disabled={loading}
                className='group relative w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-emerald-500/25 overflow-hidden '
              >
                <span className='relative z-10 flex items-center justify-center gap-2'>
                  {loading ? (
                    <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Sending...
                    </>
                  ):(<>
                    Reset Password
                  </>)}
                </span>
              </button>
            </div>
          </form>

          {/*Back to Login  */}
          <div className='mt-8 pt-6 border-t border-dark-700/60'>
            <Link 
              to="/login" 
              className='flex items-center justify-center gap-2 text-dark-400 hover:text-dark-100 font-medium transition-colors duration-200'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/*Subtle footer text  */}
        <p className='text-center text-xs text-dark-500 mt-8'>© 2026 NeuroFlux. All rights reserved.</p>
      </div>
      </div>
  )
}

export default ForgotPasswordPage

