# Offers and Purchase Requests API Contracts

## POST /api/offers

**Purpose**: Submit grain sales offers from approved suppliers

### Request
```typescript
interface SalesOfferRequest {
  grainType: string
  quantity: number          // Tons
  pricePerTon: number      // Currency based on user locale
  totalValue: number       // Auto-calculated or manual override

  // Romanian-specific fields
  deliveryZone: string
  harvestSeason: string    // e.g., "2025", "Summer 2025"
  qualityGrade?: 'Premium' | 'Standard' | 'Feed'
  moistureContent?: number // Percentage
  deliveryTerms?: string

  // Quality specifications
  specifications: {
    protein?: number       // Percentage
    testWeight?: number    // kg/hl
    fallingNumber?: number // Seconds (for wheat)
    aflatoxin?: number     // ppb (parts per billion)
  }

  // Delivery preferences
  preferredDeliveryDate: Date
  deliveryAddress?: string
  deliveryFlexibility: 'strict' | 'flexible_7_days' | 'flexible_14_days'

  // Offer validity
  validUntil: Date
  autoRenew?: boolean

  // Language context
  submittedInLanguage: 'en' | 'ro'
  notes?: string          // Additional notes in submitted language
}
```

### Response - Success (201 Created)
```typescript
interface SalesOfferResponse {
  offerId: string
  supplierId: string
  status: 'submitted'
  submittedAt: Date
  offerNumber: string     // Human-readable offer reference

  // Calculated fields
  totalValue: number
  estimatedProcessingTime: string  // e.g., "2-3 business days"

  // Next steps
  nextSteps: Array<{
    step: string
    description: string
    estimatedDate?: Date
  }>

  // Procurement routing
  assignedTo?: string     // Procurement team member
  reviewPriority: 'high' | 'medium' | 'low'
}
```

### Response - Validation Error (400 Bad Request)
```typescript
interface OfferValidationError {
  error: 'validation_failed'
  message: string
  validationErrors: Array<{
    field: string
    code: string
    message: string
    messageTranslated?: string  // If user language is Romanian
  }>
}
```

### Test Cases
```typescript
describe('POST /api/offers', () => {
  it('should create offer for Romanian wheat supplier', async () => {
    const request: SalesOfferRequest = {
      grainType: 'wheat',
      quantity: 500,
      pricePerTon: 1200,
      totalValue: 600000,
      deliveryZone: 'Bihor',
      harvestSeason: '2025',
      qualityGrade: 'Premium',
      moistureContent: 13.5,
      specifications: {
        protein: 14.2,
        testWeight: 78.5,
        fallingNumber: 320
      },
      preferredDeliveryDate: new Date('2025-10-15'),
      deliveryFlexibility: 'flexible_7_days',
      validUntil: new Date('2025-12-31'),
      submittedInLanguage: 'ro'
    }

    const response = await api.post('/api/offers', request)

    expect(response.status).toBe(201)
    expect(response.data.status).toBe('submitted')
    expect(response.data.offerNumber).toMatch(/^OF-\d{4}-\d{6}$/)
    expect(response.data.reviewPriority).toMatch(/^(high|medium|low)$/)
  })

  it('should validate required fields for Romanian market', async () => {
    const request = {
      grainType: 'wheat',
      quantity: -10,  // Invalid negative quantity
      // Missing required fields
    }

    const response = await api.post('/api/offers', request)

    expect(response.status).toBe(400)
    expect(response.data.error).toBe('validation_failed')
    expect(response.data.validationErrors).toContainEqual({
      field: 'quantity',
      code: 'min_value',
      message: expect.any(String)
    })
  })
})
```

## POST /api/purchases

**Purpose**: Submit input purchase requests from suppliers

### Request
```typescript
interface InputPurchaseRequest {
  inputType: 'seeds' | 'fertilizers' | 'pesticides' | 'equipment' | 'other'
  inputCategory: string     // More specific category
  productName?: string      // Specific product if known

  quantity: number
  quantityUnit: 'kg' | 'tons' | 'liters' | 'pieces'

  // Technical specifications
  specifications: {
    brand?: string
    model?: string
    activeIngredient?: string  // For pesticides/fertilizers
    concentration?: number     // Percentage
    organicCertified?: boolean
    applicationRate?: string   // Usage instructions
  }

  // Delivery requirements
  requiredBy: Date
  deliveryAddress: string
  deliveryInstructions?: string

  // Budget constraints
  maxBudget?: number
  preferredSuppliers?: string[]  // Supplier preferences

  // Romanian agricultural context
  cropApplication?: string[]     // Which crops this will be used for
  farmSize?: number             // Hectares
  soilType?: string
  organicFarm?: boolean

  // Language context
  submittedInLanguage: 'en' | 'ro'
  additionalNotes?: string
}
```

### Response - Success (201 Created)
```typescript
interface InputPurchaseResponse {
  requestId: string
  supplierId: string
  status: 'submitted'
  submittedAt: Date
  requestNumber: string   // Human-readable reference

  // Processing information
  estimatedQuoteTime: string  // e.g., "3-5 business days"
  assignedProcurementAgent?: string

  // Available options preview
  preliminaryOptions?: Array<{
    supplier: string
    estimatedPrice: number
    availability: string
    deliveryTimeframe: string
  }>

  // Next steps
  nextSteps: Array<{
    step: string
    description: string
    estimatedDate?: Date
  }>
}
```

### Test Cases
```typescript
describe('POST /api/purchases', () => {
  it('should create input purchase request for Romanian farmer', async () => {
    const request: InputPurchaseRequest = {
      inputType: 'fertilizers',
      inputCategory: 'NPK Fertilizer',
      productName: 'NPK 20-20-20',
      quantity: 2,
      quantityUnit: 'tons',
      specifications: {
        concentration: 60,
        organicCertified: false
      },
      requiredBy: new Date('2025-04-01'),
      deliveryAddress: 'Comuna Girișu de Criș, Județul Bihor',
      cropApplication: ['corn', 'wheat'],
      farmSize: 150,
      organicFarm: false,
      maxBudget: 8000,
      submittedInLanguage: 'ro',
      additionalNotes: 'Preferat livrare dimineața'
    }

    const response = await api.post('/api/purchases', request)

    expect(response.status).toBe(201)
    expect(response.data.status).toBe('submitted')
    expect(response.data.requestNumber).toMatch(/^PR-\d{4}-\d{6}$/)
    expect(response.data.estimatedQuoteTime).toBeDefined()
  })

  it('should validate delivery date is in future', async () => {
    const request: InputPurchaseRequest = {
      inputType: 'seeds',
      inputCategory: 'Corn Seeds',
      quantity: 50,
      quantityUnit: 'kg',
      requiredBy: new Date('2020-01-01'), // Past date
      deliveryAddress: 'Test Address',
      submittedInLanguage: 'en'
    }

    const response = await api.post('/api/purchases', request)

    expect(response.status).toBe(400)
    expect(response.data.validationErrors).toContainEqual({
      field: 'requiredBy',
      code: 'future_date_required',
      message: expect.any(String)
    })
  })
})
```

## GET /api/offers/{offerId}

**Purpose**: Retrieve sales offer details and status

### Response - Success (200 OK)
```typescript
interface SalesOfferDetails {
  offerId: string
  offerNumber: string
  supplierId: string
  supplierName: string

  // Offer details
  grainType: string
  quantity: number
  pricePerTon: number
  totalValue: number
  specifications: Record<string, any>

  // Status tracking
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'expired'
  statusHistory: Array<{
    status: string
    changedAt: Date
    changedBy?: string
    notes?: string
  }>

  // Processing information
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  acceptedAt?: Date
  rejectedAt?: Date

  // Feedback and communication
  reviewNotes?: string
  supplierFeedback?: string

  // Contract information (if accepted)
  contractGenerated?: boolean
  contractUrl?: string
  paymentTerms?: string

  // Language context
  submittedInLanguage: 'en' | 'ro'
  responseLanguage?: 'en' | 'ro'
}
```

### Test Cases
```typescript
describe('GET /api/offers/{offerId}', () => {
  it('should return complete offer details with status history', async () => {
    const response = await api.get('/api/offers/offer_123')

    expect(response.status).toBe(200)
    expect(response.data.offerId).toBe('offer_123')
    expect(response.data.statusHistory).toBeInstanceOf(Array)
    expect(response.data.statusHistory.length).toBeGreaterThan(0)
    expect(response.data.submittedInLanguage).toMatch(/^(en|ro)$/)
  })

  it('should return 404 for non-existent offer', async () => {
    const response = await api.get('/api/offers/offer_nonexistent')

    expect(response.status).toBe(404)
    expect(response.data.error).toBe('offer_not_found')
  })
})
```