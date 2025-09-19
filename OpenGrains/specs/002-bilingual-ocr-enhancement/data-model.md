# Data Model: OpenGrains Bilingual Supplier Engagement with OCR Integration

**Feature Branch**: `002-bilingual-ocr-enhancement` | **Date**: 2025-09-18
**Input**: Feature specification from `/specs/002-bilingual-ocr-enhancement/spec.md`

## Enhanced Entity Model

### Core Enhanced Entities

#### **User (Enhanced)**
```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'sales_agent' | 'supplier' | 'back_office' | 'procurement'
  languagePreference: 'en' | 'ro'  // NEW: Language preference
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  // Role-specific fields
  salesAgentProfile?: SalesAgentProfile
  supplierProfile?: SupplierProfile
}
```

#### **SalesAgentProfile (Enhanced)**
```typescript
interface SalesAgentProfile {
  id: string
  userId: string
  assignedZones: Zone[]  // NEW: Geographical zones
  currentTargets: PurchaseTarget[]  // NEW: Target tracking
  performanceMetrics: AgentPerformanceMetrics  // NEW: Performance data
  preferredLanguage: 'en' | 'ro'  // NEW: Working language preference
}
```

#### **SupplierProfile (Enhanced)**
```typescript
interface SupplierProfile {
  id: string
  userId: string
  businessName: string
  businessType: 'PJ' | 'PF'  // NEW: Romanian legal entity types
  registrationStatus: 'pending' | 'approved' | 'rejected' | 'requires_documents'
  assignedZone?: Zone  // NEW: Assigned geographical zone
  preferredLanguage: 'en' | 'ro'  // NEW: Communication language

  // Romanian compliance fields
  romanianBusinessData?: RomanianBusinessData  // NEW: Romanian-specific data
  documentValidation?: DocumentValidation  // NEW: Document compliance status
}
```

### New OCR and Document Entities

#### **Document (Enhanced for Romanian)**
```typescript
interface Document {
  id: string
  supplierId: string
  documentType: RomanianDocumentType  // NEW: Romanian document classification
  fileName: string
  fileUrl: string
  uploadedAt: Date

  // OCR processing
  ocrResult?: OCRResult  // NEW: OCR processing result
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed'

  // Romanian compliance
  validationStatus: 'pending' | 'valid' | 'invalid' | 'requires_review'
  validatedBy?: string  // User ID of validator
  validatedAt?: Date
}

type RomanianDocumentType =
  | 'onrc_certificate'     // ONRC Certificate
  | 'farmer_id_card'       // Farmer ID/Card
  | 'apia_certificate'     // APIA Certificate
  | 'bank_statement'       // Bank Statement with IBAN
  | 'identity_card'        // Romanian National ID
  | 'other'
```

#### **OCRResult (New)**
```typescript
interface OCRResult {
  id: string
  documentId: string
  extractedText: string
  structuredData: Record<string, any>  // Extracted structured fields
  confidenceScore: number  // 0-1 confidence level

  // Romanian-specific extractions
  ibanExtraction?: IBANExtraction
  businessDataExtraction?: BusinessDataExtraction

  processedAt: Date
  processingDuration: number  // milliseconds
  apiProvider: 'openai_vision'  // Future: support multiple providers
}
```

#### **IBANExtraction (New)**
```typescript
interface IBANExtraction {
  id: string
  ocrResultId: string
  extractedIBAN: string
  formattedIBAN: string  // Standardized format
  bankCode: string  // First 4 letters after RO##
  bankName?: string  // Resolved bank name
  accountNumber: string

  // Validation results
  formatValid: boolean
  checksumValid: boolean  // mod-97 validation
  confidenceScore: number

  // Manual verification
  manuallyVerified: boolean
  verifiedBy?: string
  verifiedAt?: Date
}
```

#### **RomanianBusinessData (New)**
```typescript
interface RomanianBusinessData {
  id: string
  supplierId: string

  // Legal entity data
  cui?: string  // Romanian fiscal code
  onrcRegistrationNumber?: string
  legalForm?: string
  registrationDate?: Date

  // Farmer-specific data
  farmerIdNumber?: string
  farmLocation?: string
  cropTypes?: string[]
  apiaEligible?: boolean

  // Extracted vs Manual flags
  dataSource: 'ocr_extracted' | 'manually_entered' | 'hybrid'
  extractedAt?: Date
  lastVerifiedAt?: Date
}
```

#### **DocumentValidation (New)**
```typescript
interface DocumentValidation {
  id: string
  supplierId: string

  // Validation status by document type
  onrcStatus: 'missing' | 'pending' | 'valid' | 'invalid'
  farmerIdStatus: 'missing' | 'pending' | 'valid' | 'invalid' | 'not_required'
  apiaStatus: 'missing' | 'pending' | 'valid' | 'invalid' | 'not_required'
  bankStatementStatus: 'missing' | 'pending' | 'valid' | 'invalid'
  identityStatus: 'missing' | 'pending' | 'valid' | 'invalid'

  // Overall compliance
  overallStatus: 'incomplete' | 'pending_review' | 'compliant' | 'non_compliant'

  // Review tracking
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
}
```

### Target Management Entities

#### **Zone (New)**
```typescript
interface Zone {
  id: string
  name: string
  code: string  // e.g., "BH", "CJ" for Romanian counties
  type: 'county' | 'region' | 'custom'

  // Geographical boundaries
  coordinates?: GeoJSON.Polygon
  romanianCounty?: string  // Romanian județ

  // Business data
  historicalPotential: number  // Historical grain volume
  seasonalFactors: Record<string, number>  // Monthly factors
  activeSuppliers: number

  createdAt: Date
  updatedAt: Date
}
```

#### **PurchaseTarget (New)**
```typescript
interface PurchaseTarget {
  id: string
  salesAgentId: string
  zoneId: string

  // Target periods
  year: number
  quarter?: number  // Optional quarterly targets

  // Target metrics
  targetVolume: number  // Tons of grain
  targetValue: number   // Monetary value
  targetSuppliers: number  // Number of new suppliers

  // Actual performance
  actualVolume: number
  actualValue: number
  actualSuppliers: number

  // Progress tracking
  progressPercentage: number  // Auto-calculated
  lastUpdatedAt: Date

  // Performance indicators
  status: 'on_track' | 'at_risk' | 'exceeded' | 'missed'
}
```

#### **AgentPerformanceMetrics (New)**
```typescript
interface AgentPerformanceMetrics {
  id: string
  salesAgentId: string

  // Current period metrics
  currentPeriod: {
    suppliersRegistered: number
    documentsProcessed: number
    targetsAchieved: number
    conversionRate: number  // Percentage of visits to registrations
  }

  // Historical performance
  historicalMetrics: {
    period: string  // "2025-Q1", "2025-Q2", etc.
    performance: number  // 0-1 scale
  }[]

  lastCalculatedAt: Date
}
```

### Enhanced Workflow Entities

#### **SalesOffer (Enhanced)**
```typescript
interface SalesOffer {
  id: string
  supplierId: string

  // Offer details
  grainType: string
  quantity: number  // Tons
  pricePerTon: number
  totalValue: number

  // Romanian-specific fields
  deliveryZone: string
  harvestSeason: string
  qualityGrade?: string
  moistureContent?: number

  // Workflow
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected'
  submittedAt: Date
  reviewedBy?: string
  reviewedAt?: Date

  // Language context
  submittedInLanguage: 'en' | 'ro'
}
```

#### **InputPurchaseRequest (New)**
```typescript
interface InputPurchaseRequest {
  id: string
  supplierId: string

  // Request details
  inputType: string  // Seeds, fertilizers, pesticides, etc.
  quantity: number
  specifications: Record<string, any>

  // Delivery preferences
  preferredDeliveryDate: Date
  deliveryAddress: string

  // Workflow
  status: 'draft' | 'submitted' | 'processing' | 'approved' | 'fulfilled' | 'cancelled'
  submittedAt: Date
  processedBy?: string

  // Language context
  submittedInLanguage: 'en' | 'ro'
}
```

#### **TargetReport (New)**
```typescript
interface TargetReport {
  id: string
  generatedBy: string  // User ID
  reportType: 'agent_performance' | 'zone_analysis' | 'supplier_overview'

  // Report period
  periodStart: Date
  periodEnd: Date

  // Filters applied
  zoneIds?: string[]
  agentIds?: string[]

  // Generated data
  reportData: Record<string, any>  // Flexible structure for different report types

  // Metadata
  generatedAt: Date
  language: 'en' | 'ro'
  exportFormat?: 'pdf' | 'excel' | 'csv'
}
```

## Entity Relationships

### Enhanced Relationship Diagram
```
User (Enhanced with language preference)
├── SalesAgentProfile (with zones and targets)
│   ├── Zone (geographical assignment)
│   ├── PurchaseTarget (performance tracking)
│   └── AgentPerformanceMetrics
└── SupplierProfile (with Romanian compliance)
    ├── RomanianBusinessData (OCR extracted)
    ├── DocumentValidation (compliance status)
    ├── Document (Romanian document types)
    │   └── OCRResult
    │       └── IBANExtraction
    ├── SalesOffer (enhanced with Romanian fields)
    └── InputPurchaseRequest (new workflow)

Zone (geographical management)
├── PurchaseTarget (zone-based targets)
└── SupplierProfile (zone assignment)

TargetReport (management reporting)
├── Zone (report filtering)
├── SalesAgentProfile (performance data)
└── PurchaseTarget (metrics source)
```

## Data Flow Patterns

### OCR Processing Flow
```
1. Document Upload → Document entity created
2. OCR Processing → OCRResult entity with structured data
3. IBAN Detection → IBANExtraction entity with validation
4. Business Data → RomanianBusinessData entity populated
5. Validation → DocumentValidation status updated
```

### Language Preference Flow
```
1. User Language Selection → User.languagePreference updated
2. Session Storage → Frontend language context
3. API Responses → Localized based on user preference
4. Document Submission → Language context preserved
```

### Target Management Flow
```
1. Agent Assignment → Zone relationship established
2. Target Setting → PurchaseTarget entities created
3. Supplier Approval → Target metrics updated
4. Performance Calculation → AgentPerformanceMetrics computed
5. Report Generation → TargetReport entities created
```

## Data Validation Rules

### Romanian Business Validation
- **IBAN Format**: Must match Romanian IBAN pattern `RO\d{2}[A-Z]{4}\d{16}`
- **CUI Validation**: Romanian fiscal code format validation
- **Document Types**: Must match required documents for PJ/PF business types
- **Language Fields**: Must be 'en' or 'ro' for all language preference fields

### OCR Confidence Thresholds
- **High Confidence**: >0.9 - Auto-approve for target updates
- **Medium Confidence**: 0.7-0.9 - Require manual review
- **Low Confidence**: <0.7 - Require manual data entry

### Target Calculation Rules
- **Zone Assignment**: Each supplier assigned to exactly one zone
- **Target Aggregation**: Agent targets sum across all assigned zones
- **Performance Metrics**: Updated daily based on approved suppliers
- **Historical Tracking**: Preserve quarterly/yearly performance data

## Technical Implementation Notes

### Database Considerations
- **Indexing**: Index on language preferences for quick filtering
- **OCR Results**: Consider archival strategy for large text data
- **Geographic Data**: Spatial indexing for zone boundary queries
- **Performance**: Materialized views for target calculations

### API Design Impact
- **Language Headers**: Accept-Language header support
- **Localized Responses**: Error messages and validation in user language
- **OCR Endpoints**: Async processing with status polling
- **Target Aggregation**: Real-time calculation vs. cached results

### Security and Privacy
- **Document Images**: Encrypted storage with access controls
- **OCR Data**: Audit logging for extracted personal data
- **Romanian Compliance**: GDPR-compliant data retention policies
- **API Authentication**: Enhanced role-based access for OCR operations