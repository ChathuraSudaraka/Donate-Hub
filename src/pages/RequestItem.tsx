import { useState, useEffect } from 'react'
import { Navigate, Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { ItemCategory } from '../types/database'

const categories: { value: ItemCategory; label: string; icon: string; description: string }[] = [
  { value: 'book', label: 'Books', icon: '📚', description: 'Textbooks, notebooks, story books' },
  { value: 'pencil', label: 'Stationery', icon: '✏️', description: 'Pens, pencils, erasers, rulers' },
  { value: 'school_supplies', label: 'School Supplies', icon: '🎒', description: 'Bags, uniforms, other supplies' }
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

export default function RequestItem() {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [useProfileAddress, setUseProfileAddress] = useState(true)
  const [formData, setFormData] = useState({
    item_name: '',
    category: '' as ItemCategory | '',
    quantity: 1,
    urgency: 'normal' as 'low' | 'normal' | 'high',
    description: '',
    // Shipping address fields
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'Sri Lanka'
  })

  // Check for pre-filled item from URL params (from ItemDetail page)
  useEffect(() => {
    const itemName = searchParams.get('item')
    const category = searchParams.get('category') as ItemCategory | null
    
    if (itemName && category) {
      setFormData(prev => ({
        ...prev,
        item_name: itemName,
        category: category
      }))
      // Skip to step 2 if item is pre-filled
      setStep(2)
    }
  }, [searchParams])

  // Pre-fill from profile when available
  useEffect(() => {
    if (profile && useProfileAddress) {
      setFormData(prev => ({
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
  }, [profile, useProfileAddress])

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate shipping address
    if (!formData.shipping_address || !formData.shipping_city || !formData.shipping_state || !formData.shipping_zip) {
      toast.error('Please fill in your complete shipping address')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.from('item_requests').insert({
        user_id: user.id,
        user_email: user.email!,
        user_name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
        item_name: formData.item_name,
        category: formData.category as ItemCategory,
        quantity: formData.quantity,
        description: formData.description,
        status: 'pending',
        // Shipping address snapshot
        shipping_name: formData.shipping_name || profile?.name || '',
        shipping_phone: formData.shipping_phone,
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_zip: formData.shipping_zip,
        shipping_country: formData.shipping_country
      })

      if (error) throw error

      toast.success('Request submitted successfully! We will review it shortly.')
      setFormData({
        item_name: '',
        category: '',
        quantity: 1,
        urgency: 'normal',
        description: '',
        shipping_name: profile?.name || '',
        shipping_phone: profile?.phone || '',
        shipping_address: profile?.address || '',
        shipping_city: profile?.city || '',
        shipping_state: profile?.state || '',
        shipping_zip: profile?.zip_code || '',
        shipping_country: profile?.country || 'Sri Lanka'
      })
      setStep(1)
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit request. Please try again.')
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

  const canProceed = formData.category && formData.item_name && formData.description && 
    formData.shipping_address && formData.shipping_city && formData.shipping_state && formData.shipping_zip

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-[10%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>📚</div>
          <div className="absolute top-20 right-[15%] text-4xl opacity-20 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>✏️</div>
          <div className="absolute bottom-10 left-[20%] text-4xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>🎒</div>
          <div className="absolute bottom-20 right-[10%] text-5xl opacity-20 animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}>🎨</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              🙋 Request School Supplies
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Request Items</h1>
            <p className="text-orange-100 text-lg max-w-2xl mx-auto">
              Need school supplies? We're here to help! Submit a request and our
              community will work to fulfill it.
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
            <div className={`w-16 h-1 ${step >= 4 ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 4 ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              4
            </div>
          </div>
        </div>

        {/* Step 1: Select Category */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What do you need?</h2>
              <p className="text-gray-600">Select the category that best fits your request</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => selectCategory(cat.value)}
                  className={`group relative p-8 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${
                    formData.category === cat.value 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 bg-white hover:border-orange-300'
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
          <div className="animate-fadeIn">
            <button 
              onClick={() => {
                // Clear pre-filled data if going back
                if (searchParams.get('item')) {
                  setFormData(prev => ({ ...prev, item_name: '', category: '' }))
                }
                setStep(1)
              }}
              className="mb-6 text-gray-600 hover:text-gray-800 inline-flex items-center gap-2 transition-colors"
            >
              <span>←</span> Back to categories
            </button>

            {/* Pre-filled Item Notice */}
            {searchParams.get('item') && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-medium text-emerald-800">Requesting specific item</p>
                    <p className="text-emerald-600 text-sm">You're requesting: <strong>{searchParams.get('item')}</strong></p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center text-3xl">
                  {categories.find(c => c.value === formData.category)?.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Tell us more</h2>
                  <p className="text-gray-600">Requesting: {categories.find(c => c.value === formData.category)?.label}</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6">
                <div>
                  <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-2">
                    What specific item do you need?
                  </label>
                  <input
                    type="text"
                    id="item_name"
                    name="item_name"
                    value={formData.item_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="e.g., Math textbook Grade 5, Colored pencils set"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      How many do you need?
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                      How urgent is your need?
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="low">🟢 Can wait (2+ weeks)</option>
                      <option value="normal">🟡 Normal (1-2 weeks)</option>
                      <option value="high">🔴 Urgent (within a week)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us why you need this
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
                    placeholder="Share your story - this helps donors understand your need and prioritize requests..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!formData.item_name || !formData.description}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Continue to Shipping →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 3: Shipping Address */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <button 
              onClick={() => setStep(2)}
              className="mb-6 text-gray-600 hover:text-gray-800 inline-flex items-center gap-2 transition-colors"
            >
              <span>←</span> Back to details
            </button>

            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl">
                  📦
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Shipping Address</h2>
                  <p className="text-gray-600">Where should we deliver your items?</p>
                </div>
              </div>

              {/* Use Profile Address Toggle */}
              {profile?.address && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useProfileAddress}
                      onChange={(e) => {
                        setUseProfileAddress(e.target.checked)
                        if (e.target.checked && profile) {
                          setFormData(prev => ({
                            ...prev,
                            shipping_name: profile.name || '',
                            shipping_phone: profile.phone || '',
                            shipping_address: profile.address || '',
                            shipping_city: profile.city || '',
                            shipping_state: profile.state || '',
                            shipping_zip: profile.zip_code || '',
                            shipping_country: profile.country || 'India'
                          }))
                        }
                      }}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-emerald-800 font-medium">Use address from my profile</span>
                  </label>
                </div>
              )}

              {!profile?.address && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-800 text-sm">
                    💡 <strong>Tip:</strong> Save your address in your <Link to="/profile" className="underline font-medium">profile</Link> to auto-fill it next time!
                  </p>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="shipping_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="shipping_name"
                      name="shipping_name"
                      value={formData.shipping_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="Recipient's full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="shipping_phone"
                      name="shipping_phone"
                      value={formData.shipping_phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
                    placeholder="House no, Street name, Area/Locality"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="shipping_city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="shipping_city"
                      name="shipping_city"
                      value={formData.shipping_city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping_state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      id="shipping_state"
                      name="shipping_state"
                      value={formData.shipping_state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping_zip" className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      id="shipping_zip"
                      name="shipping_zip"
                      value={formData.shipping_zip}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="123456"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping_country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      id="shipping_country"
                      name="shipping_country"
                      value={formData.shipping_country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    >
                      {countries.map(c => (
                        <option key={c.value} value={c.value}>{c.flag} {c.value}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!formData.shipping_address || !formData.shipping_city || !formData.shipping_state || !formData.shipping_zip || !formData.shipping_phone}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Continue to Review →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <button 
              onClick={() => setStep(3)}
              className="mb-6 text-gray-600 hover:text-gray-800 inline-flex items-center gap-2 transition-colors"
            >
              <span>←</span> Back to shipping
            </button>

            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  {categories.find(c => c.value === formData.category)?.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Your Request</h2>
                <p className="text-gray-600">Please confirm all details below</p>
              </div>

              {/* Item Details */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-lg">📦</span> Item Details
                </h3>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold text-gray-800">{categories.find(c => c.value === formData.category)?.label}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Item</span>
                  <span className="font-semibold text-gray-800">{formData.item_name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-semibold text-gray-800">{formData.quantity}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Urgency</span>
                  <span className={`font-semibold ${
                    formData.urgency === 'high' ? 'text-red-600' : 
                    formData.urgency === 'normal' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {formData.urgency === 'high' ? '🔴 Urgent' : formData.urgency === 'normal' ? '🟡 Normal' : '🟢 Can wait'}
                  </span>
                </div>
                <div className="py-3">
                  <span className="text-gray-600 block mb-2">Reason</span>
                  <p className="text-gray-800 bg-white p-4 rounded-xl">{formData.description}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2 mb-4">
                  <span className="text-lg">📍</span> Delivery Address
                </h3>
                <div className="text-purple-700 space-y-1">
                  <p className="font-medium">{formData.shipping_name}</p>
                  <p>{formData.shipping_address}</p>
                  <p>{formData.shipping_city}, {formData.shipping_state} - {formData.shipping_zip}</p>
                  <p>{formData.shipping_country}</p>
                  <p className="pt-2 text-sm">📞 {formData.shipping_phone}</p>
                </div>
              </div>

              {/* Requesting as */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
                <p className="font-semibold text-emerald-800 mb-1">Requesting as:</p>
                <p className="text-emerald-700 text-sm">
                  {profile?.name || user.email?.split('@')[0]} • {user.email}
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed}
                className="w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Submit Request
                    <span>🎉</span>
                  </span>
                )}
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                By submitting, you agree to our terms of service. Our team will review your request within 24-48 hours.
              </p>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-gray-800 mb-2">Submit Request</h3>
            <p className="text-gray-600 text-sm">Tell us what you need and why. Be as specific as possible.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">👀</div>
            <h3 className="font-bold text-gray-800 mb-2">We Review</h3>
            <p className="text-gray-600 text-sm">Our team reviews requests and matches them with available donations.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-bold text-gray-800 mb-2">Get Supplies</h3>
            <p className="text-gray-600 text-sm">Once approved, we'll arrange delivery of your requested items.</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
