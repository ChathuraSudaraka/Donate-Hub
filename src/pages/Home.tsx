import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-32 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] text-6xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>📚</div>
          <div className="absolute top-40 right-[15%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>✏️</div>
          <div className="absolute bottom-32 left-[20%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>🎒</div>
          <div className="absolute bottom-20 right-[25%] text-4xl opacity-20 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}>📖</div>
          <div className="absolute top-1/3 left-[5%] text-4xl opacity-15 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.7s' }}>🖊️</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                🌟 Empowering Education for All
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Make a <span className="text-yellow-300">Difference</span> in a Child's Life
              </h1>
              <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-xl">
                Help students succeed by donating books, pencils, and school supplies. 
                Every contribution brings a child closer to their dreams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/items"
                  className="group bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-300 hover:text-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  View Items
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                {user ? (
                  <Link
                    to="/request"
                    className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-300 hover:-translate-y-1"
                  >
                    Request an Item
                    <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-300 hover:-translate-y-1"
                  >
                    Join Us Today
                    <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[500px]">
                {/* Main Image Card */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop" 
                    alt="Students learning" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                {/* Secondary Image Card */}
                <div className="absolute bottom-10 left-0 w-64 h-64 bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=300&fit=crop" 
                    alt="Books and supplies" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                {/* Floating Stats Card */}
                <div className="absolute top-1/2 left-1/4 bg-white text-gray-800 rounded-2xl p-4 shadow-xl animate-float">
                  <div className="text-3xl font-bold text-emerald-600">500+</div>
                  <div className="text-sm text-gray-600">Items Donated</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl font-bold text-emerald-600 mb-2">500+</div>
                <div className="text-gray-600 font-medium">Items Donated</div>
                <div className="mt-4 text-4xl">📦</div>
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl font-bold text-blue-600 mb-2">200+</div>
                <div className="text-gray-600 font-medium">Students Helped</div>
                <div className="mt-4 text-4xl">👨‍🎓</div>
              </div>
            </div>
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-gray-600 font-medium">Schools Reached</div>
                <div className="mt-4 text-4xl">🏫</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              What We Accept
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Donate What You Can
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Every item makes a difference. Choose from our categories below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Books */}
            <div className="group relative bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop" 
                  alt="Books" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                📚
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Books</h3>
                <p className="text-gray-600 mb-4">
                  Textbooks, storybooks, encyclopedias, and educational materials for all ages.
                </p>
                <Link to="/items" className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 group/link">
                  Browse Books 
                  <span className="ml-2 group-hover/link:translate-x-2 transition-transform">→</span>
                </Link>
              </div>
            </div>

            {/* Pencils */}
            <div className="group relative bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop" 
                  alt="Pencils and Pens" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                ✏️
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Pencils & Pens</h3>
                <p className="text-gray-600 mb-4">
                  Writing instruments including pencils, pens, markers, and colored pencils.
                </p>
                <Link to="/items" className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 group/link">
                  Browse Pencils 
                  <span className="ml-2 group-hover/link:translate-x-2 transition-transform">→</span>
                </Link>
              </div>
            </div>

            {/* School Supplies */}
            <div className="group relative bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop" 
                  alt="School Supplies" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                🎒
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">School Supplies</h3>
                <p className="text-gray-600 mb-4">
                  Backpacks, notebooks, geometry sets, erasers, and other essential supplies.
                </p>
                <Link to="/items" className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 group/link">
                  Browse Supplies 
                  <span className="ml-2 group-hover/link:translate-x-2 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-200 via-teal-300 to-cyan-200 -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <div className="group text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mx-auto">
                    1
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl shadow-md">
                    👤
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-800">Sign Up</h3>
                <p className="text-gray-600">Create a free account to get started with DonateHub</p>
              </div>

              <div className="group text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mx-auto">
                    2
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl shadow-md">
                    🔍
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-800">Browse Items</h3>
                <p className="text-gray-600">Explore our collection of donated school supplies</p>
              </div>

              <div className="group text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mx-auto">
                    3
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-2xl shadow-md">
                    📝
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-800">Request</h3>
                <p className="text-gray-600">Submit a request for the items you need</p>
              </div>

              <div className="group text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 mx-auto">
                    4
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl shadow-md">
                    🎉
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-gray-800">Receive</h3>
                <p className="text-gray-600">Get approved and receive your items for free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial/Impact Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                💬 Success Stories
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Making Real <span className="text-emerald-400">Impact</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                "Thanks to DonateHub, I received the textbooks I needed for my final exams. 
                I couldn't afford them on my own, and now I'm pursuing my dream of becoming a doctor."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                  alt="Student" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400"
                />
                <div>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-gray-400 text-sm">Medical Student</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors">
                  <div className="text-3xl mb-2">🎓</div>
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-gray-400 text-sm">Request Approval Rate</div>
                </div>
                <div className="bg-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-emerald-500/30 transition-colors">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold">4.9/5</div>
                  <div className="text-gray-400 text-sm">User Satisfaction</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-teal-500/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-teal-500/30 transition-colors">
                  <div className="text-3xl mb-2">🌍</div>
                  <div className="text-2xl font-bold">15+</div>
                  <div className="text-gray-400 text-sm">Cities Covered</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors">
                  <div className="text-3xl mb-2">❤️</div>
                  <div className="text-2xl font-bold">100+</div>
                  <div className="text-gray-400 text-sm">Active Donors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-10 right-20 w-16 h-16 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-block mb-6">
            <span className="text-6xl animate-bounce inline-block">🎁</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Make an Impact?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join our community of donors and recipients. Together, we can ensure 
            every student has the tools they need to succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="group bg-white text-emerald-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Get Started Free
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              to="/contact"
              className="group border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-300 hover:-translate-y-1"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
