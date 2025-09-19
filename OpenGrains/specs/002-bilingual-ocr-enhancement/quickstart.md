# Quickstart Guide: OpenGrains Bilingual OCR Enhancement

**Feature Branch**: `002-bilingual-ocr-enhancement` | **Date**: 2025-09-18

## Overview

This enhancement adds comprehensive bilingual support (English/Romanian) and intelligent OCR document processing to the OpenGrains supplier engagement system. The feature enables Romanian agricultural businesses to interact with the platform in their native language while automating document processing for compliance verification.

## Key Features

### 🌍 Bilingual Interface
- **Complete Romanian localization** with agricultural terminology
- **Real-time language switching** without page reload
- **Persistent language preferences** across sessions
- **Cultural adaptation** for Romanian business practices

### 📄 Intelligent OCR Processing
- **OpenAI Vision API integration** for document recognition
- **Romanian document types** (ONRC, APIA, Farmer ID, Bank statements)
- **Automatic IBAN extraction** with validation
- **Confidence scoring** and manual fallback options

### 🎯 Target Management
- **Zone-based target tracking** by Romanian counties
- **Performance dashboards** with real-time metrics
- **Historical trend analysis** and seasonal adjustments
- **Automated target updates** when suppliers are approved

### 🚀 Enhanced Workflows
- **Streamlined document upload** with OCR processing
- **Intelligent offer routing** to procurement teams
- **Input purchase requests** for agricultural supplies
- **Compliance validation** for Romanian business requirements

## Quick Demo Scenarios

### Scenario 1: Romanian Sales Agent Registration
```
1. Agent opens app → Selects Romanian language
2. Creates new supplier profile → Fills form in Romanian
3. Photographs ONRC certificate → OCR extracts business data
4. Photographs bank statement → IBAN automatically extracted
5. System validates documents → Updates agent's target dashboard
```

### Scenario 2: Supplier Self-Service in Romanian
```
1. Supplier clicks registration link → Chooses Romanian interface
2. Completes profile with Romanian business details
3. Uploads required documents → OCR processes automatically
4. Back office reviews → Approves with one click
5. Supplier submits grain offer → Routed to procurement team
```

### Scenario 3: Target Management Dashboard
```
1. Agent views performance dashboard → All metrics in Romanian
2. New supplier approved → Targets automatically updated
3. Zone performance calculated → Progress tracking updated
4. Management reports generated → Export in Romanian format
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database for structured data
- Redis for OCR result caching
- OpenAI API key for OCR processing
- Cloud storage for document images

### Environment Configuration
```bash
# Core application
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/opengrains
REDIS_URL=redis://localhost:6379

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,ro

# OCR Service
OPENAI_API_KEY=your_openai_api_key
OCR_CONFIDENCE_THRESHOLD=0.7
OCR_CACHE_TTL=3600

# Document Storage
CLOUD_STORAGE_BUCKET=opengrains-documents
DOCUMENT_RETENTION_DAYS=2555  # 7 years for Romanian compliance

# Romanian Compliance
IBAN_VALIDATION_ENABLED=true
ROMANIAN_BANKS_DATABASE_URL=https://api.romanian-banks.ro
```

### Quick Start Commands
```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed:dev

# Start development servers
npm run dev          # Frontend (port 3000)
npm run dev:api      # Backend API (port 8000)
npm run dev:ocr      # OCR service (port 8001)

# Run tests
npm run test
npm run test:e2e

# Build for production
npm run build
```

## API Endpoints Overview

### Internationalization
- `GET /api/languages/{locale}` - Translation resources
- `PUT /api/users/{id}/language` - Update language preference
- `GET /api/i18n/context` - User's i18n context

### OCR Processing
- `POST /api/ocr/process` - Submit document for OCR
- `GET /api/ocr/result/{id}` - Get OCR results
- `POST /api/ocr/validate` - Validate extracted data

### Target Management
- `GET /api/targets/zones` - Zone-based targets
- `POST /api/targets/update` - Update target metrics
- `GET /api/agents/{id}/dashboard` - Agent performance dashboard

### Enhanced Workflows
- `POST /api/offers` - Submit grain sales offers
- `POST /api/purchases` - Submit input purchase requests
- `GET /api/offers/{id}` - Offer details and status

## Key Components

### Frontend Components
```typescript
// Language switcher with flag icons
<LanguageSwitcher
  currentLanguage="ro"
  onLanguageChange={handleLanguageChange}
/>

// OCR-enabled document upload
<DocumentUpload
  documentType="bank_statement"
  onOCRComplete={handleOCRResult}
  language="ro"
/>

// Zone-based target dashboard
<TargetDashboard
  agentId="agent_123"
  zones={assignedZones}
  language="ro"
/>

// Romanian form with validation
<SupplierForm
  language="ro"
  validationSchema={romanianSupplierSchema}
  onSubmit={handleSubmit}
/>
```

### Backend Services
```typescript
// OCR processing service
class OCRService {
  async processDocument(imageUrl: string, documentType: RomanianDocumentType)
  async extractIBAN(bankStatementUrl: string)
  async validateExtraction(ocrResult: OCRResult)
}

// Target calculation service
class TargetService {
  async updateTargetsForSupplierApproval(supplierId: string)
  async calculateZonePerformance(zoneId: string)
  async generatePerformanceReport(agentId: string, language: 'en' | 'ro')
}

// Romanian validation service
class RomanianValidationService {
  validateIBAN(iban: string): IBANValidationResult
  validateCUI(cui: string): CUIValidationResult
  validateDocumentCompliance(documents: Document[]): ComplianceResult
}
```

## Configuration Files

### i18n Configuration (`i18n.config.ts`)
```typescript
export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'ro'],
  namespaces: ['common', 'forms', 'validation', 'documents', 'targets'],
  fallbackLng: 'en',
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage']
  }
}
```

### OCR Service Configuration (`ocr.config.ts`)
```typescript
export const ocrConfig = {
  provider: 'openai_vision',
  confidenceThreshold: 0.7,
  romanianDocumentTypes: {
    onrc_certificate: { extractFields: ['cui', 'companyName', 'registrationDate'] },
    bank_statement: { extractFields: ['iban', 'accountHolder', 'bankName'] },
    farmer_id: { extractFields: ['farmerName', 'farmLocation', 'idNumber'] }
  },
  processing: {
    maxRetries: 3,
    timeoutMs: 30000,
    cacheResults: true
  }
}
```

## Romanian Localization Files

### Common Terms (`locales/ro/common.json`)
```json
{
  "save": "Salvează",
  "cancel": "Anulează",
  "continue": "Continuă",
  "upload": "Încarcă",
  "processing": "Se procesează...",
  "completed": "Finalizat",
  "pending": "În așteptare",
  "approved": "Aprobat",
  "rejected": "Respins"
}
```

### Document Types (`locales/ro/documents.json`)
```json
{
  "onrc_certificate": "Certificat ONRC",
  "farmer_id_card": "Carnetul/Cardul Fermierului",
  "apia_certificate": "Adeverință APIA",
  "bank_statement": "Extras de cont bancar",
  "identity_card": "Carte de Identitate",
  "upload_instructions": "Fotografiați documentul clar, cu toate informațiile vizibile"
}
```

## Testing Strategy

### Unit Tests
```bash
# Component tests with i18n
npm run test:components

# API endpoint tests
npm run test:api

# OCR service tests
npm run test:ocr

# Romanian validation tests
npm run test:validation
```

### Integration Tests
```bash
# Full workflow tests
npm run test:e2e

# OCR accuracy tests
npm run test:ocr:accuracy

# Bilingual interface tests
npm run test:i18n:e2e
```

### Performance Testing
```bash
# OCR processing performance
npm run test:perf:ocr

# Language switching performance
npm run test:perf:i18n

# Target calculation performance
npm run test:perf:targets
```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Translation files complete and reviewed
- [ ] OCR service API keys valid
- [ ] Document storage permissions set
- [ ] Romanian compliance validation tested

### Post-deployment
- [ ] Health checks passing
- [ ] OCR processing functional
- [ ] Language switching working
- [ ] Target calculations accurate
- [ ] Document upload and processing working
- [ ] Romanian interface fully functional

## Monitoring & Analytics

### Key Metrics
- **OCR Accuracy**: Success rate by document type
- **Language Usage**: Distribution between English/Romanian
- **Target Performance**: Achievement rates by zone
- **Document Processing**: Upload to approval times
- **User Engagement**: Language preference adoption

### Alerts
- OCR processing failures > 5%
- Translation loading errors
- Target calculation discrepancies
- Document validation failures
- Romanian compliance violations

## Support & Troubleshooting

### Common Issues
1. **OCR fails**: Check image quality, document type, API limits
2. **Language not switching**: Clear localStorage, check i18n config
3. **Targets not updating**: Verify zone assignments, check calculations
4. **Romanian characters**: Ensure UTF-8 encoding, font support

### Debug Commands
```bash
# OCR service logs
npm run logs:ocr

# i18n debugging
npm run debug:i18n

# Target calculation debugging
npm run debug:targets

# Romanian validation debugging
npm run debug:validation
```

### Contact & Resources
- **Technical Support**: engineering@opengrains.com
- **Romanian Localization**: i18n@opengrains.com
- **OCR Issues**: ocr-support@opengrains.com
- **Documentation**: https://docs.opengrains.com/bilingual-ocr