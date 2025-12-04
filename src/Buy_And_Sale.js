import React, { useState, useEffect } from "react";
import "./Buy_And_Sale.css";
import { Link } from "react-router-dom";
import { useTheme } from "./contexts/ThemeContext";

function Buy_And_Sale() {
  const { theme, isDark } = useTheme();

  return (
    <div className={`buy-and-sale-page ${isDark ? 'dark-theme' : ''}`}>
      <div id="background_buy_and_sale">
        {/* Header Section */}
        <section className="row">
          <div className="col-12">
            <div className="header-section">
              <div className="hero-content">
                <h1 className="hero-title">
                  Your <span className="accent-text">Donations</span>{" "}
                  
                </h1>
                <p className="hero-subtitle">
                  {/* Discover amazing deals and give your items a second life */}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Cards Section */}
        <section className="action-section">
          <div className="container-fluid px-4">
            <div className="row justify-content-center g-4">
              {/* <div className="col-12 col-md-6 col-lg-5 col-xl-4">
                <div className="action-card buy-card">
                  <div className="card-image-container">
                    <img
                      src="/image/10.gif"
                      alt="Buy second-hand items"
                      className="card-image"
                    />
                    <div className="image-overlay buy-overlay"></div>
                    <div className="buy-badge">
                      <i className="bi bi-bag-check-fill"></i>
                      <span>Great Deals</span>
                    </div>
                  </div>
                  <div className="card-content buy-content">
                    <div className="buy-icon">
                      <i className="bi bi-shop"></i>
                    </div>
                    <h3 className="card-title">Buy Items</h3>
                    <p className="card-description">
                      Find amazing deals on quality second-hand items
                    </p>
                    <Link to="/Buy" className="action-btn buy-btn" role="button">
                      <i className="bi bi-cart-plus"></i>
                      BUY NOW
                    </Link>
                  </div>
                </div>
              </div> */}

              <div className="col-12 col-md-6 col-lg-5 col-xl-4">
                <div className="action-card donate-card">
                  <div className="card-image-container">
                    <img
                      src="/image/15.png"
                      alt="Donate items for recycling"
                      className="card-image"
                    />
                    <div className="image-overlay donate-overlay"></div>
                    <div className="donate-badge">
                      <i className="bi bi-heart-fill"></i>
                      <span>Give Back</span>
                    </div>
                  </div>
                  <div className="card-content donate-content">
                    <div className="donate-icon">
                      <i className="bi bi-gift"></i>
                    </div>
                    <h3 className="card-title">Donate Items</h3>
                    <p className="card-description">
                      Make a difference by donating your unused items to those in need
                    </p>
                    <div className="donate-benefits">
                      <div className="benefit-item">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Help the community</span>
                      </div>
                      {/* <div className="benefit-item">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Reduce waste</span>
                      </div> */}
                    </div>
                    <Link
                      to="/donate"
                      className="action-btn donate-btn"
                      role="button"
                    >
                      <i className="bi bi-heart"></i>
                      DONATE NOW
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Buy_And_Sale;
