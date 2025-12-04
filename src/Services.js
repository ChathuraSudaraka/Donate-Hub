import React from "react";
import "./Services.css";

export default function Services() {
  const services = [
    {
      id: 1,
      title: "Plastic Items",
      image: "/image/2.jpg",
      description:
        "Recycle plastic bottles, containers, and household plastic items. Help reduce plastic waste in our environment.",
      link: "/Buy",
    },
    {
      id: 2,
      title: "Glass Items",
      image: "/image/5.png",
      description:
        "Glass bottles, jars, and containers can be given a new life. Quality glass items for eco-friendly living.",
      link: "/Buy",
    },
    {
      id: 3,
      title: "Tyres",
      image: "/image/6.jpg",
      description:
        "Used tyres for various purposes including garden decorations, playground equipment, and recycling.",
      link: "/Buy",
    },
    {
      id: 4,
      title: "Electronic Devices",
      image: "/image/8.jpg",
      description:
        "Smartphones, laptops, tablets, and other electronic devices. Certified refurbished electronics.",
      link: "/Buy",
    },
    {
      id: 5,
      title: "Iron & Metal",
      image: "/image/7.jpg",
      description:
        "Iron bars, metal scraps, and construction materials. Quality metal items for industrial use.",
      link: "/Buy",
    },
    {
      id: 6,
      title: "Books",
      image: "/image/9.jpg",
      description:
        "Second-hand books, textbooks, novels, and educational materials. Knowledge sharing made affordable.",
      link: "/Buy",
    },
  ];

  return (
    <section className="services-container">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2 id="Classic_Collectors_Hub">
              <b>Our Services</b>
            </h2>
          </div>
        </div>

        <div className="row services-grid">
          {services.map((service) => (
            <div key={service.id}>
              <div className="service-card">
                <img
                  src={service.image}
                  alt={service.title}
                  className="service-card-image"
                />
                <div className="service-card-body">
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-text">{service.description}</p>
                  <a href={service.link} className="service-card-button">
                    Explore Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features Section */}
        <div className="row mt-5">
          <div className="col-12 text-center">
            <h3
              className="section-subtitle"
              style={{ color: "var(--text-secondary)", marginBottom: "40px" }}
            >
              Why Choose Our Services?
            </h3>
          </div>
          <div className="col-md-4 text-center mb-4">
            <div className="feature-highlight">
              <i
                className="fas fa-leaf"
                style={{
                  fontSize: "2.5rem",
                  color: "var(--green-primary)",
                  marginBottom: "15px",
                }}
              ></i>
              <h4
                style={{ color: "var(--text-primary)", marginBottom: "10px" }}
              >
                Eco-Friendly
              </h4>
              <p style={{ color: "var(--text-secondary)" }}>
                100% environmentally conscious recycling processes
              </p>
            </div>
          </div>
          <div className="col-md-4 text-center mb-4">
            <div className="feature-highlight">
              <i
                className="fas fa-handshake"
                style={{
                  fontSize: "2.5rem",
                  color: "var(--green-primary)",
                  marginBottom: "15px",
                }}
              ></i>
              <h4
                style={{ color: "var(--text-primary)", marginBottom: "10px" }}
              >
                Fair Pricing
              </h4>
              <p style={{ color: "var(--text-secondary)" }}>
                Competitive prices for both buyers and sellers
              </p>
            </div>
          </div>
          <div className="col-md-4 text-center mb-4">
            <div className="feature-highlight">
              <i
                className="fas fa-shipping-fast"
                style={{
                  fontSize: "2.5rem",
                  color: "var(--green-primary)",
                  marginBottom: "15px",
                }}
              ></i>
              <h4
                style={{ color: "var(--text-primary)", marginBottom: "10px" }}
              >
                Fast Service
              </h4>
              <p style={{ color: "var(--text-secondary)" }}>
                Quick pickup
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
