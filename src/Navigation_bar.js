import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ThemeToggle from "./components/ThemeToggle";
import "./Navigation_bar.css";

export default function Navigation_bar() {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };
  return (
    <div>
      <nav className="navbar navbar-dark bg-success navbar-expand-lg fixed-top">
        <div className="navbar-brand-container">
          <img
            src="/image/Recycling Reuse Logo.png"
            alt="Recycle Hub Logo"
            className="navbar-logo"
          />
          <Link to="/" className="navbar-brand" id="Recycle_Hub">
            Donate Hub
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#toggle"
          aria-controls="toggle"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-center"
          id="toggle"
        >
          <ul className="navbar-nav">
            <div className="nav-links-center">
              <li className="nav-item">
                <Link to="/" className="nav-link active" id="link1">
                  Home
                </Link>
              </li>
              {/* <li className="nav-item">
                <Link to="/About" className="nav-link active" id="link2">
                  About
                </Link>
              </li> */}
              {/* <li className="nav-item">
                <Link to="/Services" className="nav-link active" id="link3">
                  Services
                </Link>
              </li> */}
              <li className="nav-item">
                <Link to="/Buy_And_Sale" className="nav-link active" id="link4">
                  Donate
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Locate" className="nav-link active" id="link4">
                  Location
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Contact" className="nav-link active" id="link5">
                  Contact
                </Link>{" "}
              </li>{" "}
            </div>

            {/* Theme Toggle */}
            <div className="theme-toggle-container">
              <ThemeToggle />
            </div>

            {/* User Icon Dropdown */}
            <div className="user-dropdown-container" ref={dropdownRef}>
              <div className="user-icon-wrapper" onClick={toggleDropdown}>
                <div className="user-icon">
                  {user ? (
                    <div className="user-avatar">
                      <span className="user-initial">
                        {user.user_metadata?.full_name
                          ? user.user_metadata.full_name.charAt(0).toUpperCase()
                          : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
              </div>
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-arrow"></div>

                  {user ? (
                    <div className="dropdown-content">
                      <div className="user-info">
                        <div className="user-name">
                          {user.user_metadata?.full_name || "User"}
                        </div>
                        <div className="user-email">{user.email}</div>
                      </div>

                      <div className="dropdown-divider"></div>

                      <Link
                        to="/Dashboard"
                        className="dropdown-item"
                        onClick={closeDropdown}
                      >
                        <i className="fas fa-tachometer-alt me-2"></i>
                        Dashboard
                      </Link>

                      <Link
                        to="/Profile"
                        className="dropdown-item"
                        onClick={closeDropdown}
                      >
                        <i className="fas fa-user-cog me-2"></i>
                        Profile Settings
                      </Link>

                      <div className="dropdown-divider"></div>

                      <button
                        onClick={handleLogout}
                        className="dropdown-item logout-btn"
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="dropdown-content">
                      <div className="auth-message">
                        <i className="fas fa-user-plus mb-2"></i>
                        <p>Join Recycle Hub today!</p>
                      </div>

                      <Link
                        to="/Login"
                        className="dropdown-btn login-btn"
                        onClick={closeDropdown}
                      >
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Login
                      </Link>

                      <Link
                        to="/Register"
                        className="dropdown-btn signup-btn"
                        onClick={closeDropdown}
                      >
                        <i className="fas fa-user-plus me-2"></i>
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}{" "}
            </div>
          </ul>
        </div>
      </nav>
    </div>
  );
}
