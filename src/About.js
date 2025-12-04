import React from "react";
import "./About.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function About() {
  return (
    <div className="about-page">
      {" "}
      <div id="background_about">
        {/* Header Section */}
        <section className="row">
          <div className="col-12">
            <div className="header-section">
              <div className="hero-content">
                <h1 className="hero-title">
                  Your <span className="accent-text">second-hand</span>{" "}
                  marketplace
                </h1>
                <p className="hero-subtitle">
                  Building a sustainable future through conscious consumption
                  and recycling
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="row align-items-center">
            <div className="col-12 col-lg-5 col-xl-4 order-lg-1 order-2">
              <div className="image-container">
                <img
                  id="image_about"
                  src="/image/3.png"
                  alt="Recycle Hub Marketplace"
                  className="img-fluid main-image"
                />
                <div className="image-overlay"></div>
              </div>
            </div>

            <div className="col-12 col-lg-7 col-xl-8 order-lg-2 order-1">
              <div className="content-wrapper">
                {/* Mission Card 1 */}
                <div className="mission-card">
                  <div className="card-icon">
                    <i className="bi bi-recycle"></i>
                  </div>
                  <h3 className="card-title">
                    Promote Effective Waste Reduction, Reuse, and Recycling
                  </h3>
                  <div className="card-content">
                    <div className="objective-item">
                      <i className="bi bi-check-circle-fill"></i>
                      <p>
                        Our site, made just for you...
                        <li>Waste Sorting Guide</li>
                        <li>Second-Hand Marketplace</li>
                        <li>Local Recycling Center Locator</li>
                        <li>Tips for fix broken items</li>
                      </p>
                    </div>
                    <div className="objective-item outcome">
                      <i className="bi bi-graph-up-arrow"></i>
                      <p>
                        <strong>Expected Outcome:</strong> Significant reduction
                        in waste sent to landfills and increased recycling rates
                        through proper waste sorting and upcycling initiatives.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mission Card 2 */}
                <div className="mission-card">
                  <div className="card-icon">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <h3 className="card-title">What You Can Do Here...</h3>
                  <div className="card-content">
                    <div className="objective-item">
                      <i className="bi bi-check-circle-fill"></i>
                      <p>
                        <ul>
                          <li>
                            Less Trash, More Recycling: Fewer items thrown away,
                            more things reused or recycled.
                          </li>
                          <li>
                            People Working Together: A friendly online community
                            where users swap, donate, and help clean up.
                          </li>
                          <li>
                            Easy New Habits: More people buying/selling used
                            items instead of new ones.
                          </li>
                        </ul>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mission Card 3 */}
                <div className="mission-card">
                  <div className="card-icon">
                    <i className="bi bi-trophy-fill"></i>
                  </div>
                  <h3 className="card-title">To build on this...</h3>
                  <div className="card-content">
                    <div className="objective-item">
                      <i className="bi bi-check-circle-fill"></i>
                      <p>
                        Keeping things in use for as long as possible instead of
                        throwing them away. Provide a secondhand marketplace,
                        locate the nearest recycling centers, and teach users
                        how to fix broken items. Encourage people to adopt and
                        maintain eco-friendly habits. Over time, recycling
                        becomes a habit. Promote Waste Reduction, Reuse and
                        Recycling. Increase recycling rates by 10% and reduce
                        landfill waste as much as we can.
                        <p>REUSE. RECYCLE. REPEAT.</p>
                      </p>
                    
                    </div>
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.656811574874!2d79.96745868715821!3d6.930679699999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae257933c002533%3A0x1a4c5c43049f18c4!2sKaduwela%20municipal%20council%20garbage%20recycling%20center!5e0!3m2!1sen!2slk!4v1751338168202!5m2!1sen!2slk"
                     
                       
                      ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
        </section>
      </div>
    </div>
  );
}
