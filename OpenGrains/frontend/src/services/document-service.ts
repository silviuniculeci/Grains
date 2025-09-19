import type { RomanianDocumentType, DocumentValidationStatus } from '@/types/romanian-documents'
import type { OCRResult } from '@/types/ocr-types'

export interface Document {
  id: string
  supplierId: string
  documentType: RomanianDocumentType
  filename: string
  fileSize: number
  mimeType: string
  url: string
  thumbnailUrl?: string

  // Upload metadata
  uploadedAt: Date
  uploadedBy: string

  // Processing status
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed'
  validationStatus: DocumentValidationStatus

  // OCR results
  ocrResult?: OCRResult
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed'

  // Validation metadata
  validatedBy?: string
  validatedAt?: Date
  validationNotes?: string

  // Flags
  requiresReview: boolean
  isRequired: boolean
}

export interface DocumentUploadRequest {
  file: File
  documentType: RomanianDocumentType
  supplierId?: string
}

export interface DocumentValidationRequest {
  documentId: string
  status: DocumentValidationStatus
  notes?: string
}

export interface DocumentFilters {
  supplierId?: string
  documentType?: RomanianDocumentType
  validationStatus?: DocumentValidationStatus
  uploadedAfter?: Date
  uploadedBefore?: Date
  requiresReview?: boolean
}

export class DocumentService {
  private static baseUrl = '/api/documents'

  /**
   * Upload a new document
   */
  static async upload(request: DocumentUploadRequest): Promise<Document> {
    const formData = new FormData()
    formData.append('file', request.file)
    formData.append('documentType', request.documentType)
    if (request.supplierId) {
      formData.append('supplierId', request.supplierId)
    }

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          // Authorization header would be added by an interceptor
        }
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      return this.mapResponseToDocument(data)
    } catch (error: any) {
      console.error('Document upload error:', error)
      throw new Error(`Failed to upload document: ${error.message}`)
    }
  }

  /**
   * Get documents with optional filtering
   */
  static async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    try {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (value instanceof Date) {
              queryParams.append(key, value.toISOString())
            } else {
              queryParams.append(key, String(value))
            }
          }
        })
      }

      const url = queryParams.toString()
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map((item: any) => this.mapResponseToDocument(item))
    } catch (error: any) {
      console.error('Document fetch error:', error)
      throw new Error(`Failed to fetch documents: ${error.message}`)
    }
  }

  /**
   * Get a specific document by ID
   */
  static async getDocument(documentId: string): Promise<Document> {
    try {
      const response = await fetch(`${this.baseUrl}/${documentId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Document not found')
        }
        throw new Error(`Failed to fetch document: ${response.statusText}`)
      }

      const data = await response.json()
      return this.mapResponseToDocument(data)
    } catch (error: any) {
      console.error('Document fetch error:', error)
      throw new Error(`Failed to fetch document: ${error.message}`)
    }
  }

  /**
   * Get documents for current user (supplier)
   */
  static async getMyDocuments(): Promise<Document[]> {
    try {
      const response = await fetch(`${this.baseUrl}/my-documents`)

      if (!response.ok) {
        throw new Error(`Failed to fetch my documents: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map((item: any) => this.mapResponseToDocument(item))
    } catch (error: any) {
      console.error('My documents fetch error:', error)
      throw new Error(`Failed to fetch my documents: ${error.message}`)
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${documentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('Document delete error:', error)
      throw new Error(`Failed to delete document: ${error.message}`)
    }
  }

  /**
   * Update document validation status (back office)
   */
  static async validateDocument(request: DocumentValidationRequest): Promise<Document> {
    try {
      const response = await fetch(`${this.baseUrl}/${request.documentId}/validate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: request.status,
          notes: request.notes
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to validate document: ${response.statusText}`)
      }

      const data = await response.json()
      return this.mapResponseToDocument(data)
    } catch (error: any) {
      console.error('Document validation error:', error)
      throw new Error(`Failed to validate document: ${error.message}`)
    }
  }

  /**
   * Trigger OCR reprocessing
   */
  static async reprocessOCR(documentId: string): Promise<Document> {
    try {
      const response = await fetch(`${this.baseUrl}/${documentId}/reprocess-ocr`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`Failed to reprocess OCR: ${response.statusText}`)
      }

      const data = await response.json()
      return this.mapResponseToDocument(data)
    } catch (error: any) {
      console.error('OCR reprocess error:', error)
      throw new Error(`Failed to reprocess OCR: ${error.message}`)
    }
  }

  /**
   * Get OCR result for a document
   */
  static async getOCRResult(documentId: string): Promise<OCRResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${documentId}/ocr`)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to fetch OCR result: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('OCR result fetch error:', error)
      throw new Error(`Failed to fetch OCR result: ${error.message}`)
    }
  }

  /**
   * Submit documents for review
   */
  static async submitForReview(documentIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/submit-for-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentIds })
      })

      if (!response.ok) {
        throw new Error(`Failed to submit for review: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('Submit for review error:', error)
      throw new Error(`Failed to submit for review: ${error.message}`)
    }
  }

  /**
   * Download document
   */
  static async downloadDocument(documentId: string, filename: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${documentId}/download`)

      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Document download error:', error)
      throw new Error(`Failed to download document: ${error.message}`)
    }
  }

  /**
   * Get documents requiring review (back office)
   */
  static async getDocumentsRequiringReview(): Promise<Document[]> {
    return this.getDocuments({
      requiresReview: true,
      validationStatus: 'under_review'
    })
  }

  /**
   * Get document statistics
   */
  static async getDocumentStats(): Promise<{
    total: number
    byStatus: Record<DocumentValidationStatus, number>
    byType: Record<RomanianDocumentType, number>
    pendingReview: number
    ocrProcessing: number
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`)

      if (!response.ok) {
        throw new Error(`Failed to fetch document stats: ${response.statusText}`)
      }

      return await response.json()
    } catch (error: any) {
      console.error('Document stats error:', error)
      throw new Error(`Failed to fetch document stats: ${error.message}`)
    }
  }

  /**
   * Batch operations
   */
  static async batchValidate(requests: DocumentValidationRequest[]): Promise<Document[]> {
    try {
      const response = await fetch(`${this.baseUrl}/batch-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ validations: requests })
      })

      if (!response.ok) {
        throw new Error(`Failed to batch validate: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map((item: any) => this.mapResponseToDocument(item))
    } catch (error: any) {
      console.error('Batch validation error:', error)
      throw new Error(`Failed to batch validate: ${error.message}`)
    }
  }

  /**
   * Map API response to Document interface
   */
  private static mapResponseToDocument(data: any): Document {
    return {
      id: data.id,
      supplierId: data.supplier_id || data.supplierId,
      documentType: data.document_type || data.documentType,
      filename: data.filename,
      fileSize: data.file_size || data.fileSize,
      mimeType: data.mime_type || data.mimeType,
      url: data.url,
      thumbnailUrl: data.thumbnail_url || data.thumbnailUrl,

      uploadedAt: new Date(data.uploaded_at || data.uploadedAt),
      uploadedBy: data.uploaded_by || data.uploadedBy,

      uploadStatus: data.upload_status || data.uploadStatus || 'completed',
      validationStatus: data.validation_status || data.validationStatus || 'not_reviewed',

      ocrResult: data.ocr_result || data.ocrResult,
      ocrStatus: data.ocr_status || data.ocrStatus || 'pending',

      validatedBy: data.validated_by || data.validatedBy,
      validatedAt: data.validated_at ? new Date(data.validated_at) : undefined,
      validationNotes: data.validation_notes || data.validationNotes,

      requiresReview: data.requires_review ?? data.requiresReview ?? false,
      isRequired: data.is_required ?? data.isRequired ?? false
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'Fișierul este prea mare (max 10MB)' }
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tip de fișier nepermis (doar JPG, PNG, PDF)' }
    }

    return { valid: true }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get document type display name
   */
  static getDocumentTypeName(type: RomanianDocumentType, language: 'en' | 'ro' = 'ro'): string {
    // This would typically import from the shared types
    const names: Record<RomanianDocumentType, { en: string; ro: string }> = {
      'onrc_certificate': { en: 'ONRC Certificate', ro: 'Certificat ONRC' },
      'farmer_id_card': { en: 'Farmer ID Card', ro: 'Card de Fermier' },
      'apia_certificate': { en: 'APIA Certificate', ro: 'Certificat APIA' },
      'bank_statement': { en: 'Bank Statement', ro: 'Extras de Cont' },
      'identity_card': { en: 'Identity Card', ro: 'Carte de Identitate' },
      'fiscal_certificate': { en: 'Fiscal Certificate', ro: 'Certificat Fiscal' },
      'vat_certificate': { en: 'VAT Certificate', ro: 'Certificat TVA' },
      'other': { en: 'Other Document', ro: 'Alt Document' }
    }

    return names[type]?.[language] || type
  }
}