import { supabase, createSupplierProfile, updateSupplierProfile, getSupplierProfile, getAllSuppliers } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../../../shared/types/database'

export type SupplierProfile = Tables<'supplier_profiles'>
export type CreateSupplierData = TablesInsert<'supplier_profiles'>
export type UpdateSupplierData = TablesUpdate<'supplier_profiles'>

// Service class for supplier operations
export class SupplierService {
  // Create a new supplier profile
  static async create(data: Omit<CreateSupplierData, 'user_id'>): Promise<SupplierProfile> {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      throw new Error('User must be authenticated to create supplier profile')
    }

    const supplierData: CreateSupplierData = {
      ...data,
      user_id: user.data.user.id,
    }

    return await createSupplierProfile(supplierData)
  }

  // Update existing supplier profile
  static async update(id: string, data: UpdateSupplierData): Promise<SupplierProfile> {
    return await updateSupplierProfile(id, data)
  }

  // Get supplier profile for current user
  static async getMyProfile(): Promise<SupplierProfile | null> {
    const user = await supabase.auth.getUser()
    if (!user.data.user) {
      throw new Error('User must be authenticated')
    }

    return await getSupplierProfile(user.data.user.id)
  }

  // Get all suppliers (for agents and back office)
  static async getAll(filters?: {
    status?: string
    county?: string
    grain_type?: string
    page?: number
    limit?: number
  }) {
    return await getAllSuppliers(filters)
  }

  // Submit supplier for review
  static async submit(id: string): Promise<SupplierProfile> {
    const updateData = {
      registration_status: 'submitted',
      validation_status: 'under_review',
    }

    const { data, error } = await supabase
      .from('supplier_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Save as draft
  static async saveDraft(id: string, data: UpdateSupplierData): Promise<SupplierProfile> {
    const draftData: UpdateSupplierData = {
      ...data,
      registration_status: 'draft',
    }

    return await SupplierService.update(id, draftData)
  }

  // Validate Romanian business data
  static validateIBAN(iban: string): boolean {
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

  static validateCUI(cui: string): boolean {
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

  static validateONRC(onrc: string): boolean {
    // ONRC format: J01/1234/2023 (County/Number/Year)
    const onrcPattern = /^J\d{2}\/\d+\/\d{4}$/
    return onrcPattern.test(onrc)
  }

  static formatIBAN(iban: string): string {
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, '').toUpperCase()

    // Add spaces every 4 characters for Romanian IBAN
    if (cleanIban.startsWith('RO') && cleanIban.length === 24) {
      return cleanIban.replace(/(.{4})/g, '$1 ').trim()
    }

    return iban
  }

  static formatPhone(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')

    // Handle Romanian phone numbers
    if (digits.startsWith('40') && digits.length === 12) {
      // +40 XXX XXX XXX
      return `+40 ${digits.substring(2, 5)} ${digits.substring(5, 8)} ${digits.substring(8)}`
    } else if (digits.startsWith('0') && digits.length === 10) {
      // 0XXX XXX XXX
      return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`
    }

    return phone
  }

  // Get grain types with Romanian translations
  static getGrainTypes() {
    return [
      { value: 'wheat', label: 'Wheat / Grâu' },
      { value: 'corn', label: 'Corn / Porumb' },
      { value: 'barley', label: 'Barley / Orz' },
      { value: 'sunflower', label: 'Sunflower / Floarea-soarelui' },
      { value: 'rapeseed', label: 'Rapeseed / Rapiță' },
      { value: 'oats', label: 'Oats / Ovăz' },
      { value: 'rye', label: 'Rye / Secară' },
      { value: 'soybeans', label: 'Soybeans / Soia' },
    ]
  }

  // Get Romanian counties
  static getRomanianCounties() {
    return [
      { value: 'AB', label: 'Alba' },
      { value: 'AR', label: 'Arad' },
      { value: 'AG', label: 'Argeș' },
      { value: 'BC', label: 'Bacău' },
      { value: 'BH', label: 'Bihor' },
      { value: 'BN', label: 'Bistrița-Năsăud' },
      { value: 'BT', label: 'Botoșani' },
      { value: 'BV', label: 'Brașov' },
      { value: 'BR', label: 'Brăila' },
      { value: 'BZ', label: 'Buzău' },
      { value: 'CS', label: 'Caraș-Severin' },
      { value: 'CL', label: 'Călărași' },
      { value: 'CJ', label: 'Cluj' },
      { value: 'CT', label: 'Constanța' },
      { value: 'CV', label: 'Covasna' },
      { value: 'DB', label: 'Dâmbovița' },
      { value: 'DJ', label: 'Dolj' },
      { value: 'GL', label: 'Galați' },
      { value: 'GR', label: 'Giurgiu' },
      { value: 'GJ', label: 'Gorj' },
      { value: 'HR', label: 'Harghita' },
      { value: 'HD', label: 'Hunedoara' },
      { value: 'IL', label: 'Ialomița' },
      { value: 'IS', label: 'Iași' },
      { value: 'IF', label: 'Ilfov' },
      { value: 'MM', label: 'Maramureș' },
      { value: 'MH', label: 'Mehedinți' },
      { value: 'MS', label: 'Mureș' },
      { value: 'NT', label: 'Neamț' },
      { value: 'OT', label: 'Olt' },
      { value: 'PH', label: 'Prahova' },
      { value: 'SM', label: 'Satu Mare' },
      { value: 'SJ', label: 'Sălaj' },
      { value: 'SB', label: 'Sibiu' },
      { value: 'SV', label: 'Suceava' },
      { value: 'TR', label: 'Teleorman' },
      { value: 'TM', label: 'Timiș' },
      { value: 'TL', label: 'Tulcea' },
      { value: 'VS', label: 'Vaslui' },
      { value: 'VL', label: 'Vâlcea' },
      { value: 'VN', label: 'Vrancea' },
      { value: 'B', label: 'București' },
    ]
  }
}