# Tasks: OpenGrains Supplier Engagement Module

**Input**: Design documents from `/specs/001-we-will-develop/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Implementation plan loaded: React + TypeScript frontend
   → Extract: React 18+, shadcn/ui, React Hook Form, Zod validation
2. Load optional design documents:
   → data-model.md: 5 entities extracted → model tasks
   → contracts/: suppliers-api.yaml → 7 endpoint tests
   → research.md: Technology decisions → setup tasks
3. Generate tasks by category:
   → Setup: React project, shadcn/ui, dependencies
   → Tests: API contract tests, component tests, integration tests
   → Core: TypeScript types, React components, forms, services
   → Integration: API client, file upload, form validation
   → Polish: accessibility tests, responsive design, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness: ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
**Web app structure** (from plan.md):
- `frontend/src/` - React application source
- `frontend/tests/` - Component and integration tests
- Paths assume frontend focus with API integration points

## Phase 3.1: Setup

- [ ] **T001** Create frontend project structure per implementation plan in `frontend/`
- [ ] **T002** Initialize React project with TypeScript and configure shadcn/ui in `frontend/`
- [ ] **T003** [P] Install core dependencies (React Hook Form, Zod, react-dropzone, axios) in `frontend/package.json`
- [ ] **T004** [P] Configure ESLint and Prettier for React/TypeScript in `frontend/.eslintrc.js` and `frontend/.prettierrc`
- [ ] **T005** [P] Setup Tailwind CSS configuration with shadcn/ui in `frontend/tailwind.config.js`
- [ ] **T006** [P] Install shadcn/ui components (Button, Input, Form, Card, Dialog, Progress, Tabs, Badge) in `frontend/src/components/ui/`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Contract Tests
- [ ] **T007** [P] Contract test POST /api/suppliers in `frontend/tests/contract/suppliers-create.test.ts`
- [ ] **T008** [P] Contract test PUT /api/suppliers/{id} in `frontend/tests/contract/suppliers-update.test.ts`
- [ ] **T009** [P] Contract test POST /api/suppliers/{id}/submit in `frontend/tests/contract/suppliers-submit.test.ts`
- [ ] **T010** [P] Contract test POST /api/suppliers/{id}/validate in `frontend/tests/contract/suppliers-validate.test.ts`
- [ ] **T011** [P] Contract test POST /api/suppliers/{id}/documents in `frontend/tests/contract/documents-upload.test.ts`
- [ ] **T012** [P] Contract test GET /api/suppliers in `frontend/tests/contract/suppliers-list.test.ts`
- [ ] **T013** [P] Contract test GET /api/suppliers/{id} in `frontend/tests/contract/suppliers-get.test.ts`

### Component Tests
- [ ] **T014** [P] Component test SupplierForm validation in `frontend/tests/components/SupplierForm.test.tsx`
- [ ] **T015** [P] Component test DocumentUpload functionality in `frontend/tests/components/DocumentUpload.test.tsx`
- [ ] **T016** [P] Component test ContactInfoForm validation in `frontend/tests/components/ContactInfoForm.test.tsx`
- [ ] **T017** [P] Component test AddressForm validation in `frontend/tests/components/AddressForm.test.tsx`
- [ ] **T018** [P] Component test SupplierStatusBadge display in `frontend/tests/components/SupplierStatusBadge.test.tsx`

### Integration Tests
- [ ] **T019** [P] Integration test sales agent onboarding workflow in `frontend/tests/integration/agent-workflow.test.tsx`
- [ ] **T020** [P] Integration test self-service supplier registration in `frontend/tests/integration/supplier-workflow.test.tsx`
- [ ] **T021** [P] Integration test back office validation workflow in `frontend/tests/integration/backoffice-workflow.test.tsx`
- [ ] **T022** [P] Integration test document upload with validation in `frontend/tests/integration/document-flow.test.tsx`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### TypeScript Types and Schemas
- [ ] **T023** [P] Supplier entity types in `frontend/src/types/supplier.ts`
- [ ] **T024** [P] Document entity types in `frontend/src/types/document.ts`
- [ ] **T025** [P] User role types in `frontend/src/types/user.ts`
- [ ] **T026** [P] API response types in `frontend/src/types/api.ts`
- [ ] **T027** [P] Zod validation schemas in `frontend/src/schemas/supplier-schema.ts`
- [ ] **T028** [P] Zod document validation schemas in `frontend/src/schemas/document-schema.ts`

### API Services
- [ ] **T029** [P] Supplier API service in `frontend/src/services/supplier-api.ts`
- [ ] **T030** [P] Document API service in `frontend/src/services/document-api.ts`
- [ ] **T031** [P] API client configuration with axios in `frontend/src/services/api-client.ts`

### Core Components
- [ ] **T032** [P] ContactInfoForm component in `frontend/src/components/forms/ContactInfoForm.tsx`
- [ ] **T033** [P] AddressForm component in `frontend/src/components/forms/AddressForm.tsx`
- [ ] **T034** [P] BusinessInfoForm component in `frontend/src/components/forms/BusinessInfoForm.tsx`
- [ ] **T035** [P] GrainTypesForm component in `frontend/src/components/forms/GrainTypesForm.tsx`
- [ ] **T036** [P] DocumentUpload component in `frontend/src/components/upload/DocumentUpload.tsx`
- [ ] **T037** [P] SupplierStatusBadge component in `frontend/src/components/ui/SupplierStatusBadge.tsx`
- [ ] **T038** [P] FormProgress component in `frontend/src/components/ui/FormProgress.tsx`

### Multi-Step Form Integration
- [ ] **T039** SupplierForm container component integrating all form steps in `frontend/src/components/forms/SupplierForm.tsx`
- [ ] **T040** Form state management with React Hook Form in `frontend/src/hooks/useSupplierForm.ts`
- [ ] **T041** Draft persistence hook with localStorage in `frontend/src/hooks/useDraftPersistence.ts`

### Page Components
- [ ] **T042** [P] Sales agent dashboard page in `frontend/src/pages/agent/AgentDashboard.tsx`
- [ ] **T043** [P] Supplier registration page in `frontend/src/pages/supplier/SupplierRegistration.tsx`
- [ ] **T044** [P] Back office validation page in `frontend/src/pages/backoffice/ValidationDashboard.tsx`
- [ ] **T045** [P] Supplier profile view page in `frontend/src/pages/supplier/SupplierProfile.tsx`

## Phase 3.4: Integration

- [ ] **T046** Connect forms to API services for data persistence
- [ ] **T047** Implement file upload with progress tracking and error handling
- [ ] **T048** Add form validation error handling and user feedback
- [ ] **T049** Implement routing and navigation between pages
- [ ] **T050** Add authentication context and protected routes
- [ ] **T051** Implement real-time form validation with Zod schemas

## Phase 3.5: Polish

- [ ] **T052** [P] Accessibility tests with axe-core in `frontend/tests/accessibility/forms.test.tsx`
- [ ] **T053** [P] Responsive design tests for mobile compatibility in `frontend/tests/responsive/mobile.test.tsx`
- [ ] **T054** [P] Performance tests for form rendering (<2s load time) in `frontend/tests/performance/form-load.test.ts`
- [ ] **T055** [P] Unit tests for utility functions in `frontend/tests/unit/utils.test.ts`
- [ ] **T056** [P] Update project documentation in `frontend/README.md`
- [ ] **T057** [P] Create Storybook stories for components in `frontend/src/stories/`
- [ ] **T058** Error boundary implementation for robust error handling
- [ ] **T059** Loading states and skeleton components for better UX
- [ ] **T060** Run complete quickstart validation test suite

## Dependencies

**Setup Dependencies**:
- T001-T006 must complete before any other tasks

**TDD Dependencies**:
- All tests (T007-T022) MUST complete and FAIL before implementation (T023+)

**Type Dependencies**:
- T023-T028 (types/schemas) before T029-T031 (API services)
- T029-T031 (API services) before T032-T045 (components/pages)

**Component Dependencies**:
- T032-T037 (individual form components) before T039 (SupplierForm container)
- T039-T041 (form integration) before T042-T045 (pages)

**Integration Dependencies**:
- T042-T045 (pages) before T046-T051 (integration)
- T046-T051 (integration) before T052-T060 (polish)

## Parallel Execution Examples

### Setup Phase (T003-T006)
```bash
# Launch dependency installation tasks together:
Task: "Install core dependencies (React Hook Form, Zod, react-dropzone, axios) in frontend/package.json"
Task: "Configure ESLint and Prettier for React/TypeScript in frontend/.eslintrc.js and frontend/.prettierrc"
Task: "Setup Tailwind CSS configuration with shadcn/ui in frontend/tailwind.config.js"
Task: "Install shadcn/ui components in frontend/src/components/ui/"
```

### Contract Tests Phase (T007-T013)
```bash
# Launch API contract tests together:
Task: "Contract test POST /api/suppliers in frontend/tests/contract/suppliers-create.test.ts"
Task: "Contract test PUT /api/suppliers/{id} in frontend/tests/contract/suppliers-update.test.ts"
Task: "Contract test POST /api/suppliers/{id}/submit in frontend/tests/contract/suppliers-submit.test.ts"
Task: "Contract test POST /api/suppliers/{id}/validate in frontend/tests/contract/suppliers-validate.test.ts"
Task: "Contract test POST /api/suppliers/{id}/documents in frontend/tests/contract/documents-upload.test.ts"
Task: "Contract test GET /api/suppliers in frontend/tests/contract/suppliers-list.test.ts"
Task: "Contract test GET /api/suppliers/{id} in frontend/tests/contract/suppliers-get.test.ts"
```

### Component Tests Phase (T014-T018)
```bash
# Launch component tests together:
Task: "Component test SupplierForm validation in frontend/tests/components/SupplierForm.test.tsx"
Task: "Component test DocumentUpload functionality in frontend/tests/components/DocumentUpload.test.tsx"
Task: "Component test ContactInfoForm validation in frontend/tests/components/ContactInfoForm.test.tsx"
Task: "Component test AddressForm validation in frontend/tests/components/AddressForm.test.tsx"
Task: "Component test SupplierStatusBadge display in frontend/tests/components/SupplierStatusBadge.test.tsx"
```

### Types and Schemas Phase (T023-T028)
```bash
# Launch type definition tasks together:
Task: "Supplier entity types in frontend/src/types/supplier.ts"
Task: "Document entity types in frontend/src/types/document.ts"
Task: "User role types in frontend/src/types/user.ts"
Task: "API response types in frontend/src/types/api.ts"
Task: "Zod validation schemas in frontend/src/schemas/supplier-schema.ts"
Task: "Zod document validation schemas in frontend/src/schemas/document-schema.ts"
```

### Core Components Phase (T032-T038)
```bash
# Launch individual form components together:
Task: "ContactInfoForm component in frontend/src/components/forms/ContactInfoForm.tsx"
Task: "AddressForm component in frontend/src/components/forms/AddressForm.tsx"
Task: "BusinessInfoForm component in frontend/src/components/forms/BusinessInfoForm.tsx"
Task: "GrainTypesForm component in frontend/src/components/forms/GrainTypesForm.tsx"
Task: "DocumentUpload component in frontend/src/components/upload/DocumentUpload.tsx"
Task: "SupplierStatusBadge component in frontend/src/components/ui/SupplierStatusBadge.tsx"
Task: "FormProgress component in frontend/src/components/ui/FormProgress.tsx"
```

### Pages Phase (T042-T045)
```bash
# Launch page components together:
Task: "Sales agent dashboard page in frontend/src/pages/agent/AgentDashboard.tsx"
Task: "Supplier registration page in frontend/src/pages/supplier/SupplierRegistration.tsx"
Task: "Back office validation page in frontend/src/pages/backoffice/ValidationDashboard.tsx"
Task: "Supplier profile view page in frontend/src/pages/supplier/SupplierProfile.tsx"
```

## Notes
- [P] tasks can run in parallel (different files, no dependencies)
- Verify all tests fail before implementing corresponding features
- Commit after each completed task
- Follow TDD strictly: Red → Green → Refactor
- Use shadcn/ui components consistently for UI consistency
- Implement responsive design patterns throughout
- Focus on accessibility from the start

## Validation Checklist
*GATE: Checked before task execution*

- [x] All contracts have corresponding tests (T007-T013)
- [x] All entities have model tasks (T023-T028)
- [x] All tests come before implementation (T007-T022 before T023+)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] User stories have integration tests (T019-T022)
- [x] Core components separated from integration (T032-T051)