# Claude Code Configuration: OpenGrains

## Project Overview
OpenGrains is a grain trading application focused on supplier engagement and procurement processes. The current phase focuses on enhanced bilingual support (English/Romanian) and intelligent OCR document processing for Romanian business documents, while maintaining the core supplier engagement functionality built with React and shadcn/ui components.

## Technology Stack
- **Frontend**: React 18+ with TypeScript
- **UI Components**: shadcn/ui (based on Radix UI + Tailwind CSS)
- **Internationalization**: react-i18next with Romanian localization
- **OCR Processing**: OpenAI Vision API for document recognition
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: react-dropzone with progress tracking
- **HTTP Client**: axios for API communication
- **Testing**: Vitest/Jest with React Testing Library
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Caching**: Redis for OCR results and translation resources
- **Database**: PostgreSQL for structured data with Romanian business entities

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── forms/       # enhanced multilingual forms
│   │   ├── upload/      # document upload components
│   │   ├── ocr/         # OCR processing components
│   │   ├── i18n/        # language switching components
│   │   ├── targets/     # target dashboard components
│   │   └── layout/      # page layouts and navigation
│   ├── locales/         # translation files (en, ro)
│   ├── pages/
│   │   ├── agent/       # sales agent interface
│   │   ├── supplier/    # self-service supplier interface
│   │   └── backoffice/  # commercial back office interface
│   ├── services/        # enhanced API integration + OCR
│   ├── hooks/           # i18n and OCR custom hooks
│   ├── types/           # enhanced TypeScript definitions
│   ├── schemas/         # Zod validation schemas with Romanian rules
│   └── utils/           # OCR validation, IBAN formatting, i18n helpers
└── tests/

backend/
├── src/
│   ├── services/
│   │   ├── ocr/         # OpenAI OCR integration
│   │   ├── documents/   # document processing service
│   │   ├── targets/     # target calculation service
│   │   └── zones/       # geographical zone management
│   ├── models/          # enhanced data models
│   ├── api/             # REST API endpoints
│   └── utils/           # Romanian validation, IBAN verification

shared/
├── types/               # shared TypeScript definitions
├── constants/           # Romanian document types, IBAN formats
└── validation/          # shared Zod schemas
```

## Key Entities and Types

### Enhanced Supplier Profile
```typescript
interface SupplierProfile {
  businessName: string
  businessType: 'PJ' | 'PF'  // Romanian legal entity types
  languagePreference: 'en' | 'ro'
  assignedZone?: Zone
  primaryContact: ContactInfo
  address: Address
  grainTypes: string[]
  estimatedVolume?: VolumeEstimate

  // Romanian compliance fields
  romanianBusinessData?: RomanianBusinessData
  documentValidation?: DocumentValidation
}
```

### Romanian Document Management
```typescript
interface Document {
  id: string
  supplierId: string
  documentType: RomanianDocumentType  // onrc_certificate, farmer_id_card, etc.
  filename: string
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed'
  validationStatus: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'

  // OCR processing
  ocrResult?: OCRResult
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed'
}

type RomanianDocumentType =
  | 'onrc_certificate'     // ONRC Certificate
  | 'farmer_id_card'       // Farmer ID/Card
  | 'apia_certificate'     // APIA Certificate
  | 'bank_statement'       // Bank Statement with IBAN
  | 'identity_card'        // Romanian National ID
```

### OCR Processing
```typescript
interface OCRResult {
  id: string
  documentId: string
  extractedText: string
  structuredData: Record<string, any>
  confidenceScore: number  // 0-1 confidence level

  // Romanian-specific extractions
  ibanExtraction?: IBANExtraction
  businessDataExtraction?: BusinessDataExtraction

  processedAt: Date
  processingDuration: number
}

interface IBANExtraction {
  extractedIBAN: string
  formattedIBAN: string  // Standardized format
  bankCode: string
  bankName?: string
  formatValid: boolean
  checksumValid: boolean  // mod-97 validation
  confidenceScore: number
}
```

### Target Management
```typescript
interface Zone {
  id: string
  name: string
  code: string  // e.g., "BH", "CJ" for Romanian counties
  romanianCounty?: string
  historicalPotential: number
  activeSuppliers: number
}

interface PurchaseTarget {
  id: string
  salesAgentId: string
  zoneId: string
  year: number
  quarter?: number

  targetVolume: number
  targetValue: number
  targetSuppliers: number

  actualVolume: number
  actualValue: number
  actualSuppliers: number

  progressPercentage: number
  status: 'on_track' | 'at_risk' | 'exceeded' | 'missed'
}
```

## Form Patterns
- Use React Hook Form with `useForm` hook
- Zod schemas for validation (`zodResolver`) with Romanian business rules
- Multi-step forms with progress indicators and i18n support
- Auto-save functionality with localStorage
- Real-time validation with `mode: 'onChange'`
- Language-aware validation messages and error handling
- Romanian IBAN validation with format checking and mod-97 algorithm

## Component Patterns
- Prefer shadcn/ui components over custom implementations
- Use compound components for complex UI patterns
- Implement error boundaries for robust error handling
- Custom hooks for reusable logic (e.g., `useSupplierForm`, `useDocumentUpload`, `useOCR`, `useI18n`)
- Language-aware components that handle text expansion (Romanian ~20% longer)
- OCR-enabled document upload components with confidence scoring
- Target dashboard components with zone-based calculations

## API Integration
- Base URL: `/api` with environment-specific configuration
- RESTful endpoints following OpenAPI specification
- Error handling with consistent error response format and i18n support
- File uploads using FormData with progress tracking
- OCR endpoints with async processing and status polling
- Language preference headers (`Accept-Language`) for localized responses
- Target management endpoints with zone-based filtering
- Romanian business validation endpoints (IBAN, CUI, document compliance)

## Enhanced User Flows
1. **Bilingual Sales Agent Flow**: Agent selects Romanian, creates supplier profile, photographs Romanian documents, OCR extracts data automatically, target dashboard updates
2. **Romanian Supplier Self-Service Flow**: Supplier accesses link in Romanian, completes profile with local business requirements, uploads documents with OCR processing
3. **Enhanced Validation Flow**: Back office reviews with OCR-extracted data pre-populated, validates Romanian compliance, approves with automatic target calculations
4. **Target Management Flow**: Agents track zone-based performance, targets update automatically with new suppliers, management reports in preferred language
5. **Offer Processing Flow**: Suppliers submit grain sales offers and input purchase requests with Romanian agricultural specifications

## Current Feature Focus: Bilingual OCR Enhancement
Building enhanced UI components for the Supplier Engagement module with:
- **Bilingual Interface**: Complete English/Romanian localization with react-i18next
- **OCR Document Processing**: Intelligent Romanian business document recognition using OpenAI Vision API
- **Target Management**: Zone-based performance tracking and automated target calculations
- **Enhanced Forms**: Multi-step supplier registration with Romanian business validation
- **Document Upload**: OCR-enabled drag-and-drop interface with confidence scoring
- **Compliance Validation**: Romanian business document requirements (ONRC, APIA, IBAN validation)
- **Responsive Design**: Mobile-first bilingual interface with cultural adaptations

## Development Guidelines
- Follow TypeScript strict mode with enhanced type safety for Romanian business entities
- Use semantic HTML and ARIA attributes for accessibility in both languages
- Implement responsive design mobile-first with text expansion considerations
- Write component tests for critical user interactions including i18n and OCR scenarios
- Use environment variables for configuration including API keys and Romanian compliance settings
- Follow React best practices (hooks, composition, etc.) with i18n-aware components
- Implement error boundaries for OCR processing and language switching failures
- Follow Romanian data protection regulations (GDPR compliance for document processing)
- Test OCR accuracy with Romanian document samples and validation scenarios

## Enhanced Testing Strategy
- Unit tests for components and utilities including i18n and OCR processing
- Integration tests for bilingual user flows and OCR workflows
- API mocking with MSW for consistent testing including OCR endpoints
- Accessibility testing with axe-core for both English and Romanian interfaces
- Visual regression testing for UI components with text expansion scenarios
- OCR accuracy testing with Romanian document samples
- i18n testing for translation completeness and cultural adaptations
- Romanian business validation testing (IBAN format, CUI validation, document compliance)
- Performance testing for OCR processing and language switching
- Target calculation accuracy testing with zone-based scenarios

## Recent Changes: Bilingual OCR Enhancement

### Phase 0 (Research) - Completed
- Researched react-i18next integration with shadcn/ui for bilingual support
- Evaluated OpenAI Vision API for Romanian document OCR processing
- Investigated Romanian IBAN validation standards and banking formats
- Analyzed target calculation systems and geographical zone management
- Studied Romanian business document compliance requirements

### Phase 1 (Design) - Completed
- Enhanced data model with bilingual and OCR entities
- Created comprehensive API contracts for i18n, OCR, targets, and offers
- Designed Romanian document processing workflows
- Enhanced TypeScript interfaces for Romanian business compliance
- Added target management entities with zone-based calculations

### Previous Foundation
- Set up project structure for React frontend with shadcn/ui
- Defined TypeScript interfaces for supplier entities
- Created Zod validation schemas for forms
- Designed API contracts for supplier management
- Implemented file upload patterns with progress tracking

### Current Status
- Phase 2 (Task Generation) ready for `/tasks` command execution
- All Phase 0-1 artifacts completed: research.md, data-model.md, contracts/, quickstart.md, CLAUDE.md
- Enhanced project foundation supports bilingual interface and OCR processing
- Romanian business compliance patterns established
- Ready for implementation phase with comprehensive planning documentation