import React from "react";
import "./Home.css";
import Services from "./Services";

export default function Home() {
  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <div id="home_background_image">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="home-hero-content">
                <h1 id="Recycle_Hub_home">Donate Hub</h1>
                <p id="Buy_and_Sell_home">
                Donate your items, support your community
                </p>
                <p className="home-hero-description">
                  Join Donate Hub today and make a difference by donating your
                  unused items to those in need. Together, we can build a stronger,
                  more sustainable community.
                </p>
                <div className="home-hero-buttons">
                  <a
                    href="/Buy_And_Sale"
                    type="button"
                    id="home_button_primary"
                    className="home-btn-primary"
                  >
                    DONATE
                  </a>
                  <a href="/reqdon" type="button" className="home-btn-secondary">
                    REQUEST DONATION
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      {/* <section className="home-features-section">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="home-section-title">Why Choose Recycle Hub?</h2>
              <p className="home-section-subtitle">
                Making sustainable shopping accessible for everyone
              </p>
            </div>
          </div>
          <div className="row home-features-grid">
            <div className="col-md-4">
              <div className="home-feature-card">
                <div className="home-feature-icon">
                  <i className="fas fa-recycle"></i>
                </div>
                <h3>Eco-Friendly</h3>
                <p>
                  Reduce waste by giving items a second life. Every purchase
                  contributes to a cleaner planet.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="home-feature-card">
                <div className="home-feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>Secure Trading</h3>
                <p>
                  Safe and secure transactions with verified sellers and
                  quality-checked products.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="home-feature-card">
                <div className="home-feature-icon">
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <h3>Great Deals</h3>
                <p>
                  Find amazing deals on quality second-hand items at unbeatable
                  prices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Statistics Section */}
      {/* <section className="home-stats-section">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-6">
              <div className="home-stat-item">
                <h3 className="home-stat-number">10K+</h3>
                <p className="home-stat-label">Happy Customers</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="home-stat-item">
                <h3 className="home-stat-number">50K+</h3>
                <p className="home-stat-label">Items Sold</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="home-stat-item">
                <h3 className="home-stat-number">25K+</h3>
                <p className="home-stat-label">CO₂ Saved</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="home-stat-item">
                <h3 className="home-stat-number">100+</h3>
                <p className="home-stat-label">Cities Covered</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* How It Works Section */}
      {/* <section className="home-how-it-works">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="home-section-title">How It Works</h2>
              <p className="home-section-subtitle">
                Simple steps to start your sustainable shopping journey
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="home-step-card">
                <div className="home-step-number">1</div>
                <h4>Browse & Discover</h4>
                <p>
                  Explore thousands of quality second-hand items from
                  electronics to furniture.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="home-step-card">
                <div className="home-step-number">2</div>
                <h4>Buy or Sell</h4>
                <p>
                  Purchase items you love or list your own products to earn
                  while helping the environment.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="home-step-card">
                <div className="home-step-number">3</div>
                <h4>Make Impact</h4>
                <p>
                  Every transaction contributes to reducing waste and creating a
                  sustainable future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* <Services /> */}
    </div>
  );
}
