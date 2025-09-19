/**
 * Internationalization Types for OpenGrains
 * Defines types for bilingual support (English/Romanian)
 */

/**
 * Supported languages in the application
 */
export type SupportedLanguage = 'en' | 'ro'

/**
 * Language direction for text rendering
 */
export type TextDirection = 'ltr' | 'rtl'

/**
 * Translation namespace keys
 */
export type TranslationNamespace =
  | 'common'
  | 'forms'
  | 'ocr'
  | 'targets'
  | 'validation'
  | 'navigation'
  | 'errors'
  | 'success'

/**
 * Language preference configuration
 */
export interface LanguagePreference {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string                    // Unicode flag emoji or flag code
  isDefault: boolean
  isRTL: boolean
  dateFormat: string
  numberFormat: string
  currencyFormat: string
  locale: string                  // Browser locale (e.g., 'ro-RO', 'en-US')
}

/**
 * Supported language configurations
 */
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguagePreference> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isDefault: true,
    isRTL: false,
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,234.56',
    currencyFormat: 'RON 1,234.56',
    locale: 'en-US',
  },
  ro: {
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    flag: '🇷🇴',
    isDefault: false,
    isRTL: false,
    dateFormat: 'DD.MM.YYYY',
    numberFormat: '1.234,56',
    currencyFormat: '1.234,56 RON',
    locale: 'ro-RO',
  },
}

/**
 * Translation key structure for type safety
 */
export interface TranslationKeys {
  common: {
    appName: string
    navigation: {
      dashboard: string
      suppliers: string
      targets: string
      offers: string
      documents: string
      profile: string
      settings: string
      logout: string
    }
    buttons: {
      save: string
      cancel: string
      submit: string
      edit: string
      delete: string
      upload: string
      download: string
      approve: string
      reject: string
      retry: string
      continue: string
      back: string
      next: string
      close: string
      confirm: string
      search: string
      filter: string
      reset: string
      export: string
    }
    status: {
      pending: string
      inProgress: string
      completed: string
      approved: string
      rejected: string
      failed: string
      success: string
      error: string
      warning: string
      info: string
    }
    language: {
      current: string
      switch: string
      switchSuccess: string
    }
  }
  forms: {
    supplier: {
      title: string
      subtitle: string
      steps: {
        contact: string
        business: string
        address: string
        grains: string
        documents: string
        review: string
      }
      fields: Record<string, string>
      placeholders: Record<string, string>
    }
    validation: Record<string, string>
    grains: Record<string, string>
    counties: Record<string, string>
  }
  ocr: {
    title: string
    subtitle: string
    upload: Record<string, string>
    types: Record<string, string>
    status: Record<string, string>
    confidence: Record<string, string>
    extraction: Record<string, string>
    validation: Record<string, string>
    actions: Record<string, string>
    progress: Record<string, string>
    errors: Record<string, string>
  }
  targets: {
    dashboard: Record<string, string>
    metrics: Record<string, string>
    status: Record<string, string>
    zones: Record<string, string>
    time: Record<string, string>
    charts: Record<string, string>
    actions: Record<string, string>
    forms: Record<string, string>
    calculations: Record<string, string>
    notifications: Record<string, string>
  }
  validation: {
    messages: Record<string, string>
    romanian: {
      cui: Record<string, string>
      iban: Record<string, string>
      onrc: Record<string, string>
      phone: Record<string, string>
      postalCode: Record<string, string>
      idCard: Record<string, string>
    }
    business: Record<string, string>
    documents: Record<string, string>
    grains: Record<string, string>
    targets: Record<string, string>
  }
}

/**
 * Language context for components
 */
export interface LanguageContext {
  currentLanguage: SupportedLanguage
  availableLanguages: SupportedLanguage[]
  isLoading: boolean
  error?: string

  // Language switching
  changeLanguage: (language: SupportedLanguage) => Promise<void>
  toggleLanguage: () => Promise<void>

  // Formatting utilities
  formatCurrency: (amount: number) => string
  formatDate: (date: Date | string) => string
  formatNumber: (num: number) => string
  formatPercentage: (num: number) => string

  // Text utilities
  getTextDirection: () => TextDirection
  isRTL: () => boolean
  getLanguageClass: () => string

  // Romanian-specific utilities
  formatRomanianPhone: (phone: string) => string
  formatRomanianIBAN: (iban: string) => string
  getCountyName: (countyCode: string) => string
  getGrainTypeName: (grainType: string) => string
}

/**
 * Translation interpolation values
 */
export interface TranslationValues {
  [key: string]: string | number | Date | boolean
}

/**
 * Language detection options
 */
export interface LanguageDetectionOptions {
  order: string[]                 // Detection order: localStorage, navigator, etc.
  lookupLocalStorage: string      // localStorage key
  caches: string[]               // Where to cache the detected language
  checkWhitelist: boolean        // Only detect whitelisted languages
  fallback: SupportedLanguage    // Fallback language
}

/**
 * Translation loading state
 */
export interface TranslationLoadingState {
  language: SupportedLanguage
  namespace: TranslationNamespace
  isLoading: boolean
  isLoaded: boolean
  error?: string
  lastLoaded?: Date
}

/**
 * Language switching animation options
 */
export interface LanguageSwitchOptions {
  animated: boolean
  duration: number               // Animation duration in ms
  easing: string                // CSS easing function
  direction: 'fade' | 'slide' | 'scale'
  preserveState: boolean        // Preserve form state during switch
}

/**
 * Text expansion configuration for Romanian
 */
export interface TextExpansionConfig {
  language: SupportedLanguage
  expansionFactor: number       // Multiplier for text length
  lineHeightAdjustment: number  // Line height adjustment
  letterSpacingAdjustment: number // Letter spacing adjustment
  fontSizeAdjustment: number    // Font size adjustment
}

/**
 * Romanian text expansion factors
 */
export const TEXT_EXPANSION_CONFIG: Record<SupportedLanguage, TextExpansionConfig> = {
  en: {
    language: 'en',
    expansionFactor: 1.0,
    lineHeightAdjustment: 1.0,
    letterSpacingAdjustment: 1.0,
    fontSizeAdjustment: 1.0,
  },
  ro: {
    language: 'ro',
    expansionFactor: 1.2,         // Romanian text is ~20% longer
    lineHeightAdjustment: 1.05,   // Slightly more line height
    letterSpacingAdjustment: 1.0,
    fontSizeAdjustment: 0.95,     // Slightly smaller font for longer text
  },
}

/**
 * Cultural formatting preferences
 */
export interface CulturalFormatting {
  language: SupportedLanguage

  // Number formatting
  decimalSeparator: string
  thousandsSeparator: string

  // Date formatting
  dateFormat: string
  timeFormat: string
  firstDayOfWeek: number        // 0 = Sunday, 1 = Monday

  // Currency formatting
  currencySymbol: string
  currencyPosition: 'before' | 'after'

  // Address formatting
  addressFormat: string[]       // Order of address components

  // Phone formatting
  phoneFormat: string

  // Name formatting
  nameOrder: 'first-last' | 'last-first'

  // Business formatting
  businessIdentifierFormat: string // CUI format
  bankAccountFormat: string     // IBAN format
}

/**
 * Romanian cultural formatting
 */
export const CULTURAL_FORMATTING: Record<SupportedLanguage, CulturalFormatting> = {
  en: {
    language: 'en',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm A',
    firstDayOfWeek: 0,
    currencySymbol: 'RON',
    currencyPosition: 'before',
    addressFormat: ['street', 'city', 'state', 'postal', 'country'],
    phoneFormat: '+40 XXX XXX XXX',
    nameOrder: 'first-last',
    businessIdentifierFormat: 'RO########',
    bankAccountFormat: 'RO## #### #### #### #### ####',
  },
  ro: {
    language: 'ro',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    firstDayOfWeek: 1,
    currencySymbol: 'RON',
    currencyPosition: 'after',
    addressFormat: ['street', 'city', 'county', 'postal', 'country'],
    phoneFormat: '+40 XXX XXX XXX',
    nameOrder: 'first-last',
    businessIdentifierFormat: 'RO########',
    bankAccountFormat: 'RO## #### #### #### #### ####',
  },
}

/**
 * Validation message parameters for different languages
 */
export interface ValidationMessageParams {
  field?: string
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  allowedTypes?: string[]
  maxSize?: number
  count?: number
}

/**
 * Language-aware form field configuration
 */
export interface I18nFieldConfig {
  name: string
  labelKey: string              // Translation key for label
  placeholderKey: string        // Translation key for placeholder
  helpTextKey?: string          // Translation key for help text
  errorMessagesKeys: string[]   // Translation keys for error messages

  // Language-specific validation
  validation: Record<SupportedLanguage, {
    pattern?: RegExp
    minLength?: number
    maxLength?: number
    customValidator?: (value: string) => boolean
  }>

  // Text expansion considerations
  fieldWidth: Record<SupportedLanguage, number> // CSS width adjustments
  maxDisplayLength: Record<SupportedLanguage, number> // Display truncation
}