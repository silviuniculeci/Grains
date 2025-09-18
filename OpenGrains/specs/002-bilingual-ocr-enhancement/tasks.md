# Tasks: OpenGrains Bilingual Supplier Engagement with OCR Integration

**Input**: Design documents from `/specs/002-bilingual-ocr-enhancement/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: React, react-i18next, shadcn/ui, OpenAI API, Node.js
   → Structure: Extended web application (frontend + backend services)
2. Load design documents ✅
   → data-model.md: 12 core entities extracted
   → contracts/: 11 API endpoints identified
   → quickstart.md: 3 integration scenarios extracted
3. Generate tasks by category ✅
   → Setup: i18n dependencies, OCR services, enhanced project structure
   → Tests: contract tests (11), integration tests (3)
   → Core: models (12), services (6), components (8)
   → Integration: OCR processing, target calculations, Romanian validation
   → Polish: unit tests, performance optimization, documentation
4. Apply task rules ✅
   → Different files = [P] for parallel execution
   → Tests before implementation (TDD approach)
   → Dependencies clearly mapped
5. Tasks numbered T001-T078 ✅
6. Parallel execution examples provided ✅
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- File paths are absolute from repository root

## Path Conventions
**Web app structure**: `frontend/src/`, `backend/src/`, `shared/`
- Frontend: React components, hooks, services, translations
- Backend: API endpoints, OCR processing, target calculations
- Shared: TypeScript types, validation schemas, constants

## Phase 3.1: Enhanced Setup & Dependencies
- [ ] T001 Create enhanced project structure for bilingual OCR features
- [ ] T002 Install i18n dependencies (react-i18next, i18next-browser-languagedetector)
- [ ] T003 [P] Install OCR dependencies (OpenAI SDK, image processing libraries)
- [ ] T004 [P] Install Romanian validation dependencies (iban, moment with Romanian locale)
- [ ] T005 [P] Configure ESLint for i18n and OCR code patterns
- [ ] T006 [P] Setup Prettier with Romanian character support
- [ ] T007 Create backend project structure with OCR and target services
- [ ] T008 [P] Install backend dependencies (Express, PostgreSQL, Redis, OpenAI)
- [ ] T009 [P] Setup database migrations for enhanced entities
- [ ] T010 [P] Configure environment variables for OpenAI API and Romanian settings

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Parallel - Different Files)
- [ ] T011 [P] Contract test POST /api/ocr/process in backend/tests/contracts/test_ocr_process.test.ts
- [ ] T012 [P] Contract test GET /api/ocr/result/{id} in backend/tests/contracts/test_ocr_result.test.ts
- [ ] T013 [P] Contract test GET /api/languages/{locale} in backend/tests/contracts/test_i18n_languages.test.ts
- [ ] T014 [P] Contract test PUT /api/users/{id}/language in backend/tests/contracts/test_i18n_users.test.ts
- [ ] T015 [P] Contract test GET /api/i18n/context in backend/tests/contracts/test_i18n_context.test.ts
- [ ] T016 [P] Contract test GET /api/targets/zones in backend/tests/contracts/test_targets_zones.test.ts
- [ ] T017 [P] Contract test POST /api/targets/update in backend/tests/contracts/test_targets_update.test.ts
- [ ] T018 [P] Contract test GET /api/agents/{id}/dashboard in backend/tests/contracts/test_agents_dashboard.test.ts
- [ ] T019 [P] Contract test POST /api/offers in backend/tests/contracts/test_offers_post.test.ts
- [ ] T020 [P] Contract test POST /api/purchases in backend/tests/contracts/test_purchases_post.test.ts
- [ ] T021 [P] Contract test GET /api/offers/{id} in backend/tests/contracts/test_offers_get.test.ts

### Integration Tests (Parallel - Different Files)
- [ ] T022 [P] Integration test Romanian sales agent workflow in frontend/tests/integration/test_romanian_agent_workflow.test.tsx
- [ ] T023 [P] Integration test supplier self-service in Romanian in frontend/tests/integration/test_romanian_supplier_workflow.test.tsx
- [ ] T024 [P] Integration test target management dashboard in frontend/tests/integration/test_target_dashboard.test.tsx
- [ ] T025 [P] Integration test OCR document processing flow in backend/tests/integration/test_ocr_processing.test.ts
- [ ] T026 [P] Integration test Romanian IBAN validation in backend/tests/integration/test_romanian_validation.test.ts
- [ ] T027 [P] Integration test language switching performance in frontend/tests/integration/test_language_switching.test.tsx

### Component Tests (Parallel - Different Files)
- [ ] T028 [P] Component test LanguageSwitcher in frontend/tests/components/test_language_switcher.test.tsx
- [ ] T029 [P] Component test OCRDocumentUpload in frontend/tests/components/test_ocr_upload.test.tsx
- [ ] T030 [P] Component test TargetDashboard in frontend/tests/components/test_target_dashboard.test.tsx
- [ ] T031 [P] Component test RomanianSupplierForm in frontend/tests/components/test_romanian_form.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Shared Types and Constants (Parallel - Different Files)
- [ ] T032 [P] Romanian document types in shared/types/romanian-documents.ts
- [ ] T033 [P] OCR result types in shared/types/ocr-types.ts
- [ ] T034 [P] Target management types in shared/types/target-types.ts
- [ ] T035 [P] i18n types and locale definitions in shared/types/i18n-types.ts
- [ ] T036 [P] Romanian validation constants in shared/constants/romanian-constants.ts
- [ ] T037 [P] IBAN validation schemas in shared/validation/iban-schemas.ts

### Enhanced Data Models (Parallel - Different Files)
- [ ] T038 [P] Enhanced User model with language preference in backend/src/models/User.ts
- [ ] T039 [P] SalesAgentProfile model with zones in backend/src/models/SalesAgentProfile.ts
- [ ] T040 [P] SupplierProfile model with Romanian compliance in backend/src/models/SupplierProfile.ts
- [ ] T041 [P] Document model with OCR support in backend/src/models/Document.ts
- [ ] T042 [P] OCRResult model in backend/src/models/OCRResult.ts
- [ ] T043 [P] IBANExtraction model in backend/src/models/IBANExtraction.ts
- [ ] T044 [P] RomanianBusinessData model in backend/src/models/RomanianBusinessData.ts
- [ ] T045 [P] Zone model for geographical management in backend/src/models/Zone.ts
- [ ] T046 [P] PurchaseTarget model in backend/src/models/PurchaseTarget.ts
- [ ] T047 [P] SalesOffer enhanced model in backend/src/models/SalesOffer.ts
- [ ] T048 [P] InputPurchaseRequest model in backend/src/models/InputPurchaseRequest.ts
- [ ] T049 [P] DocumentValidation model in backend/src/models/DocumentValidation.ts

### Backend Services (Sequential - Dependencies)
- [ ] T050 OCRService with OpenAI Vision integration in backend/src/services/ocr/OCRService.ts
- [ ] T051 IBANExtractionService in backend/src/services/ocr/IBANExtractionService.ts
- [ ] T052 DocumentProcessingService in backend/src/services/documents/DocumentProcessingService.ts
- [ ] T053 RomanianValidationService in backend/src/services/validation/RomanianValidationService.ts
- [ ] T054 TargetCalculationService in backend/src/services/targets/TargetCalculationService.ts
- [ ] T055 ZoneManagementService in backend/src/services/zones/ZoneManagementService.ts

### API Endpoints (Sequential - Shared Router)
- [ ] T056 OCR processing endpoints in backend/src/api/ocr-routes.ts
- [ ] T057 i18n management endpoints in backend/src/api/i18n-routes.ts
- [ ] T058 Target management endpoints in backend/src/api/targets-routes.ts
- [ ] T059 Enhanced offers endpoints in backend/src/api/offers-routes.ts
- [ ] T060 Agent dashboard endpoints in backend/src/api/agents-routes.ts

### Frontend i18n Setup (Sequential - Shared Config)
- [ ] T061 i18n configuration and setup in frontend/src/i18n/config.ts
- [ ] T062 Romanian translation files in frontend/src/locales/ro/
- [ ] T063 English translation files update in frontend/src/locales/en/
- [ ] T064 i18n utility functions in frontend/src/utils/i18n-utils.ts

### Frontend Components (Parallel - Different Files)
- [ ] T065 [P] LanguageSwitcher component in frontend/src/components/i18n/LanguageSwitcher.tsx
- [ ] T066 [P] OCRDocumentUpload component in frontend/src/components/ocr/OCRDocumentUpload.tsx
- [ ] T067 [P] OCRResultDisplay component in frontend/src/components/ocr/OCRResultDisplay.tsx
- [ ] T068 [P] TargetDashboard component in frontend/src/components/targets/TargetDashboard.tsx
- [ ] T069 [P] ZonePerformanceChart component in frontend/src/components/targets/ZonePerformanceChart.tsx
- [ ] T070 [P] RomanianSupplierForm component in frontend/src/components/forms/RomanianSupplierForm.tsx
- [ ] T071 [P] Enhanced OfferForm component in frontend/src/components/forms/OfferForm.tsx

### Frontend Hooks and Services (Parallel - Different Files)
- [ ] T072 [P] useI18n custom hook in frontend/src/hooks/useI18n.ts
- [ ] T073 [P] useOCR custom hook in frontend/src/hooks/useOCR.ts
- [ ] T074 [P] useTargets custom hook in frontend/src/hooks/useTargets.ts
- [ ] T075 [P] OCR API service in frontend/src/services/ocr-service.ts
- [ ] T076 [P] i18n API service in frontend/src/services/i18n-service.ts
- [ ] T077 [P] Targets API service in frontend/src/services/targets-service.ts

## Phase 3.4: Integration & Validation
- [ ] T078 Connect OCRService to OpenAI API with error handling
- [ ] T079 Romanian IBAN validation with mod-97 algorithm
- [ ] T080 Target calculation automation on supplier approval
- [ ] T081 Language preference persistence across sessions
- [ ] T082 OCR confidence scoring and manual fallback
- [ ] T083 Zone-based performance metric calculations
- [ ] T084 Romanian compliance validation workflows
- [ ] T085 Document image storage and security setup
- [ ] T086 API rate limiting for OCR endpoints
- [ ] T087 Error boundary setup for OCR and i18n failures

## Phase 3.5: Performance & Polish
- [ ] T088 [P] Unit tests for Romanian validation utils in backend/tests/unit/test_romanian_validation.test.ts
- [ ] T089 [P] Unit tests for OCR confidence scoring in backend/tests/unit/test_ocr_confidence.test.ts
- [ ] T090 [P] Unit tests for target calculations in backend/tests/unit/test_target_calculations.test.ts
- [ ] T091 [P] Unit tests for i18n utilities in frontend/tests/unit/test_i18n_utils.test.ts
- [ ] T092 Performance optimization for language switching (<1s requirement)
- [ ] T093 Performance optimization for OCR processing (<3s requirement)
- [ ] T094 OCR accuracy validation (95% IBAN extraction requirement)
- [ ] T095 [P] Update API documentation in docs/api.md
- [ ] T096 [P] Update Romanian localization guide in docs/i18n.md
- [ ] T097 [P] Update OCR integration guide in docs/ocr.md
- [ ] T098 Security audit for document processing and GDPR compliance
- [ ] T099 End-to-end testing with Romanian document samples
- [ ] T100 Production deployment preparation and monitoring setup

## Dependencies
**Critical Dependencies**:
- Setup (T001-T010) before ALL other phases
- Tests (T011-T031) before implementation (T032-T087)
- Shared types (T032-T037) before models and services
- Models (T038-T049) before services (T050-T055)
- Services (T050-T055) before API endpoints (T056-T060)
- i18n setup (T061-T064) before components (T065-T071)

**Specific Blockers**:
- T032-T037 block T038-T049 (models need types)
- T038-T049 block T050-T055 (services need models)
- T050-T055 block T056-T060 (endpoints need services)
- T061-T064 block T065-T071 (components need i18n)
- T056-T060 block T078-T087 (integration needs endpoints)

## Parallel Execution Examples

### Phase 3.2: Contract Tests (All Parallel)
```bash
# Launch T011-T021 together:
Task: "Contract test POST /api/ocr/process in backend/tests/contracts/test_ocr_process.test.ts"
Task: "Contract test GET /api/ocr/result/{id} in backend/tests/contracts/test_ocr_result.test.ts"
Task: "Contract test GET /api/languages/{locale} in backend/tests/contracts/test_i18n_languages.test.ts"
Task: "Contract test PUT /api/users/{id}/language in backend/tests/contracts/test_i18n_users.test.ts"
Task: "Contract test GET /api/i18n/context in backend/tests/contracts/test_i18n_context.test.ts"
```

### Phase 3.3: Models (All Parallel After Types)
```bash
# Launch T038-T049 together (after T032-T037 complete):
Task: "Enhanced User model with language preference in backend/src/models/User.ts"
Task: "SalesAgentProfile model with zones in backend/src/models/SalesAgentProfile.ts"
Task: "SupplierProfile model with Romanian compliance in backend/src/models/SupplierProfile.ts"
Task: "Document model with OCR support in backend/src/models/Document.ts"
Task: "OCRResult model in backend/src/models/OCRResult.ts"
```

### Phase 3.3: Frontend Components (All Parallel After i18n Setup)
```bash
# Launch T065-T071 together (after T061-T064 complete):
Task: "LanguageSwitcher component in frontend/src/components/i18n/LanguageSwitcher.tsx"
Task: "OCRDocumentUpload component in frontend/src/components/ocr/OCRDocumentUpload.tsx"
Task: "TargetDashboard component in frontend/src/components/targets/TargetDashboard.tsx"
Task: "RomanianSupplierForm component in frontend/src/components/forms/RomanianSupplierForm.tsx"
```

## Romanian Localization Focus Areas
- **Translation Files**: Complete Romanian agricultural terminology
- **Form Validation**: Romanian business rules (CUI, IBAN formats)
- **Date/Number Formats**: Romanian locale-specific formatting
- **Cultural Adaptations**: Romanian business document requirements
- **Text Expansion**: Handle 20% longer Romanian text in UI layouts

## OCR Processing Focus Areas
- **Document Types**: ONRC, APIA, Farmer ID, Bank statements, Identity cards
- **Confidence Thresholds**: >0.9 auto-approve, 0.7-0.9 review, <0.7 manual entry
- **Error Handling**: Poor image quality, network issues, API limits
- **Performance**: <3s processing time, caching for efficiency
- **Security**: GDPR compliance, secure document storage

## Target Management Focus Areas
- **Zone Definitions**: Romanian counties and agricultural regions
- **Calculation Rules**: Historical data, seasonal factors, market potential
- **Performance Metrics**: Volume, value, supplier count tracking
- **Reporting**: Bilingual reports with export capabilities
- **Real-time Updates**: Automatic recalculation on supplier approval

## Validation Checklist
*GATE: Checked before task execution*

- [x] All 11 contracts have corresponding tests (T011-T021)
- [x] All 12 entities have model tasks (T038-T049)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Dependencies clearly mapped and sequential
- [x] Romanian compliance requirements addressed
- [x] OCR processing requirements covered
- [x] Performance goals specified and testable

## Implementation Notes
- **TDD Approach**: All tests must fail before implementation begins
- **Romanian Focus**: Every component must support Romanian language
- **OCR Integration**: OpenAI Vision API with fallback mechanisms
- **Performance**: Monitor language switching and OCR processing times
- **Security**: GDPR compliance for document processing throughout
- **Testing**: Use real Romanian document samples for accuracy validation