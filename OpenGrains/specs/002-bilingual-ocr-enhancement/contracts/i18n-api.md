# Internationalization (i18n) API Contracts

## GET /api/languages/{locale}

**Purpose**: Retrieve translation resources for specified locale

### Request Parameters
- `locale`: 'en' | 'ro' - Target language code

### Response - Success (200 OK)
```typescript
interface TranslationResources {
  locale: 'en' | 'ro'
  version: string  // Translation version for cache busting
  namespaces: {
    common: Record<string, string>      // Common UI elements
    forms: Record<string, string>       // Form labels and validation
    navigation: Record<string, string>  // Menu and navigation items
    validation: Record<string, string>  // Validation error messages
    documents: Record<string, string>   // Document type names and instructions
    targets: Record<string, string>     // Target management terminology
    reports: Record<string, string>     // Report labels and descriptions
  }
  plurals?: Record<string, Record<string, string>>  // Plural forms for Romanian
  lastUpdated: Date
}
```

### Response - Not Found (404)
```typescript
interface LocaleNotFound {
  error: 'locale_not_supported'
  message: string
  supportedLocales: string[]
}
```

### Test Cases
```typescript
describe('GET /api/languages/{locale}', () => {
  it('should return English translations', async () => {
    const response = await api.get('/api/languages/en')

    expect(response.status).toBe(200)
    expect(response.data.locale).toBe('en')
    expect(response.data.namespaces.common).toHaveProperty('save', 'Save')
    expect(response.data.namespaces.forms).toHaveProperty('businessName', 'Business Name')
  })

  it('should return Romanian translations with diacritics', async () => {
    const response = await api.get('/api/languages/ro')

    expect(response.status).toBe(200)
    expect(response.data.locale).toBe('ro')
    expect(response.data.namespaces.common).toHaveProperty('save', 'Salvează')
    expect(response.data.namespaces.documents).toHaveProperty('onrc_certificate', 'Certificat ONRC')
  })

  it('should return 404 for unsupported locale', async () => {
    const response = await api.get('/api/languages/fr')

    expect(response.status).toBe(404)
    expect(response.data.error).toBe('locale_not_supported')
    expect(response.data.supportedLocales).toEqual(['en', 'ro'])
  })
})
```

## PUT /api/users/{userId}/language

**Purpose**: Update user's language preference

### Request
```typescript
interface UpdateLanguageRequest {
  languagePreference: 'en' | 'ro'
  updateProfile?: boolean  // Whether to persist in user profile (default: true)
}
```

### Response - Success (200 OK)
```typescript
interface UpdateLanguageResponse {
  userId: string
  languagePreference: 'en' | 'ro'
  updatedAt: Date
  sessionUpdated: boolean
  profileUpdated: boolean
}
```

### Response - Error (400 Bad Request)
```typescript
interface UpdateLanguageError {
  error: 'invalid_language' | 'user_not_found'
  message: string
}
```

### Test Cases
```typescript
describe('PUT /api/users/{userId}/language', () => {
  it('should update user language preference to Romanian', async () => {
    const request: UpdateLanguageRequest = {
      languagePreference: 'ro',
      updateProfile: true
    }

    const response = await api.put('/api/users/user_123/language', request)

    expect(response.status).toBe(200)
    expect(response.data.languagePreference).toBe('ro')
    expect(response.data.profileUpdated).toBe(true)
  })

  it('should reject invalid language codes', async () => {
    const request = {
      languagePreference: 'invalid' as any
    }

    const response = await api.put('/api/users/user_123/language', request)

    expect(response.status).toBe(400)
    expect(response.data.error).toBe('invalid_language')
  })
})
```

## GET /api/i18n/context

**Purpose**: Get current user's internationalization context and preferences

### Response - Success (200 OK)
```typescript
interface I18nContext {
  userLanguage: 'en' | 'ro'
  systemDefaultLanguage: 'en' | 'ro'
  availableLanguages: Array<{
    code: 'en' | 'ro'
    name: string
    nativeName: string
    flag?: string
  }>

  // Romanian-specific context
  dateFormat: string        // Romanian: "dd.MM.yyyy"
  timeFormat: string        // Romanian: "HH:mm"
  numberFormat: {
    decimal: string         // Romanian: ","
    thousands: string       // Romanian: "."
  }
  currencyFormat: {
    symbol: string          // "RON" or "EUR"
    position: 'before' | 'after'
  }

  // Text direction and layout
  direction: 'ltr'          // Both EN and RO are left-to-right
  textExpansion: number     // Romanian text ~20% longer than English
}
```

### Test Cases
```typescript
describe('GET /api/i18n/context', () => {
  it('should return Romanian context for Romanian user', async () => {
    const response = await api.get('/api/i18n/context', {
      headers: { 'Accept-Language': 'ro' }
    })

    expect(response.status).toBe(200)
    expect(response.data.userLanguage).toBe('ro')
    expect(response.data.dateFormat).toBe('dd.MM.yyyy')
    expect(response.data.numberFormat.decimal).toBe(',')
    expect(response.data.textExpansion).toBeGreaterThan(1.1)
  })

  it('should include available languages with native names', async () => {
    const response = await api.get('/api/i18n/context')

    expect(response.status).toBe(200)
    expect(response.data.availableLanguages).toContainEqual({
      code: 'en',
      name: 'English',
      nativeName: 'English'
    })
    expect(response.data.availableLanguages).toContainEqual({
      code: 'ro',
      name: 'Romanian',
      nativeName: 'Română'
    })
  })
})
```