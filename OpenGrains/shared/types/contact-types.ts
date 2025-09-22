/**
 * Contact Management Types for OpenGrains
 * Comprehensive contact system supporting suppliers, buyers, and both
 */

/**
 * Contact legal type
 */
export type ContactLegalType = 'individual' | 'legal_entity'

/**
 * Contact type classification
 */
export type ContactType = 'supplier' | 'buyer' | 'both'

/**
 * Contact status for validation workflow
 */
export type ContactStatus = 'draft' | 'pending_validation' | 'valid' | 'rejected'

/**
 * Contact validation level
 */
export type ValidationStatus = 'not_reviewed' | 'under_review' | 'approved' | 'rejected'

/**
 * Individual contact specific fields
 */
export interface IndividualContactData {
  firstName: string
  lastName: string
  fullName?: string  // Auto-populated: firstName + lastName
  idSeries?: string
  idNumber?: string
  personalIdentificationNumber?: string  // CNP
}

/**
 * Legal entity specific fields
 */
export interface LegalEntityContactData {
  companyName: string
  tradeRegisterNumber?: string  // Auto-filled via ANAF
  vatRegistrationNumber?: string  // Auto-filled via ANAF
  companyNumber?: string  // Auto-filled via ANAF
}

/**
 * Basic contact information
 */
export interface BasicContactInfo {
  name: string  // Business name or full name
  street: string
  city: string
  county: string
  country: string
  postalCode: string
  phone: string
  email: string
}

/**
 * Financial information
 */
export interface FinancialInfo {
  tradeRegisterNumber?: string
  vatRegistrationNumber?: string
  companyNumber?: string
  companyName?: string
  iban?: string
  bankName?: string
  swiftCode?: string
  ibanValidated: boolean
  anafVerified: boolean
}

/**
 * Commercial information
 */
export interface CommercialInfo {
  cultivatedArea?: number  // hectares
  purchasePotential?: string
  annualPurchaseTarget?: number
  apiaCertificateNumber?: string
  apiaCertificateExpiration?: Date
}

/**
 * Loading address
 */
export interface LoadingAddress {
  id: string
  name: string
  phone: string
  address: string
  postalCode: string
  unloadingLocation: string
  secondaryAddress?: string
  secondaryAddress2?: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Associated contact person
 */
export interface AssociatedContact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Document attachment
 */
export interface ContactDocument {
  id: string
  contactId: string
  filename: string
  filePath: string
  documentType: string
  description?: string
  uploadedBy: string
  uploadedAt: Date
  fileSize: number
  mimeType: string
  validationStatus: ValidationStatus
  validationNotes?: string
}

/**
 * Main Contact entity
 */
export interface Contact {
  id: string

  // Basic identification
  name: string
  legalType: ContactLegalType
  taxId?: string
  agentId?: string  // Assigned sales agent
  status: ContactStatus
  contactType: ContactType  // supplier, buyer, both

  // Type-specific data
  individualData?: IndividualContactData
  legalEntityData?: LegalEntityContactData

  // Contact information
  basicInfo: BasicContactInfo

  // Financial information
  financialInfo?: FinancialInfo

  // Commercial information (for suppliers)
  commercialInfo?: CommercialInfo

  // Loading information
  loadingAddresses: LoadingAddress[]
  primaryLoadingAddressId?: string

  // Associated contacts
  associatedContacts: AssociatedContact[]

  // Document management
  documents: ContactDocument[]

  // Validation and workflow
  validationStatus: ValidationStatus
  validationNotes?: string
  validatedBy?: string
  validatedAt?: Date

  // ANAF integration
  anafData?: Record<string, any>
  anafVerified: boolean
  anafLastChecked?: Date

  // Audit fields
  createdBy: string
  createdAt: Date
  updatedBy: string
  updatedAt: Date

  // Flags
  canPlaceOrders: boolean  // Only valid suppliers can place orders
  requiresBackofficeValidation: boolean
}

/**
 * Contact creation data
 */
export interface CreateContactData {
  name: string
  legalType: ContactLegalType
  contactType: ContactType
  basicInfo: BasicContactInfo
  individualData?: Partial<IndividualContactData>
  legalEntityData?: Partial<LegalEntityContactData>
  financialInfo?: Partial<FinancialInfo>
  commercialInfo?: Partial<CommercialInfo>
}

/**
 * Contact update data
 */
export interface UpdateContactData {
  name?: string
  legalType?: ContactLegalType
  contactType?: ContactType
  basicInfo?: Partial<BasicContactInfo>
  individualData?: Partial<IndividualContactData>
  legalEntityData?: Partial<LegalEntityContactData>
  financialInfo?: Partial<FinancialInfo>
  commercialInfo?: Partial<CommercialInfo>
  status?: ContactStatus
  validationStatus?: ValidationStatus
  validationNotes?: string
}

/**
 * Contact filters for list view
 */
export interface ContactFilters {
  status?: ContactStatus[]
  legalType?: ContactLegalType[]
  contactType?: ContactType[]
  agentId?: string
  county?: string[]
  validationStatus?: ValidationStatus[]
  search?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'createdAt' | 'status' | 'county'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Contact list response
 */
export interface ContactListResponse {
  contacts: Contact[]
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
  filters: ContactFilters
}

/**
 * ANAF query result
 */
export interface ANAFQueryResult {
  cui: string
  companyName: string
  tradeRegisterNumber: string
  vatRegistrationNumber?: string
  address: string
  status: 'active' | 'inactive' | 'suspended'
  vatPayer: boolean
  fiscalAddress: {
    street: string
    city: string
    county: string
    postalCode: string
  }
  lastUpdated: Date
  confidence: number
}

/**
 * Contact validation result
 */
export interface ContactValidationResult {
  contactId: string
  isValid: boolean
  errors: string[]
  warnings: string[]
  anafResult?: ANAFQueryResult
  ibanValidation?: {
    isValid: boolean
    formattedIban: string
    bankName?: string
  }
  suggestions: string[]
}

/**
 * Contact statistics
 */
export interface ContactStatistics {
  totalContacts: number
  byStatus: Record<ContactStatus, number>
  byType: Record<ContactType, number>
  byLegalType: Record<ContactLegalType, number>
  byValidationStatus: Record<ValidationStatus, number>
  recentlyCreated: number
  pendingValidation: number
  validSuppliers: number
}