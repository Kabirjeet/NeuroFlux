import React from 'react'
import { useState } from 'react'
import{Link, useNavigate} from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import {BrainCircuit, Mail, Lock, ArrowRight} from 'lucide-react'
import { toast } from 'react-hot-toast'

const LoginPage = () => {

  const [email, setEmail] = useState('abc@gmail.com');
  const [password, setPassword] = useState('test123');
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
     const {token, user} = await authService.login(email, password);
     login(user, token);
     toast.success("Login successful!");
     navigate('/dashboard');
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=''>

      <div className=''/>

      <div className=''>
        <div className=''>
          {/*Header  */}
            
          <div className=''>
             <div className=''>
              <BrainCircuit className='' strokeWidth={2} />
             </div>
             <h1 className=''>Welcome Back</h1>
             <p className=''>Sign in to continue your journey with NeuroFlux</p>
          </div>

          {/* Form  */}
          <div className=''>
            {/*Email field  */}
            <div className=''>
              <label className=''>Email</label>
              <div className=''>
                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-200' ${
                  focusedField === 'email' ?'text-emerald-500':'text-gray-400'
                  }`}>
                  <Mail className='' strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className=''
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/*Password field  */}
            <div className=''>
              <label className=''>Password</label>
              <div className=''>
                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none transition-colors duration-200' ${
                  focusedField === 'password' ?'text-emerald-500':'text-gray-400'
                  }`}>
                  <Lock className='' strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className=''
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/*Error Message  */}
            {error && (
              <div className=''>
                <p className=''>{error}</p>
              </div>
            )}

            {/*Submit Button  */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className=''
            >
              <span className=''>
                {loading ? (
                  <>
                  <div className='' />
                  Signing in...
                  </>
                ):(<>
                  Sign In <ArrowRight className='' strokeWidth={2.5} />
                </>)}
              </span>
              <div className='' />
            </button>
            </div>

          {/*Footer  */}
          



    
  )
}

export default LoginPage
