import react from "react";  

export default function Locate() {
  return (
    <div className="locate-page">
      <div id="background_locate">
        <section className="row">
          <div className="col-12">
            <div className="header-section">
              <div className="hero-content">
                <h1 className="hero-title">Locate Donation Centers</h1>
                <p className="hero-subtitle">
                  Find your nearest donation center with ease
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="map-section">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15842.656811574874!2d79.96745868715821!3d6.930679699999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae257933c002533%3A0x1a4c5c43049f18c4!2sKaduwela%20municipal%20council%20garbage%20recycling%20center!5e0!3m2!1sen!2slk!4v1751338168202!5m2!1sen!2slk"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </section>
      </div>
    </div>
  );
}