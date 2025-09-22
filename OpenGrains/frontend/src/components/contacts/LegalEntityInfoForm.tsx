import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContactService } from '@/services/contact-service'
import type { ANAFQueryResult } from '../../../../shared/types/contact-types'
import {
  Building2,
  Search,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Hash,
  CreditCard
} from 'lucide-react'

interface LegalEntityInfoFormProps {
  form: UseFormReturn<any>
  isReadOnly: boolean
}

const LegalEntityInfoForm: React.FC<LegalEntityInfoFormProps> = ({ form, isReadOnly }) => {
  const { t } = useTranslation()

  const [anafLoading, setAnafLoading] = useState(false)
  const [anafResult, setAnafResult] = useState<ANAFQueryResult | null>(null)
  const [anafError, setAnafError] = useState<string | null>(null)

  const companyName = form.watch('companyName')
  const vatRegistrationNumber = form.watch('vatRegistrationNumber')

  // Auto-update display name when company name changes
  useEffect(() => {
    if (companyName) {
      form.setValue('name', companyName)
    }
  }, [companyName, form])

  // Validate CUI (Romanian Company Unique Identifier)
  const validateCUI = (cui: string) => {
    if (!cui) return null
    const cleanCui = cui.replace(/^RO/, '')
    return ContactService.validateCUI(cleanCui)
  }

  // Query ANAF for company information
  const queryANAF = async () => {
    const cui = vatRegistrationNumber?.replace(/^RO/, '') || ''

    if (!cui || cui.length < 2) {
      setAnafError(t('contacts.validation.cuiRequired'))
      return
    }

    try {
      setAnafLoading(true)
      setAnafError(null)

      const result = await ContactService.queryANAF(cui)
      setAnafResult(result)

      // Auto-fill fields with ANAF data
      if (result.companyName) {
        form.setValue('companyName', result.companyName)
      }
      if (result.tradeRegisterNumber) {
        form.setValue('tradeRegisterNumber', result.tradeRegisterNumber)
      }
      if (result.vatRegistrationNumber) {
        form.setValue('vatRegistrationNumber', result.vatRegistrationNumber)
      }

    } catch (error: any) {
      console.error('ANAF query failed:', error)
      setAnafError(error.message || t('contacts.validation.anafQueryFailed'))
    } finally {
      setAnafLoading(false)
    }
  }

  const cuiValid = vatRegistrationNumber ? validateCUI(vatRegistrationNumber) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('contacts.sections.legalEntityInfo')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>
                {t('contacts.fields.companyName')}
                <Badge variant="outline" className="ml-2">
                  {t('common.required')}
                </Badge>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isReadOnly}
                  placeholder={t('contacts.placeholders.companyName')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* VAT Registration Number (CUI) */}
        <FormField
          control={form.control}
          name="vatRegistrationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                {t('contacts.fields.vatRegistrationNumber')}
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    {...field}
                    disabled={isReadOnly}
                    placeholder={t('contacts.placeholders.vatRegistrationNumber')}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={queryANAF}
                    disabled={anafLoading || !vatRegistrationNumber}
                  >
                    {anafLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <FormDescription>
                {t('contacts.help.vatRegistrationNumber')}
              </FormDescription>
              {vatRegistrationNumber && (
                <div className="mt-2">
                  {cuiValid === true ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-600">
                        {t('contacts.validation.cuiValid')}
                      </AlertDescription>
                    </Alert>
                  ) : cuiValid === false ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {t('contacts.validation.cuiInvalid')}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trade Register Number */}
        <FormField
          control={form.control}
          name="tradeRegisterNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('contacts.fields.tradeRegisterNumber')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isReadOnly}
                  placeholder={t('contacts.placeholders.tradeRegisterNumber')}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                {t('contacts.help.tradeRegisterNumber')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company Number */}
        <FormField
          control={form.control}
          name="companyNumber"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t('contacts.fields.companyNumber')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isReadOnly}
                  placeholder={t('contacts.placeholders.companyNumber')}
                />
              </FormControl>
              <FormDescription>
                {t('contacts.help.companyNumber')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ANAF Query Results */}
      {anafResult && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">
              {t('contacts.anaf.dataFound')}
            </span>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {t('contacts.anaf.confidence')}: {Math.round(anafResult.confidence * 100)}%
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">{t('contacts.fields.companyName')}:</span>
              <br />
              <span className="text-green-700">{anafResult.companyName}</span>
            </div>
            <div>
              <span className="font-medium">{t('contacts.fields.status')}:</span>
              <br />
              <Badge variant={anafResult.status === 'active' ? 'default' : 'destructive'}>
                {t(`contacts.anaf.status.${anafResult.status}`)}
              </Badge>
            </div>
            <div>
              <span className="font-medium">{t('contacts.fields.tradeRegisterNumber')}:</span>
              <br />
              <span className="text-green-700">{anafResult.tradeRegisterNumber}</span>
            </div>
            <div>
              <span className="font-medium">{t('contacts.anaf.vatPayer')}:</span>
              <br />
              <Badge variant={anafResult.vatPayer ? 'default' : 'outline'}>
                {anafResult.vatPayer ? t('common.yes') : t('common.no')}
              </Badge>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-green-200">
            <span className="font-medium text-sm">{t('contacts.fields.address')}:</span>
            <br />
            <span className="text-green-700 text-sm">{anafResult.address}</span>
          </div>
        </div>
      )}

      {/* ANAF Query Error */}
      {anafError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('contacts.anaf.queryFailed')}:</strong> {anafError}
          </AlertDescription>
        </Alert>
      )}

      {/* Romanian Company Registration Information */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          <strong>{t('contacts.info.romanianCompanyTitle')}:</strong>
          <br />
          {t('contacts.info.romanianCompanyDescription')}
          <br />
          <br />
          <strong>{t('contacts.info.anafIntegrationTitle')}:</strong>
          <br />
          {t('contacts.info.anafIntegrationDescription')}
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default LegalEntityInfoForm