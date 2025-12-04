import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { ItemRequest, UserAddress, DonationItem } from '../types/database'

interface ProfileData {
  name: string
  phone: string
}

const countries = [
  { value: 'Sri Lanka', flag: '🇱🇰' },
  { value: 'India', flag: '🇮🇳' },
  { value: 'United States', flag: '🇺🇸' },
  { value: 'United Kingdom', flag: '🇬🇧' },
  { value: 'Canada', flag: '🇨🇦' },
  { value: 'Australia', flag: '🇦🇺' },
  { value: 'Other', flag: '🌍' }
]

const addressLabels = ['Home', 'Work', 'School', 'Other']

export default function Profile() {
  const { user, profile, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'requests'>('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [requests, setRequests] = useState<ItemRequest[]>([])
  const [myDonations, setMyDonations] = useState<DonationItem[]>([])
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [requestsSubTab, setRequestsSubTab] = useState<'requests' | 'donations'>('requests')
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    phone: ''
  })
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'Sri Lanka',
    is_primary: false
  })

  useEffect(() => {
    if (profile) {
      setProfileData(prev => ({
        ...prev,
        name: profile.name || ''
      }))
      fetchProfileDetails()
      fetchAddresses()
      fetchMyRequests()
      fetchMyDonations()
    }
  }, [profile])

  const fetchProfileDetails = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setProfileData({
          name: data.name || '',
          phone: data.phone || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

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

  const fetchMyRequests = async () => {
    if (!user) return
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('item_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data as ItemRequest[])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyDonations = async () => {
    if (!user) return
    
    try {
      // Fetch donations by donor_id
      const { data, error } = await supabase
        .from('donation_items')
        .select('*')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMyDonations(data as DonationItem[])
    } catch (error) {
      console.error('Error fetching donations:', error)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          name: profileData.name,
          phone: profileData.phone
        })

      if (error) throw error
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSaving(true)
    
    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('user_addresses')
          .update({
            label: addressForm.label,
            name: addressForm.name,
            phone: addressForm.phone,
            address: addressForm.address,
            city: addressForm.city,
            state: addressForm.state,
            zip_code: addressForm.zip_code,
            country: addressForm.country,
            is_primary: addressForm.is_primary
          })
          .eq('id', editingAddress.id)

        if (error) throw error
        toast.success('Address updated!')
      } else {
        // Create new address
        const { error } = await supabase
          .from('user_addresses')
          .insert({
            user_id: user.id,
            label: addressForm.label,
            name: addressForm.name,
            phone: addressForm.phone,
            address: addressForm.address,
            city: addressForm.city,
            state: addressForm.state,
            zip_code: addressForm.zip_code,
            country: addressForm.country,
            is_primary: addresses.length === 0 ? true : addressForm.is_primary
          })

        if (error) throw error
        toast.success('Address added!')
      }

      setShowAddressModal(false)
      setEditingAddress(null)
      resetAddressForm()
      fetchAddresses()
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)

      if (error) throw error
      toast.success('Address deleted!')
      fetchAddresses()
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    }
  }

  const handleSetPrimary = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_primary: true })
        .eq('id', addressId)

      if (error) throw error
      toast.success('Primary address updated!')
      fetchAddresses()
    } catch (error) {
      console.error('Error setting primary:', error)
      toast.error('Failed to set primary address')
    }
  }

  const openEditAddress = (address: UserAddress) => {
    setEditingAddress(address)
    setAddressForm({
      label: address.label,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state || '',
      zip_code: address.zip_code || '',
      country: address.country,
      is_primary: address.is_primary
    })
    setShowAddressModal(true)
  }

  const resetAddressForm = () => {
    setAddressForm({
      label: 'Home',
      name: profileData.name || '',
      phone: profileData.phone || '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'Sri Lanka',
      is_primary: false
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      fulfilled: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'book': return '📚'
      case 'pencil': return '✏️'
      case 'school_supplies': return '🎒'
      default: return '📦'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
              {profileData.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profileData.name || 'User'}</h1>
              <p className="text-emerald-100">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl shadow p-1 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'addresses'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Addresses ({addresses.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'requests'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Requests ({requests.length})
            </span>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
              <p className="text-gray-600 text-sm">Update your basic profile information</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            {/* Add Address Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Shipping Addresses</h2>
                <p className="text-gray-600 text-sm">Manage your delivery addresses</p>
              </div>
              <button
                onClick={() => {
                  setEditingAddress(null)
                  resetAddressForm()
                  setShowAddressModal(true)
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Address
              </button>
            </div>

            {/* Address Cards */}
            {addresses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses yet</h3>
                <p className="text-gray-600 mb-6">Add a shipping address to make requesting items easier.</p>
                <button
                  onClick={() => {
                    setEditingAddress(null)
                    resetAddressForm()
                    setShowAddressModal(true)
                  }}
                  className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`relative bg-white rounded-2xl shadow-lg p-6 border-2 transition-all ${
                      addr.is_primary ? 'border-emerald-500' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    {/* Primary Badge */}
                    {addr.is_primary && (
                      <div className="absolute -top-3 left-4">
                        <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                          ✓ Primary
                        </span>
                      </div>
                    )}

                    {/* Label */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">
                        {addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '🏢' : addr.label === 'School' ? '🏫' : '📍'}
                      </span>
                      <span className="font-semibold text-gray-800">{addr.label}</span>
                    </div>

                    {/* Address Details */}
                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <p className="font-medium text-gray-800">{addr.name}</p>
                      <p>{addr.phone}</p>
                      <p>{addr.address}</p>
                      <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip_code}</p>
                      <p>{countries.find(c => c.value === addr.country)?.flag} {addr.country}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      {!addr.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(addr.id)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Set as Primary
                        </button>
                      )}
                      <button
                        onClick={() => openEditAddress(addr)}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium ml-auto"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="bg-white rounded-xl shadow p-1 flex">
              <button
                onClick={() => setRequestsSubTab('requests')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                  requestsSubTab === 'requests'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  📦 My Requests ({requests.length})
                </span>
              </button>
              <button
                onClick={() => setRequestsSubTab('donations')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                  requestsSubTab === 'donations'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  💝 My Donations ({myDonations.length})
                </span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              </div>
            ) : requestsSubTab === 'requests' ? (
              /* Item Requests */
              requests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No requests yet</h3>
                  <p className="text-gray-600 mb-6">You haven't made any item requests.</p>
                  <a
                    href="/items"
                    className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Browse Items
                  </a>
                </div>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                          {getCategoryEmoji(request.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-800">{request.item_name}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span>Quantity: {request.quantity}</span>
                            <span>•</span>
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                          {request.admin_notes && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                              <span className="font-medium text-blue-800">Admin note:</span>{' '}
                              <span className="text-blue-700">{request.admin_notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              /* My Donations */
              myDonations.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">💝</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No donations yet</h3>
                  <p className="text-gray-600 mb-6">You haven't donated any items yet.</p>
                  <a
                    href="/donate"
                    className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Donate Items
                  </a>
                </div>
              ) : (
                myDonations.map((donation) => {
                  const descParts = donation.description.split('---')
                  const mainDesc = descParts[0]?.trim() || donation.description
                  
                  return (
                    <div key={donation.id} className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${donation.is_available ? 'border-green-500' : 'border-orange-400'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${donation.is_available ? 'bg-green-100' : 'bg-orange-100'}`}>
                            {getCategoryEmoji(donation.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-800">{donation.name}</h3>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                donation.is_available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {donation.is_available ? '✓ Approved' : '⏳ Pending Review'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{mainDesc}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              <span>Quantity: {donation.quantity}</span>
                              <span>•</span>
                              <span>Condition: {donation.condition || 'Good'}</span>
                              <span>•</span>
                              <span>{new Date(donation.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )
            )}
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <p className="text-sm text-gray-500">Fill in your delivery details</p>
              </div>
              <button
                onClick={() => {
                  setShowAddressModal(false)
                  setEditingAddress(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Label</label>
                <div className="flex gap-2 flex-wrap">
                  {addressLabels.map(label => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setAddressForm(prev => ({ ...prev, label }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        addressForm.label === label
                          ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {label === 'Home' ? '🏠' : label === 'Work' ? '🏢' : label === 'School' ? '🏫' : '📍'} {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={addressForm.address}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="123 Main Street, Apartment 4B"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="Colombo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Province/State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="Western"
                  />
                </div>
              </div>

              {/* Zip & Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.zip_code}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, zip_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="10100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                  <select
                    value={addressForm.country}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white"
                  >
                    {countries.map(c => (
                      <option key={c.value} value={c.value}>{c.flag} {c.value}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={addressForm.is_primary}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, is_primary: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_primary" className="text-sm text-gray-700">
                  Set as primary address
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  editingAddress ? 'Update Address' : 'Add Address'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
