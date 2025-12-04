import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Message sent successfully! We\'ll get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-[10%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>💬</div>
          <div className="absolute top-20 right-[15%] text-4xl opacity-20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>📧</div>
          <div className="absolute bottom-10 left-[20%] text-4xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>🤝</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              💬 We'd Love to Hear From You
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Have questions about donating or requesting items? We're here to help!
              Our team typically responds within 24 hours.
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-24 mb-16 relative z-10">
          <div className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📧
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Email Us</h3>
            <p className="text-gray-600 text-sm mb-3">We'll respond within 24 hours</p>
            <a href="mailto:support@donatehub.org" className="text-emerald-600 font-medium hover:text-emerald-700 inline-flex items-center gap-1">
              support@donatehub.org
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          <div className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📞
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Call Us</h3>
            <p className="text-gray-600 text-sm mb-3">Mon-Fri from 9am to 5pm</p>
            <a href="tel:+15551234567" className="text-emerald-600 font-medium hover:text-emerald-700 inline-flex items-center gap-1">
              +1 (555) 123-4567
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          <div className="group bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📍
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Visit Us</h3>
            <p className="text-gray-600 text-sm mb-3">Come say hello at our office</p>
            <span className="text-emerald-600 font-medium">
              123 Charity Lane, Good City
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Send us a Message</h2>
              <p className="text-gray-600">Fill out the form and we'll get back to you shortly.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  What can we help you with?
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                >
                  <option value="">Select a subject</option>
                  <option value="donation">🎁 I want to donate items</option>
                  <option value="request">📚 I need items for my school</option>
                  <option value="volunteer">🤝 I want to volunteer</option>
                  <option value="partnership">🏢 Business partnership</option>
                  <option value="other">💬 Other inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send Message
                    <span>→</span>
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Image Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=600&h=400&fit=crop" 
                alt="Team collaboration" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-bold text-xl mb-1">We're Here to Help</h3>
                <p className="text-white/80 text-sm">Our dedicated team is ready to assist you with any questions</p>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="font-bold text-gray-800 text-xl mb-6">Frequently Asked</h3>
              <div className="space-y-4">
                <div className="group p-4 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 group-hover:text-emerald-700">How do I donate items?</span>
                    <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
                <div className="group p-4 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 group-hover:text-emerald-700">Can I request specific items?</span>
                    <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
                <div className="group p-4 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 group-hover:text-emerald-700">How can I volunteer?</span>
                    <span className="text-emerald-600 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Donation Card */}
            <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="font-bold text-xl mb-2">Bulk Donations?</h3>
                <p className="text-emerald-100 mb-6">
                  If you're a business or organization looking to donate large quantities, 
                  we'd love to arrange a pickup!
                </p>
                <a
                  href="mailto:partnerships@donatehub.org"
                  className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 hover:text-emerald-700 transition-all"
                >
                  Contact Partnerships
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
