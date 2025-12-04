import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { ItemCategory, UserAddress } from '../types/database'

const categories: { value: ItemCategory; label: string; icon: string; description: string }[] = [
  { value: 'book', label: 'Books', icon: '📚', description: 'Textbooks, notebooks, story books' },
  { value: 'pencil', label: 'Stationery', icon: '✏️', description: 'Pens, pencils, erasers, rulers' },
  { value: 'school_supplies', label: 'School Supplies', icon: '🎒', description: 'Bags, uniforms, other supplies' }
]

const conditions = [
  { value: 'New', label: 'New', description: 'Brand new, unused' },
  { value: 'Like New', label: 'Like New', description: 'Barely used, excellent condition' },
  { value: 'Good', label: 'Good', description: 'Some wear, fully functional' },
  { value: 'Fair', label: 'Fair', description: 'Noticeable wear, still usable' }
]

const countries = [
  { value: 'Sri Lanka', flag: '🇱🇰' },
  { value: 'India', flag: '🇮🇳' },
  { value: 'United States', flag: '🇺🇸' },
  { value: 'United Kingdom', flag: '🇬🇧' },
  { value: 'Canada', flag: '🇨🇦' },
  { value: 'Australia', flag: '🇦🇺' },
  { value: 'Other', flag: '🌍' }
]

export default function DonateItems() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [formData, setFormData] = useState({
    item_name: '',
    category: '' as ItemCategory | '',
    quantity: 1,
    condition: 'Good',
    description: '',
    image_url: '',
    donor_name: '',
    donor_phone: '',
    donor_email: '',
    donor_address: '',
    donor_city: '',
    donor_country: 'Sri Lanka'
  })

  // Fetch addresses
  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  // Auto-select primary address
  useEffect(() => {
    const primary = addresses.find(a => a.is_primary)
    if (primary) {
      setSelectedAddressId(primary.id)
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id)
    }
  }, [addresses])

  const fetchAddresses = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setAddresses(data as UserAddress[] || [])
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  // Pre-fill donor info from profile when no saved addresses
  useEffect(() => {
    if (profile && user && addresses.length === 0) {
      setFormData(prev => ({
        ...prev,
        donor_name: prev.donor_name || profile.name || '',
        donor_phone: prev.donor_phone || profile.phone || '',
        donor_email: prev.donor_email || user.email || '',
        donor_address: prev.donor_address || profile.address || '',
        donor_city: prev.donor_city || profile.city || '',
        donor_country: prev.donor_country || profile.country || 'Sri Lanka'
      }))
    }
  }, [profile, user, addresses])

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get donor data from selected address or form
      let donorInfo = {
        name: formData.donor_name,
        phone: formData.donor_phone,
        email: formData.donor_email,
        address: formData.donor_address,
        city: formData.donor_city,
        country: formData.donor_country
      }

      if (selectedAddressId && !showNewAddressForm) {
        const selectedAddress = addresses.find(a => a.id === selectedAddressId)
        if (selectedAddress) {
          donorInfo = {
            name: selectedAddress.name,
            phone: selectedAddress.phone,
            email: user?.email || '',
            address: selectedAddress.address,
            city: selectedAddress.city,
            country: selectedAddress.country
          }
        }
      }

      const { error } = await supabase.from('donation_items').insert({
        name: formData.item_name,
        description: `${formData.description}\n\n---\nDonor: ${donorInfo.name}\nPhone: ${donorInfo.phone}\nEmail: ${donorInfo.email}\nLocation: ${donorInfo.address}, ${donorInfo.city}, ${donorInfo.country}`,
        category: formData.category as ItemCategory,
        quantity: formData.quantity,
        condition: formData.condition,
        image_url: formData.image_url || null,
        is_available: false,
        donor_id: user.id
      })

      if (error) throw error

      setSubmitted(true)
      toast.success('Thank you! Your donation has been submitted for review.')
    } catch (error) {
      console.error('Error submitting donation:', error)
      toast.error('Failed to submit donation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }))
  }

  const selectCategory = (category: ItemCategory) => {
    setFormData(prev => ({ ...prev, category }))
    setStep(2)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
            🎉
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-8">
            Your donation has been submitted and is pending review. Our team will review it 
            and make it available for those in need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/items"
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Browse Items
            </Link>
            <button
              onClick={() => {
                setSubmitted(false)
                setStep(1)
                setFormData({
                  item_name: '',
                  category: '',
                  quantity: 1,
                  condition: 'Good',
                  description: '',
                  image_url: '',
                  donor_name: profile?.name || '',
                  donor_phone: profile?.phone || '',
                  donor_email: user?.email || '',
                  donor_address: profile?.address || '',
                  donor_city: profile?.city || '',
                  donor_country: profile?.country || 'Sri Lanka'
                })
              }}
              className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
            >
              Donate Another Item
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-[10%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>📚</div>
          <div className="absolute top-20 right-[15%] text-4xl opacity-20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>✏️</div>
          <div className="absolute bottom-10 left-[20%] text-4xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>🎒</div>
          <div className="absolute bottom-20 right-[10%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}>💝</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              💝 Make a Difference
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Donate Items</h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Have school supplies you'd like to donate? Submit them here and help students in need.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`w-20 h-1 ${step >= 3 ? 'bg-gradient-to-r from-teal-500 to-cyan-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>
        </div>

        {/* Step 1: Select Category */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What are you donating?</h2>
              <p className="text-gray-600">Select the category that best describes your item</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => selectCategory(cat.value)}
                  className={`group relative p-8 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${
                    formData.category === cat.value 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{cat.label}</h3>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Item Details */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="mb-6 text-gray-600 hover:text-gray-800 inline-flex items-center gap-2">
              <span>←</span> Back
            </button>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl">
                  {categories.find(c => c.value === formData.category)?.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Item Details</h2>
                  <p className="text-gray-600 text-sm">{categories.find(c => c.value === formData.category)?.label}</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    name="item_name"
                    value={formData.item_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Math Textbook Grade 10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    >
                      {conditions.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Describe the item condition and any details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!formData.item_name || !formData.description}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                >
                  Continue →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {step === 3 && (
          <div>
            <button onClick={() => setStep(2)} className="mb-6 text-gray-600 hover:text-gray-800 inline-flex items-center gap-2">
              <span>←</span> Back
            </button>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-2xl">📍</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Your Contact Info</h2>
                    <p className="text-gray-600 text-sm">For pickup coordination</p>
                  </div>
                </div>
                {addresses.length > 0 && !showNewAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    + Add New
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Saved Address Cards */}
                {addresses.length > 0 && !showNewAddressForm ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Select Address</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {/* Selection indicator */}
                          <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddressId === addr.id
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedAddressId === addr.id && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>

                          {/* Address content */}
                          <div className="pr-8">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">
                                {addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '🏢' : addr.label === 'School' ? '🏫' : '📍'}
                              </span>
                              <span className="font-medium text-gray-800 text-sm">{addr.label}</span>
                              {addr.is_primary && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded">Primary</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{addr.name} • {addr.phone}</p>
                            <p className="text-xs text-gray-500 mt-1">{addr.address}, {addr.city}</p>
                            <p className="text-xs text-gray-500">{countries.find(c => c.value === addr.country)?.flag} {addr.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* New Address Form */
                  <div className="space-y-4">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-sm text-gray-600 hover:text-gray-800 mb-2 inline-flex items-center gap-1"
                      >
                        ← Use saved address
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="donor_name"
                          value={formData.donor_name}
                          onChange={handleChange}
                          required={showNewAddressForm || addresses.length === 0}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          name="donor_phone"
                          value={formData.donor_phone}
                          onChange={handleChange}
                          required={showNewAddressForm || addresses.length === 0}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="donor_email"
                        value={formData.donor_email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="donor_address"
                        value={formData.donor_address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="donor_city"
                          value={formData.donor_city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select
                          name="donor_country"
                          value={formData.donor_country}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
                        >
                          {countries.map(c => (
                            <option key={c.value} value={c.value}>{c.flag} {c.value}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* No saved addresses tip */}
                {addresses.length === 0 && (
                  <p className="text-xs text-gray-500">
                    💡 Tip: <Link to="/profile" className="text-emerald-600 hover:underline">Add addresses in your profile</Link> for faster checkout.
                  </p>
                )}

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Item:</span> {formData.item_name}</p>
                    <p><span className="text-gray-500">Qty:</span> {formData.quantity} • <span className="text-gray-500">Condition:</span> {formData.condition}</p>
                    {selectedAddressId && !showNewAddressForm && addresses.length > 0 && (
                      <p className="text-gray-500 mt-2">
                        📍 {addresses.find(a => a.id === selectedAddressId)?.label} - {addresses.find(a => a.id === selectedAddressId)?.city}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || (showNewAddressForm || addresses.length === 0 ? (!formData.donor_name || !formData.donor_phone) : !selectedAddressId)}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Donation 💝'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-bold text-gray-800 mb-2">Submit</h3>
            <p className="text-gray-600 text-sm">Tell us what you'd like to donate</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-bold text-gray-800 mb-2">Review</h3>
            <p className="text-gray-600 text-sm">Our team reviews and approves</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-bold text-gray-800 mb-2">Connect</h3>
            <p className="text-gray-600 text-sm">We match with students in need</p>
          </div>
        </div>
      </div>
    </div>
  )
}
