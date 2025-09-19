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
import { DocumentUpload } from '@/components/upload/DocumentUpload'
import {
  UserCheck,
  MapPin,
  Building2,
  Wheat,
  Camera,
  Send,
  Save,
  Loader2,
  Check,
  Phone,
  Mail,
  Share
} from 'lucide-react'

interface FarmerProfilingFormProps {
  onSuccess?: (farmerId: string) => void
  onSaveDraft?: (farmerId: string) => void
  mode?: 'field_visit' | 'office'
}

const GRAIN_TYPES = [
  'wheat', 'corn', 'barley', 'oats', 'rye', 'sunflower', 'soybean', 'rapeseed'
] as const

const ROMANIAN_COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov',
  'Brăila', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța', 'Covasna',
  'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
  'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț',
  'Olt', 'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman',
  'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea', 'București'
]

export const FarmerProfilingForm = ({ onSuccess, onSaveDraft, mode = 'field_visit' }: FarmerProfilingFormProps) => {
  const { t } = useTranslation(['common', 'forms', 'agent'])
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentFarmerId, setCurrentFarmerId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Visit Information
    visit_date: new Date().toISOString().split('T')[0],
    visit_notes: '',
    follow_up_required: false,

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

    // Agricultural Information
    grain_types: [] as string[],
    estimated_volume: '',
    farm_size_hectares: '',
    farming_experience_years: '',

    // Business Information
    bank_account: '',
    cui: '',
    onrc_number: '',
    apia_id: '',

    // Agent Assessment
    farmer_interest_level: 'medium' as 'low' | 'medium' | 'high',
    competitive_assessment: 'medium' as 'low' | 'medium' | 'high',
    recommended_priority: 'medium' as 'low' | 'medium' | 'high',
    agent_notes: '',

    // Registration Method
    registration_method: 'agent_direct' as 'agent_direct' | 'invitation_link',
    invitation_preference: 'email' as 'email' | 'whatsapp' | 'phone',

    // Internal fields
    language_preference: 'ro' as 'en' | 'ro',
    registration_status: 'draft' as const,
    created_by_agent: true,
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
        return !!(formData.business_name && formData.contact_person && formData.phone)
      case 2:
        return !!(formData.address && formData.city && formData.county)
      case 3:
        return formData.grain_types.length > 0
      case 4:
        return !!(formData.agent_notes && formData.registration_method)
      default:
        return true
    }
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
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
      // TODO: Implement actual API call
      console.log('Saving draft farmer profile:', formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const farmerId = 'farmer-' + Date.now()
      setCurrentFarmerId(farmerId)
      setSuccess(t('agent:profiling.draft_saved'))
      onSaveDraft?.(farmerId)
    } catch (err: any) {
      setError(err.message || t('forms:errors.save_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError(t('forms:errors.required_fields'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // TODO: Implement actual API call
      console.log('Submitting farmer profile:', formData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const farmerId = currentFarmerId || 'farmer-' + Date.now()
      setSuccess(t('agent:profiling.submitted_success'))
      onSuccess?.(farmerId)
    } catch (err: any) {
      setError(err.message || t('forms:errors.submit_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const sendInvitationLink = async () => {
    if (!currentFarmerId) {
      setError(t('agent:profiling.save_first'))
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement invitation sending
      console.log('Sending invitation via:', formData.invitation_preference)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(t('agent:profiling.invitation_sent'))
    } catch (err: any) {
      setError(err.message || t('agent:profiling.invitation_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (currentStep / 4) * 100

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          {mode === 'field_visit'
            ? t('agent:profiling.field_visit_title')
            : t('agent:profiling.office_title')
          }
        </CardTitle>
        <CardDescription>
          {t('agent:profiling.description')}
        </CardDescription>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('agent:profiling.progress')}</span>
            <span>{currentStep}/4</span>
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
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('agent:profiling.steps.basic_info')}
            </h3>

            {mode === 'field_visit' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                  <MapPin className="h-4 w-4" />
                  {t('agent:profiling.visit_info')}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visit_date">{t('agent:profiling.visit_date')}</Label>
                    <Input
                      id="visit_date"
                      type="date"
                      value={formData.visit_date}
                      onChange={handleInputChange('visit_date')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visit_notes">{t('agent:profiling.visit_notes')}</Label>
                    <Textarea
                      id="visit_notes"
                      value={formData.visit_notes}
                      onChange={handleInputChange('visit_notes')}
                      placeholder={t('agent:profiling.visit_notes_placeholder')}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

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
                <Label htmlFor="email">{t('forms:supplier.fields.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder={t('forms:supplier.placeholders.email')}
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

        {/* Step 2: Location Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('agent:profiling.steps.location_info')}
            </h3>

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

        {/* Step 3: Agricultural Information */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Wheat className="h-5 w-5" />
              {t('agent:profiling.steps.agricultural_info')}
            </h3>

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="farm_size_hectares">{t('agent:profiling.farm_size_hectares')}</Label>
                  <Input
                    id="farm_size_hectares"
                    type="number"
                    value={formData.farm_size_hectares}
                    onChange={handleInputChange('farm_size_hectares')}
                    placeholder={t('agent:profiling.farm_size_placeholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farming_experience_years">{t('agent:profiling.farming_experience')}</Label>
                  <Input
                    id="farming_experience_years"
                    type="number"
                    value={formData.farming_experience_years}
                    onChange={handleInputChange('farming_experience_years')}
                    placeholder={t('agent:profiling.experience_placeholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Agent Assessment & Registration Method */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('agent:profiling.steps.assessment')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmer_interest_level">{t('agent:profiling.farmer_interest')}</Label>
                <Select onValueChange={handleSelectChange('farmer_interest_level')} value={formData.farmer_interest_level}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('agent:assessment.low')}</SelectItem>
                    <SelectItem value="medium">{t('agent:assessment.medium')}</SelectItem>
                    <SelectItem value="high">{t('agent:assessment.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitive_assessment">{t('agent:profiling.competitive_assessment')}</Label>
                <Select onValueChange={handleSelectChange('competitive_assessment')} value={formData.competitive_assessment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('agent:assessment.low')}</SelectItem>
                    <SelectItem value="medium">{t('agent:assessment.medium')}</SelectItem>
                    <SelectItem value="high">{t('agent:assessment.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommended_priority">{t('agent:profiling.recommended_priority')}</Label>
                <Select onValueChange={handleSelectChange('recommended_priority')} value={formData.recommended_priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('agent:assessment.low')}</SelectItem>
                    <SelectItem value="medium">{t('agent:assessment.medium')}</SelectItem>
                    <SelectItem value="high">{t('agent:assessment.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent_notes">{t('agent:profiling.agent_notes')} *</Label>
              <Textarea
                id="agent_notes"
                value={formData.agent_notes}
                onChange={handleInputChange('agent_notes')}
                placeholder={t('agent:profiling.agent_notes_placeholder')}
                rows={3}
                required
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">{t('agent:profiling.registration_method_title')}</h4>

              <div className="space-y-2">
                <Label>{t('agent:profiling.registration_method')} *</Label>
                <Select onValueChange={handleSelectChange('registration_method')} value={formData.registration_method}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent_direct">{t('agent:profiling.agent_direct')}</SelectItem>
                    <SelectItem value="invitation_link">{t('agent:profiling.invitation_link')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.registration_method === 'invitation_link' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('agent:profiling.invitation_preference')}</Label>
                    <Select onValueChange={handleSelectChange('invitation_preference')} value={formData.invitation_preference}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </div>
                        </SelectItem>
                        <SelectItem value="whatsapp">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            WhatsApp
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {t('agent:profiling.phone_call')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentFarmerId && (
                    <Button
                      variant="outline"
                      onClick={sendInvitationLink}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <Share className="h-4 w-4" />
                      {t('agent:profiling.send_invitation')}
                    </Button>
                  )}
                </div>
              )}
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
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t('common:buttons.save_draft')}
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNextStep} disabled={isLoading}>
                {t('common:buttons.next')}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {formData.registration_method === 'agent_direct'
                  ? t('agent:profiling.complete_registration')
                  : t('agent:profiling.save_and_invite')
                }
              </Button>
            )}
          </div>
        </div>

        {/* Document Upload Section */}
        {currentFarmerId && formData.registration_method === 'agent_direct' && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {t('agent:profiling.document_upload')}
            </h4>
            <DocumentUpload
              supplierId={currentFarmerId}
              onUploadSuccess={(documentId) => {
                console.log('Document uploaded:', documentId)
              }}
              maxFiles={10}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}