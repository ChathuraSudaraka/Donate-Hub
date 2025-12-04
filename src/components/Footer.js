import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-main-container">
      <div className="footer-content-wrapper">
        <div className="footer-main-content">
          {/* Brand Section */}
          <div className="footer-content-block footer-brand-section">
            <h3 className="footer-brand-title">Recycle Hub</h3>
            <p className="footer-brand-description">
              Your trusted marketplace for buying and selling quality used items.
              Reduce, reuse, recycle - together we make a difference for a sustainable future.
            </p>
            <div className="footer-social-links">
              <a href="https://www.facebook.com/profile.php?id=100094431764478" target="_blank" className="footer-social-icon" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="footer-social-icon" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="footer-social-icon" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="footer-social-icon" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>          {/* Quick Links */}
          <div className="footer-content-block">
            <h4 className="footer-section-title">Quick Links</h4>
            <ul className="footer-link-list">
              <li className="footer-link-item">
                <Link to="/" className="footer-nav-link">
                  Home
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/Buy" className="footer-nav-link">
                  Buy Items
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/Sale" className="footer-nav-link">
                  Sell Items
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/About" className="footer-nav-link">
                  About Us
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/Services" className="footer-nav-link">
                  Services
                </Link>
              </li>
              <li className="footer-link-item">
                <Link to="/Contact" className="footer-nav-link">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>          {/* Categories */}
          <div className="footer-content-block">
            <h4 className="footer-section-title">Categories</h4>
            <ul className="footer-link-list">
              <li className="footer-link-item">
                <a href="#" className="footer-nav-link">
                  Electronics
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#" className="footer-nav-link">
                  Furniture
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#" className="footer-nav-link">
                  Clothing
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#" className="footer-nav-link">
                  Books
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#" className="footer-nav-link">
                  Sports
                </a>
              </li>
              <li className="footer-link-item">
                <a href="#" className="footer-nav-link">
                  Home & Garden
                </a>
              </li>
            </ul>
          </div>          {/* Contact & Support */}
          <div className="footer-content-block">
            <h4 className="footer-section-title">Contact & Support</h4>
            <div className="footer-contact-details">
              <div className="footer-contact-row">
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Recycle Street, Green City</span>
              </div>
              <div className="footer-contact-row">
                <i className="fas fa-phone"></i>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="footer-contact-row">
                <i className="fas fa-envelope"></i>
                <span>info@recyclehub.com</span>
              </div>
            </div>
            <div className="footer-support-links">
              <a href="#" className="footer-nav-link">
                Help Center
              </a>
              <a href="#" className="footer-nav-link">
                Privacy Policy
              </a>
              <a href="#" className="footer-nav-link">
                Terms of Service
              </a>
            </div>
          </div>
        </div>        {/* Bottom Bar */}
        <div className="footer-bottom-section">
          <div className="footer-bottom-content">
            <p>&copy; 2025 Recycle Hub. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#" className="footer-bottom-link">
                Privacy
              </a>
              <a href="#" className="footer-bottom-link">
                Terms
              </a>
              <a href="#" className="footer-bottom-link">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
