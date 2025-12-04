import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './ResetPassword.css'

export default function ResetPassword() {  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
    const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if we have the necessary tokens for password reset
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const type = searchParams.get('type')
    
    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session using the tokens from the URL
      const setSessionFromTokens = async () => {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Session error:', error)
            toast.error('Invalid or expired reset link. Please request a new one.')
            setTimeout(() => {
              navigate('/forgot-password')
            }, 3000)
          } else {
            setIsValidSession(true)
          }
        } catch (error) {
          console.error('Session setup error:', error)
          toast.error('Invalid or expired reset link. Please request a new one.')
          setTimeout(() => {
            navigate('/forgot-password')
          }, 3000)
        } finally {
          setSessionLoading(false)
        }
      }
      
      setSessionFromTokens()
    } else {
      // Invalid session, redirect to forgot password
      toast.error('Invalid or expired reset link. Please request a new one.')
      setTimeout(() => {
        navigate('/forgot-password')
      }, 3000)
      setSessionLoading(false)
    }
  }, [searchParams, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const validateForm = () => {
    const { password, confirmPassword } = formData
    
    if (!password.trim()) {
      toast.error('Please enter a new password')
      return false
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return false
    }
    
    if (!confirmPassword.trim()) {
      toast.error('Please confirm your password')
      return false
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
      try {
      const result = await updatePassword(formData.password)
      
      if (result.error) {
        toast.error(result.error.message || 'Failed to update password. Please try again.')
        return
      }

      toast.success('Password updated successfully! 🎉', {
        duration: 3000,
        position: 'top-center',
      })
      
      // Reset form
      setFormData({ password: '', confirmPassword: '' })
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/Login')
      }, 2000)
      
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
      console.error('Password reset error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  if (!isValidSession) {
    return (
      <div>
        <Toaster />
        <div id="background-image-reset">
          <div className="container-fluid py-5">
            <div className="row justify-content-center">
              <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4" id="reset-container">
                <div className="p-4 text-center">
                  <div className="error-icon mb-4">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  
                  <h2 className="reset-title mb-3">Invalid Reset Link</h2>
                  <p className="reset-subtitle mb-4">
                    This password reset link is invalid or has expired.
                  </p>
                  
                  <div className="spinner-border text-success mb-3" role="status">
                    <span className="visually-hidden">Redirecting...</span>
                  </div>
                  
                  <p>Redirecting you to request a new reset link...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div>
      <Toaster />
      <div id="background-image-reset">
        <div className="container-fluid py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4" id="reset-container">
              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="reset-icon mb-3">
                    <i className="fas fa-lock"></i>
                  </div>
                  <h2 className="reset-title">Reset Your Password</h2>
                  <p className="reset-subtitle">
                    Choose a strong new password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">New Password</label>
                    <div className="input-group">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter new password (min 6 characters)"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={togglePasswordVisibility}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <div className="input-group">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="password-requirements mb-4">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-2"></i>
                      Password must be at least 6 characters long
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 mb-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Update Password
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="mb-0">
                    Remember your password?{' '}
                    <Link to="/Login" className="text-success fw-bold text-decoration-none">
                      Back to Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
