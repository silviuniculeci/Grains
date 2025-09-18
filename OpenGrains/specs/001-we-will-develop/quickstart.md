# Quickstart: OpenGrains Supplier Engagement Module

## Overview
This guide walks through setting up and testing the OpenGrains Supplier Engagement Module UI. The module handles supplier onboarding through two main pathways: sales agent-assisted registration and self-service supplier registration.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Basic familiarity with React and TypeScript
- Access to OpenGrains API endpoints (staging/local)

## Quick Setup

### 1. Initialize Project
```bash
# Create new React project with TypeScript
npx create-react-app opengrains-frontend --template typescript
cd opengrains-frontend

# Install shadcn/ui
npx shadcn-ui@latest init

# Follow prompts:
# ✓ Would you like to use TypeScript? Yes
# ✓ Which style would you like to use? Default
# ✓ Which color would you like to use as base color? Slate
# ✓ Where is your global CSS file? src/index.css
# ✓ Would you like to use CSS variables for colors? Yes
# ✓ Are you using a custom tailwind prefix? No
# ✓ Where is your tailwind.config.js located? tailwind.config.js
# ✓ Configure the import alias for components? src/components
# ✓ Configure the import alias for utils? src/lib/utils
```

### 2. Install Core Dependencies
```bash
# Form handling and validation
npm install react-hook-form @hookform/resolvers zod

# File upload
npm install react-dropzone

# HTTP client
npm install axios

# Additional shadcn/ui components
npx shadcn-ui@latest add button input form card dialog progress tabs badge
```

### 3. Install Development Dependencies
```bash
# Testing
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# API mocking
npm install --save-dev msw
```

## Core Components Setup

### 1. Type Definitions
Create `src/types/supplier.ts`:
```typescript
export interface SupplierProfile {
  businessName: string
  businessType: 'individual_farmer' | 'family_farm' | 'cooperative' | 'agribusiness'
  primaryContact: ContactInfo
  address: Address
  grainTypes: string[]
  estimatedVolume?: VolumeEstimate
}

export interface ContactInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredContactMethod: 'email' | 'phone' | 'mobile'
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface VolumeEstimate {
  amount: number
  unit: 'tons' | 'bushels' | 'kilograms'
  period: 'yearly' | 'seasonal' | 'monthly'
}
```

### 2. Form Schema
Create `src/schemas/supplier-schema.ts`:
```typescript
import { z } from 'zod'

export const contactInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  preferredContactMethod: z.enum(['email', 'phone', 'mobile'])
})

export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required')
})

export const supplierProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.enum(['individual_farmer', 'family_farm', 'cooperative', 'agribusiness']),
  primaryContact: contactInfoSchema,
  address: addressSchema,
  grainTypes: z.array(z.string()).min(1, 'At least one grain type is required')
})
```

### 3. API Service
Create `src/services/supplier-api.ts`:
```typescript
import axios from 'axios'
import { SupplierProfile } from '../types/supplier'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const supplierApi = {
  create: async (profile: SupplierProfile) => {
    const response = await api.post('/suppliers', { profile })
    return response.data
  },

  update: async (id: string, profile: Partial<SupplierProfile>) => {
    const response = await api.put(`/suppliers/${id}`, { profile })
    return response.data
  },

  submit: async (id: string) => {
    const response = await api.post(`/suppliers/${id}/submit`)
    return response.data
  },

  uploadDocument: async (supplierId: string, file: File, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await api.post(`/suppliers/${supplierId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}
```

## Testing Setup

### 1. Component Test Example
Create `src/components/__tests__/SupplierForm.test.tsx`:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SupplierForm } from '../SupplierForm'

describe('SupplierForm', () => {
  it('should validate required fields', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(<SupplierForm onSubmit={onSubmit} />)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/business name is required/i)).toBeInTheDocument()
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should submit valid form data', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(<SupplierForm onSubmit={onSubmit} />)

    // Fill out form
    await user.type(screen.getByLabelText(/business name/i), 'Test Farm')
    await user.selectOptions(screen.getByLabelText(/business type/i), 'family_farm')

    // ... fill other required fields

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        businessName: 'Test Farm',
        businessType: 'family_farm'
      }))
    })
  })
})
```

### 2. API Mocking Setup
Create `src/mocks/handlers.ts`:
```typescript
import { rest } from 'msw'

export const handlers = [
  rest.post('/api/suppliers', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'supplier-123',
        status: 'draft',
        createdAt: new Date().toISOString()
      })
    )
  }),

  rest.post('/api/suppliers/:id/submit', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: req.params.id,
        status: 'submitted',
        updatedAt: new Date().toISOString()
      })
    )
  })
]
```

## User Acceptance Tests

### Sales Agent Workflow
1. **Setup**: Sales agent logs in with agent credentials
2. **Action**: Navigate to "New Supplier Registration"
3. **Expected**: Form loads with agent-specific UI
4. **Action**: Fill out supplier profile information
5. **Expected**: Form validates in real-time, saves draft automatically
6. **Action**: Upload required documents
7. **Expected**: File upload with progress, validation of file types
8. **Action**: Submit for validation
9. **Expected**: Status changes to "Submitted", notification sent

### Self-Service Workflow
1. **Setup**: Supplier receives registration link via email
2. **Action**: Click registration link
3. **Expected**: Registration form loads with supplier-friendly UI
4. **Action**: Complete profile information step by step
5. **Expected**: Multi-step form with progress indicator
6. **Action**: Upload documents
7. **Expected**: Clear instructions and file requirements
8. **Action**: Submit profile
9. **Expected**: Confirmation message and status tracking

### Back Office Validation Workflow
1. **Setup**: Back office user logs in
2. **Action**: Navigate to "Pending Validations"
3. **Expected**: List of submitted supplier profiles
4. **Action**: Review supplier profile and documents
5. **Expected**: All information and documents visible
6. **Action**: Approve or reject with comments
7. **Expected**: Status updated, notifications sent

## Environment Configuration

### Development Environment
```bash
# .env.development
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_UPLOAD_MAX_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg,.png,.doc,.docx
```

### Production Environment
```bash
# .env.production
REACT_APP_API_URL=https://api.opengrains.com/v1
REACT_APP_UPLOAD_MAX_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg,.png,.doc,.docx
```

## Running the Application

### Development
```bash
npm start
```
Application runs on http://localhost:3000

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

### Building for Production
```bash
npm run build
```

## Common Issues and Solutions

### File Upload Issues
- **Problem**: Large files fail to upload
- **Solution**: Check REACT_APP_UPLOAD_MAX_SIZE setting and server limits

### Form Validation Issues
- **Problem**: Validation errors not showing
- **Solution**: Ensure Zod schemas match form field names exactly

### API Connection Issues
- **Problem**: API calls failing in development
- **Solution**: Verify REACT_APP_API_URL and server is running

## Next Steps
1. Set up deployment pipeline
2. Configure monitoring and error tracking
3. Add internationalization (i18n) support
4. Implement offline capability with service workers
5. Add comprehensive E2E test suite