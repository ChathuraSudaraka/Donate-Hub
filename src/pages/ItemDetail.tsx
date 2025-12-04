import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { DonationItem, ItemCategory } from '../types/database'

const countries = [
  { value: 'Sri Lanka', flag: '🇱🇰' },
  { value: 'India', flag: '🇮🇳' },
  { value: 'United States', flag: '🇺🇸' },
  { value: 'United Kingdom', flag: '🇬🇧' },
  { value: 'Canada', flag: '🇨🇦' },
  { value: 'Australia', flag: '🇦🇺' },
  { value: 'Other', flag: '🌍' }
]

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [item, setItem] = useState<DonationItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedItems, setRelatedItems] = useState<DonationItem[]>([])
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [requestData, setRequestData] = useState({
    quantity: 1,
    description: '',
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'Sri Lanka'
  })

  useEffect(() => {
    if (id) {
      fetchItem()
    }
  }, [id])

  // Pre-fill shipping from profile
  useEffect(() => {
    if (profile) {
      setRequestData(prev => ({
        ...prev,
        shipping_name: profile.name || '',
        shipping_phone: profile.phone || '',
        shipping_address: profile.address || '',
        shipping_city: profile.city || '',
        shipping_state: profile.state || '',
        shipping_zip: profile.zip_code || '',
        shipping_country: profile.country || 'Sri Lanka'
      }))
    }
  }, [profile])

  const fetchItem = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('donation_items')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setItem(data as DonationItem)

      // Fetch related items
      if (data) {
        const { data: related } = await supabase
          .from('donation_items')
          .select('*')
          .eq('category', data.category)
          .neq('id', id)
          .eq('is_available', true)
          .limit(3)

        setRelatedItems(related as DonationItem[] || [])
      }
    } catch (error) {
      console.error('Error fetching item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !item) return

    if (!requestData.shipping_address || !requestData.shipping_city || !requestData.shipping_phone) {
      toast.error('Please fill in all required shipping fields')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('item_requests').insert({
        user_id: user.id,
        user_email: user.email!,
        user_name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
        item_name: item.name,
        category: item.category,
        quantity: requestData.quantity,
        description: requestData.description || `Requesting ${item.name}`,
        status: 'pending',
        shipping_name: requestData.shipping_name,
        shipping_phone: requestData.shipping_phone,
        shipping_address: requestData.shipping_address,
        shipping_city: requestData.shipping_city,
        shipping_state: requestData.shipping_state,
        shipping_zip: requestData.shipping_zip,
        shipping_country: requestData.shipping_country
      })

      if (error) throw error

      toast.success('Request submitted successfully!')
      setShowModal(false)
      setRequestData({
        quantity: 1,
        description: '',
        shipping_name: profile?.name || '',
        shipping_phone: profile?.phone || '',
        shipping_address: profile?.address || '',
        shipping_city: profile?.city || '',
        shipping_state: profile?.state || '',
        shipping_zip: profile?.zip_code || '',
        shipping_country: profile?.country || 'Sri Lanka'
      })
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryEmoji = (category: ItemCategory) => {
    switch (category) {
      case 'book': return '📚'
      case 'pencil': return '✏️'
      case 'school_supplies': return '🎒'
      default: return '📦'
    }
  }

  const getCategoryLabel = (category: ItemCategory) => {
    switch (category) {
      case 'book': return 'Books'
      case 'pencil': return 'Stationery'
      case 'school_supplies': return 'School Supplies'
      default: return 'Other'
    }
  }

  const getCategoryImage = (category: ItemCategory) => {
    switch (category) {
      case 'book':
        return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop'
      case 'pencil':
        return 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=400&fit=crop'
      case 'school_supplies':
        return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop'
      default:
        return 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=400&fit=crop'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-6">The item you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/items"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Browse All Items
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-300">/</span>
            <Link to="/items" className="text-gray-500 hover:text-gray-700">Items</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-medium">{item.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg">
              <img
                src={item.image_url || getCategoryImage(item.category)}
                alt={item.name}
                className="w-full h-96 object-cover"
              />
              {!item.is_available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="px-6 py-3 bg-red-600 text-white rounded-full font-bold text-lg">
                    Currently Unavailable
                  </span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800 shadow">
                  {getCategoryEmoji(item.category)} {getCategoryLabel(item.category)}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">{item.name}</h1>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.is_available 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.is_available ? '✓ Available' : '✗ Unavailable'}
                </span>
                <span className="text-gray-500 text-sm">
                  Added {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Item Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-semibold text-gray-800 flex items-center gap-2">
                    <span>{getCategoryEmoji(item.category)}</span>
                    {getCategoryLabel(item.category)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Quantity Available</p>
                  <p className="font-semibold text-gray-800">{item.quantity} items</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Condition</p>
                  <p className="font-semibold text-gray-800">{item.condition || 'Good'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Availability</p>
                  <p className={`font-semibold ${item.is_available ? 'text-green-600' : 'text-red-600'}`}>
                    {item.is_available ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {item.is_available ? (
                <button
                  onClick={() => {
                    if (user) {
                      setShowModal(true)
                    } else {
                      navigate('/login')
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Request This Item
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-4 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                >
                  Currently Unavailable
                </button>
              )}
              <Link
                to="/items"
                className="block w-full py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors"
              >
                ← Back to All Items
              </Link>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">ℹ️</span>
                <div>
                  <p className="font-medium text-blue-800 mb-1">How it works</p>
                  <p className="text-sm text-blue-700">
                    Click "Request This Item" to submit a request. Our team will review it 
                    and contact you within 2-3 business days about pickup or delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedItems.map((relatedItem) => (
                <Link
                  key={relatedItem.id}
                  to={`/items/${relatedItem.id}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 relative overflow-hidden">
                    <img
                      src={relatedItem.image_url || getCategoryImage(relatedItem.category)}
                      alt={relatedItem.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">
                      {relatedItem.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedItem.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Qty: {relatedItem.quantity}</span>
                      <span className="text-emerald-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        View <span>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
                  {getCategoryEmoji(item.category)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Request Item</h2>
                  <p className="text-sm text-gray-500">{item.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRequestSubmit} className="p-6 space-y-5">
              {/* Quantity & Reason */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max={item.quantity}
                    value={requestData.quantity}
                    onChange={(e) => setRequestData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Why do you need this?</label>
                  <textarea
                    rows={2}
                    value={requestData.description}
                    onChange={(e) => setRequestData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Tell us briefly why you need this item..."
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📍</span> Delivery Address
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={requestData.shipping_name}
                        onChange={(e) => setRequestData(prev => ({ ...prev, shipping_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={requestData.shipping_phone}
                        onChange={(e) => setRequestData(prev => ({ ...prev, shipping_phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={requestData.shipping_address}
                      onChange={(e) => setRequestData(prev => ({ ...prev, shipping_address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      placeholder="123 Main Street, Apartment 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={requestData.shipping_city}
                        onChange={(e) => setRequestData(prev => ({ ...prev, shipping_city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        placeholder="Colombo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Province/State</label>
                      <input
                        type="text"
                        value={requestData.shipping_state}
                        onChange={(e) => setRequestData(prev => ({ ...prev, shipping_state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        placeholder="Western"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={requestData.shipping_zip}
                        onChange={(e) => setRequestData(prev => ({ ...prev, shipping_zip: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        placeholder="10100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                      <select
                        value={requestData.shipping_country}
                        onChange={(e) => setRequestData(prev => ({ ...prev, shipping_country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                      >
                        {countries.map(c => (
                          <option key={c.value} value={c.value}>{c.flag} {c.value}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                We'll review your request and get back to you within 2-3 business days.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
