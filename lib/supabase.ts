import { createClient } from '@supabase/supabase-js'
import type { Organization, User, Property, Conversation, Message } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Public client (browser-safe)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// ─── Auth helpers ────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) return null

  const { data } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as User | null
}

export async function getCurrentOrg(): Promise<Organization | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data } = await supabaseClient
    .from('organizations')
    .select('*')
    .eq('id', user.org_id)
    .single()

  return data as Organization | null
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Cria a organização + o usuário admin na primeira vez que a sessão é confirmada.
// Se já existirem (usuário logando de novo), apenas retorna os registros existentes.
export async function ensureUserAndOrg(
  authUserId: string,
  email: string,
  metadata: { org_name?: string; full_name?: string }
): Promise<{ user: User; org: Organization }> {
  const { data: existingUser } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', authUserId)
    .single()

  if (existingUser) {
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', existingUser.org_id)
      .single()

    if (orgError) throw orgError
    return { user: existingUser as User, org: org as Organization }
  }

  const orgName = metadata.org_name || 'Minha Imobiliária'
  const slug = `${slugify(orgName)}-${Math.random().toString(36).slice(2, 6)}`

  const { data: org, error: orgError } = await supabaseClient
    .from('organizations')
    .insert({ name: orgName, slug, created_by: authUserId })
    .select()
    .single()

  if (orgError) throw orgError

  const { data: user, error: userError } = await supabaseClient
    .from('users')
    .insert({
      id: authUserId,
      org_id: org.id,
      email,
      full_name: metadata.full_name || null,
      role: 'admin',
    })
    .select()
    .single()

  if (userError) throw userError

  return { user: user as User, org: org as Organization }
}

// ─── Properties CRUD ─────────────────────────────────────────────────────────

export async function getProperties(orgId: string): Promise<Property[]> {
  const { data, error } = await supabaseClient
    .from('properties')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Property[]
}

export async function getActiveProperties(orgId: string): Promise<Property[]> {
  const { data, error } = await supabaseClient
    .from('properties')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Property[]
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabaseClient
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Property
}

export async function getPropertyByIdPublic(id: string, orgSlug: string): Promise<Property | null> {
  const { data: org } = await supabaseClient
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) return null

  const { data, error } = await supabaseClient
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('org_id', org.id)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as Property
}

export async function createProperty(
  property: Omit<Property, 'id' | 'created_at' | 'updated_at'>
): Promise<Property> {
  const { data, error } = await supabaseClient
    .from('properties')
    .insert(property)
    .select()
    .single()

  if (error) throw error
  return data as Property
}

export async function updateProperty(
  id: string,
  updates: Partial<Omit<Property, 'id' | 'org_id' | 'created_at'>>
): Promise<Property> {
  const { data, error } = await supabaseClient
    .from('properties')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Property
}

export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabaseClient
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Organizations ────────────────────────────────────────────────────────────

export async function getOrgBySlug(slug: string): Promise<Organization | null> {
  const { data, error } = await supabaseClient
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Organization
}

export async function updateOrganization(
  id: string,
  updates: Partial<Pick<Organization, 'name' | 'whatsapp_number' | 'logo_url'>>
): Promise<Organization> {
  const { data, error } = await supabaseClient
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Organization
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function upsertConversation(
  orgId: string,
  propertyId: string,
  visitorSessionId: string,
  messages: Message[]
): Promise<Conversation> {
  const { data: existing } = await supabaseClient
    .from('conversations')
    .select('id')
    .eq('visitor_session_id', visitorSessionId)
    .eq('property_id', propertyId)
    .single()

  if (existing) {
    const { data, error } = await supabaseClient
      .from('conversations')
      .update({ messages, last_message_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data as Conversation
  }

  const { data, error } = await supabaseClient
    .from('conversations')
    .insert({
      org_id: orgId,
      property_id: propertyId,
      visitor_session_id: visitorSessionId,
      messages,
    })
    .select()
    .single()

  if (error) throw error
  return data as Conversation
}

export async function getConversations(orgId: string): Promise<Conversation[]> {
  const { data, error } = await supabaseClient
    .from('conversations')
    .select('*')
    .eq('org_id', orgId)
    .order('last_message_at', { ascending: false })

  if (error) throw error
  return data as Conversation[]
}

// ─── Image storage ────────────────────────────────────────────────────────────

export async function uploadImage(
  file: File,
  orgId: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${orgId}/${Date.now()}.${ext}`

  const { error } = await supabaseClient.storage
    .from('property-images')
    .upload(path, file)

  if (error) throw error

  const { data } = supabaseClient.storage
    .from('property-images')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function deleteImage(url: string): Promise<void> {
  const path = url.split('/property-images/')[1]
  if (!path) return

  await supabaseClient.storage
    .from('property-images')
    .remove([path])
}
