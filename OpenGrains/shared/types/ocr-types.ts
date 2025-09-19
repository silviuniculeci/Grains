/**
 * OCR Types for OpenGrains Document Processing
 * Defines types for OCR processing, confidence scoring, and data extraction
 */

import { RomanianBusinessData, RomanianDocumentType } from './romanian-documents'

/**
 * OCR processing status
 */
export type OCRStatus =
  | 'pending'       // Waiting for OCR processing
  | 'processing'    // Currently being processed
  | 'completed'     // OCR processing completed
  | 'failed'        // OCR processing failed
  | 'timeout'       // Processing timed out
  | 'rate_limited'  // Rate limit exceeded

/**
 * OCR confidence levels
 */
export type OCRConfidenceLevel =
  | 'high'      // >= 90% confidence
  | 'medium'    // 70-89% confidence
  | 'low'       // < 70% confidence

/**
 * OCR result from processing a document
 */
export interface OCRResult {
  id: string
  documentId: string
  documentType: RomanianDocumentType

  // Raw OCR output
  rawText: string

  // Structured data extraction
  extractedData: RomanianBusinessData

  // Confidence metrics
  overallConfidence: number  // 0-100
  fieldConfidences: Record<string, number>
  confidenceLevel: OCRConfidenceLevel

  // Processing metadata
  processingTime: number     // milliseconds
  processedAt: Date
  ocrProvider: string        // 'openai' | 'tesseract' | etc.
  modelVersion?: string

  // Error handling
  errors: OCRError[]
  warnings: string[]

  // Review status
  requiresReview: boolean
  reviewedBy?: string
  reviewedAt?: Date
  manualCorrections?: Record<string, any>
}

/**
 * OCR processing error
 */
export interface OCRError {
  code: string
  message: string
  field?: string
  severity: 'error' | 'warning' | 'info'
  suggestedFix?: string
}

/**
 * OCR processing request
 */
export interface OCRProcessingRequest {
  documentId: string
  documentType: RomanianDocumentType
  imageData: string | Buffer  // Base64 encoded image or buffer
  imageFormat: 'jpg' | 'png' | 'pdf'

  // Processing options
  language: 'ro' | 'en'
  extractionMode: 'fast' | 'accurate' | 'detailed'
  enableStructuredExtraction: boolean

  // Validation options
  validateExtractedData: boolean
  strictValidation: boolean

  // Callback configuration
  callbackUrl?: string
  notifyOnCompletion: boolean
}

/**
 * OCR service configuration
 */
export interface OCRServiceConfig {
  provider: 'openai' | 'azure' | 'google' | 'aws'
  apiKey: string
  endpoint?: string
  model?: string
  maxRetries: number
  timeoutMs: number
  rateLimitPerMinute: number
}

/**
 * IBAN extraction result from OCR
 */
export interface IBANExtraction {
  extractedIBAN: string
  formattedIBAN: string      // Standardized format with spaces
  confidence: number         // 0-100

  // IBAN components
  countryCode: string        // 'RO'
  checkDigits: string        // 2 digits
  bankCode: string           // 4 characters
  accountNumber: string      // Remaining digits

  // Validation results
  formatValid: boolean
  checksumValid: boolean     // mod-97 validation
  bankExists: boolean        // Bank code exists in Romanian system

  // Romanian bank information
  bankName?: string
  bankBIC?: string

  // Extraction metadata
  sourceText: string         // Original text where IBAN was found
  extractionMethod: 'pattern' | 'ml' | 'hybrid'
  position: { x: number; y: number; width: number; height: number }
}

/**
 * CUI (Romanian tax ID) extraction result
 */
export interface CUIExtraction {
  extractedCUI: string
  formattedCUI: string       // With or without 'RO' prefix
  confidence: number

  // Validation results
  formatValid: boolean
  checksumValid: boolean
  lengthValid: boolean

  // Extraction metadata
  sourceText: string
  hasROPrefix: boolean
  numericPart: string
}

/**
 * ONRC number extraction result
 */
export interface ONRCExtraction {
  extractedONRC: string
  confidence: number

  // ONRC components
  countyCode: string         // J01, J02, etc.
  registrationNumber: string
  registrationYear: string

  // Validation results
  formatValid: boolean
  countyValid: boolean
  yearValid: boolean

  // Extraction metadata
  sourceText: string
}

/**
 * Business name extraction result
 */
export interface BusinessNameExtraction {
  extractedName: string
  confidence: number
  alternativeNames: string[]

  // Name analysis
  containsLegalForm: boolean  // SRL, SA, etc.
  legalForm?: string
  cleanedName: string         // Name without legal form

  // Extraction metadata
  sourceText: string
  extractionMethod: 'header' | 'signature' | 'body'
}

/**
 * Address extraction result
 */
export interface AddressExtraction {
  fullAddress: string
  confidence: number

  // Address components
  streetAddress?: string
  city?: string
  county?: string
  postalCode?: string
  country?: string

  // Validation results
  postalCodeValid: boolean
  countyValid: boolean

  // Extraction metadata
  sourceText: string
}

/**
 * OCR processing statistics
 */
export interface OCRProcessingStats {
  totalDocuments: number
  successfulExtractions: number
  failedExtractions: number
  averageConfidence: number
  averageProcessingTime: number

  // By document type
  byDocumentType: Record<RomanianDocumentType, {
    count: number
    averageConfidence: number
    successRate: number
  }>

  // By confidence level
  byConfidenceLevel: Record<OCRConfidenceLevel, number>

  // Error analysis
  commonErrors: Array<{
    error: string
    count: number
    percentage: number
  }>
}

/**
 * OCR quality assessment
 */
export interface OCRQualityAssessment {
  imageQuality: {
    resolution: number
    sharpness: number
    contrast: number
    brightness: number
    score: number          // 0-100
  }

  textQuality: {
    readability: number
    fontClarity: number
    orientation: number
    score: number          // 0-100
  }

  documentQuality: {
    completeness: number   // All required fields visible
    authenticity: number   // Appears to be genuine document
    condition: number      // Physical condition of document
    score: number          // 0-100
  }

  overallQuality: number   // 0-100
  recommendations: string[]
}

/**
 * OCR processing batch
 */
export interface OCRBatch {
  id: string
  name: string
  documents: string[]      // Document IDs
  status: 'pending' | 'processing' | 'completed' | 'failed'

  // Progress tracking
  totalDocuments: number
  processedDocuments: number
  successfulDocuments: number
  failedDocuments: number

  // Timing
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  estimatedCompletion?: Date

  // Configuration
  batchConfig: {
    priority: 'low' | 'normal' | 'high'
    maxConcurrency: number
    retryFailures: boolean
    notifyOnCompletion: boolean
  }

  // Results summary
  summary?: OCRProcessingStats
}

/**
 * Manual review request for OCR results
 */
export interface OCRReviewRequest {
  resultId: string
  reason: 'low_confidence' | 'validation_failed' | 'user_requested' | 'quality_check'
  priority: 'low' | 'normal' | 'high' | 'urgent'

  assignedTo?: string
  reviewInstructions?: string
  expectedFields: string[]

  createdAt: Date
  dueDate?: Date

  // Review context
  originalDocument: {
    url: string
    type: RomanianDocumentType
    metadata: Record<string, any>
  }

  extractedData: RomanianBusinessData
  confidenceScores: Record<string, number>
  identifiedIssues: string[]
}

/**
 * OCR review result
 */
export interface OCRReviewResult {
  requestId: string
  reviewerId: string
  reviewedAt: Date

  decision: 'approved' | 'rejected' | 'needs_correction'
  correctedData?: RomanianBusinessData
  corrections: Array<{
    field: string
    originalValue: any
    correctedValue: any
    reason: string
  }>

  reviewNotes: string
  qualityRating: number    // 1-5
  timeSpentMinutes: number

  // Follow-up actions
  requiresReprocessing: boolean
  escalateToSupervisor: boolean
  addToTrainingData: boolean
}