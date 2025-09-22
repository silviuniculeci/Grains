import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Save,
  Send,
  ArrowLeft,
  Building2,
  User,
  MapPin,
  CreditCard,
  Package,
  Truck,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'

import { ContactService } from '@/services/contact-service'
import type {
  Contact,
  CreateContactData,
  UpdateContactData,
  ContactLegalType,
  ContactType,
  ContactStatus
} from '../../../shared/types/contact-types'
import { useAuth } from '@/hooks/useAuth'
import BasicInfoForm from '@/components/contacts/BasicInfoForm'
import IndividualInfoForm from '@/components/contacts/IndividualInfoForm'
import LegalEntityInfoForm from '@/components/contacts/LegalEntityInfoForm'
import FinancialInfoForm from '@/components/contacts/FinancialInfoForm'
import CommercialInfoForm from '@/components/contacts/CommercialInfoForm'
import LoadingAddressesForm from '@/components/contacts/LoadingAddressesForm'
import AssociatedContactsForm from '@/components/contacts/AssociatedContactsForm'
import DocumentUploadForm from '@/components/contacts/DocumentUploadForm'

// Form validation schema
const createContactSchema = z.object({
  // Basic info
  name: z.string().min(2, 'Name is required'),
  legalType: z.enum(['individual', 'legal_entity']),
  contactType: z.enum(['supplier', 'buyer', 'both']),

  // Contact details
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  county: z.string().min(1, 'County is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid email is required'),

  // Individual-specific fields (conditional)
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  idSeries: z.string().optional(),
  idNumber: z.string().optional(),
  personalIdentificationNumber: z.string().optional(),

  // Legal entity-specific fields (conditional)
  companyName: z.string().optional(),
  tradeRegisterNumber: z.string().optional(),
  vatRegistrationNumber: z.string().optional(),
  companyNumber: z.string().optional(),

  // Financial info
  iban: z.string().optional(),
  bankName: z.string().optional(),
  swiftCode: z.string().optional(),

  // Commercial info
  cultivatedArea: z.number().optional(),
  purchasePotential: z.string().optional(),
  annualPurchaseTarget: z.number().optional(),
  apiaCertificateNumber: z.string().optional(),
  apiaCertificateExpiration: z.string().optional(),
}).refine(
  (data) => {
    // Individual must have first and last name
    if (data.legalType === 'individual') {
      return data.firstName && data.lastName
    }
    return true
  },
  {
    message: 'First name and last name are required for individuals',
    path: ['firstName']
  }
).refine(
  (data) => {
    // Legal entity must have company name
    if (data.legalType === 'legal_entity') {
      return data.companyName
    }
    return true
  },
  {
    message: 'Company name is required for legal entities',
    path: ['companyName']
  }
)

type ContactFormData = z.infer<typeof createContactSchema>

interface ContactFormProps {
  contactId?: string
  navigate: {
    toList: () => void
    toNew: () => void
    toEdit: (id: string) => void
    toView: (id: string) => void
  }
  readOnly?: boolean
}

const ContactForm: React.FC<ContactFormProps> = ({
  contactId,
  navigate,
  readOnly = false
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!contactId
  const isReadOnly = readOnly || (contact?.status === 'valid' && user?.role !== 'back_office' && user?.role !== 'admin')

  // Form setup
  const form = useForm<ContactFormData>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      legalType: 'individual',
      contactType: 'supplier',
      country: 'Romania',
    }
  })

  const legalType = form.watch('legalType')
  const contactType = form.watch('contactType')

  // Load existing contact for editing
  useEffect(() => {
    if (isEditing) {
      loadContact()
    }
  }, [contactId])

  const loadContact = async () => {
    if (!contactId) return

    try {
      setLoading(true)
      setError(null)

      const contactData = await ContactService.getById(contactId)
      setContact(contactData)

      // Populate form
      form.reset({
        name: contactData.name,
        legalType: contactData.legalType,
        contactType: contactData.contactType,
        street: contactData.basicInfo.street,
        city: contactData.basicInfo.city,
        county: contactData.basicInfo.county,
        country: contactData.basicInfo.country,
        postalCode: contactData.basicInfo.postalCode,
        phone: contactData.basicInfo.phone,
        email: contactData.basicInfo.email,

        // Individual data
        firstName: contactData.individualData?.firstName,
        lastName: contactData.individualData?.lastName,
        idSeries: contactData.individualData?.idSeries,
        idNumber: contactData.individualData?.idNumber,
        personalIdentificationNumber: contactData.individualData?.personalIdentificationNumber,

        // Legal entity data
        companyName: contactData.legalEntityData?.companyName,
        tradeRegisterNumber: contactData.legalEntityData?.tradeRegisterNumber,
        vatRegistrationNumber: contactData.legalEntityData?.vatRegistrationNumber,
        companyNumber: contactData.legalEntityData?.companyNumber,

        // Financial data
        iban: contactData.financialInfo?.iban,
        bankName: contactData.financialInfo?.bankName,
        swiftCode: contactData.financialInfo?.swiftCode,

        // Commercial data
        cultivatedArea: contactData.commercialInfo?.cultivatedArea,
        purchasePotential: contactData.commercialInfo?.purchasePotential,
        annualPurchaseTarget: contactData.commercialInfo?.annualPurchaseTarget,
        apiaCertificateNumber: contactData.commercialInfo?.apiaCertificateNumber,
        apiaCertificateExpiration: contactData.commercialInfo?.apiaCertificateExpiration?.toISOString().split('T')[0],
      })
    } catch (err: any) {
      console.error('Failed to load contact:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Save as draft
  const saveDraft = async (data: ContactFormData) => {
    try {
      setSaving(true)
      setError(null)

      const contactData: CreateContactData | UpdateContactData = {
        name: data.name,
        legalType: data.legalType,
        contactType: data.contactType,
        basicInfo: {
          name: data.name,
          street: data.street,
          city: data.city,
          county: data.county,
          country: data.country,
          postalCode: data.postalCode,
          phone: data.phone,
          email: data.email,
        },
        individualData: data.legalType === 'individual' ? {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          idSeries: data.idSeries,
          idNumber: data.idNumber,
          personalIdentificationNumber: data.personalIdentificationNumber,
        } : undefined,
        legalEntityData: data.legalType === 'legal_entity' ? {
          companyName: data.companyName || '',
          tradeRegisterNumber: data.tradeRegisterNumber,
          vatRegistrationNumber: data.vatRegistrationNumber,
          companyNumber: data.companyNumber,
        } : undefined,
        financialInfo: {
          iban: data.iban,
          bankName: data.bankName,
          swiftCode: data.swiftCode,
          ibanValidated: data.iban ? ContactService.validateIBAN(data.iban) : false,
          anafVerified: false
        },
        commercialInfo: {
          cultivatedArea: data.cultivatedArea,
          purchasePotential: data.purchasePotential,
          annualPurchaseTarget: data.annualPurchaseTarget,
          apiaCertificateNumber: data.apiaCertificateNumber,
          apiaCertificateExpiration: data.apiaCertificateExpiration ? new Date(data.apiaCertificateExpiration) : undefined,
        }
      }

      let result: Contact

      if (isEditing && contact) {
        result = await ContactService.update(contact.id, {
          ...contactData,
          status: 'draft'
        })
      } else {
        result = await ContactService.create(contactData)
      }

      setContact(result)

      if (!isEditing) {
        navigate.toEdit(result.id)
      }
    } catch (err: any) {
      console.error('Failed to save contact:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Submit for validation
  const submitForValidation = async (data: ContactFormData) => {
    try {
      setSubmitting(true)
      setError(null)

      // First save as draft
      await saveDraft(data)

      if (contact) {
        await ContactService.submitForValidation(contact.id)
        navigate.toList()
      }
    } catch (err: any) {
      console.error('Failed to submit contact:', err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle form submission
  const onSubmit = (data: ContactFormData, action: 'draft' | 'submit') => {
    if (action === 'draft') {
      saveDraft(data)
    } else {
      submitForValidation(data)
    }
  }

  // Status badge
  const getStatusBadge = (status: ContactStatus) => {
    const variants = {
      draft: { icon: AlertTriangle, variant: 'secondary' as const, color: 'text-gray-600' },
      pending_validation: { icon: Loader2, variant: 'default' as const, color: 'text-yellow-600' },
      valid: { icon: CheckCircle, variant: 'default' as const, color: 'text-green-600' },
      rejected: { icon: AlertTriangle, variant: 'destructive' as const, color: 'text-red-600' }
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {t(`contacts.status.${status}`)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>{t('common.loading')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !contact) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={() => navigate.toList()} className="mt-4">
                {t('common.back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate.toList()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? t('contacts.editContact') : t('contacts.newContact')}
            </h1>
            {contact && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground font-mono text-sm">
                  ID: {contact.id.slice(0, 8)}
                </span>
                {getStatusBadge(contact.status)}
              </div>
            )}
          </div>
        </div>

        {isReadOnly && (
          <div className="text-sm text-muted-foreground">
            {t('contacts.readOnlyMessage')}
          </div>
        )}
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-8 w-full">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                {legalType === 'individual' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                {t('contacts.tabs.basic')}
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('contacts.tabs.contact')}
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t('contacts.tabs.financial')}
              </TabsTrigger>
              {(contactType === 'supplier' || contactType === 'both') && (
                <TabsTrigger value="commercial" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('contacts.tabs.commercial')}
                </TabsTrigger>
              )}
              <TabsTrigger value="loading" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                {t('contacts.tabs.loading')}
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('contacts.tabs.contacts')}
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('contacts.tabs.documents')}
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {legalType === 'individual' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                    {t('contacts.sections.basicInfo')}
                  </CardTitle>
                  <CardDescription>
                    {t('contacts.sections.basicInfoDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <BasicInfoForm form={form} isReadOnly={isReadOnly} />

                  <Separator />

                  {legalType === 'individual' ? (
                    <IndividualInfoForm form={form} isReadOnly={isReadOnly} />
                  ) : (
                    <LegalEntityInfoForm form={form} isReadOnly={isReadOnly} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('contacts.sections.contactInfo')}
                  </CardTitle>
                  <CardDescription>
                    {t('contacts.sections.contactInfoDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>{t('contacts.fields.street')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isReadOnly}
                              placeholder={t('contacts.placeholders.street')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contacts.fields.city')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isReadOnly}
                              placeholder={t('contacts.placeholders.city')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="county"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contacts.fields.county')}</FormLabel>
                          <Select disabled={isReadOnly} onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('contacts.placeholders.county')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* Romanian counties */}
                              <SelectItem value="AB">Alba</SelectItem>
                              <SelectItem value="AR">Arad</SelectItem>
                              <SelectItem value="AG">Argeș</SelectItem>
                              <SelectItem value="BC">Bacău</SelectItem>
                              <SelectItem value="BH">Bihor</SelectItem>
                              <SelectItem value="BN">Bistrița-Năsăud</SelectItem>
                              <SelectItem value="BT">Botoșani</SelectItem>
                              <SelectItem value="BV">Brașov</SelectItem>
                              <SelectItem value="BR">Brăila</SelectItem>
                              <SelectItem value="BZ">Buzău</SelectItem>
                              <SelectItem value="CS">Caraș-Severin</SelectItem>
                              <SelectItem value="CL">Călărași</SelectItem>
                              <SelectItem value="CJ">Cluj</SelectItem>
                              <SelectItem value="CT">Constanța</SelectItem>
                              <SelectItem value="CV">Covasna</SelectItem>
                              <SelectItem value="DB">Dâmbovița</SelectItem>
                              <SelectItem value="DJ">Dolj</SelectItem>
                              <SelectItem value="GL">Galați</SelectItem>
                              <SelectItem value="GR">Giurgiu</SelectItem>
                              <SelectItem value="GJ">Gorj</SelectItem>
                              <SelectItem value="HR">Harghita</SelectItem>
                              <SelectItem value="HD">Hunedoara</SelectItem>
                              <SelectItem value="IL">Ialomița</SelectItem>
                              <SelectItem value="IS">Iași</SelectItem>
                              <SelectItem value="IF">Ilfov</SelectItem>
                              <SelectItem value="MM">Maramureș</SelectItem>
                              <SelectItem value="MH">Mehedinți</SelectItem>
                              <SelectItem value="MS">Mureș</SelectItem>
                              <SelectItem value="NT">Neamț</SelectItem>
                              <SelectItem value="OT">Olt</SelectItem>
                              <SelectItem value="PH">Prahova</SelectItem>
                              <SelectItem value="SM">Satu Mare</SelectItem>
                              <SelectItem value="SJ">Sălaj</SelectItem>
                              <SelectItem value="SB">Sibiu</SelectItem>
                              <SelectItem value="SV">Suceava</SelectItem>
                              <SelectItem value="TR">Teleorman</SelectItem>
                              <SelectItem value="TM">Timiș</SelectItem>
                              <SelectItem value="TL">Tulcea</SelectItem>
                              <SelectItem value="VS">Vaslui</SelectItem>
                              <SelectItem value="VL">Vâlcea</SelectItem>
                              <SelectItem value="VN">Vrancea</SelectItem>
                              <SelectItem value="B">București</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contacts.fields.postalCode')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isReadOnly}
                              placeholder={t('contacts.placeholders.postalCode')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contacts.fields.country')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isReadOnly}
                              placeholder={t('contacts.placeholders.country')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contacts.fields.phone')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isReadOnly}
                              placeholder={t('contacts.placeholders.phone')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contacts.fields.email')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              disabled={isReadOnly}
                              placeholder={t('contacts.placeholders.email')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Information Tab */}
            <TabsContent value="financial">
              <FinancialInfoForm
                form={form}
                isReadOnly={isReadOnly}
                contact={contact}
                legalType={legalType}
              />
            </TabsContent>

            {/* Commercial Information Tab */}
            {(contactType === 'supplier' || contactType === 'both') && (
              <TabsContent value="commercial">
                <CommercialInfoForm
                  form={form}
                  isReadOnly={isReadOnly}
                  contactType={contactType}
                />
              </TabsContent>
            )}

            {/* Loading Addresses Tab */}
            <TabsContent value="loading">
              <LoadingAddressesForm
                contact={contact}
                isReadOnly={isReadOnly}
              />
            </TabsContent>

            {/* Associated Contacts Tab */}
            <TabsContent value="contacts">
              <AssociatedContactsForm
                contact={contact}
                isReadOnly={isReadOnly}
              />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <DocumentUploadForm
                contact={contact}
                isReadOnly={isReadOnly}
              />
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          {!isReadOnly && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {t('contacts.formActions.description')}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate.toList()}
                    >
                      {t('common.cancel')}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.handleSubmit((data) => onSubmit(data, 'draft'))()}
                      disabled={saving || submitting}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {t('contacts.formActions.saveDraft')}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => form.handleSubmit((data) => onSubmit(data, 'submit'))()}
                      disabled={saving || submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {t('contacts.formActions.submitForValidation')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  )
}

export default ContactForm