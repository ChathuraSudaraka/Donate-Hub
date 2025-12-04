import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import './ForgotPassword.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setEmail(e.target.value)
  }

  const validateForm = () => {
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return false
    }
    
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        if (error.message.includes('User not found')) {
          toast.error('No account found with this email address.')
        } else {
          toast.error(error.message || 'Failed to send reset email. Please try again.')
        }
        return
      }

      setEmailSent(true)
      toast.success('Password reset email sent! Please check your inbox. 📧', {
        duration: 5000,
        position: 'top-center',
      })
      
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.')
      console.error('Password reset error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    
    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        toast.error('Failed to resend email. Please try again.')
        return
      }

      toast.success('Password reset email sent again! 📧', {
        duration: 4000,
        position: 'top-center',
      })
      
    } catch (error) {
      toast.error('Failed to resend email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  if (emailSent) {
    return (
      <div>
        <Toaster />
        <div id="background-image-forgot">
          <div className="container-fluid py-5">
            <div className="row justify-content-center">
              <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4" id="forgot-container">
                <div className="p-4 text-center">
                  <div className="success-icon mb-4">
                    <i className="fas fa-envelope-circle-check"></i>
                  </div>
                  
                  <h2 className="forgot-title mb-3">Check Your Email</h2>
                  <p className="forgot-subtitle mb-4">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  
                  <div className="email-instructions mb-4">
                    <p>Please check your email and click the link to reset your password.</p>
                    <p>If you don't see the email, check your spam folder.</p>
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={handleResendEmail}
                      className="btn btn-outline-success mb-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Resending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-redo me-2"></i>
                          Resend Email
                        </>
                      )}
                    </button>

                    <Link to="/Login" className="btn btn-success w-100">
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Login
                    </Link>
                  </div>
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
      <Navigation_bar />
      <Toaster />
      <div id="background-image-forgot">
        <div className="container-fluid py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4" id="forgot-container">
              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="forgot-icon mb-3">
                    <i className="fas fa-key"></i>
                  </div>
                  <h2 className="forgot-title">Forgot Password?</h2>
                  <p className="forgot-subtitle">
                    No worries! Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 mb-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Send Reset Link
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
