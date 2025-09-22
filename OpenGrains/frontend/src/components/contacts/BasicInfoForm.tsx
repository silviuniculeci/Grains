import React from 'react'
import { useTranslation } from 'react-i18next'
import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Building2, User, Package, ShoppingCart, Users } from 'lucide-react'

interface BasicInfoFormProps {
  form: UseFormReturn<any>
  isReadOnly: boolean
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ form, isReadOnly }) => {
  const { t } = useTranslation()

  const legalType = form.watch('legalType')
  const contactType = form.watch('contactType')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supplier':
        return <Package className="h-4 w-4" />
      case 'buyer':
        return <ShoppingCart className="h-4 w-4" />
      case 'both':
        return <Users className="h-4 w-4" />
      default:
        return null
    }
  }

  const getLegalTypeIcon = (type: string) => {
    return type === 'individual' ? (
      <User className="h-4 w-4" />
    ) : (
      <Building2 className="h-4 w-4" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Contact Type and Legal Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="legalType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {getLegalTypeIcon(field.value)}
                {t('contacts.fields.legalType')}
              </FormLabel>
              <Select disabled={isReadOnly} onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('contacts.placeholders.legalType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('contacts.legalType.individual')}
                    </div>
                  </SelectItem>
                  <SelectItem value="legal_entity">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {t('contacts.legalType.legal_entity')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                {getTypeIcon(field.value)}
                {t('contacts.fields.contactType')}
              </FormLabel>
              <Select disabled={isReadOnly} onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('contacts.placeholders.contactType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="supplier">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t('contacts.type.supplier')}
                    </div>
                  </SelectItem>
                  <SelectItem value="buyer">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {t('contacts.type.buyer')}
                    </div>
                  </SelectItem>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t('contacts.type.both')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Display Name Field */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('contacts.fields.name')}
              <Badge variant="outline" className="ml-2">
                {t('common.required')}
              </Badge>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={isReadOnly}
                placeholder={
                  legalType === 'individual'
                    ? t('contacts.placeholders.individualName')
                    : t('contacts.placeholders.companyName')
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Selection Summary */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t('contacts.summary.type')}:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              {getLegalTypeIcon(legalType)}
              {t(`contacts.legalType.${legalType}`)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t('contacts.summary.role')}:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              {getTypeIcon(contactType)}
              {t(`contacts.type.${contactType}`)}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {legalType === 'individual'
            ? t('contacts.help.individualDescription')
            : t('contacts.help.legalEntityDescription')}
        </p>
      </div>
    </div>
  )
}

export default BasicInfoForm