import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '../../../shared/types/database'
import type {
  Contact,
  ContactFilters,
  ContactListResponse,
  CreateContactData,
  UpdateContactData,
  LoadingAddress,
  AssociatedContact,
  ContactDocument,
  ANAFQueryResult,
  ContactValidationResult,
  ContactStatistics
} from '../../../shared/types/contact-types'

export type ContactRow = Tables<'contacts'>
export type ContactInsert = TablesInsert<'contacts'>
export type ContactUpdate = TablesUpdate<'contacts'>

export type LoadingAddressRow = Tables<'contact_loading_addresses'>
export type LoadingAddressInsert = TablesInsert<'contact_loading_addresses'>
export type LoadingAddressUpdate = TablesUpdate<'contact_loading_addresses'>

export type AssociatedContactRow = Tables<'contact_associated_contacts'>
export type AssociatedContactInsert = TablesInsert<'contact_associated_contacts'>
export type AssociatedContactUpdate = TablesUpdate<'contact_associated_contacts'>

export type ContactDocumentRow = Tables<'contact_documents'>
export type ContactDocumentInsert = TablesInsert<'contact_documents'>
export type ContactDocumentUpdate = TablesUpdate<'contact_documents'>

/**
 * Contact service for comprehensive contact management
 */
export class ContactService {
  // Create a new contact
  static async create(data: CreateContactData): Promise<Contact> {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()

      if (authError || !userData.user) {
        throw new Error('Authentication required to create contacts')
      }

      const contactInsert: ContactInsert = {
        name: data.name,
        legal_type: data.legalType,
        contact_type: data.contactType,
        street: data.basicInfo.street,
        city: data.basicInfo.city,
        county: data.basicInfo.county,
        country: data.basicInfo.country,
        postal_code: data.basicInfo.postalCode,
        phone: data.basicInfo.phone,
        email: data.basicInfo.email,

        // Individual specific fields
        first_name: data.individualData?.firstName,
        last_name: data.individualData?.lastName,
        id_series: data.individualData?.idSeries,
        id_number: data.individualData?.idNumber,
        personal_identification_number: data.individualData?.personalIdentificationNumber,

        // Legal entity specific fields
        company_name: data.legalEntityData?.companyName,
        trade_register_number: data.legalEntityData?.tradeRegisterNumber,
        vat_registration_number: data.legalEntityData?.vatRegistrationNumber,
        company_number: data.legalEntityData?.companyNumber,

        // Financial info
        iban: data.financialInfo?.iban,
        bank_name: data.financialInfo?.bankName,
        swift_code: data.financialInfo?.swiftCode,
        iban_validated: data.financialInfo?.ibanValidated || false,
        anaf_verified: data.financialInfo?.anafVerified || false,

        // Commercial info
        cultivated_area: data.commercialInfo?.cultivatedArea,
        purchase_potential: data.commercialInfo?.purchasePotential,
        annual_purchase_target: data.commercialInfo?.annualPurchaseTarget,
        apia_certificate_number: data.commercialInfo?.apiaCertificateNumber,
        apia_certificate_expiration: data.commercialInfo?.apiaCertificateExpiration?.toISOString().split('T')[0],

        created_by: userData.user.id,
        updated_by: userData.user.id
      }

      const { data: contact, error } = await supabase
        .from('contacts')
        .insert(contactInsert)
        .select()
        .single()

      if (error) throw error

      return await ContactService.getById(contact.id)
    } catch (error: any) {
      console.error('Error creating contact:', error)
      throw new Error(`Failed to create contact: ${error.message}`)
    }
  }

  // Get contact by ID with all related data
  static async getById(id: string): Promise<Contact> {
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .select(`
          *,
          loading_addresses:contact_loading_addresses(*),
          associated_contacts:contact_associated_contacts(*),
          documents:contact_documents(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return ContactService.mapRowToContact(contact)
    } catch (error: any) {
      console.error('Error fetching contact:', error)
      throw new Error(`Failed to fetch contact: ${error.message}`)
    }
  }

  // Get all contacts with filtering and pagination
  static async getAll(filters: ContactFilters = {}): Promise<ContactListResponse> {
    try {
      let query = supabase
        .from('contacts')
        .select(`
          *,
          loading_addresses:contact_loading_addresses(*),
          associated_contacts:contact_associated_contacts(*),
          documents:contact_documents(*)
        `, { count: 'exact' })

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters.legalType && filters.legalType.length > 0) {
        query = query.in('legal_type', filters.legalType)
      }

      if (filters.contactType && filters.contactType.length > 0) {
        query = query.in('contact_type', filters.contactType)
      }

      if (filters.validationStatus && filters.validationStatus.length > 0) {
        query = query.in('validation_status', filters.validationStatus)
      }

      if (filters.agentId) {
        query = query.eq('agent_id', filters.agentId)
      }

      if (filters.county && filters.county.length > 0) {
        query = query.in('county', filters.county)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%, email.ilike.%${filters.search}%, phone.ilike.%${filters.search}%`)
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at'
      const sortOrder = filters.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const page = filters.page || 1
      const limit = filters.limit || 20
      const offset = (page - 1) * limit

      query = query.range(offset, offset + limit - 1)

      const { data: contacts, error, count } = await query

      if (error) throw error

      const mappedContacts = contacts?.map(ContactService.mapRowToContact) || []

      return {
        contacts: mappedContacts,
        totalCount: count || 0,
        page,
        pageSize: limit,
        hasMore: (count || 0) > page * limit,
        filters
      }
    } catch (error: any) {
      console.error('Error fetching contacts:', error)
      throw new Error(`Failed to fetch contacts: ${error.message}`)
    }
  }

  // Update contact
  static async update(id: string, data: UpdateContactData): Promise<Contact> {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()

      if (authError || !userData.user) {
        throw new Error('Authentication required to update contacts')
      }

      const contactUpdate: ContactUpdate = {
        ...data.basicInfo && {
          street: data.basicInfo.street,
          city: data.basicInfo.city,
          county: data.basicInfo.county,
          country: data.basicInfo.country,
          postal_code: data.basicInfo.postalCode,
          phone: data.basicInfo.phone,
          email: data.basicInfo.email,
        },

        // Individual data
        ...data.individualData && {
          first_name: data.individualData.firstName,
          last_name: data.individualData.lastName,
          id_series: data.individualData.idSeries,
          id_number: data.individualData.idNumber,
          personal_identification_number: data.individualData.personalIdentificationNumber,
        },

        // Legal entity data
        ...data.legalEntityData && {
          company_name: data.legalEntityData.companyName,
          trade_register_number: data.legalEntityData.tradeRegisterNumber,
          vat_registration_number: data.legalEntityData.vatRegistrationNumber,
          company_number: data.legalEntityData.companyNumber,
        },

        // Financial data
        ...data.financialInfo && {
          iban: data.financialInfo.iban,
          bank_name: data.financialInfo.bankName,
          swift_code: data.financialInfo.swiftCode,
          iban_validated: data.financialInfo.ibanValidated,
          anaf_verified: data.financialInfo.anafVerified,
        },

        // Commercial data
        ...data.commercialInfo && {
          cultivated_area: data.commercialInfo.cultivatedArea,
          purchase_potential: data.commercialInfo.purchasePotential,
          annual_purchase_target: data.commercialInfo.annualPurchaseTarget,
          apia_certificate_number: data.commercialInfo.apiaCertificateNumber,
          apia_certificate_expiration: data.commercialInfo.apiaCertificateExpiration?.toISOString().split('T')[0],
        },

        // Status updates
        name: data.name,
        legal_type: data.legalType,
        contact_type: data.contactType,
        status: data.status,
        validation_status: data.validationStatus,
        validation_notes: data.validationNotes,

        updated_by: userData.user.id
      }

      const { error } = await supabase
        .from('contacts')
        .update(contactUpdate)
        .eq('id', id)

      if (error) throw error

      return await ContactService.getById(id)
    } catch (error: any) {
      console.error('Error updating contact:', error)
      throw new Error(`Failed to update contact: ${error.message}`)
    }
  }

  // Delete contact
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting contact:', error)
      throw new Error(`Failed to delete contact: ${error.message}`)
    }
  }

  // Submit contact for validation
  static async submitForValidation(id: string): Promise<Contact> {
    return await ContactService.update(id, {
      status: 'pending_validation',
      validationStatus: 'under_review'
    })
  }

  // Approve contact
  static async approve(id: string, notes?: string): Promise<Contact> {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()

      if (authError || !userData.user) {
        throw new Error('Authentication required')
      }

      const { error } = await supabase
        .from('contacts')
        .update({
          status: 'valid',
          validation_status: 'approved',
          validation_notes: notes,
          validated_by: userData.user.id,
          validated_at: new Date().toISOString(),
          can_place_orders: true,
          updated_by: userData.user.id
        })
        .eq('id', id)

      if (error) throw error

      return await ContactService.getById(id)
    } catch (error: any) {
      console.error('Error approving contact:', error)
      throw new Error(`Failed to approve contact: ${error.message}`)
    }
  }

  // Reject contact
  static async reject(id: string, notes: string): Promise<Contact> {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()

      if (authError || !userData.user) {
        throw new Error('Authentication required')
      }

      const { error } = await supabase
        .from('contacts')
        .update({
          status: 'rejected',
          validation_status: 'rejected',
          validation_notes: notes,
          validated_by: userData.user.id,
          validated_at: new Date().toISOString(),
          can_place_orders: false,
          updated_by: userData.user.id
        })
        .eq('id', id)

      if (error) throw error

      return await ContactService.getById(id)
    } catch (error: any) {
      console.error('Error rejecting contact:', error)
      throw new Error(`Failed to reject contact: ${error.message}`)
    }
  }

  // Loading address management
  static async addLoadingAddress(contactId: string, address: Omit<LoadingAddressInsert, 'contact_id'>): Promise<LoadingAddress> {
    try {
      const { data, error } = await supabase
        .from('contact_loading_addresses')
        .insert({ ...address, contact_id: contactId })
        .select()
        .single()

      if (error) throw error

      return ContactService.mapRowToLoadingAddress(data)
    } catch (error: any) {
      console.error('Error adding loading address:', error)
      throw new Error(`Failed to add loading address: ${error.message}`)
    }
  }

  static async updateLoadingAddress(id: string, data: LoadingAddressUpdate): Promise<LoadingAddress> {
    try {
      const { data: address, error } = await supabase
        .from('contact_loading_addresses')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return ContactService.mapRowToLoadingAddress(address)
    } catch (error: any) {
      console.error('Error updating loading address:', error)
      throw new Error(`Failed to update loading address: ${error.message}`)
    }
  }

  static async deleteLoadingAddress(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('contact_loading_addresses')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting loading address:', error)
      throw new Error(`Failed to delete loading address: ${error.message}`)
    }
  }

  // Associated contact management
  static async addAssociatedContact(contactId: string, associatedContact: Omit<AssociatedContactInsert, 'contact_id'>): Promise<AssociatedContact> {
    try {
      const { data, error } = await supabase
        .from('contact_associated_contacts')
        .insert({ ...associatedContact, contact_id: contactId })
        .select()
        .single()

      if (error) throw error

      return ContactService.mapRowToAssociatedContact(data)
    } catch (error: any) {
      console.error('Error adding associated contact:', error)
      throw new Error(`Failed to add associated contact: ${error.message}`)
    }
  }

  static async updateAssociatedContact(id: string, data: AssociatedContactUpdate): Promise<AssociatedContact> {
    try {
      const { data: contact, error } = await supabase
        .from('contact_associated_contacts')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return ContactService.mapRowToAssociatedContact(contact)
    } catch (error: any) {
      console.error('Error updating associated contact:', error)
      throw new Error(`Failed to update associated contact: ${error.message}`)
    }
  }

  static async deleteAssociatedContact(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('contact_associated_contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting associated contact:', error)
      throw new Error(`Failed to delete associated contact: ${error.message}`)
    }
  }

  // Document management
  static async uploadDocument(contactId: string, file: File, documentType: string, description?: string): Promise<ContactDocument> {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()

      if (authError || !userData.user) {
        throw new Error('Authentication required')
      }

      // Upload file to storage
      const fileName = `${contactId}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contact-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Create document record
      const documentInsert: ContactDocumentInsert = {
        contact_id: contactId,
        filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        document_type: documentType,
        description,
        uploaded_by: userData.user.id
      }

      const { data: document, error } = await supabase
        .from('contact_documents')
        .insert(documentInsert)
        .select()
        .single()

      if (error) throw error

      return ContactService.mapRowToContactDocument(document)
    } catch (error: any) {
      console.error('Error uploading document:', error)
      throw new Error(`Failed to upload document: ${error.message}`)
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      // Get document info first
      const { data: document, error: fetchError } = await supabase
        .from('contact_documents')
        .select('file_path')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('contact-documents')
        .remove([document.file_path])

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError)
      }

      // Delete record
      const { error } = await supabase
        .from('contact_documents')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting document:', error)
      throw new Error(`Failed to delete document: ${error.message}`)
    }
  }

  // ANAF integration
  static async queryANAF(cui: string): Promise<ANAFQueryResult> {
    // This would integrate with Romanian ANAF API
    // For now, return mock data
    try {
      // TODO: Implement actual ANAF API integration
      const mockResult: ANAFQueryResult = {
        cui: cui,
        companyName: 'Mock Company SRL',
        tradeRegisterNumber: 'J40/1234/2023',
        vatRegistrationNumber: `RO${cui}`,
        address: 'Str. Principala nr. 1, Bucuresti',
        status: 'active',
        vatPayer: true,
        fiscalAddress: {
          street: 'Str. Principala nr. 1',
          city: 'Bucuresti',
          county: 'Bucuresti',
          postalCode: '010000'
        },
        lastUpdated: new Date(),
        confidence: 0.95
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return mockResult
    } catch (error: any) {
      console.error('Error querying ANAF:', error)
      throw new Error(`Failed to query ANAF: ${error.message}`)
    }
  }

  // Validation utilities
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

  static validateCNP(cnp: string): boolean {
    if (!/^\d{13}$/.test(cnp)) {
      return false
    }

    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]
    const digits = cnp.slice(0, 12).split('').map(Number)
    const checkDigit = parseInt(cnp.slice(-1))

    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * weights[i]
    }

    const calculatedCheck = sum % 11
    const expectedCheck = calculatedCheck < 10 ? calculatedCheck : 1

    return checkDigit === expectedCheck
  }

  // Get contact statistics
  static async getStatistics(): Promise<ContactStatistics> {
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('status, contact_type, legal_type, validation_status, created_at')

      if (error) throw error

      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const stats: ContactStatistics = {
        totalContacts: contacts.length,
        byStatus: {
          draft: 0,
          pending_validation: 0,
          valid: 0,
          rejected: 0
        },
        byType: {
          supplier: 0,
          buyer: 0,
          both: 0
        },
        byLegalType: {
          individual: 0,
          legal_entity: 0
        },
        byValidationStatus: {
          not_reviewed: 0,
          under_review: 0,
          approved: 0,
          rejected: 0
        },
        recentlyCreated: 0,
        pendingValidation: 0,
        validSuppliers: 0
      }

      contacts.forEach(contact => {
        // Count by status
        stats.byStatus[contact.status as keyof typeof stats.byStatus]++

        // Count by type
        stats.byType[contact.contact_type as keyof typeof stats.byType]++

        // Count by legal type
        stats.byLegalType[contact.legal_type as keyof typeof stats.byLegalType]++

        // Count by validation status
        stats.byValidationStatus[contact.validation_status as keyof typeof stats.byValidationStatus]++

        // Recently created
        if (new Date(contact.created_at) > thirtyDaysAgo) {
          stats.recentlyCreated++
        }

        // Pending validation
        if (contact.status === 'pending_validation') {
          stats.pendingValidation++
        }

        // Valid suppliers
        if (contact.status === 'valid' && (contact.contact_type === 'supplier' || contact.contact_type === 'both')) {
          stats.validSuppliers++
        }
      })

      return stats
    } catch (error: any) {
      console.error('Error getting contact statistics:', error)
      throw new Error(`Failed to get contact statistics: ${error.message}`)
    }
  }

  // Helper methods to map database rows to types
  private static mapRowToContact(row: any): Contact {
    return {
      id: row.id,
      name: row.name,
      legalType: row.legal_type,
      taxId: row.tax_id,
      agentId: row.agent_id,
      status: row.status,
      contactType: row.contact_type,

      individualData: row.legal_type === 'individual' ? {
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: row.full_name,
        idSeries: row.id_series,
        idNumber: row.id_number,
        personalIdentificationNumber: row.personal_identification_number
      } : undefined,

      legalEntityData: row.legal_type === 'legal_entity' ? {
        companyName: row.company_name,
        tradeRegisterNumber: row.trade_register_number,
        vatRegistrationNumber: row.vat_registration_number,
        companyNumber: row.company_number
      } : undefined,

      basicInfo: {
        name: row.name,
        street: row.street,
        city: row.city,
        county: row.county,
        country: row.country,
        postalCode: row.postal_code,
        phone: row.phone,
        email: row.email
      },

      financialInfo: {
        tradeRegisterNumber: row.trade_register_number,
        vatRegistrationNumber: row.vat_registration_number,
        companyNumber: row.company_number,
        companyName: row.company_name,
        iban: row.iban,
        bankName: row.bank_name,
        swiftCode: row.swift_code,
        ibanValidated: row.iban_validated,
        anafVerified: row.anaf_verified
      },

      commercialInfo: {
        cultivatedArea: row.cultivated_area,
        purchasePotential: row.purchase_potential,
        annualPurchaseTarget: row.annual_purchase_target,
        apiaCertificateNumber: row.apia_certificate_number,
        apiaCertificateExpiration: row.apia_certificate_expiration ? new Date(row.apia_certificate_expiration) : undefined
      },

      loadingAddresses: row.loading_addresses?.map(ContactService.mapRowToLoadingAddress) || [],
      primaryLoadingAddressId: row.loading_addresses?.find((addr: any) => addr.is_primary)?.id,

      associatedContacts: row.associated_contacts?.map(ContactService.mapRowToAssociatedContact) || [],

      documents: row.documents?.map(ContactService.mapRowToContactDocument) || [],

      validationStatus: row.validation_status,
      validationNotes: row.validation_notes,
      validatedBy: row.validated_by,
      validatedAt: row.validated_at ? new Date(row.validated_at) : undefined,

      anafData: row.anaf_data,
      anafVerified: row.anaf_verified,
      anafLastChecked: row.anaf_last_checked ? new Date(row.anaf_last_checked) : undefined,

      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedBy: row.updated_by,
      updatedAt: new Date(row.updated_at),

      canPlaceOrders: row.can_place_orders,
      requiresBackofficeValidation: row.requires_backoffice_validation
    }
  }

  private static mapRowToLoadingAddress(row: LoadingAddressRow): LoadingAddress {
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      address: row.address,
      postalCode: row.postal_code,
      unloadingLocation: row.unloading_location,
      secondaryAddress: row.secondary_address,
      secondaryAddress2: row.secondary_address_2,
      isPrimary: row.is_primary,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }

  private static mapRowToAssociatedContact(row: AssociatedContactRow): AssociatedContact {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }

  private static mapRowToContactDocument(row: ContactDocumentRow): ContactDocument {
    return {
      id: row.id,
      contactId: row.contact_id,
      filename: row.filename,
      filePath: row.file_path,
      documentType: row.document_type,
      description: row.description,
      uploadedBy: row.uploaded_by,
      uploadedAt: new Date(row.uploaded_at),
      fileSize: row.file_size,
      mimeType: row.mime_type,
      validationStatus: row.validation_status,
      validationNotes: row.validation_notes
    }
  }
}