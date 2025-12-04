import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { ItemRequest, DonationItem, ItemCategory, RequestStatus } from '../types/database'

type TabType = 'requests' | 'donations' | 'items' | 'add-item'

export default function AdminPanel() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('requests')
  const [requests, setRequests] = useState<ItemRequest[]>([])
  const [items, setItems] = useState<DonationItem[]>([])
  const [pendingDonations, setPendingDonations] = useState<DonationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null)

  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category: 'book' as ItemCategory,
    quantity: 1,
    image_url: ''
  })

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin])

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchRequests(), fetchItems(), fetchPendingDonations()])
    setLoading(false)
  }

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('item_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data as ItemRequest[])
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const fetchPendingDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_items')
        .select('*')
        .eq('is_available', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingDonations(data as DonationItem[])
    } catch (error) {
      console.error('Error fetching pending donations:', error)
    }
  }

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_items')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data as DonationItem[])
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const approveDonation = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('donation_items')
        .update({ is_available: true })
        .eq('id', itemId)

      if (error) throw error
      
      toast.success('Donation approved and now visible!')
      fetchData()
    } catch (error) {
      console.error('Error approving donation:', error)
      toast.error('Failed to approve donation')
    }
  }

  const rejectDonation = async (itemId: string) => {
    if (!confirm('Are you sure you want to reject and delete this donation?')) return

    try {
      const { error } = await supabase
        .from('donation_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      
      toast.success('Donation rejected')
      fetchData()
    } catch (error) {
      console.error('Error rejecting donation:', error)
      toast.error('Failed to reject donation')
    }
  }

  const updateRequestStatus = async (requestId: string, status: RequestStatus) => {
    try {
      const { error } = await supabase
        .from('item_requests')
        .update({ status })
        .eq('id', requestId)

      if (error) throw error
      
      toast.success(`Request ${status}!`)
      fetchRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      toast.error('Failed to update request')
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase.from('donation_items').insert({
        name: newItem.name,
        description: newItem.description,
        category: newItem.category,
        quantity: newItem.quantity,
        image_url: newItem.image_url || null,
        is_available: true
      })

      if (error) throw error

      toast.success('Item added successfully!')
      setNewItem({
        name: '',
        description: '',
        category: 'book',
        quantity: 1,
        image_url: ''
      })
      fetchItems()
      setActiveTab('items')
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item')
    }
  }

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('donation_items')
        .update({ is_available: !isAvailable })
        .eq('id', itemId)

      if (error) throw error
      
      toast.success(`Item ${!isAvailable ? 'enabled' : 'disabled'}`)
      fetchItems()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item')
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('donation_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      
      toast.success('Item deleted')
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  // Redirect if not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />
  }

  const getCategoryEmoji = (category: ItemCategory) => {
    switch (category) {
      case 'book': return '📚'
      case 'pencil': return '✏️'
      case 'school_supplies': return '🎒'
      default: return '📦'
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-sm text-gray-500">Manage requests and inventory</p>
            </div>
            <button
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Requests
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'donations'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Donations
              {pendingDonations.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  {pendingDonations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'items'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Inventory ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('add-item')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'add-item'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-3">
                {requests.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl">
                    <div className="text-5xl mb-3">📭</div>
                    <h3 className="text-lg font-semibold text-gray-800">No requests yet</h3>
                    <p className="text-gray-500 text-sm">Requests will appear here</p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div key={request.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                            {getCategoryEmoji(request.category)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-gray-800">{request.item_name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {request.status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-1 mb-2">{request.description}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              <span>{request.user_name}</span>
                              <span>•</span>
                              <span>{request.user_email}</span>
                              <span>•</span>
                              <span>Qty: {request.quantity}</span>
                              <span>•</span>
                              <span>{new Date(request.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-shrink-0">
                            {/* Expand/Collapse Button */}
                            <button
                              onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title={expandedRequest === request.id ? 'Hide details' : 'Show shipping details'}
                            >
                              <svg className={`w-5 h-5 transition-transform ${expandedRequest === request.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateRequestStatus(request.id, 'approved')}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateRequestStatus(request.id, 'rejected')}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <button
                                onClick={() => updateRequestStatus(request.id, 'fulfilled')}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                Mark Fulfilled
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Shipping Details */}
                      {expandedRequest === request.id && (
                        <div className="border-t bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-lg p-4 border">
                              <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                                <span className="text-lg">📍</span> Shipping Address
                              </h4>
                              {request.shipping_address ? (
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p className="font-medium text-gray-800">{request.shipping_name || request.user_name}</p>
                                  <p>{request.shipping_address}</p>
                                  <p>{request.shipping_city}, {request.shipping_state} - {request.shipping_zip}</p>
                                  <p className="font-medium">{request.shipping_country || 'Sri Lanka'}</p>
                                  {request.shipping_phone && (
                                    <p className="pt-2 flex items-center gap-2">
                                      <span>📞</span> {request.shipping_phone}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 italic">No shipping address provided</p>
                              )}
                            </div>

                            {/* Request Details */}
                            <div className="bg-white rounded-lg p-4 border">
                              <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                                <span className="text-lg">📝</span> Request Details
                              </h4>
                              <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex justify-between">
                                  <span>Category:</span>
                                  <span className="font-medium text-gray-800">{getCategoryEmoji(request.category)} {request.category}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Quantity:</span>
                                  <span className="font-medium text-gray-800">{request.quantity}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Requested:</span>
                                  <span className="font-medium text-gray-800">{new Date(request.created_at).toLocaleString()}</span>
                                </div>
                                <div className="pt-2 border-t">
                                  <p className="text-gray-500 text-xs mb-1">Description:</p>
                                  <p className="text-gray-700">{request.description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pending Donations Tab */}
            {activeTab === 'donations' && (
              <div className="space-y-4">
                {pendingDonations.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl">
                    <div className="text-5xl mb-3">✅</div>
                    <h3 className="text-lg font-semibold text-gray-800">No pending donations</h3>
                    <p className="text-gray-500 text-sm">All donations have been reviewed</p>
                  </div>
                ) : (
                  pendingDonations.map((donation) => {
                    // Parse donor info from description
                    const descParts = donation.description.split('---')
                    const mainDesc = descParts[0]?.trim() || donation.description
                    const donorInfo = descParts[1] || ''
                    
                    return (
                      <div key={donation.id} className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-orange-400">
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                              {getCategoryEmoji(donation.category)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-gray-800 text-lg">{donation.name}</h3>
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                  Pending Review
                                </span>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3">{mainDesc}</p>
                              
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Qty:</span> {donation.quantity}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Condition:</span> {donation.condition || 'Good'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Submitted:</span> {new Date(donation.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Donor Info */}
                              {donorInfo && (
                                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                  <p className="font-medium text-gray-700 mb-1">📞 Donor Contact:</p>
                                  <div className="text-gray-600 whitespace-pre-line text-xs">
                                    {donorInfo.trim().split('\n').map((line, i) => (
                                      <p key={i}>{line.replace(/^(Donor|Phone|Email|Location):/, (m) => `**${m}**`)}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <button
                                onClick={() => approveDonation(donation.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </button>
                              <button
                                onClick={() => rejectDonation(donation.id)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white rounded-xl">
                    <div className="text-5xl mb-3">📦</div>
                    <h3 className="text-lg font-semibold text-gray-800">No items</h3>
                    <p className="text-gray-500 text-sm">Add your first item</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl shadow-sm overflow-hidden ${!item.is_available ? 'opacity-60' : ''}`}
                    >
                      <div className="h-24 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <span className="text-4xl">{getCategoryEmoji(item.category)}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">{item.name}</h3>
                        <p className="text-gray-500 text-xs line-clamp-1 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>Qty: {item.quantity}</span>
                          <span className={item.is_available ? 'text-green-600' : 'text-red-600'}>
                            {item.is_available ? '● Active' : '○ Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleItemAvailability(item.id, item.is_available)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              item.is_available
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {item.is_available ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="py-1.5 px-3 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add Item Tab */}
            {activeTab === 'add-item' && (
              <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Item</h2>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      placeholder="Item name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as ItemCategory }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      >
                        <option value="book">📚 Book</option>
                        <option value="pencil">✏️ Pencil</option>
                        <option value="school_supplies">🎒 Supplies</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        min="1"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      required
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                      placeholder="Describe the item"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                    <input
                      type="url"
                      value={newItem.image_url}
                      onChange={(e) => setNewItem(prev => ({ ...prev, image_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Add Item
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
