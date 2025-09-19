import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../shared/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Database helpers for suppliers
export const createSupplierProfile = async (profileData: any) => {
  const { data, error } = await supabase
    .from('supplier_profiles')
    .insert(profileData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateSupplierProfile = async (id: string, profileData: any) => {
  const { data, error } = await supabase
    .from('supplier_profiles')
    .update(profileData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getSupplierProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('supplier_profiles')
    .select(`
      *,
      assigned_zone:zones(id, name, code),
      documents(id, document_type, filename, upload_status, validation_status, created_at)
    `)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No profile found
    throw error
  }
  return data
}

export const getAllSuppliers = async (filters?: {
  status?: string
  county?: string
  grain_type?: string
  page?: number
  limit?: number
}) => {
  let query = supabase
    .from('supplier_profiles')
    .select(`
      *,
      assigned_zone:zones(id, name, code),
      assigned_agent:users!supplier_profiles_assigned_agent_fkey(id, first_name, last_name)
    `)

  // Apply filters
  if (filters?.status) {
    query = query.eq('registration_status', filters.status)
  }
  if (filters?.county) {
    query = query.eq('county', filters.county)
  }
  if (filters?.grain_type) {
    query = query.contains('grain_types', [filters.grain_type])
  }

  // Apply pagination
  const page = filters?.page || 1
  const limit = filters?.limit || 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) throw error
  return { data, count, page, limit }
}

// Document helpers
export const uploadDocument = async (
  file: File,
  supplierId: string,
  documentType: string
) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${supplierId}/${documentType}/${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file)

  if (uploadError) throw uploadError

  // Create document record
  const { data: document, error: dbError } = await supabase
    .from('documents')
    .insert({
      supplier_id: supplierId,
      document_type: documentType as any,
      filename: file.name,
      file_path: uploadData.path,
      file_size: file.size,
      mime_type: file.type,
      upload_status: 'completed',
      uploaded_by: (await getCurrentUser())?.id || '',
    })
    .select()
    .single()

  if (dbError) throw dbError
  return document
}

export const getDocumentUrl = async (path: string) => {
  const { data } = await supabase.storage
    .from('documents')
    .getPublicUrl(path)

  return data.publicUrl
}

// Romanian validation helpers
export const validateRomanianIBAN = (iban: string): boolean => {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase()

  if (!cleanIban.startsWith('RO') || cleanIban.length !== 24) {
    return false
  }

  // Basic mod-97 validation
  const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4)
  const numericString = rearranged.replace(/[A-Z]/g, (char) =>
    (char.charCodeAt(0) - 55).toString()
  )

  let remainder = 0
  for (const digit of numericString) {
    remainder = (remainder * 10 + parseInt(digit)) % 97
  }

  return remainder === 1
}

export const validateRomanianCUI = (cui: string): boolean => {
  const numericCui = cui.replace(/^RO/, '').replace(/\s/g, '')

  if (!/^\d{2,10}$/.test(numericCui)) {
    return false
  }

  const weights = [7, 3, 1, 7, 3, 1, 7, 3, 1]
  const digits = numericCui.slice(0, -1).split('').map(Number)
  const checkDigit = parseInt(numericCui.slice(-1))

  let sum = 0
  for (let i = 0; i < digits.length && i < weights.length; i++) {
    sum += digits[i] * weights[i]
  }

  const calculatedCheck = sum % 11
  const expectedCheck = calculatedCheck < 10 ? calculatedCheck : 0

  return checkDigit === expectedCheck
}

export default supabase