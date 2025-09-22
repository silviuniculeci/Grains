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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContactService } from '@/services/contact-service'
import type { Contact, ContactLegalType } from '../../../../shared/types/contact-types'
import {
  CreditCard,
  Building2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Upload,
  Camera,
  Banknote
} from 'lucide-react'

interface FinancialInfoFormProps {
  form: UseFormReturn<any>
  isReadOnly: boolean
  contact?: Contact | null
  legalType: ContactLegalType
}

const FinancialInfoForm: React.FC<FinancialInfoFormProps> = ({
  form,
  isReadOnly,
  contact,
  legalType
}) => {
  const { t } = useTranslation()

  const [ibanValidating, setIbanValidating] = useState(false)
  const [ibanValidationResult, setIbanValidationResult] = useState<{
    isValid: boolean
    formattedIban?: string
    bankName?: string
  } | null>(null)

  const iban = form.watch('iban')

  // Validate IBAN in real-time
  useEffect(() => {
    if (iban && iban.length >= 24) {
      validateIBAN(iban)
    } else {
      setIbanValidationResult(null)
    }
  }, [iban])

  const validateIBAN = async (ibanValue: string) => {
    try {
      setIbanValidating(true)

      const isValid = ContactService.validateIBAN(ibanValue)
      const formattedIban = ibanValue.replace(/\s/g, '').toUpperCase()

      // Mock bank name extraction (in real implementation, this would query a bank database)
      let bankName = ''
      if (isValid && formattedIban.startsWith('RO')) {
        const bankCode = formattedIban.substring(4, 8)
        const bankNames: Record<string, string> = {
          'RNCB': 'Banca Comercială Română',
          'BTRL': 'Banca Transilvania',
          'INGB': 'ING Bank România',
          'BRDE': 'BRD - Groupe Société Générale',
          'CECEB': 'CEC Bank',
          'RZBR': 'Raiffeisen Bank România'
        }
        bankName = bankNames[bankCode] || t('contacts.financial.unknownBank')
      }

      setIbanValidationResult({
        isValid,
        formattedIban: isValid ? formatIBAN(formattedIban) : undefined,
        bankName: isValid ? bankName : undefined
      })

      // Auto-fill bank name if valid
      if (isValid && bankName && !form.getValues('bankName')) {
        form.setValue('bankName', bankName)
      }
    } catch (error) {
      console.error('IBAN validation error:', error)
    } finally {
      setIbanValidating(false)
    }
  }

  const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim()
  }

  const handleOCRBankStatement = () => {
    // This would trigger OCR processing for bank statements
    // For now, show a placeholder message
    alert(t('contacts.financial.ocrNotImplemented'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('contacts.sections.financialInfo')}
        </CardTitle>
        <CardDescription>
          {t('contacts.sections.financialInfoDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legal Entity Financial Info */}
        {legalType === 'legal_entity' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <h4 className="font-medium">{t('contacts.financial.companyInfo')}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tradeRegisterNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contacts.fields.tradeRegisterNumber')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isReadOnly}
                        placeholder={t('contacts.placeholders.tradeRegisterNumber')}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('contacts.help.tradeRegisterNumberFinancial')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contacts.fields.vatRegistrationNumber')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isReadOnly}
                        placeholder={t('contacts.placeholders.vatRegistrationNumber')}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('contacts.help.vatRegistrationNumberFinancial')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyNumber"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('contacts.fields.companyNumber')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isReadOnly}
                        placeholder={t('contacts.placeholders.companyNumber')}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('contacts.help.companyNumberFinancial')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Banking Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            <h4 className="font-medium">{t('contacts.financial.bankingInfo')}</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* IBAN */}
            <FormField
              control={form.control}
              name="iban"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t('contacts.fields.iban')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        disabled={isReadOnly}
                        placeholder={t('contacts.placeholders.iban')}
                        className="font-mono pr-10"
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').toUpperCase()
                          field.onChange(formatIBAN(value))
                        }}
                      />
                      {ibanValidating && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t('contacts.help.iban')}
                  </FormDescription>

                  {/* IBAN Validation Result */}
                  {ibanValidationResult && (
                    <div className="mt-2">
                      {ibanValidationResult.isValid ? (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-green-600">
                            <div className="space-y-1">
                              <div>
                                <strong>{t('contacts.validation.ibanValid')}</strong>
                              </div>
                              {ibanValidationResult.bankName && (
                                <div className="text-sm">
                                  {t('contacts.fields.bank')}: {ibanValidationResult.bankName}
                                </div>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {t('contacts.validation.ibanInvalid')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bank Name and SWIFT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contacts.fields.bankName')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isReadOnly}
                        placeholder={t('contacts.placeholders.bankName')}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('contacts.help.bankName')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="swiftCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contacts.fields.swiftCode')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isReadOnly}
                        placeholder={t('contacts.placeholders.swiftCode')}
                        className="font-mono"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('contacts.help.swiftCode')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* OCR Bank Statement Upload */}
        {!isReadOnly && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {t('contacts.financial.ocrBankStatement')}
              </span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              {t('contacts.financial.ocrBankStatementDescription')}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleOCRBankStatement}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('contacts.financial.uploadBankStatement')}
            </Button>
          </div>
        )}

        {/* Validation Status Display */}
        {contact && (
          <div className="space-y-3">
            <h4 className="font-medium">{t('contacts.financial.validationStatus')}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{t('contacts.financial.ibanValidated')}</span>
                <Badge variant={contact.financialInfo?.ibanValidated ? 'default' : 'outline'}>
                  {contact.financialInfo?.ibanValidated ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {contact.financialInfo?.ibanValidated ? t('common.validated') : t('common.pending')}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{t('contacts.financial.anafVerified')}</span>
                <Badge variant={contact.anafVerified ? 'default' : 'outline'}>
                  {contact.anafVerified ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {contact.anafVerified ? t('common.verified') : t('common.pending')}
                </Badge>
              </div>
            </div>

            {contact.anafLastChecked && (
              <p className="text-sm text-muted-foreground">
                {t('contacts.financial.lastAnafCheck')}: {contact.anafLastChecked.toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Information Alert */}
        <Alert>
          <CreditCard className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('contacts.financial.validationTitle')}:</strong>
            <br />
            {t('contacts.financial.validationDescription')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default FinancialInfoForm