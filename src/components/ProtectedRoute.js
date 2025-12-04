import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="spinner-border text-success"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (adminOnly) {
    const isAdmin =
      user?.email === "admin@recyclehub.com" ||
      user?.user_metadata?.role === "admin" ||
      user?.app_metadata?.role === "admin";

    if (!isAdmin) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger text-center">
            <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <h4>Access Denied</h4>
            <p>
              You don't have permission to access this page. Administrator
              privileges required.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Render protected component if authenticated and authorized
  return children;
}
