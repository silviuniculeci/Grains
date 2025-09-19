/**
 * Romanian Document Types for OpenGrains OCR Integration
 * Defines all Romanian business document types supported by the system
 */

export type RomanianDocumentType =
  | 'onrc_certificate'     // ONRC Certificate (Trade Registry)
  | 'farmer_id_card'       // Farmer ID/Card
  | 'apia_certificate'     // APIA Certificate (Agricultural Payments)
  | 'bank_statement'       // Bank Statement with IBAN
  | 'identity_card'        // Romanian National ID
  | 'fiscal_certificate'   // Fiscal Certificate
  | 'vat_certificate'      // VAT Registration Certificate
  | 'other'               // Other business documents

export interface RomanianDocumentTypeInfo {
  code: RomanianDocumentType
  nameEn: string
  nameRo: string
  description: string
  required: boolean
  ocrEnabled: boolean
  extractableFields: string[]
  validationRules: string[]
}

export const ROMANIAN_DOCUMENT_TYPES: Record<RomanianDocumentType, RomanianDocumentTypeInfo> = {
  onrc_certificate: {
    code: 'onrc_certificate',
    nameEn: 'ONRC Certificate',
    nameRo: 'Certificat ONRC',
    description: 'Trade Registry Certificate proving business registration',
    required: true,
    ocrEnabled: true,
    extractableFields: ['businessName', 'cui', 'onrcNumber', 'address', 'businessType'],
    validationRules: ['onrc_format', 'cui_validation', 'registration_date'],
  },
  farmer_id_card: {
    code: 'farmer_id_card',
    nameEn: 'Farmer ID Card',
    nameRo: 'Card de Fermier',
    description: 'Official farmer identification card',
    required: false,
    ocrEnabled: true,
    extractableFields: ['farmerName', 'farmerId', 'farmLocation', 'farmSize'],
    validationRules: ['farmer_id_format', 'expiration_date'],
  },
  apia_certificate: {
    code: 'apia_certificate',
    nameEn: 'APIA Certificate',
    nameRo: 'Certificat APIA',
    description: 'Agricultural Payment and Intervention Agency Certificate',
    required: false,
    ocrEnabled: true,
    extractableFields: ['apiaId', 'farmerName', 'landArea', 'cropTypes'],
    validationRules: ['apia_id_format', 'land_area_validation'],
  },
  bank_statement: {
    code: 'bank_statement',
    nameEn: 'Bank Statement',
    nameRo: 'Extras de Cont',
    description: 'Bank statement showing IBAN and account details',
    required: true,
    ocrEnabled: true,
    extractableFields: ['iban', 'accountHolder', 'bankName', 'accountNumber'],
    validationRules: ['iban_format', 'romanian_bank', 'iban_checksum'],
  },
  identity_card: {
    code: 'identity_card',
    nameEn: 'Identity Card',
    nameRo: 'Carte de Identitate',
    description: 'Romanian national identity card',
    required: false,
    ocrEnabled: true,
    extractableFields: ['idNumber', 'firstName', 'lastName', 'birthDate', 'address'],
    validationRules: ['cnp_validation', 'id_expiration', 'address_match'],
  },
  fiscal_certificate: {
    code: 'fiscal_certificate',
    nameEn: 'Fiscal Certificate',
    nameRo: 'Certificat Fiscal',
    description: 'Certificate proving tax compliance',
    required: false,
    ocrEnabled: true,
    extractableFields: ['cui', 'businessName', 'fiscalStatus', 'issueDate'],
    validationRules: ['cui_validation', 'fiscal_status', 'certificate_validity'],
  },
  vat_certificate: {
    code: 'vat_certificate',
    nameEn: 'VAT Certificate',
    nameRo: 'Certificat TVA',
    description: 'VAT registration certificate',
    required: false,
    ocrEnabled: true,
    extractableFields: ['vatNumber', 'businessName', 'registrationDate'],
    validationRules: ['vat_format', 'registration_validity'],
  },
  other: {
    code: 'other',
    nameEn: 'Other Document',
    nameRo: 'Alt Document',
    description: 'Other business-related documents',
    required: false,
    ocrEnabled: false,
    extractableFields: [],
    validationRules: [],
  },
}

/**
 * Document validation status
 */
export type DocumentValidationStatus =
  | 'not_reviewed'   // Not yet reviewed
  | 'under_review'   // Currently being reviewed
  | 'approved'       // Approved and valid
  | 'rejected'       // Rejected due to issues
  | 'expired'        // Document has expired
  | 'invalid'        // Document is invalid

/**
 * Romanian business data extracted from documents
 */
export interface RomanianBusinessData {
  // Basic business information
  businessName?: string
  cui?: string              // Romanian tax identification number
  onrcNumber?: string       // Trade registry number
  vatNumber?: string        // VAT registration number
  fiscalCode?: string       // Fiscal code

  // Address information
  address?: string
  city?: string
  county?: string
  postalCode?: string

  // Banking information
  iban?: string
  bankName?: string
  accountNumber?: string

  // Agricultural information
  farmerName?: string
  farmerId?: string
  apiaId?: string
  farmLocation?: string
  farmSize?: number
  cropTypes?: string[]

  // Personal information (for individual farmers)
  firstName?: string
  lastName?: string
  idNumber?: string       // CNP - Romanian personal ID
  birthDate?: Date

  // Metadata
  extractionConfidence?: number
  lastValidated?: Date
  validationStatus?: DocumentValidationStatus
}

/**
 * Document processing status
 */
export type DocumentProcessingStatus =
  | 'pending'       // Waiting to be processed
  | 'uploading'     // Currently uploading
  | 'processing'    // OCR in progress
  | 'completed'     // Processing completed
  | 'failed'        // Processing failed
  | 'review'        // Requires manual review

/**
 * Romanian county codes for validation
 */
export const ROMANIAN_COUNTIES = [
  'AB', 'AR', 'AG', 'BC', 'BH', 'BN', 'BT', 'BV', 'BR', 'BZ',
  'CS', 'CL', 'CJ', 'CT', 'CV', 'DB', 'DJ', 'GL', 'GR', 'GJ',
  'HR', 'HD', 'IL', 'IS', 'IF', 'MM', 'MH', 'MS', 'NT', 'OT',
  'PH', 'SM', 'SJ', 'SB', 'SV', 'TR', 'TM', 'TL', 'VS', 'VL',
  'VN', 'B'  // B = Bucharest
] as const

export type RomanianCountyCode = typeof ROMANIAN_COUNTIES[number]

/**
 * Romanian business entity types
 */
export type RomanianBusinessType =
  | 'PF'          // Persoană Fizică (Individual)
  | 'PJ'          // Persoană Juridică (Legal Entity)
  | 'SRL'         // Societate cu Răspundere Limitată
  | 'SA'          // Societate pe Acțiuni
  | 'PFA'         // Persoană Fizică Autorizată
  | 'II'          // Întreprindere Individuală
  | 'IF'          // Întreprindere Familială
  | 'SNC'         // Societate în Nume Colectiv
  | 'SCS'         // Societate în Comandită Simplă

/**
 * Validation result for Romanian business data
 */
export interface RomanianValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  validatedFields: string[]
  confidence: number
  validationDate: Date
}

/**
 * IBAN validation result specific to Romanian banks
 */
export interface RomanianIBANValidation {
  isValid: boolean
  bankCode: string
  bankName?: string
  accountNumber: string
  checkDigits: string
  formattedIBAN: string
  checksumValid: boolean
  lengthValid: boolean
  countryValid: boolean
  errors: string[]
}