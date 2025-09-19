import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation resources
import enCommon from '@/locales/en/common.json'
import enForms from '@/locales/en/forms.json'
import enOcr from '@/locales/en/ocr.json'
import enTargets from '@/locales/en/targets.json'
import enValidation from '@/locales/en/validation.json'

import roCommon from '@/locales/ro/common.json'
import roForms from '@/locales/ro/forms.json'
import roOcr from '@/locales/ro/ocr.json'
import roTargets from '@/locales/ro/targets.json'
import roValidation from '@/locales/ro/validation.json'

export const defaultNamespace = 'common'
export const fallbackLanguage = 'en'
export const supportedLanguages = ['en', 'ro'] as const

export type SupportedLanguage = typeof supportedLanguages[number]

// Resource configuration
const resources = {
  en: {
    common: enCommon,
    forms: enForms,
    ocr: enOcr,
    targets: enTargets,
    validation: enValidation,
  },
  ro: {
    common: roCommon,
    forms: roForms,
    ocr: roOcr,
    targets: roTargets,
    validation: roValidation,
  },
}

// Language detection configuration
const detectionOptions = {
  // Order and from where user language should be detected
  order: ['localStorage', 'navigator', 'htmlTag'],

  // Keys or params to lookup language from
  lookupLocalStorage: 'opengrains-language',
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,

  // Cache user language on
  caches: ['localStorage'],

  // Only detect languages that are in the whitelist
  checkWhitelist: true,
}

// i18n configuration
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: defaultNamespace,
    fallbackLng: fallbackLanguage,
    lng: fallbackLanguage, // Default language

    // Language whitelist
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: true,

    // Detection options
    detection: detectionOptions,

    // Debug in development
    debug: process.env.NODE_ENV === 'development',

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
      formatSeparator: ',',
      format: (value, format, lng) => {
        if (format === 'uppercase') return value.toUpperCase()
        if (format === 'lowercase') return value.toLowerCase()
        if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1)
        return value
      },
    },

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Missing key handling
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${ns}:${key} for language: ${lng}`)
      }
    },

    // Parse missing key
    parseMissingKeyHandler: (key) => key,

    // Namespace loading
    load: 'languageOnly',
    preload: supportedLanguages,

    // React options
    react: {
      bindI18n: 'languageChanged',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
      useSuspense: false,
    },
  })

export default i18n

// Helper functions
export const changeLanguage = (language: SupportedLanguage) => {
  return i18n.changeLanguage(language)
}

export const getCurrentLanguage = (): SupportedLanguage => {
  return i18n.language as SupportedLanguage
}

export const isRomanianLanguage = (): boolean => {
  return getCurrentLanguage() === 'ro'
}

export const formatCurrency = (amount: number, currency = 'RON'): string => {
  const locale = getCurrentLanguage() === 'ro' ? 'ro-RO' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (date: Date | string): string => {
  const locale = getCurrentLanguage() === 'ro' ? 'ro-RO' : 'en-US'
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export const formatNumber = (num: number): string => {
  const locale = getCurrentLanguage() === 'ro' ? 'ro-RO' : 'en-US'
  return new Intl.NumberFormat(locale).format(num)
}