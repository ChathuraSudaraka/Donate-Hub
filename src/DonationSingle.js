import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDonationById, getSimilarDonations } from "./lib/donationQueries";
import { useTheme } from "./contexts/ThemeContext";
import toast, { Toaster } from "react-hot-toast";
import "./ProductSingle.css"; // Reusing existing styles

export default function DonationSingle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  const [donation, setDonation] = useState(null);
  const [similarDonations, setSimilarDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const donationData = await getDonationById(parseInt(id));
        setDonation(donationData);

        // Fetch similar donations
        if (donationData?.category) {
          const similar = await getSimilarDonations(
            donationData.id,
            donationData.category
          );
          setSimilarDonations(similar);
        }
      } catch (err) {
        console.error("Error fetching donation:", err);
        setError("Failed to load donation. Please try again later.");
        toast.error("Failed to load donation");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDonation();
    }
  }, [id]);

  const handleContactDonor = () => {
    if (donation?.contact_phone) {
      window.open(`tel:${donation.contact_phone}`, '_self');
    } else if (donation?.contact_email) {
      window.open(`mailto:${donation.contact_email}`, '_self');
    } else {
      toast.error("Contact information not available");
    }
  };

  const handleWhatsApp = () => {
    if (donation?.contact_phone) {
      const message = `Hi! I'm interested in your donation: ${donation.item_name} listed on Recycle Hub.`;

      // Clean the phone number and format for WhatsApp
      let phoneNumber = donation.contact_phone.replace(/[^0-9]/g, "");

      // If it's a Sri Lankan number starting with 0, convert to international format
      if (phoneNumber.startsWith("0") && phoneNumber.length === 10) {
        phoneNumber = "94" + phoneNumber.substring(1);
      } else if (phoneNumber.startsWith("94")) {
        phoneNumber = phoneNumber;
      } else if (phoneNumber.length === 9) {
        phoneNumber = "94" + phoneNumber;
      }

      window.open(
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
      );
    } else {
      toast.error("WhatsApp contact not available");
    }
  };

  const handleSimilarDonationClick = (donationId) => {
    navigate(`/donation/${donationId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`product-single-container ${isDark ? 'dark-theme' : ''}`}>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className={`product-single-container ${isDark ? 'dark-theme' : ''}`}>
        <div className="error-container">
          <h2>Donation Not Found</h2>
          <p>{error || "This donation may have been removed or is no longer available."}</p>
          <button onClick={() => navigate('/donate')} className="btn btn-primary">
            Back to Donations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-single-container ${isDark ? 'dark-theme' : ''}`}>
      <Toaster position="top-right" />
      
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span onClick={() => navigate('/donate')} className="breadcrumb-link">Donations</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{donation.item_name}</span>
        </nav>

        <div className="row">
          {/* Image Section */}
          <div className="col-md-6">
            <div className="product-images">
              <div className="main-image">
                <img
                  src={donation.image_url || "/image/placeholder.svg"}
                  alt={donation.item_name}
                  className="main-product-image"
                  onError={(e) => {
                    e.target.src = "/image/placeholder.svg";
                  }}
                />
                <div className="image-badges">
                  <span className="badge badge-donation">
                    <i className="bi bi-heart-fill"></i>
                    Free Donation
                  </span>
                  <span className={`badge badge-condition ${donation.condition.toLowerCase()}`}>
                    {donation.condition}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="col-md-6">
            <div className="product-details">
              <h1 className="product-title">{donation.item_name}</h1>
              
              <div className="product-price">
                <span className="price-badge">FREE</span>
                <span className="donation-tag">Community Donation</span>
              </div>

              <div className="product-meta-info">
                <div className="meta-item">
                  <i className="bi bi-tag"></i>
                  <span>Category: {donation.category}</span>
                </div>
                <div className="meta-item">
                  <i className="bi bi-geo-alt"></i>
                  <span>Location: {donation.location}</span>
                </div>
                <div className="meta-item">
                  <i className="bi bi-calendar"></i>
                  <span>Donated: {formatDate(donation.created_at)}</span>
                </div>
                <div className="meta-item">
                  <i className="bi bi-person"></i>
                  <span>Donor: {donation.contact_name}</span>
                </div>
              </div>

              <div className="product-description">
                <h3>Description</h3>
                <p>{donation.description}</p>
              </div>

              {/* Contact Actions */}
              <div className="contact-actions">
                <h3>Interested in this item?</h3>
                <div className="action-buttons">
                  <button 
                    onClick={handleContactDonor}
                    className="btn btn-primary contact-btn"
                  >
                    <i className="bi bi-telephone"></i>
                    Contact Donor
                  </button>
                  
                  {donation.contact_phone && (
                    <button 
                      onClick={handleWhatsApp}
                      className="btn btn-success whatsapp-btn"
                    >
                      <i className="bi bi-whatsapp"></i>
                      WhatsApp
                    </button>
                  )}
                  
                  {donation.contact_email && (
                    <button 
                      onClick={() => window.open(`mailto:${donation.contact_email}`, '_self')}
                      className="btn btn-outline-primary email-btn"
                    >
                      <i className="bi bi-envelope"></i>
                      Email
                    </button>
                  )}
                </div>
              </div>

              {/* Donation Info */}
              <div className="donation-info">
                <div className="info-card">
                  <i className="bi bi-info-circle"></i>
                  <div>
                    <h4>About Donations</h4>
                    <p>This item is being offered for free as a community donation. Please contact the donor directly to arrange pickup.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Donations */}
        {similarDonations.length > 0 && (
          <div className="similar-products-section">
            <h2>Similar Donations</h2>
            <div className="row">
              {similarDonations.map((similarDonation) => (
                <div key={similarDonation.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                  <div
                    className="product-card donation-card"
                    onClick={() => handleSimilarDonationClick(similarDonation.id)}
                  >
                    <div className="product-image-container">
                      <img
                        src={similarDonation.image_url || "/image/placeholder.svg"}
                        alt={similarDonation.item_name}
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
                        <span className={`badge badge-condition ${similarDonation.condition.toLowerCase()}`}>
                          {similarDonation.condition}
                        </span>
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{similarDonation.item_name}</h3>
                      <p className="product-description">
                        {similarDonation.description.length > 80
                          ? `${similarDonation.description.substring(0, 80)}...`
                          : similarDonation.description}
                      </p>
                      
                      <div className="product-meta">
                        <span className="product-location">
                          📍 {similarDonation.location}
                        </span>
                        <span className="product-category">
                          🏷️ {similarDonation.category}
                        </span>
                      </div>

                      <div className="product-date">
                        Donated: {formatDate(similarDonation.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
