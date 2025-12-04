import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import "./Register.css";

export default function Register() {  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };  const validateForm = () => {
    const { fullName, email, password, phoneNumber, location } = formData;

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }

    if (!location.trim()) {
      toast.error("Please enter your location");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        location: formData.location,
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error(
            "This email is already registered. Please try logging in instead."
          );
        } else if (
          error.message.includes("Password should be at least 6 characters")
        ) {
          toast.error("Password must be at least 6 characters long.");
        } else {
          toast.error(
            error.message || "Registration failed. Please try again."
          );
        }
        return;
      }

      toast.success(
        "Account created successfully! Please check your email to confirm your account. 🎉",
        {
          duration: 6000,
          position: "top-center",
        }
      );      // Reset form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        location: "",
      });

      // Redirect to login page after success
      setTimeout(() => {
        navigate("/Login");
      }, 3000);
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast.error("Google signup failed. Please try again.");
        console.error("Google signup error:", error);
      }
      // Success handling is done by the auth state change listener
    } catch (error) {
      toast.error("An unexpected error occurred with Google signup.");
      console.error("Google signup error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };  return (
    <div className={`register-page ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <Toaster 
        toastOptions={{
          style: {
            background: isDark ? 'var(--bg-secondary)' : '#fff',
            color: isDark ? 'var(--text-primary)' : '#333',
            border: isDark ? '1px solid var(--border-color)' : '1px solid #e2e8f0'
          },
          success: {
            style: {
              background: isDark ? 'var(--green-dark)' : '#10b981',
              color: '#fff'
            }
          },
          error: {
            style: {
              background: isDark ? '#dc2626' : '#ef4444',
              color: '#fff'
            }
          }
        }}
      />
      <div id="background-image-register">
        <div className="container-fluid py-5">
          <div className="row justify-content-center">
            <div
              className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4"
              id="second-div-register"
            >
              <div className="p-4">
                {" "}
                <div className="text-center mb-4">
                  <span id="create-account-register">CREATE ACCOUNT</span>
                </div>
                <div className="mb-4">                  <button
                    type="button"
                    className="btn btn-google w-100 mb-3"
                    onClick={handleGoogleSignup}
                    disabled={isGoogleLoading || isLoading}
                  >
                    {isGoogleLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing up with Google...
                      </>
                    ) : (
                      <>
                        <i className="fab fa-google me-2"></i>
                        Continue with Google
                      </>
                    )}
                  </button>
                </div>                <div className="divider mb-4">
                  <span>or</span>
                </div>
                <div className="mt-3">
                  <form onSubmit={handleSubmit}>
                    <label htmlFor="fullName">Full Name:</label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="form-control mb-3"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="email">Email Address:</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control mb-3"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />{" "}
                    <label htmlFor="password">Password:</label>
                    <div className="input-group mb-3">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Password (min 6 characters)"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={togglePasswordVisibility}
                      >
                        <i
                          className={`fas ${
                            showPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                        ></i>
                      </button>
                    </div>                    <label htmlFor="phoneNumber">Phone Number:</label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      className="form-control mb-3"
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="location">Location:</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="form-control mb-4"
                      placeholder="Location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="text-center">
                      {" "}                      <button
                        type="submit"
                        id="submit-register"
                        className="btn btn-success w-100"
                        disabled={isLoading || isGoogleLoading}
                      >
                        {isLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Creating Account...
                          </>
                        ) : (
                          "CREATE ACCOUNT"
                        )}
                      </button>
                    </div>{" "}
                    <div className="text-center mt-3">
                      <p className="mb-0">
                        Already have an account?{" "}
                        <Link
                          to="/Login"
                          className="text-success fw-bold text-decoration-none"
                        >
                          Login here
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
