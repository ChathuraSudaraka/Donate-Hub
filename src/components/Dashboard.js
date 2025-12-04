import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import {
  getUserProducts,
  deleteProduct,
  getUserFavorites,
  // Add credit system imports
  getUserCredits,
  getCreditPackages,
  getUserCreditTransactions,
  getUserPaymentTransactions,
} from "../lib/productQueries";
import { deleteImage } from "../lib/storageHelpers";
import { supabase } from "../lib/supabase";
import AddProductForm from "./AddProductForm";
import ThemeToggle from "./ThemeToggle";
import PayPalPayment from "./PayPalPayment";
import ManualPayment from "./ManualPayment";
import AdminPaymentReview from "./AdminPaymentReview";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  // State management
  const [activeSection, setActiveSection] = useState("overview");
  const [userProducts, setUserProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile update state
  const [profileData, setProfileData] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    productNotifications: true,
    marketingEmails: false,
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    soldProducts: 0,
    totalViews: 0,
    totalFavorites: 0,
  });

  // Credit system state
  const [userCredits, setUserCredits] = useState(0);
  const [creditPackages, setCreditPackages] = useState([]);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [showCreditPurchase, setShowCreditPurchase] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // 'paypal' or 'manual'
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user?.user_metadata?.full_name || "",
        phoneNumber: user?.user_metadata?.phone_number || "",
        location: user?.user_metadata?.location || "",
      });
    }
  }, [user]);
  // Load user products and stats
  useEffect(() => {
    if (
      user &&
      (activeSection === "overview" || activeSection === "products")
    ) {
      loadUserProducts();
    }
    if (user && activeSection === "favorites") {
      loadUserFavorites();
    }
    if (user && (activeSection === "credits" || activeSection === "overview")) {
      loadCreditData();
    }
  }, [user, activeSection]);

  // Load credit data
  useEffect(() => {
    if (user) {
      loadUserCredits();
    }
  }, [user]);

  const loadUserProducts = async () => {
    try {
      setLoading(true);
      const products = await getUserProducts(user.id);
      setUserProducts(products || []);

      // Calculate stats
      const totalProducts = products?.length || 0;
      const activeProducts =
        products?.filter((p) => p.status === "available").length || 0;
      const soldProducts =
        products?.filter((p) => p.status === "sold").length || 0;
      const totalViews =
        products?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
      const totalFavorites =
        products?.reduce((sum, p) => sum + (p.favorites_count || 0), 0) || 0;

      setStats({
        totalProducts,
        activeProducts,
        soldProducts,
        totalViews,
        totalFavorites,
      });
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load your products");
    } finally {
      setLoading(false);
    }
  };
  const loadUserFavorites = async () => {
    try {
      setLoading(true);
      const favorites = await getUserFavorites(user.id);
      setFavoriteProducts(favorites || []);
    } catch (err) {
      console.error("Error loading favorites:", err);
      setError("Failed to load your favorites");
    } finally {
      setLoading(false);
    }
  };

  // Credit system functions
  const loadUserCredits = async () => {
    try {
      const credits = await getUserCredits(user.id);
      setUserCredits(credits);
    } catch (err) {
      console.error("Error loading user credits:", err);
    }
  };

  const loadCreditData = async () => {
    try {
      setCreditLoading(true);
      const [credits, packages, creditTransactions, paymentTransactions] =
        await Promise.all([
          getUserCredits(user.id),
          getCreditPackages(),
          getUserCreditTransactions(user.id),
          getUserPaymentTransactions(user.id),
        ]);

      setUserCredits(credits);
      setCreditPackages(packages);
      setCreditTransactions(creditTransactions);
      setPaymentTransactions(paymentTransactions);
    } catch (err) {
      console.error("Error loading credit data:", err);
      setError("Failed to load credit information");
    } finally {
      setCreditLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await deleteProduct(productId);
      setSuccess("Product deleted successfully");
      loadUserProducts(); // Reload products
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setError("");
    setSuccess("");

    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          phone_number: profileData.phoneNumber,
          location: profileData.location,
        },
      });

      if (authError) throw authError;

      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.fullName,
          phone: profileData.phoneNumber,
          location: profileData.location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setSuccess("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateNotifications = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setError("");
    setSuccess("");

    try {
      // Update notification preferences in profile table
      const { error } = await supabase
        .from("profiles")
        .update({
          notification_preferences: notificationPrefs,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess("Notification preferences updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Notification update error:", error);
      setError("Failed to update notification preferences. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPrefs((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false); // Close mobile menu when section changes
  };

  // Mobile menu functions
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };  // Sidebar menu items
  const menuItems = [
    { id: "overview", label: "Overview", icon: "fas fa-tachometer-alt" },    { id: "products", label: "My Products", icon: "fas fa-boxes" },
    { id: "add-product", label: "Add Product", icon: "fas fa-plus-circle" },    { id: "favorites", label: "Favorites", icon: "fas fa-heart" },
    { id: "credits", label: "Credits", icon: "fas fa-coins" },
    { id: "settings", label: "Settings", icon: "fas fa-cog" },
    // Admin-only menu item
    ...(user?.email === 'admin@recyclehub.com' || user?.user_metadata?.role === 'admin' ? [
      {
        id: "admin-payments",
        label: "Payment Review",
        icon: "fas fa-gavel",
      }
    ] : []),
  ];

  // Check URL parameters for section
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get("section");
    if (section && menuItems.find((item) => item.id === section)) {
      setActiveSection(section);
    }
  }, []);

  // Render different sections based on active selection
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "products":
        return renderProducts();
      case "add-product":
        return (
          <AddProductForm
            onSuccess={() => {
              setSuccess("Product added successfully!");
              setActiveSection("products");
              loadUserProducts();
            }}
          />
        );      case "favorites":
        return renderFavorites();
      case "credits":
        return renderCredits();
      case "settings":
        return renderSettings();
      case "admin-payments":
        return <AdminPaymentReview />;
      default:
        return renderOverview();
    }
  };

  const renderProducts = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>My Products</h2>
        <p className="text-muted">Manage your listed products</p>
        <div className="header-actions">
          <button
            className="btn btn-success"
            onClick={() => setActiveSection("add-product")}
          >
            <i className="fas fa-plus me-2"></i>Add New Product
          </button>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : userProducts.length > 0 ? (
        <div className="products-grid">
          {userProducts.map((product) => (
            <div key={product.id} className="product-card">
              {" "}
              <div className="product-image-container">
                {" "}
                <img
                  src={product.primary_image || "/image/placeholder.svg"}
                  alt={product.title}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = "/image/placeholder.svg";
                  }}
                />
                <div className="product-status">
                  <span className={`status-badge ${product.status}`}>
                    {product.status}
                  </span>
                </div>
              </div>{" "}
              <div className="product-info">
                <h5>{product.title}</h5>
                <p className="product-price">
                  LKR {product.price?.toLocaleString()}
                </p>
                <p className="product-category">{product.category_name}</p>
                <div className="product-stats">
                  <span>
                    <i className="fas fa-eye"></i> {product.views || 0}
                  </span>
                  <span>
                    <i className="fas fa-heart"></i>{" "}
                    {product.favorites_count || 0}
                  </span>
                </div>
                <div className="product-actions">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <i className="fas fa-eye me-1"></i>View
                  </button>
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => navigate(`/edit-product/${product.id}`)}
                  >
                    <i className="fas fa-edit me-1"></i>Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <i className="fas fa-trash me-1"></i>Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="text-center">
            <i className="fas fa-boxes fa-4x text-muted mb-3"></i>
            <h4>No products yet</h4>
            <p className="text-muted mb-4">
              Start by adding your first product to the marketplace
            </p>
            <button
              className="btn btn-success"
              onClick={() => setActiveSection("add-product")}
            >
              <i className="fas fa-plus me-2"></i>Add Your First Product
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>My Favorites</h2>
        <p className="text-muted">Products you've marked as favorites</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : favoriteProducts.length > 0 ? (
        <div className="products-grid">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                {" "}
                <img
                  src={product.primary_image || "/image/placeholder.svg"}
                  alt={product.title}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = "/image/placeholder.svg";
                  }}
                />
                <div className="favorite-badge">
                  <i className="fas fa-heart text-danger"></i>
                </div>
              </div>{" "}
              <div className="product-info">
                <h5>{product.title}</h5>
                <p className="product-price">
                  LKR {product.price?.toLocaleString()}
                </p>
                <p className="product-category">{product.category_name}</p>
                <div className="product-stats">
                  <span>
                    <i className="fas fa-eye"></i> {product.views || 0}
                  </span>
                  <span>
                    <i className="fas fa-map-marker-alt"></i> {product.location}
                  </span>
                </div>
                <div className="product-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <i className="fas fa-eye me-1"></i>View Details
                  </button>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() =>
                      window.open(`tel:${product.contact_phone}`, "_self")
                    }
                  >
                    <i className="fas fa-phone me-1"></i>Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="text-center">
            <i className="fas fa-heart fa-4x text-muted mb-3"></i>
            <h4>No favorites yet</h4>
            <p className="text-muted mb-4">
              Browse products and mark them as favorites to see them here
            </p>
            <button
              className="btn btn-success"
              onClick={() => navigate("/Buy")}
            >
              <i className="fas fa-shopping-cart me-2"></i>Browse Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
  const renderSettings = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>Account Settings</h2>
        <p className="text-muted">
          Manage your account preferences and information
        </p>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      <div className="settings-sections">
        <div className="card mb-4">
          <div className="card-header">
            <h5>
              <i className="fas fa-user me-2"></i>Profile Information
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateProfile}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control"
                      value={profileData.fullName}
                      onChange={handleProfileInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ""}
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-control"
                      value={profileData.phoneNumber}
                      onChange={handleProfileInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      className="form-control"
                      value={profileData.location}
                      onChange={handleProfileInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-success"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h5>
              <i className="fas fa-bell me-2"></i>Notification Preferences
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateNotifications}>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={notificationPrefs.emailNotifications}
                  onChange={handleNotificationChange}
                />
                <label
                  className="form-check-label"
                  htmlFor="emailNotifications"
                >
                  Email notifications for new messages
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="productNotifications"
                  name="productNotifications"
                  checked={notificationPrefs.productNotifications}
                  onChange={handleNotificationChange}
                />
                <label
                  className="form-check-label"
                  htmlFor="productNotifications"
                >
                  Notifications for product inquiries
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="marketingEmails"
                  name="marketingEmails"
                  checked={notificationPrefs.marketingEmails}
                  onChange={handleNotificationChange}
                />
                <label className="form-check-label" htmlFor="marketingEmails">
                  Marketing emails and promotions
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-success"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Save Preferences
                  </>
                )}
              </button>
            </form>
          </div>{" "}
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h5>
              <i className="fas fa-palette me-2"></i>Appearance
            </h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Theme Preference</label>
              <p className="text-muted mb-3">
                Choose your preferred theme for the application
              </p>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h5>
              <i className="fas fa-shield-alt me-2"></i>Security
            </h5>
          </div>
          <div className="card-body">
            <button
              className="btn btn-outline-warning mb-3"
              onClick={() => navigate("/reset-password")}
            >
              <i className="fas fa-key me-2"></i>Change Password
            </button>
            <br />
            <button
              className="btn btn-outline-danger"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete your account? This action cannot be undone."
                  )
                ) {
                  // Add delete account functionality here
                  alert(
                    "Account deletion functionality will be implemented soon."
                  );
                }
              }}
            >
              <i className="fas fa-user-times me-2"></i>Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>  );

  const renderOverview = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>Dashboard Overview</h2>
        <p className="text-muted">
          Welcome back, {user?.user_metadata?.full_name || "User"}!
        </p>
      </div>{" "}
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-2 col-6">
          <div className="stat-card">
            <div className="stat-icon bg-primary">
              <i className="fas fa-boxes"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="stat-card">
            <div className="stat-icon bg-success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.activeProducts}</h3>
              <p>Active Listings</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="stat-card">
            <div className="stat-icon bg-warning">
              <i className="fas fa-handshake"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.soldProducts}</h3>
              <p>Sold Items</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="stat-card">
            <div className="stat-icon bg-info">
              <i className="fas fa-eye"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalViews}</h3>
              <p>Total Views</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="stat-card">
            <div className="stat-icon bg-danger">
              <i className="fas fa-heart"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalFavorites}</h3>
              <p>Favorites</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-6">
          <div className="stat-card">
            <div className="stat-icon bg-secondary">
              <i className="fas fa-coins"></i>
            </div>
            <div className="stat-content">
              <h3>{userCredits}</h3>
              <p>Credits</p>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <button
                    className="btn btn-success w-100 mb-2"
                    onClick={() => setActiveSection("add-product")}
                  >
                    <i className="fas fa-plus me-2"></i>Add New Product
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-primary w-100 mb-2"
                    onClick={() => navigate("/Buy")}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>Browse Products
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-info w-100 mb-2"
                    onClick={() => setActiveSection("products")}
                  >
                    <i className="fas fa-boxes me-2"></i>Manage Products
                  </button>                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Products */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Recent Products</h5>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setActiveSection("products")}
              >
                View All
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : userProducts.length > 0 ? (
                <div className="row">
                  {userProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="col-md-3 col-6 mb-3">
                      <div className="product-card-mini">
                        {" "}
                        <img
                          src={
                            product.primary_image || "/image/placeholder.svg"
                          }
                          alt={product.title}
                          className="product-image-mini"
                          onError={(e) => {
                            e.target.src = "/image/placeholder.svg";
                          }}
                        />
                        <div className="product-info-mini">
                          <h6>{product.title}</h6>
                          <p className="text-success">
                            LKR {product.price?.toLocaleString()}
                          </p>
                          <small className="text-muted">
                            {product.views || 0} views
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="fas fa-boxes fa-3x mb-3"></i>
                  <p>No products yet. Start by adding your first product!</p>
                  <button
                    className="btn btn-success"
                    onClick={() => setActiveSection("add-product")}
                  >
                    Add Your First Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>{" "}
    </div>
  );

  const renderCredits = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>Credits Management</h2>
        <p className="text-muted">Manage your credits for posting products</p>
      </div>

      {/* Current Credits Display */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="stat-card credits-card">
            <div className="stat-icon bg-warning">
              <i className="fas fa-coins"></i>
            </div>
            <div className="stat-content">
              <h3>{userCredits}</h3>
              <p>Available Credits</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="quick-actions-card">
            <h5>Need More Credits?</h5>
            <p className="text-muted">
              Purchase credit packages to continue posting products
            </p>
            <button
              className="btn btn-success"
              onClick={() => setShowCreditPurchase(true)}
            >
              <i className="fas fa-shopping-cart me-2"></i>Buy Credits
            </button>
          </div>
        </div>
      </div>

      {/* Credit Purchase Modal/Section */}
      {showCreditPurchase && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>
              <i className="fas fa-shopping-cart me-2"></i>Purchase Credits
            </h5>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowCreditPurchase(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="card-body">
            {creditLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading packages...</span>
                </div>
              </div>
            ) : (
              <div className="row">
                {creditPackages.map((pkg) => (
                  <div key={pkg.id} className="col-md-3 mb-3">
                    <div
                      className={`credit-package-card ${
                        selectedPackage?.id === pkg.id ? "selected" : ""
                      }`}
                    >
                      <div className="package-header">
                        <h6>{pkg.name}</h6>
                        <div className="package-credits">
                          {pkg.credits} Credits
                        </div>
                      </div>
                      <div className="package-price">
                        <span className="currency">LKR</span>
                        <span className="amount">
                          {pkg.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="package-description">
                        {pkg.description}
                      </div>
                      <button
                        className={`btn ${
                          selectedPackage?.id === pkg.id
                            ? "btn-success"
                            : "btn-outline-success"
                        } w-100`}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        {selectedPackage?.id === pkg.id
                          ? "Selected"
                          : "Select Package"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedPackage && (
              <div className="payment-section mt-4">
                <h6>Payment Options</h6>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div
                      className={`payment-option ${
                        paymentMethod === "paypal" ? "selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("paypal")}
                    >
                      <h6>
                        <i className="fab fa-paypal me-2"></i>PayPal
                      </h6>
                      <p className="text-muted">Pay securely with PayPal</p>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === "paypal"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label className="form-check-label">
                          Select PayPal
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className={`payment-option ${
                        paymentMethod === "manual" ? "selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("manual")}
                    >
                      <h6>
                        <i className="fas fa-upload me-2"></i>Manual Payment
                      </h6>
                      <p className="text-muted">Upload bank transfer receipt</p>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          value="manual"
                          checked={paymentMethod === "manual"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label className="form-check-label">
                          Select Manual Payment
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMethod && (
                  <div className="payment-form-container">
                    <button
                      className="btn btn-success mb-3"
                      onClick={() => setShowPaymentForm(true)}
                    >
                      <i
                        className={`fas ${
                          paymentMethod === "paypal"
                            ? "fa-credit-card"
                            : "fa-upload"
                        } me-2`}
                      ></i>
                      Proceed to{" "}
                      {paymentMethod === "paypal" ? "PayPal" : "Payment Upload"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedPackage && paymentMethod && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>
              <i
                className={`fas ${
                  paymentMethod === "paypal" ? "fa-credit-card" : "fa-upload"
                } me-2`}
              ></i>
              {paymentMethod === "paypal"
                ? "PayPal Payment"
                : "Manual Payment Upload"}
            </h5>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setShowPaymentForm(false);
                setPaymentMethod("");
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="card-body">
            {paymentMethod === "paypal" ? (
              <PayPalPayment
                creditPackage={selectedPackage}
                onSuccess={(result) => {
                  setSuccess(
                    `Payment successful! ${result.credits} credits have been added to your account.`
                  );
                  setShowPaymentForm(false);
                  setShowCreditPurchase(false);
                  setPaymentMethod("");
                  setSelectedPackage(null);
                  loadCreditData(); // Refresh credit data
                }}
                onCancel={() => {
                  setShowPaymentForm(false);
                  setPaymentMethod("");
                }}
              />
            ) : (
              <ManualPayment
                creditPackage={selectedPackage}
                onSuccess={(result) => {
                  setSuccess(
                    "Payment receipt uploaded successfully! Your payment is under review."
                  );
                  setShowPaymentForm(false);
                  setShowCreditPurchase(false);
                  setPaymentMethod("");
                  setSelectedPackage(null);
                  loadCreditData(); // Refresh credit data
                }}
                onCancel={() => {
                  setShowPaymentForm(false);
                  setPaymentMethod("");
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Credit History */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>
                <i className="fas fa-history me-2"></i>Credit History
              </h5>
            </div>
            <div className="card-body">
              {creditLoading ? (
                <div className="text-center py-3">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : creditTransactions.length > 0 ? (
                <div className="transaction-list">
                  {creditTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <div className="transaction-type">
                          <i
                            className={`fas ${
                              transaction.credits > 0
                                ? "fa-plus-circle text-success"
                                : "fa-minus-circle text-danger"
                            }`}
                          ></i>
                          <span>{transaction.description}</span>
                        </div>
                        <small className="text-muted">
                          {new Date(
                            transaction.created_at
                          ).toLocaleDateString()}
                        </small>
                      </div>
                      <div
                        className={`transaction-amount ${
                          transaction.credits > 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {transaction.credits > 0 ? "+" : ""}
                        {transaction.credits}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-history fa-2x mb-2"></i>
                  <p>No credit transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>
                <i className="fas fa-credit-card me-2"></i>Payment History
              </h5>
            </div>
            <div className="card-body">
              {creditLoading ? (
                <div className="text-center py-3">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : paymentTransactions.length > 0 ? (
                <div className="transaction-list">
                  {paymentTransactions.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="transaction-item">
                      <div className="transaction-info">
                        <div className="transaction-type">
                          <i className="fas fa-credit-card"></i>
                          <span>
                            {payment.payment_method} - {payment.credits} credits
                          </span>
                        </div>
                        <small className="text-muted">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div
                        className={`transaction-status status-${payment.status}`}
                      >
                        {payment.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-credit-card fa-2x mb-2"></i>
                  <p>No payments yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
      </button>

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Sidebar */}
      <div
        className={`dashboard-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="user-details">
              <h6>{user?.user_metadata?.full_name || "User"}</h6>
              <small className="text-muted">{user?.email}</small>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link className="btn btn-outline-success w-100" to={"/"}>
            <i className="fas fa-home-alt me-2"></i>
            Back to Home
          </Link>
          <button
            className="btn btn-outline-danger w-100"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-container">{renderContent()}</div>
      </div>
    </div>
  );
}
