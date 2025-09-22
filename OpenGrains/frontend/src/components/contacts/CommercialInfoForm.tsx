import React from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ContactType } from '../../../../shared/types/contact-types'
import {
  Package,
  MapPin,
  Target,
  FileText,
  Calendar,
  Info,
  Wheat,
  TrendingUp
} from 'lucide-react'

interface CommercialInfoFormProps {
  form: UseFormReturn<any>
  isReadOnly: boolean
  contactType: ContactType
}

const CommercialInfoForm: React.FC<CommercialInfoFormProps> = ({
  form,
  isReadOnly,
  contactType
}) => {
  const { t } = useTranslation()

  const cultivatedArea = form.watch('cultivatedArea')
  const annualPurchaseTarget = form.watch('annualPurchaseTarget')
  const apiaCertificateExpiration = form.watch('apiaCertificateExpiration')

  // Check if APIA certificate is expiring soon (within 30 days)
  const isApiaCertificateExpiringSoon = () => {
    if (!apiaCertificateExpiration) return false
    const expirationDate = new Date(apiaCertificateExpiration)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expirationDate <= thirtyDaysFromNow && expirationDate >= today
  }

  const isApiaCertificateExpired = () => {
    if (!apiaCertificateExpiration) return false
    const expirationDate = new Date(apiaCertificateExpiration)
    const today = new Date()
    return expirationDate < today
  }

  // Calculate potential value based on area and target
  const calculatePotentialValue = () => {
    if (!cultivatedArea || !annualPurchaseTarget) return null
    return cultivatedArea * annualPurchaseTarget
  }

  const potentialValue = calculatePotentialValue()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t('contacts.sections.commercialInfo')}
        </CardTitle>
        <CardDescription>
          {contactType === 'supplier'
            ? t('contacts.sections.commercialInfoSupplierDescription')
            : contactType === 'buyer'
            ? t('contacts.sections.commercialInfoBuyerDescription')
            : t('contacts.sections.commercialInfoBothDescription')
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agricultural Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wheat className="h-4 w-4" />
            <h4 className="font-medium">{t('contacts.commercial.agriculturalInfo')}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cultivated Area */}
            <FormField
              control={form.control}
              name="cultivatedArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('contacts.fields.cultivatedArea')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isReadOnly}
                        placeholder={t('contacts.placeholders.cultivatedArea')}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                      <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                        {t('contacts.units.hectares')}
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t('contacts.help.cultivatedArea')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purchase Potential */}
            <FormField
              control={form.control}
              name="purchasePotential"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {t('contacts.fields.purchasePotential')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isReadOnly}
                      placeholder={t('contacts.placeholders.purchasePotential')}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('contacts.help.purchasePotential')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Annual Purchase Target */}
            <FormField
              control={form.control}
              name="annualPurchaseTarget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {t('contacts.fields.annualPurchaseTarget')}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isReadOnly}
                        placeholder={t('contacts.placeholders.annualPurchaseTarget')}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                      <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                        {t('contacts.units.tons')}
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t('contacts.help.annualPurchaseTarget')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Potential Value Calculation */}
            {potentialValue && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">
                    {t('contacts.commercial.potentialValue')}
                  </span>
                </div>
                <div className="text-lg font-bold text-green-700">
                  {potentialValue.toLocaleString()} {t('contacts.units.tonsTotal')}
                </div>
                <p className="text-sm text-green-600">
                  {t('contacts.commercial.potentialValueDescription')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* APIA Certification */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <h4 className="font-medium">{t('contacts.commercial.apiaCertification')}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* APIA Certificate Number */}
            <FormField
              control={form.control}
              name="apiaCertificateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t('contacts.fields.apiaCertificateNumber')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isReadOnly}
                      placeholder={t('contacts.placeholders.apiaCertificateNumber')}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    {t('contacts.help.apiaCertificateNumber')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* APIA Certificate Expiration */}
            <FormField
              control={form.control}
              name="apiaCertificateExpiration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('contacts.fields.apiaCertificateExpiration')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      disabled={isReadOnly}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('contacts.help.apiaCertificateExpiration')}
                  </FormDescription>

                  {/* Expiration Warning */}
                  {apiaCertificateExpiration && (
                    <div className="mt-2">
                      {isApiaCertificateExpired() ? (
                        <Alert variant="destructive">
                          <Calendar className="h-4 w-4" />
                          <AlertDescription>
                            {t('contacts.commercial.apiaCertificateExpired')}
                          </AlertDescription>
                        </Alert>
                      ) : isApiaCertificateExpiringSoon() ? (
                        <Alert>
                          <Calendar className="h-4 w-4" />
                          <AlertDescription className="text-orange-600">
                            {t('contacts.commercial.apiaCertificateExpiringSoon')}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert>
                          <Calendar className="h-4 w-4" />
                          <AlertDescription className="text-green-600">
                            {t('contacts.commercial.apiaCertificateValid')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Commercial Summary */}
        {(cultivatedArea || annualPurchaseTarget || form.watch('purchasePotential')) && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {t('contacts.commercial.summary')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {cultivatedArea && (
                <div>
                  <span className="font-medium">{t('contacts.fields.cultivatedArea')}:</span>
                  <div className="text-blue-700">
                    {cultivatedArea} {t('contacts.units.hectares')}
                  </div>
                </div>
              )}

              {annualPurchaseTarget && (
                <div>
                  <span className="font-medium">{t('contacts.fields.annualPurchaseTarget')}:</span>
                  <div className="text-blue-700">
                    {annualPurchaseTarget} {t('contacts.units.tons')}
                  </div>
                </div>
              )}

              {form.watch('apiaCertificateNumber') && (
                <div>
                  <span className="font-medium">{t('contacts.commercial.apiaCertified')}:</span>
                  <div className="flex items-center gap-1">
                    <Badge variant={isApiaCertificateExpired() ? 'destructive' : 'default'}>
                      {isApiaCertificateExpired() ? t('common.expired') : t('common.valid')}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Type Specific Information */}
        {contactType === 'supplier' && (
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              <strong>{t('contacts.commercial.supplierInfoTitle')}:</strong>
              <br />
              {t('contacts.commercial.supplierInfoDescription')}
            </AlertDescription>
          </Alert>
        )}

        {contactType === 'buyer' && (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>{t('contacts.commercial.buyerInfoTitle')}:</strong>
              <br />
              {t('contacts.commercial.buyerInfoDescription')}
            </AlertDescription>
          </Alert>
        )}

        {contactType === 'both' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>{t('contacts.commercial.bothInfoTitle')}:</strong>
              <br />
              {t('contacts.commercial.bothInfoDescription')}
            </AlertDescription>
          </Alert>
        )}

        {/* APIA Information */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('contacts.info.apiaTitle')}:</strong>
            <br />
            {t('contacts.info.apiaDescription')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default CommercialInfoForm