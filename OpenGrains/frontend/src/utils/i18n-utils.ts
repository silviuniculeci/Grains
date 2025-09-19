import i18n from '@/i18n/config'
import { type SupportedLanguage } from '@/i18n/config'

/**
 * Romanian-specific utility functions for i18n
 */

/**
 * Validate if a language code is supported
 */
export const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return ['en', 'ro'].includes(lang)
}

/**
 * Get browser's preferred language, defaulting to Romanian for Romania
 */
export const getBrowserLanguage = (): SupportedLanguage => {
  const browserLang = navigator.language.toLowerCase()

  // If browser is set to Romanian or user is in Romania
  if (browserLang.startsWith('ro') || browserLang === 'ro-ro') {
    return 'ro'
  }

  // Default to English for all other cases
  return 'en'
}

/**
 * Get appropriate direction for text (Romanian and English are both LTR)
 */
export const getTextDirection = (language?: SupportedLanguage): 'ltr' | 'rtl' => {
  return 'ltr' // Both Romanian and English are left-to-right
}

/**
 * Format Romanian currency (RON)
 */
export const formatRomanianCurrency = (
  amount: number,
  language: SupportedLanguage = i18n.language as SupportedLanguage
): string => {
  const locale = language === 'ro' ? 'ro-RO' : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format numbers according to Romanian/English locale
 */
export const formatLocalizedNumber = (
  num: number,
  language: SupportedLanguage = i18n.language as SupportedLanguage
): string => {
  const locale = language === 'ro' ? 'ro-RO' : 'en-US'
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Format dates according to Romanian/English locale
 */
export const formatLocalizedDate = (
  date: Date | string,
  language: SupportedLanguage = i18n.language as SupportedLanguage,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  const locale = language === 'ro' ? 'ro-RO' : 'en-US'
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

/**
 * Format Romanian phone number for display
 */
export const formatRomanianPhone = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // Handle Romanian phone numbers
  if (digits.startsWith('40') && digits.length === 12) {
    // +40 XXX XXX XXX
    return `+40 ${digits.substring(2, 5)} ${digits.substring(5, 8)} ${digits.substring(8)}`
  } else if (digits.startsWith('0') && digits.length === 10) {
    // 0XXX XXX XXX
    return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`
  }

  // Return as-is if not a recognized format
  return phone
}

/**
 * Format Romanian IBAN for display
 */
export const formatRomanianIBAN = (iban: string): string => {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase()

  // Add spaces every 4 characters for Romanian IBAN
  if (cleanIban.startsWith('RO') && cleanIban.length === 24) {
    return cleanIban.replace(/(.{4})/g, '$1 ').trim()
  }

  // Return as-is if not Romanian IBAN
  return iban
}

/**
 * Get Romanian county name from code
 */
export const getCountyName = (
  countyCode: string,
  language: SupportedLanguage = i18n.language as SupportedLanguage
): string => {
  const countyMap: Record<string, { en: string; ro: string }> = {
    AB: { en: 'Alba', ro: 'Alba' },
    AR: { en: 'Arad', ro: 'Arad' },
    AG: { en: 'Argeș', ro: 'Argeș' },
    BC: { en: 'Bacău', ro: 'Bacău' },
    BH: { en: 'Bihor', ro: 'Bihor' },
    BN: { en: 'Bistrița-Năsăud', ro: 'Bistrița-Năsăud' },
    BT: { en: 'Botoșani', ro: 'Botoșani' },
    BV: { en: 'Brașov', ro: 'Brașov' },
    BR: { en: 'Brăila', ro: 'Brăila' },
    BZ: { en: 'Buzău', ro: 'Buzău' },
    CS: { en: 'Caraș-Severin', ro: 'Caraș-Severin' },
    CL: { en: 'Călărași', ro: 'Călărași' },
    CJ: { en: 'Cluj', ro: 'Cluj' },
    CT: { en: 'Constanța', ro: 'Constanța' },
    CV: { en: 'Covasna', ro: 'Covasna' },
    DB: { en: 'Dâmbovița', ro: 'Dâmbovița' },
    DJ: { en: 'Dolj', ro: 'Dolj' },
    GL: { en: 'Galați', ro: 'Galați' },
    GR: { en: 'Giurgiu', ro: 'Giurgiu' },
    GJ: { en: 'Gorj', ro: 'Gorj' },
    HR: { en: 'Harghita', ro: 'Harghita' },
    HD: { en: 'Hunedoara', ro: 'Hunedoara' },
    IL: { en: 'Ialomița', ro: 'Ialomița' },
    IS: { en: 'Iași', ro: 'Iași' },
    IF: { en: 'Ilfov', ro: 'Ilfov' },
    MM: { en: 'Maramureș', ro: 'Maramureș' },
    MH: { en: 'Mehedinți', ro: 'Mehedinți' },
    MS: { en: 'Mureș', ro: 'Mureș' },
    NT: { en: 'Neamț', ro: 'Neamț' },
    OT: { en: 'Olt', ro: 'Olt' },
    PH: { en: 'Prahova', ro: 'Prahova' },
    SM: { en: 'Satu Mare', ro: 'Satu Mare' },
    SJ: { en: 'Sălaj', ro: 'Sălaj' },
    SB: { en: 'Sibiu', ro: 'Sibiu' },
    SV: { en: 'Suceava', ro: 'Suceava' },
    TR: { en: 'Teleorman', ro: 'Teleorman' },
    TM: { en: 'Timiș', ro: 'Timiș' },
    TL: { en: 'Tulcea', ro: 'Tulcea' },
    VS: { en: 'Vaslui', ro: 'Vaslui' },
    VL: { en: 'Vâlcea', ro: 'Vâlcea' },
    VN: { en: 'Vrancea', ro: 'Vrancea' },
    B: { en: 'Bucharest', ro: 'București' },
  }

  const county = countyMap[countyCode.toUpperCase()]
  return county ? county[language] : countyCode
}

/**
 * Calculate text expansion factor for Romanian
 * Romanian text is typically 15-20% longer than English
 */
export const getTextExpansionFactor = (language: SupportedLanguage): number => {
  return language === 'ro' ? 1.2 : 1.0
}

/**
 * Get CSS class for language-specific styling
 */
export const getLanguageClass = (language: SupportedLanguage): string => {
  return `lang-${language}`
}

/**
 * Check if current language is Romanian
 */
export const isRomanian = (): boolean => {
  return i18n.language === 'ro'
}

/**
 * Get translated grain type
 */
export const getGrainTypeName = (
  grainType: string,
  language: SupportedLanguage = i18n.language as SupportedLanguage
): string => {
  const grainMap: Record<string, { en: string; ro: string }> = {
    wheat: { en: 'Wheat', ro: 'Grâu' },
    corn: { en: 'Corn', ro: 'Porumb' },
    barley: { en: 'Barley', ro: 'Orz' },
    sunflower: { en: 'Sunflower', ro: 'Floarea-soarelui' },
    rapeseed: { en: 'Rapeseed', ro: 'Rapiță' },
    oats: { en: 'Oats', ro: 'Ovăz' },
    rye: { en: 'Rye', ro: 'Secară' },
    soybeans: { en: 'Soybeans', ro: 'Soia' },
  }

  const grain = grainMap[grainType.toLowerCase()]
  return grain ? grain[language] : grainType
}

/**
 * Format volume with appropriate units
 */
export const formatVolume = (
  volume: number,
  language: SupportedLanguage = i18n.language as SupportedLanguage
): string => {
  const formattedNumber = formatLocalizedNumber(volume, language)
  const unit = language === 'ro' ? 'tone' : 'tons'
  return `${formattedNumber} ${unit}`
}

/**
 * Get relative time formatting
 */
export const formatRelativeTime = (
  date: Date | string,
  language: SupportedLanguage = i18n.language as SupportedLanguage
): string => {
  const locale = language === 'ro' ? 'ro-RO' : 'en-US'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffMinutes < 1) {
    return language === 'ro' ? 'acum' : 'just now'
  } else if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, 'minute')
  } else if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour')
  } else {
    return rtf.format(-diffDays, 'day')
  }
}

/**
 * Truncate text with language-aware ellipsis
 */
export const truncateText = (
  text: string,
  maxLength: number,
  language: SupportedLanguage = i18n.language as SupportedLanguage
): string => {
  if (text.length <= maxLength) return text

  const ellipsis = language === 'ro' ? '...' : '...'
  return text.substring(0, maxLength - ellipsis.length) + ellipsis
}