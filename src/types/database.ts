export type ItemCategory = 'book' | 'pencil' | 'school_supplies'
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled'
export type UserRole = 'user' | 'admin'

export interface UserAddress {
  id: string
  user_id: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  state?: string | null
  zip_code?: string | null
  country: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface DonationItem {
  id: string
  name: string
  description: string
  category: ItemCategory
  quantity: number
  image_url?: string | null
  condition?: string | null
  is_available: boolean
  donor_id?: string | null
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
  admin_notes?: string | null
  // Shipping info snapshot
  shipping_name?: string | null
  shipping_phone?: string | null
  shipping_address?: string | null
  shipping_city?: string | null
  shipping_state?: string | null
  shipping_zip?: string | null
  shipping_country?: string | null
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  // Contact info
  phone?: string | null
  // Shipping address
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  country?: string | null
  created_at: string
  updated_at?: string | null
}

export interface Database {
  public: {
    Tables: {
      donation_items: {
        Row: DonationItem
        Insert: {
          name: string
          description: string
          category: ItemCategory
          quantity: number
          image_url?: string | null
          condition?: string | null
          is_available?: boolean
          donor_id?: string | null
        }
        Update: {
          name?: string
          description?: string
          category?: ItemCategory
          quantity?: number
          image_url?: string | null
          condition?: string | null
          is_available?: boolean
          donor_id?: string | null
        }
        Relationships: []
      }
      item_requests: {
        Row: ItemRequest
        Insert: {
          user_id: string
          user_email: string
          user_name: string
          item_name: string
          category: ItemCategory
          quantity: number
          description: string
          status?: RequestStatus
          admin_notes?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_state?: string | null
          shipping_zip?: string | null
          shipping_country?: string | null
        }
        Update: {
          user_id?: string
          user_email?: string
          user_name?: string
          item_name?: string
          category?: ItemCategory
          quantity?: number
          description?: string
          status?: RequestStatus
          admin_notes?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_state?: string | null
          shipping_zip?: string | null
          shipping_country?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: UserProfile
        Insert: {
          id: string
          email: string
          name: string
          role?: UserRole
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
        }
        Update: {
          email?: string
          name?: string
          role?: UserRole
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: UserAddress
        Insert: {
          user_id: string
          label: string
          name: string
          phone: string
          address: string
          city: string
          state?: string | null
          zip_code?: string | null
          country: string
          is_primary?: boolean
        }
        Update: {
          label?: string
          name?: string
          phone?: string
          address?: string
          city?: string
          state?: string | null
          zip_code?: string | null
          country?: string
          is_primary?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
