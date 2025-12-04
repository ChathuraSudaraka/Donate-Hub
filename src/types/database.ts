export type ItemCategory = 'book' | 'pencil' | 'school_supplies'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled'
export type UserRole = 'user' | 'admin'

export interface DonationItem {
  id: string
  name: string
  description: string
  category: ItemCategory
  quantity: number
  image_url?: string
  condition?: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface ItemRequest {
  id: string
  user_id: string
  user_email: string
  user_name: string
  item_name: string
  category: ItemCategory
  quantity: number
  description: string
  status: RequestStatus
  admin_notes?: string
  // Shipping info snapshot
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_city?: string
  shipping_state?: string
  shipping_zip?: string
  shipping_country?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  // Contact info
  phone?: string
  // Shipping address
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  created_at: string
  updated_at?: string
}

export interface Database {
  public: {
    Tables: {
      donation_items: {
        Row: DonationItem
        Insert: Omit<DonationItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DonationItem, 'id' | 'created_at' | 'updated_at'>>
      }
      item_requests: {
        Row: ItemRequest
        Insert: Omit<ItemRequest, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: RequestStatus }
        Update: Partial<Omit<ItemRequest, 'id' | 'created_at' | 'updated_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
