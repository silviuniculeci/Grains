# Research: OpenGrains Bilingual Supplier Engagement with OCR Integration

## React i18n with shadcn/ui Integration

**Decision**: Use react-i18next with shadcn/ui for comprehensive bilingual support
**Rationale**:
- react-i18next is the industry standard for React internationalization
- Supports dynamic language switching without page reloads
- Compatible with shadcn/ui component structure
- Provides strong TypeScript support and namespace organization
- Handles pluralization and context-specific translations

**Alternatives considered**:
- react-intl: More complex setup, less flexible for component libraries
- Custom solution: Too much development overhead for i18n features
- Server-side i18n: Doesn't support real-time language switching

**Implementation approach**:
- Initialize with i18next and react-i18next
- Create translation namespaces for different sections (forms, validation, etc.)
- Use t() hook in shadcn/ui components
- Implement language switcher component with persistent storage
- Support RTL/LTR text direction (future Romanian requirement)

## OpenAI Vision API for Romanian Document OCR

**Decision**: Use OpenAI Vision API (GPT-4 Vision) for document OCR processing
**Rationale**:
- Superior accuracy for handwritten and printed text recognition
- Built-in understanding of document structure and context
- Supports Romanian language and diacritical marks
- Can extract structured data (IBAN, names, addresses) with context
- Handles various image qualities and formats

**Alternatives considered**:
- Tesseract.js: Lower accuracy for Romanian text and complex layouts
- Google Cloud Vision: Good but more expensive and complex setup
- Azure Computer Vision: Similar capability but vendor lock-in concerns

**Implementation approach**:
- Use GPT-4 Vision API with structured prompts for each document type
- Implement confidence scoring based on response completeness
- Create fallback mechanisms for low-confidence extractions
- Cache OCR results to avoid duplicate processing
- Implement image preprocessing for better accuracy

## Romanian IBAN Validation and Banking Formats

**Decision**: Implement comprehensive Romanian IBAN validation with real-time verification
**Rationale**:
- Romanian IBAN format: RO + 2 check digits + 4 bank code + 16 account number
- Critical for payment processing and compliance
- Must validate both format and check digit algorithm
- Need to support major Romanian banks (BCR, BRD, ING, etc.)

**Implementation approach**:
```typescript
// Romanian IBAN format: RO + 2 digits + 4 bank + 16 account
const ROMANIAN_IBAN_REGEX = /^RO\d{2}[A-Z]{4}\d{16}$/
const MAJOR_ROMANIAN_BANKS = {
  'RNCB': 'BCR (Banca Comercială Română)',
  'BRDE': 'BRD (Banca Română pentru Dezvoltare)',
  'INGB': 'ING Bank România',
  'BTRL': 'Banca Transilvania'
}

// Implement mod-97 check digit validation
// Support both typed input validation and OCR result verification
```

## Target Calculation Systems and Zone Management

**Decision**: Implement zone-based target calculation with historical performance tracking
**Rationale**:
- Agricultural business requires geographical territory management
- Sales targets must account for regional potential and seasonal variations
- Need to track performance vs. targets for agent evaluation
- Zone definitions based on administrative regions and delivery logistics

**Implementation approach**:
- Define zones by Romanian counties (județe) and agricultural regions
- Calculate targets based on historical data, crop reports, and market potential
- Track metrics: signed suppliers, volume commitments, seasonal performance
- Implement target vs. actual dashboards with trending analysis
- Support target adjustments based on market conditions

## Romanian Business Document Types and Compliance

**Decision**: Support comprehensive Romanian business document validation
**Rationale**:
- Legal entities (PJ) and individuals (PF) have different requirements
- Must comply with Romanian commercial and agricultural regulations
- Document validation ensures legal compliance and reduces risk

**Key Romanian Documents**:
1. **ONRC Certificate** (Certificat ONRC)
   - Commercial registry certificate for legal entities
   - Contains CUI (fiscal code), registration number, business activity codes
   - OCR targets: Company name, CUI, registration date, legal form

2. **Farmer ID/Card** (Carnetul/Cardul Fermierului)
   - Official farmer identification document
   - Required for agricultural subsidies and APIA programs
   - OCR targets: Farmer name, ID number, farm location, crop types

3. **APIA Certificate** (Adeverință APIA)
   - Agricultural Payment and Intervention Agency certificate
   - Proves eligibility for agricultural subsidies
   - OCR targets: Farmer details, land area, subsidy amounts

4. **Bank Statement** (Extras de cont bancar)
   - Required for IBAN verification and financial capacity
   - Must show recent transactions and account balance
   - OCR targets: IBAN, account holder name, bank details

5. **Identity Document** (CI - Carte de Identitate)
   - Romanian national ID card for individual verification
   - OCR targets: Name, CNP (personal numeric code), address

**Validation Requirements**:
- Document authenticity checks (security features, format validation)
- Cross-reference data consistency between documents
- Compliance with GDPR for personal data handling
- Retention policies for sensitive document images

## Multilingual UI/UX Patterns

**Decision**: Implement comprehensive bilingual experience with cultural adaptation
**Rationale**:
- Romanian users expect localized experience beyond translation
- Agricultural terminology requires domain-specific translations
- Form layouts may need adjustment for text length differences
- Cultural preferences for information presentation

**Implementation approach**:
- Create Romanian translation files with agricultural terminology
- Implement responsive layouts that handle text expansion (Romanian ~20% longer)
- Use Romanian date/number formats and currency display
- Provide Romanian-specific help text and validation messages
- Support Romanian keyboard layouts and input methods

## Performance and Caching Strategies

**Decision**: Implement multi-level caching for OCR and translation performance
**Rationale**:
- OCR processing can be slow (2-5 seconds per document)
- Translation resources should be cached for instant language switching
- Document images need efficient storage and retrieval

**Implementation approach**:
- Redis cache for OCR results (keyed by image hash)
- Local storage for translation resources and language preferences
- CDN for document images with secure access controls
- Background processing for non-critical OCR tasks
- Progressive loading for large translation files

## Security and Privacy Considerations

**Decision**: Implement comprehensive data protection for document processing
**Rationale**:
- Romanian business documents contain sensitive personal and financial data
- Must comply with GDPR and Romanian data protection laws
- OCR processing involves sending data to external APIs (OpenAI)

**Implementation approach**:
- End-to-end encryption for document transmission
- Secure document storage with access controls
- GDPR-compliant data retention and deletion policies
- User consent management for OCR processing
- Audit logging for document access and processing
- Data minimization for API calls (send only necessary data)

## Error Handling and Fallback Strategies

**Decision**: Implement graceful degradation for OCR and language features
**Rationale**:
- OCR may fail due to poor image quality or network issues
- Language switching should work even with partial translations
- System must remain functional when AI services are unavailable

**Implementation approach**:
- Manual data entry fallback when OCR fails
- Progressive enhancement for language features
- Error boundaries for OCR components
- Retry mechanisms with exponential backoff
- User feedback for OCR confidence levels
- Offline mode support for basic functionality