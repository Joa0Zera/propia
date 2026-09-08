export interface Organization {
  id: string
  name: string
  slug: string
  whatsapp_number: string | null
  logo_url: string | null
  created_at: string
  created_by: string | null
}

export interface User {
  id: string
  org_id: string
  email: string
  full_name: string | null
  role: 'admin' | 'agent'
  created_at: string
}

export interface Property {
  id: string
  org_id: string
  name: string
  description: string | null
  price: number
  down_payment_options: string[] | null
  parcels_available: string[] | null
  taxes_fees: string | null
  location: string | null
  features: string[] | null
  images: string[] | null
  main_image_url: string | null
  videos: string[] | null
  ai_context: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  org_id: string
  property_id: string
  visitor_session_id: string
  messages: Message[]
  lead_qualified: boolean
  visitor_name: string | null
  visitor_phone: string | null
  last_message_at: string
  created_at: string
}

export interface PropertyFormData {
  name: string
  description: string
  price: number | ''
  down_payment_options: string[]
  parcels_available: string[]
  taxes_fees: string
  location: string
  features: string[]
  images: string[]
  main_image_url: string
  videos: string[]
  ai_context: string
  is_active: boolean
}
