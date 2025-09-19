import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { changeLanguage, getCurrentLanguage, type SupportedLanguage } from '@/i18n/config'

// Local supported languages configuration
const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en' as const,
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
    code: 'ro' as const,
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

interface LanguageSwitcherProps {
  className?: string
  variant?: 'default' | 'compact' | 'mobile'
  showFlag?: boolean
  showText?: boolean
  alignment?: 'left' | 'right'
}

/**
 * LanguageSwitcher Component
 *
 * Provides a dropdown interface for switching between English and Romanian languages.
 * Supports different display variants and automatically saves language preference.
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  variant = 'default',
  showFlag = true,
  showText = true,
  alignment = 'right',
}) => {
  const { t } = useTranslation(['common'])
  const [isLoading, setIsLoading] = useState(false)
  const currentLanguage = getCurrentLanguage()

  const handleLanguageChange = async (newLanguage: SupportedLanguage) => {
    if (newLanguage === currentLanguage || isLoading) return

    setIsLoading(true)
    try {
      await changeLanguage(newLanguage)

      // Show success message briefly
      // Note: In a real app, you might want to use a toast notification
      console.log(t('language.switchSuccess'))
    } catch (error) {
      console.error('Failed to switch language:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderLanguageOption = (languageCode: SupportedLanguage) => {
    const language = SUPPORTED_LANGUAGES[languageCode]
    const isActive = currentLanguage === languageCode

    return (
      <DropdownMenuItem
        key={languageCode}
        onClick={() => handleLanguageChange(languageCode)}
        disabled={isLoading || isActive}
        className={cn(
          'flex items-center gap-2 min-w-[120px]',
          isActive && 'bg-muted font-medium'
        )}
      >
        {showFlag && (
          <span className="text-lg">{language.flag}</span>
        )}
        <span className="flex-1">{language.nativeName}</span>
        {isActive && <Check className="h-4 w-4 text-primary" />}
      </DropdownMenuItem>
    )
  }

  const currentLanguageInfo = SUPPORTED_LANGUAGES[currentLanguage]

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('px-2', className)}
            disabled={isLoading}
          >
            <Globe className="h-4 w-4" />
            {showFlag && (
              <span className="ml-1">{currentLanguageInfo.flag}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={alignment} className="min-w-[140px]">
          {Object.keys(SUPPORTED_LANGUAGES).map((lang) =>
            renderLanguageOption(lang as SupportedLanguage)
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'mobile') {
    return (
      <div className={cn('w-full', className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                {showFlag && (
                  <span className="text-lg">{currentLanguageInfo.flag}</span>
                )}
                {showText && (
                  <span>{currentLanguageInfo.nativeName}</span>
                )}
                {!showText && !showFlag && (
                  <Globe className="h-4 w-4" />
                )}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[200px]">
            {Object.keys(SUPPORTED_LANGUAGES).map((lang) =>
              renderLanguageOption(lang as SupportedLanguage)
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3"
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {showFlag && (
                <span className="text-lg">{currentLanguageInfo.flag}</span>
              )}
              {showText && (
                <span className="hidden sm:inline">
                  {currentLanguageInfo.nativeName}
                </span>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={alignment} className="min-w-[160px]">
          {Object.keys(SUPPORTED_LANGUAGES).map((lang) =>
            renderLanguageOption(lang as SupportedLanguage)
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/**
 * Simple Language Toggle Button
 *
 * A simpler component that just toggles between English and Romanian
 */
interface LanguageToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className,
  size = 'md',
}) => {
  const { t } = useTranslation(['common'])
  const [isLoading, setIsLoading] = useState(false)
  const currentLanguage = getCurrentLanguage()

  const handleToggle = async () => {
    const newLanguage: SupportedLanguage = currentLanguage === 'en' ? 'ro' : 'en'

    setIsLoading(true)
    try {
      await changeLanguage(newLanguage)
    } catch (error) {
      console.error('Failed to toggle language:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextLanguage = currentLanguage === 'en' ? 'ro' : 'en'
  const nextLanguageInfo = SUPPORTED_LANGUAGES[nextLanguage]

  const buttonSizes = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(buttonSizes[size], className)}
      title={t('language.switch')}
    >
      <Globe className="h-4 w-4 mr-1" />
      <span className="font-medium">{nextLanguageInfo.flag}</span>
      <span className="ml-1 hidden sm:inline">
        {nextLanguageInfo.code.toUpperCase()}
      </span>
    </Button>
  )
}

/**
 * Language Status Indicator
 *
 * Shows current language in a badge format
 */
interface LanguageIndicatorProps {
  className?: string
  showText?: boolean
}

export const LanguageIndicator: React.FC<LanguageIndicatorProps> = ({
  className,
  showText = false,
}) => {
  const currentLanguage = getCurrentLanguage()
  const currentLanguageInfo = SUPPORTED_LANGUAGES[currentLanguage]

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium',
      className
    )}>
      <span>{currentLanguageInfo.flag}</span>
      {showText && (
        <span>{currentLanguageInfo.nativeName}</span>
      )}
    </div>
  )
}

export default LanguageSwitcher