# Data Model: OpenGrains Supplier Engagement Module

## Core Entities

### Supplier
Represents a farmer or grain supplier entity in the system.

```typescript
interface Supplier {
  id: SupplierId
  profile: SupplierProfile
  status: SupplierStatus
  createdAt: Date
  updatedAt: Date
  createdBy: UserId
  validatedBy?: UserId
  validatedAt?: Date
}

type SupplierId = string & { readonly brand: unique symbol }
type UserId = string & { readonly brand: unique symbol }

enum SupplierStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}
```

**Validation Rules**:
- ID must be unique across system
- Profile must be complete before submission
- Status transitions must follow defined workflow
- CreatedBy must reference valid user

**State Transitions**:
- DRAFT → SUBMITTED (when form is completed)
- SUBMITTED → UNDER_REVIEW (when picked up by back office)
- UNDER_REVIEW → APPROVED | REJECTED (after validation)
- APPROVED → ACTIVE (when system access granted)
- ACTIVE ↔ SUSPENDED (administrative actions)

### SupplierProfile
Contains all supplier information including personal/business details.

```typescript
interface SupplierProfile {
  // Business Information
  businessName: string
  businessType: BusinessType
  registrationNumber?: string
  taxId?: string

  // Contact Information
  primaryContact: ContactInfo
  alternateContact?: ContactInfo
  address: Address

  // Operational Details
  grainTypes: GrainType[]
  estimatedVolume: VolumeEstimate
  harvestSeason: SeasonInfo
  certifications: Certification[]

  // Banking & Payment
  bankingDetails?: BankingInfo
  paymentTerms: PaymentTerms

  // Capabilities
  storageCapacity?: number
  transportCapabilities: TransportCapability[]
  qualityStandards: QualityStandard[]
}

enum BusinessType {
  INDIVIDUAL_FARMER = 'individual_farmer',
  FAMILY_FARM = 'family_farm',
  COOPERATIVE = 'cooperative',
  AGRIBUSINESS = 'agribusiness',
  GRAIN_ELEVATOR = 'grain_elevator'
}

interface ContactInfo {
  firstName: string
  lastName: string
  title?: string
  email: string
  phone: string
  mobilePhone?: string
  preferredContactMethod: ContactMethod
}

interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  coordinates?: GeoCoordinates
}
```

**Validation Rules**:
- Business name required, 2-100 characters
- At least one contact method required
- Email must be valid format
- Phone numbers must match regional format
- At least one grain type must be selected
- Volume estimates must be positive numbers

### Document
Files uploaded during the onboarding process.

```typescript
interface Document {
  id: DocumentId
  supplierId: SupplierId
  type: DocumentType
  filename: string
  originalFilename: string
  mimeType: string
  size: number
  uploadStatus: UploadStatus
  validationStatus: ValidationStatus
  uploadedAt: Date
  uploadedBy: UserId
  validatedAt?: Date
  validatedBy?: UserId
  expiryDate?: Date
  metadata: DocumentMetadata
}

type DocumentId = string & { readonly brand: unique symbol }

enum DocumentType {
  BUSINESS_LICENSE = 'business_license',
  TAX_CERTIFICATE = 'tax_certificate',
  BANK_STATEMENT = 'bank_statement',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  QUALITY_CERTIFICATION = 'quality_certification',
  GRAIN_ANALYSIS = 'grain_analysis',
  IDENTIFICATION = 'identification',
  PROOF_OF_ADDRESS = 'proof_of_address',
  OTHER = 'other'
}

enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

enum ValidationStatus {
  NOT_REVIEWED = 'not_reviewed',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_UPDATE = 'requires_update'
}

interface DocumentMetadata {
  description?: string
  category: string
  isRequired: boolean
  rejectionReason?: string
  reviewNotes?: string
}
```

**Validation Rules**:
- File size must not exceed 10MB
- Only specific MIME types allowed (PDF, JPG, PNG, DOC, DOCX)
- Required documents must be uploaded before submission
- Expiry dates must be future dates for time-sensitive documents

### User Roles

```typescript
interface User {
  id: UserId
  email: string
  role: UserRole
  permissions: Permission[]
  profile: UserProfile
  isActive: boolean
  lastLogin?: Date
}

enum UserRole {
  SALES_AGENT = 'sales_agent',
  COMMERCIAL_BACK_OFFICE = 'commercial_back_office',
  SUPPLIER = 'supplier',
  ADMIN = 'admin'
}

interface Permission {
  resource: string
  actions: string[]
  conditions?: Record<string, any>
}

interface UserProfile {
  firstName: string
  lastName: string
  department?: string
  territory?: string // For sales agents
  phone?: string
}
```

**Role Permissions**:
- **SALES_AGENT**: Create/edit supplier profiles, upload documents, view own submissions
- **COMMERCIAL_BACK_OFFICE**: View all submissions, approve/reject profiles, manage validations
- **SUPPLIER**: View own profile, edit profile (when in draft), upload additional documents
- **ADMIN**: Full system access, user management, system configuration

### Form State Management

```typescript
interface FormState {
  currentStep: number
  completedSteps: number[]
  validationErrors: Record<string, string[]>
  isDirty: boolean
  lastSaved?: Date
  autoSaveEnabled: boolean
}

interface OnboardingSession {
  id: SessionId
  supplierId?: SupplierId
  userRole: UserRole
  formState: FormState
  draftData: Partial<SupplierProfile>
  startedAt: Date
  lastActivity: Date
  expiresAt: Date
}

type SessionId = string & { readonly brand: unique symbol }
```

## Entity Relationships

```
User (Sales Agent) --creates--> Supplier
User (Back Office) --validates--> Supplier
Supplier --has--> SupplierProfile
Supplier --has-many--> Document
OnboardingSession --references--> Supplier
Document --belongs-to--> Supplier
```

## Data Flow Patterns

### Sales Agent Flow
1. Sales Agent creates new Supplier record (DRAFT status)
2. Agent fills SupplierProfile in multiple steps
3. Agent uploads required Documents
4. Agent submits for validation (SUBMITTED status)
5. Back Office reviews and validates (APPROVED/REJECTED)

### Self-Service Flow
1. Supplier accesses registration link
2. New Supplier record created (DRAFT status)
3. Supplier fills own SupplierProfile
4. Supplier uploads Documents
5. Supplier submits for validation
6. Back Office reviews and validates

### Validation Workflow
1. Profile completeness check
2. Document verification
3. Business validation rules
4. Final approval/rejection
5. System access provisioning (if approved)

## Storage Considerations

### Local Storage (Browser)
- Draft form data for auto-save functionality
- Session management
- User preferences
- Maximum 5MB storage limit

### API Persistence
- Complete supplier profiles
- Document metadata and file references
- User management and permissions
- Audit trails and status history

### File Storage
- Document files stored separately from metadata
- Cloud storage with CDN for performance
- Secure access controls and encryption
- Backup and retention policies