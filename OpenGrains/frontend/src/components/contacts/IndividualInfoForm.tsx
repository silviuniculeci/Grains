import React, { useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContactService } from '@/services/contact-service'
import { User, CreditCard, Hash, AlertTriangle, CheckCircle } from 'lucide-react'

interface IndividualInfoFormProps {
  form: UseFormReturn<any>
  isReadOnly: boolean
}

const IndividualInfoForm: React.FC<IndividualInfoFormProps> = ({ form, isReadOnly }) => {
  const { t } = useTranslation()

  const firstName = form.watch('firstName')
  const lastName = form.watch('lastName')
  const personalIdentificationNumber = form.watch('personalIdentificationNumber')

  // Auto-update display name when individual names change
  useEffect(() => {
    if (firstName && lastName) {
      form.setValue('name', `${firstName} ${lastName}`)
    }
  }, [firstName, lastName, form])

  // Validate CNP (Romanian Personal Identification Number)
  const validateCNP = (cnp: string) => {
    if (!cnp) return null
    return ContactService.validateCNP(cnp)
  }

  const cnpValid = personalIdentificationNumber ? validateCNP(personalIdentificationNumber) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('contacts.sections.individualInfo')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('contacts.fields.firstName')}
                <Badge variant="outline" className="ml-2">
                  {t('common.required')}
                </Badge>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isReadOnly}
                  placeholder={t('contacts.placeholders.firstName')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('contacts.fields.lastName')}
                <Badge variant="outline" className="ml-2">
                  {t('common.required')}
                </Badge>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isReadOnly}
                  placeholder={t('contacts.placeholders.lastName')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ID Series */}
        <FormField
          control={form.control}
          name="idSeries"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t('contacts.fields.idSeries')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isReadOnly}
                  placeholder={t('contacts.placeholders.idSeries')}
                  className="uppercase"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                {t('contacts.help.idSeries')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ID Number */}
        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                {t('contacts.fields.idNumber')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isReadOnly}
                  placeholder={t('contacts.placeholders.idNumber')}
                />
              </FormControl>
              <FormDescription>
                {t('contacts.help.idNumber')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Personal Identification Number (CNP) */}
        <FormField
          control={form.control}
          name="personalIdentificationNumber"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                {t('contacts.fields.personalIdentificationNumber')}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isReadOnly}
                  placeholder={t('contacts.placeholders.personalIdentificationNumber')}
                  maxLength={13}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '') // Only digits
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormDescription>
                {t('contacts.help.personalIdentificationNumber')}
              </FormDescription>
              {personalIdentificationNumber && (
                <div className="mt-2">
                  {cnpValid === true ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-600">
                        {t('contacts.validation.cnpValid')}
                      </AlertDescription>
                    </Alert>
                  ) : cnpValid === false ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {t('contacts.validation.cnpInvalid')}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Auto-generated Full Name Display */}
      {firstName && lastName && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {t('contacts.fields.autoGeneratedName')}:
            </span>
            <Badge variant="outline" className="text-blue-800 border-blue-300">
              {firstName} {lastName}
            </Badge>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {t('contacts.help.autoGeneratedName')}
          </p>
        </div>
      )}

      {/* Romanian ID Format Information */}
      <Alert>
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          <strong>{t('contacts.info.romanianIdTitle')}:</strong>
          <br />
          {t('contacts.info.romanianIdDescription')}
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default IndividualInfoForm