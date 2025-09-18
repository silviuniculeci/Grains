# Claude Code Configuration: OpenGrains

## Project Overview
OpenGrains is a grain trading application focused on supplier engagement and procurement processes. The current phase focuses on developing the UI for the Supplier Engagement module using React and shadcn/ui components.

## Technology Stack
- **Frontend**: React 18+ with TypeScript
- **UI Components**: shadcn/ui (based on Radix UI + Tailwind CSS)
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: react-dropzone with progress tracking
- **HTTP Client**: axios for API communication
- **Testing**: Vitest/Jest with React Testing Library
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── forms/       # supplier profile forms
│   │   ├── upload/      # document upload components
│   │   └── layout/      # page layouts and navigation
│   ├── pages/
│   │   ├── agent/       # sales agent interface
│   │   ├── supplier/    # self-service supplier interface
│   │   └── backoffice/  # commercial back office interface
│   ├── services/        # API integration
│   ├── hooks/           # custom React hooks
│   ├── types/           # TypeScript definitions
│   ├── schemas/         # Zod validation schemas
│   └── utils/           # helper functions
└── tests/
```

## Key Entities and Types

### Supplier Profile
```typescript
interface SupplierProfile {
  businessName: string
  businessType: 'individual_farmer' | 'family_farm' | 'cooperative' | 'agribusiness'
  primaryContact: ContactInfo
  address: Address
  grainTypes: string[]
  estimatedVolume?: VolumeEstimate
}
```

### Document Management
```typescript
interface Document {
  id: string
  supplierId: string
  type: DocumentType
  filename: string
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed'
  validationStatus: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
}
```

## Form Patterns
- Use React Hook Form with `useForm` hook
- Zod schemas for validation (`zodResolver`)
- Multi-step forms with progress indicators
- Auto-save functionality with localStorage
- Real-time validation with `mode: 'onChange'`

## Component Patterns
- Prefer shadcn/ui components over custom implementations
- Use compound components for complex UI patterns
- Implement error boundaries for robust error handling
- Custom hooks for reusable logic (e.g., `useSupplierForm`, `useDocumentUpload`)

## API Integration
- Base URL: `/api` with environment-specific configuration
- RESTful endpoints following OpenAPI specification
- Error handling with consistent error response format
- File uploads using FormData with progress tracking

## User Flows
1. **Sales Agent Flow**: Agent creates supplier profile on behalf of farmer
2. **Self-Service Flow**: Supplier completes own registration via provided link
3. **Validation Flow**: Back office reviews and approves/rejects submissions

## Current Feature Focus
Building UI components for the Supplier Engagement module with:
- Multi-step supplier registration forms
- Document upload with drag-and-drop interface
- Profile validation and status tracking
- Responsive design for mobile and desktop

## Development Guidelines
- Follow TypeScript strict mode
- Use semantic HTML and ARIA attributes for accessibility
- Implement responsive design mobile-first
- Write component tests for critical user interactions
- Use environment variables for configuration
- Follow React best practices (hooks, composition, etc.)

## Testing Strategy
- Unit tests for components and utilities
- Integration tests for user flows
- API mocking with MSW for consistent testing
- Accessibility testing with axe-core
- Visual regression testing for UI components

## Recent Changes
- Set up project structure for React frontend with shadcn/ui
- Defined TypeScript interfaces for supplier entities
- Created Zod validation schemas for forms
- Designed API contracts for supplier management
- Implemented file upload patterns with progress tracking