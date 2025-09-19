import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { SupplierService, type CreateSupplierData } from '@/services/supplier-service'
import { Building2, Loader2, Check } from 'lucide-react'

interface SupplierRegistrationFormProps {
  onSuccess?: (supplierId: string) => void
  onSaveDraft?: (supplierId: string) => void
}

const GRAIN_TYPES = [
  'wheat',
  'corn',
  'barley',
  'oats',
  'rye',
  'sunflower',
  'soybean',
  'rapeseed',
] as const

const ROMANIAN_COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov',
  'Brăila', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța', 'Covasna',
  'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
  'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț',
  'Olt', 'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman',
  'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea', 'București'
]

export const SupplierRegistrationForm = ({ onSuccess, onSaveDraft }: SupplierRegistrationFormProps) => {
  const { t } = useTranslation(['common', 'forms'])
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    // Basic Information
    business_name: '',
    business_type: 'PF' as 'PF' | 'PJ',
    contact_person: '',
    email: '',
    phone: '',
    alternative_phone: '',

    // Address Information
    address: '',
    city: '',
    county: '',
    postal_code: '',
    country: 'Romania',

    // Business Information
    grain_types: [] as string[],
    estimated_volume: '',
    bank_account: '',
    cui: '',
    onrc_number: '',
    apia_id: '',

    // Internal fields
    language_preference: 'ro' as 'en' | 'ro',
    registration_status: 'draft' as const,
  })

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSelectChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGrainTypesChange = (grainType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      grain_types: checked
        ? [...prev.grain_types, grainType]
        : prev.grain_types.filter(type => type !== grainType)
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.business_name && formData.contact_person && formData.email && formData.phone)
      case 2:
        return !!(formData.address && formData.city && formData.county)
      case 3:
        return formData.grain_types.length > 0
      default:
        return true
    }
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
      setError('')
    } else {
      setError(t('forms:errors.required_fields'))
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSaveDraft = async () => {
    setIsLoading(true)
    setError('')

    try {
      const supplierData: Omit<CreateSupplierData, 'user_id'> = {
        ...formData,
        estimated_volume: formData.estimated_volume ? parseInt(formData.estimated_volume) : undefined,
        registration_status: 'draft',
      }

      const result = await SupplierService.create(supplierData)
      setSuccess(t('forms:supplier.draft_saved'))
      onSaveDraft?.(result.id)
    } catch (err: any) {
      setError(err.message || t('forms:errors.save_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError(t('forms:errors.required_fields'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const supplierData: Omit<CreateSupplierData, 'user_id'> = {
        ...formData,
        estimated_volume: formData.estimated_volume ? parseInt(formData.estimated_volume) : undefined,
        registration_status: 'submitted',
      }

      const result = await SupplierService.create(supplierData)
      setSuccess(t('forms:supplier.submitted_success'))
      onSuccess?.(result.id)
    } catch (err: any) {
      setError(err.message || t('forms:errors.submit_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (currentStep / 3) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {t('forms:supplier.title')}
        </CardTitle>
        <CardDescription>
          {t('forms:supplier.description')}
        </CardDescription>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('forms:supplier.progress')}</span>
            <span>{currentStep}/3</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('forms:supplier.steps.basic_info')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">{t('forms:supplier.fields.businessName')} *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange('business_name')}
                  placeholder={t('forms:supplier.placeholders.businessName')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type">{t('forms:supplier.fields.businessType')} *</Label>
                <Select onValueChange={handleSelectChange('business_type')} defaultValue={formData.business_type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">{t('forms:supplier.businessTypes.PF')}</SelectItem>
                    <SelectItem value="PJ">{t('forms:supplier.businessTypes.PJ')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">{t('forms:supplier.fields.contactPerson')} *</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange('contact_person')}
                  placeholder={t('forms:supplier.placeholders.contactPerson')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('forms:supplier.fields.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder={t('forms:supplier.placeholders.email')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('forms:supplier.fields.phone')} *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder={t('forms:supplier.placeholders.phone')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternative_phone">{t('forms:supplier.fields.alternativePhone')}</Label>
                <Input
                  id="alternative_phone"
                  value={formData.alternative_phone}
                  onChange={handleInputChange('alternative_phone')}
                  placeholder={t('forms:supplier.placeholders.alternativePhone')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('forms:supplier.steps.address_info')}</h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">{t('forms:supplier.fields.address')} *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  placeholder={t('forms:supplier.placeholders.address')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('forms:supplier.fields.city')} *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange('city')}
                    placeholder={t('forms:supplier.placeholders.city')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">{t('forms:supplier.fields.county')} *</Label>
                  <Select onValueChange={handleSelectChange('county')} value={formData.county}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('forms:supplier.placeholders.county')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ROMANIAN_COUNTIES.map(county => (
                        <SelectItem key={county} value={county}>{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">{t('forms:supplier.fields.postalCode')}</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange('postal_code')}
                    placeholder={t('forms:supplier.placeholders.postalCode')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Business Information */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('forms:supplier.steps.business_info')}</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('forms:supplier.fields.grainTypes')} *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {GRAIN_TYPES.map(grain => (
                    <label key={grain} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.grain_types.includes(grain)}
                        onChange={(e) => handleGrainTypesChange(grain, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">{t(`forms:supplier.grainTypes.${grain}`)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated_volume">{t('forms:supplier.fields.estimatedVolume')}</Label>
                  <Input
                    id="estimated_volume"
                    type="number"
                    value={formData.estimated_volume}
                    onChange={handleInputChange('estimated_volume')}
                    placeholder={t('forms:supplier.placeholders.estimatedVolume')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_account">{t('forms:supplier.fields.bankAccount')}</Label>
                  <Input
                    id="bank_account"
                    value={formData.bank_account}
                    onChange={handleInputChange('bank_account')}
                    placeholder={t('forms:supplier.placeholders.bankAccount')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cui">{t('forms:supplier.fields.cui')}</Label>
                  <Input
                    id="cui"
                    value={formData.cui}
                    onChange={handleInputChange('cui')}
                    placeholder={t('forms:supplier.placeholders.cui')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apia_id">{t('forms:supplier.fields.apiaId')}</Label>
                  <Input
                    id="apia_id"
                    value={formData.apia_id}
                    onChange={handleInputChange('apia_id')}
                    placeholder={t('forms:supplier.placeholders.apiaId')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevStep} disabled={isLoading}>
                {t('common:buttons.previous')}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t('common:buttons.save_draft')}
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNextStep} disabled={isLoading}>
                {t('common:buttons.next')}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t('common:buttons.submit')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}