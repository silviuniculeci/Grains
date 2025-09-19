import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Helper function to create admin client (for backend use)
export const createAdminClient = (serviceRoleKey?: string) => {
  const adminKey = serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!adminKey) {
    throw new Error('Missing Supabase service role key for admin operations')
  }

  return createClient<Database>(supabaseUrl, adminKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Database helpers
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Romanian business validation helpers
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

  // Calculate mod 97
  let remainder = 0
  for (const digit of numericString) {
    remainder = (remainder * 10 + parseInt(digit)) % 97
  }

  return remainder === 1
}

export const validateRomanianCUI = (cui: string): boolean => {
  // Remove RO prefix if present
  const numericCui = cui.replace(/^RO/, '').replace(/\s/g, '')

  if (!/^\d{2,10}$/.test(numericCui)) {
    return false
  }

  // CUI checksum validation for Romanian tax IDs
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

export const validateRomanianONRC = (onrc: string): boolean => {
  // ONRC format: J01/1234/2023 (County/Number/Year)
  const onrcPattern = /^J\d{2}\/\d+\/\d{4}$/
  return onrcPattern.test(onrc)
}

// File upload helpers for OCR documents
export const uploadDocument = async (
  file: File,
  supplierId: string,
  documentType: string
) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${supplierId}/${documentType}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file)

  if (error) throw error
  return data
}

export const getDocumentUrl = async (path: string) => {
  const { data } = await supabase.storage
    .from('documents')
    .getPublicUrl(path)

  return data.publicUrl
}