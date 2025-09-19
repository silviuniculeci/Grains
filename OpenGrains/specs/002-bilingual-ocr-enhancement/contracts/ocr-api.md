# OCR API Contracts

## POST /api/ocr/process

**Purpose**: Process uploaded document images using OCR to extract structured data

### Request
```typescript
interface OCRProcessRequest {
  documentId: string
  documentType: RomanianDocumentType
  imageUrl: string
  processingOptions?: {
    extractIBAN?: boolean
    extractBusinessData?: boolean
    confidenceThreshold?: number  // 0-1, default 0.7
  }
}
```

### Response - Success (202 Accepted)
```typescript
interface OCRProcessResponse {
  ocrResultId: string
  status: 'processing'
  estimatedCompletion: Date
  processingStartedAt: Date
}
```

### Response - Error (400 Bad Request)
```typescript
interface OCRProcessError {
  error: 'invalid_document_type' | 'unsupported_format' | 'file_too_large'
  message: string
  details?: Record<string, any>
}
```

### Test Cases
```typescript
describe('POST /api/ocr/process', () => {
  it('should accept valid Romanian bank statement for IBAN extraction', async () => {
    const request: OCRProcessRequest = {
      documentId: 'doc_123',
      documentType: 'bank_statement',
      imageUrl: 'https://example.com/bank_statement.jpg',
      processingOptions: { extractIBAN: true }
    }

    const response = await api.post('/api/ocr/process', request)

    expect(response.status).toBe(202)
    expect(response.data.status).toBe('processing')
    expect(response.data.ocrResultId).toMatch(/^ocr_[a-zA-Z0-9]+$/)
  })

  it('should reject unsupported document types', async () => {
    const request: OCRProcessRequest = {
      documentId: 'doc_124',
      documentType: 'unsupported_type' as any,
      imageUrl: 'https://example.com/document.jpg'
    }

    const response = await api.post('/api/ocr/process', request)

    expect(response.status).toBe(400)
    expect(response.data.error).toBe('invalid_document_type')
  })
})
```

## GET /api/ocr/result/{ocrResultId}

**Purpose**: Retrieve OCR processing results and extracted data

### Response - Processing (202 Accepted)
```typescript
interface OCRResultProcessing {
  ocrResultId: string
  status: 'processing'
  progress: number  // 0-100
  estimatedCompletion: Date
}
```

### Response - Completed (200 OK)
```typescript
interface OCRResultCompleted {
  ocrResultId: string
  documentId: string
  status: 'completed'
  extractedText: string
  structuredData: Record<string, any>
  confidenceScore: number

  // Romanian-specific extractions
  ibanExtraction?: {
    extractedIBAN: string
    formattedIBAN: string
    bankCode: string
    bankName?: string
    formatValid: boolean
    checksumValid: boolean
    confidenceScore: number
  }

  businessDataExtraction?: {
    cui?: string
    onrcRegistrationNumber?: string
    legalForm?: string
    farmerIdNumber?: string
    farmLocation?: string
  }

  processedAt: Date
  processingDuration: number
}
```

### Response - Failed (200 OK with error status)
```typescript
interface OCRResultFailed {
  ocrResultId: string
  status: 'failed'
  error: string
  failureReason: 'poor_image_quality' | 'unsupported_format' | 'processing_timeout' | 'api_error'
  retryable: boolean
}
```

### Test Cases
```typescript
describe('GET /api/ocr/result/{ocrResultId}', () => {
  it('should return completed IBAN extraction for bank statement', async () => {
    const response = await api.get('/api/ocr/result/ocr_123_completed')

    expect(response.status).toBe(200)
    expect(response.data.status).toBe('completed')
    expect(response.data.ibanExtraction?.extractedIBAN).toMatch(/^RO\d{2}[A-Z]{4}\d{16}$/)
    expect(response.data.ibanExtraction?.formatValid).toBe(true)
    expect(response.data.confidenceScore).toBeGreaterThan(0.7)
  })

  it('should return processing status for ongoing OCR', async () => {
    const response = await api.get('/api/ocr/result/ocr_124_processing')

    expect(response.status).toBe(202)
    expect(response.data.status).toBe('processing')
    expect(response.data.progress).toBeGreaterThanOrEqual(0)
    expect(response.data.progress).toBeLessThanOrEqual(100)
  })
})
```