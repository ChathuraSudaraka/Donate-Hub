import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import "./login.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
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
  };

  const validateForm = () => {
    const { email, password } = formData;

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return false;
    }

    return true;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and confirm your account.");
        } else {
          toast.error(error.message || "Login failed. Please try again.");
        }
        return;
      }

      toast.success("Welcome back! 🎉", {
        duration: 2000,
        position: "top-center",
      });

      // Reset form
      setFormData({ email: "", password: "" });

      // Redirect to home page
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast.error("Google login failed. Please try again.");
        console.error("Google login error:", error);
      }
      // Success handling is done by the auth state change listener
    } catch (error) {
      toast.error("An unexpected error occurred with Google login.");
      console.error("Google login error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={`login-page ${isDark ? "dark-theme" : "light-theme"}`}>
      <Toaster
        toastOptions={{
          style: {
            background: isDark ? "var(--bg-secondary)" : "#fff",
            color: isDark ? "var(--text-primary)" : "#333",
            border: isDark
              ? "1px solid var(--border-color)"
              : "1px solid #e2e8f0",
          },
          success: {
            style: {
              background: isDark ? "var(--green-dark)" : "#10b981",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: isDark ? "#dc2626" : "#ef4444",
              color: "#fff",
            },
          },
        }}
      />

      <div id="background-image-login">
        <div className="container-fluid py-5">
          <div className="row justify-content-center">
            <div
              className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 col-xxl-4"
              id="login-container"
            >
              <div className="p-4">
                <div className="text-center mb-4">
                  <span id="login-title">WELCOME BACK</span>
                  <p className="login-subtitle">Sign in to your account</p>
                </div>

                <div className="mb-4">
                  <button
                    type="button"
                    className="btn btn-google w-100 mb-3"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isLoading}
                  >
                    {isGoogleLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing in with Google...
                      </>
                    ) : (
                      <>
                        <i className="fab fa-google me-2"></i>
                        Continue with Google
                      </>
                    )}
                  </button>
                </div>

                <div className="divider mb-4">
                  <span>or</span>
                </div>

                <form onSubmit={handleEmailLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <button
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
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-success text-decoration-none"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 mb-3"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing in...
                      </>
                    ) : (
                      "SIGN IN"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{" "}
                    <Link
                      to="/Register"
                      className="text-success fw-bold text-decoration-none"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
