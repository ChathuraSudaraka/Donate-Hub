import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from "./contexts/ThemeContext";
import "./Buy.css"; // Using the same styles as Buy page
import {
  getAllDonations,
  addDonation,
  uploadDonationImage,
  getDonationsByCategory,
  searchDonations
} from "./lib/donationQueries";

export default function Donate() {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();

  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationForm, setDonationForm] = useState({
    itemName: '',
    description: '',
    category: '',
    condition: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    images: []
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "All", "Electronics", "Furniture", "Clothing", "Books", 
    "Toys", "Sports", "Kitchen", "Others"
  ];

  // Development helper for testing setup
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Load donations from Supabase
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await getAllDonations();
      setDonations(data || []);
      setFilteredDonations(data || []);
    } catch (err) {
      console.error("Error fetching donations:", err);
      setError("Failed to load donations. Please try again later.");
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search donations
  useEffect(() => {
    let filtered = donations;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(donation => donation.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(donation =>
        donation.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDonations(filtered);
  }, [donations, selectedCategory, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setDonationForm(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = '/image/placeholder.jpg';

      // Upload image if provided
      if (donationForm.images.length > 0) {
        const tempId = Date.now();
        imageUrl = await uploadDonationImage(donationForm.images[0], tempId);
      }

      // Add donation to Supabase
      const newDonation = await addDonation({
        ...donationForm,
        imageUrl
      });

      // Update local state
      setDonations(prev => [newDonation, ...prev]);
      
      // Reset form
      setDonationForm({
        itemName: '',
        description: '',
        category: '',
        condition: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        location: '',
        images: []
      });
      
      setShowDonationForm(false);
      toast.success('Thank you for your donation! Your item has been added to the donation list.');
    } catch (error) {
      console.error('Error submitting donation:', error);
      toast.error('Failed to submit donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDonationClick = (donationId) => {
    navigate(`/donation/${donationId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`buy-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? 'var(--bg-secondary)' : '#fff',
            color: isDark ? 'var(--text-primary)' : '#333',
            border: isDark ? '1px solid var(--border-color)' : '1px solid #e2e8f0'
          },
          success: {
            style: {
              background: isDark ? 'var(--green-dark)' : '#10b981',
              color: '#fff'
            },
            iconTheme: {
              primary: 'var(--green-primary)',
              secondary: 'white',
            },
          },
          error: {
            style: {
              background: isDark ? '#dc2626' : '#ef4444',
              color: '#fff'
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
      
      {/* Header Section */}
      <div className="buy-header">
        <div className="container">
          <h1 className="buy-title">
            Community <span className="accent-text">Donations</span>
          </h1>
          <p className="buy-subtitle">
            Help your community by donating items you no longer need, or find what you're looking for
          </p>
          <button
            onClick={() => setShowDonationForm(true)}
            className="cta-button donate-cta"
          >
            <i className="bi bi-heart-fill"></i>
            Donate an Item
          </button>
        </div>
      </div>

      <div className="container">
        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-md-3">
            <div className="filters-section">
              <h3>Filters</h3>
              
              {/* Search */}
              <div className="filter-group">
                <label>Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div className="filter-group">
                <label>Category</label>
                <div className="category-filters">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`category-btn ${
                        selectedCategory === category ? "active" : ""
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Donations Grid */}
          <div className="col-md-9">
            <div className="products-header">
              <h2>
                {selectedCategory === "All" ? "All Donations" : selectedCategory}
                <span className="products-count">
                  ({filteredDonations.length} items)
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading donations...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <h3>Error</h3>
                <p>{error}</p>
                <button
                  onClick={fetchDonations}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="row">
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((donation) => (
                    <div key={donation.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                      <div
                        className="product-card donation-card"
                        onClick={() => handleDonationClick(donation.id)}
                      >
                        <div className="product-image-container">
                          <img
                            src={donation.image_url || "/image/placeholder.svg"}
                            alt={donation.item_name}
                            className="product-image"
                            onError={(e) => {
                              e.target.src = "/image/placeholder.svg";
                            }}
                          />
                          <div className="product-badges">
                            <span className="badge badge-donation">
                              <i className="bi bi-heart-fill"></i>
                              Free
                            </span>
                            <span className={`badge badge-condition ${donation.condition.toLowerCase()}`}>
                              {donation.condition}
                            </span>
                          </div>
                        </div>

                        <div className="product-info">
                          <h3 className="product-name">{donation.item_name}</h3>
                          <p className="product-description">
                            {donation.description.length > 100
                              ? `${donation.description.substring(0, 100)}...`
                              : donation.description}
                          </p>
                          
                          <div className="product-meta">
                            <span className="product-location">
                              📍 {donation.location}
                            </span>
                            <span className="product-category">
                              🏷️ {donation.category}
                            </span>
                          </div>

                          <div className="product-date">
                            Donated: {formatDate(donation.created_at)}
                          </div>

                          <div className="product-actions">
                            <button 
                              className="contact-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (donation.contact_phone) {
                                  window.open(`tel:${donation.contact_phone}`, '_self');
                                } else if (donation.contact_email) {
                                  window.open(`mailto:${donation.contact_email}`, '_self');
                                } else {
                                  toast.info('Contact information not available');
                                }
                              }}
                            >
                              <i className="bi bi-telephone"></i>
                              Contact Donor
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="no-products">
                      <h3>No donations found</h3>
                      <p>
                        {searchTerm || selectedCategory !== "All"
                          ? "Try adjusting your search or filter criteria."
                          : "Be the first to donate an item to your community!"}
                      </p>
                      <button
                        onClick={() => setShowDonationForm(true)}
                        className="btn btn-primary"
                      >
                        <i className="bi bi-heart-fill"></i>
                        Donate an Item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDonationForm(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Donate an Item</h3>
              <button
                className="modal-close"
                onClick={() => setShowDonationForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitDonation} className="donation-form">
              <div className="form-group">
                <label htmlFor="itemName">Item Name *</label>
                <input
                  type="text"




















                  
                  id="itemName"
                  name="itemName"
                  className="form-control"
                  value={donationForm.itemName}
                  onChange={handleInputChange}
                  required
                  placeholder="What are you donating?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={donationForm.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the item, its condition, and any important details"
                  rows="3"
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      className="form-control"
                      value={donationForm.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.slice(1).map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="condition">Condition *</label>
                    <select
                      id="condition"
                      name="condition"
                      className="form-control"
                      value={donationForm.condition}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Condition</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Repair">Needs Repair</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contactName">Your Name *</label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  className="form-control"
                  value={donationForm.contactName}
                  onChange={handleInputChange}
                  required
                  placeholder="Your name or organization"
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="contactPhone">Phone Number</label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      className="form-control"
                      value={donationForm.contactPhone}
                      onChange={handleInputChange}
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="contactEmail">Email</label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      className="form-control"
                      value={donationForm.contactEmail}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-control"
                  value={donationForm.location}
                  onChange={handleInputChange}
                  required
                  placeholder="City or area for pickup"
                />
              </div>

              <div className="form-group">
                <label htmlFor="images">Upload Images</label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  className="form-control"
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                />
                <small className="form-text text-muted">Upload photos of your item (optional)</small>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDonationForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner-small"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-heart"></i>
                      Donate Item
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
