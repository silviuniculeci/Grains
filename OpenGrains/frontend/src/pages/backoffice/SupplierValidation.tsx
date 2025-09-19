import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  User,
  MapPin,
  Building2,
  Search,
  Filter,
  MessageSquare,
  Download,
  Brain,
  Loader2
} from 'lucide-react'

interface SupplierProfile {
  id: string
  business_name: string
  contact_person: string
  email: string
  phone: string
  city: string
  county: string
  business_type: 'PF' | 'PJ'
  grain_types: string[]
  estimated_volume?: number
  registration_status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  validation_status: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
  created_at: string
  assigned_agent?: string
  agent_notes?: string
  farmer_interest_level?: 'low' | 'medium' | 'high'
  documents_count: number
  ocr_processed_count: number
}

interface Document {
  id: string
  document_type: string
  filename: string
  upload_status: string
  validation_status: 'not_reviewed' | 'under_review' | 'approved' | 'rejected'
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed'
  ocr_confidence?: number
  uploaded_at: string
}

interface ValidationDecision {
  decision: 'approve' | 'reject' | 'request_changes'
  notes: string
  required_changes?: string[]
  priority_level?: 'low' | 'medium' | 'high'
}

export const SupplierValidation = () => {
  const { t } = useTranslation(['common', 'backoffice'])
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierProfile | null>(null)
  const [supplierDocuments, setSupplierDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [validationDecision, setValidationDecision] = useState<ValidationDecision>({
    decision: 'approve',
    notes: '',
    required_changes: [],
    priority_level: 'medium'
  })
  const [showValidationDialog, setShowValidationDialog] = useState(false)

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // Mock data for now
      const mockSuppliers: SupplierProfile[] = [
        {
          id: '1',
          business_name: 'Ferma Popescu SRL',
          contact_person: 'Ion Popescu',
          email: 'ion.popescu@email.com',
          phone: '+40 765 432 109',
          city: 'Cluj-Napoca',
          county: 'Cluj',
          business_type: 'PJ',
          grain_types: ['wheat', 'corn'],
          estimated_volume: 500,
          registration_status: 'submitted',
          validation_status: 'not_reviewed',
          created_at: '2024-01-15T10:30:00Z',
          assigned_agent: 'Agent Ana Popescu',
          agent_notes: 'Fermier foarte interesat, ferma mare, echipamente moderne.',
          farmer_interest_level: 'high',
          documents_count: 4,
          ocr_processed_count: 3
        },
        {
          id: '2',
          business_name: 'Gheorghe Ionescu PF',
          contact_person: 'Gheorghe Ionescu',
          email: 'gheorghe.ionescu@email.com',
          phone: '+40 765 432 108',
          city: 'Dej',
          county: 'Cluj',
          business_type: 'PF',
          grain_types: ['barley', 'oats'],
          estimated_volume: 200,
          registration_status: 'submitted',
          validation_status: 'under_review',
          created_at: '2024-01-18T14:15:00Z',
          assigned_agent: 'Agent Maria Ionescu',
          documents_count: 2,
          ocr_processed_count: 2
        }
      ]
      setSuppliers(mockSuppliers)
    } catch (error) {
      console.error('Failed to load suppliers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSupplierDocuments = async (supplierId: string) => {
    try {
      // TODO: Replace with actual API call
      const mockDocuments: Document[] = [
        {
          id: '1',
          document_type: 'onrc_certificate',
          filename: 'certificat_onrc.pdf',
          upload_status: 'completed',
          validation_status: 'not_reviewed',
          ocr_status: 'completed',
          ocr_confidence: 0.92,
          uploaded_at: '2024-01-15T11:00:00Z'
        },
        {
          id: '2',
          document_type: 'farmer_id_card',
          filename: 'card_fermier.jpg',
          upload_status: 'completed',
          validation_status: 'not_reviewed',
          ocr_status: 'completed',
          ocr_confidence: 0.88,
          uploaded_at: '2024-01-15T11:05:00Z'
        }
      ]
      setSupplierDocuments(mockDocuments)
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch =
      supplier.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || supplier.validation_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getValidationStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{t('backoffice:status.approved')}</Badge>
      case 'under_review':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t('backoffice:status.under_review')}</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t('backoffice:status.rejected')}</Badge>
      default:
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />{t('backoffice:status.not_reviewed')}</Badge>
    }
  }

  const getInterestLevelBadge = (level?: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="default" className="bg-green-500">{t('backoffice:interest.high')}</Badge>
      case 'medium':
        return <Badge variant="secondary">{t('backoffice:interest.medium')}</Badge>
      case 'low':
        return <Badge variant="outline">{t('backoffice:interest.low')}</Badge>
      default:
        return null
    }
  }

  const getOCRConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null

    const percentage = Math.round(confidence * 100)
    const variant = confidence >= 0.9 ? 'default' : confidence >= 0.7 ? 'secondary' : 'destructive'

    return <Badge variant={variant}>{percentage}% OCR</Badge>
  }

  const handleSupplierSelect = (supplier: SupplierProfile) => {
    setSelectedSupplier(supplier)
    loadSupplierDocuments(supplier.id)
  }

  const handleValidationSubmit = async () => {
    if (!selectedSupplier) return

    setIsLoading(true)
    try {
      // TODO: Implement actual API call
      console.log('Submitting validation decision:', validationDecision)

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update supplier status
      setSuppliers(prev => prev.map(supplier =>
        supplier.id === selectedSupplier.id
          ? { ...supplier, validation_status: validationDecision.decision === 'approve' ? 'approved' : 'rejected' }
          : supplier
      ))

      setShowValidationDialog(false)
      setValidationDecision({ decision: 'approve', notes: '', required_changes: [], priority_level: 'medium' })
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('backoffice:validation.title')}</h1>
          <p className="text-muted-foreground">{t('backoffice:validation.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('backoffice:validation.pending_suppliers')}</CardTitle>
              <CardDescription>{t('backoffice:validation.pending_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="space-y-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('backoffice:search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('backoffice:filters.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('backoffice:filters.all_status')}</SelectItem>
                    <SelectItem value="not_reviewed">{t('backoffice:status.not_reviewed')}</SelectItem>
                    <SelectItem value="under_review">{t('backoffice:status.under_review')}</SelectItem>
                    <SelectItem value="approved">{t('backoffice:status.approved')}</SelectItem>
                    <SelectItem value="rejected">{t('backoffice:status.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Suppliers List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedSupplier?.id === supplier.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSupplierSelect(supplier)}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm">{supplier.business_name}</h3>
                        {getValidationStatusBadge(supplier.validation_status)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          {supplier.contact_person}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {supplier.city}, {supplier.county}
                        </div>
                        <div className="flex items-center gap-2 justify-between">
                          <span>{supplier.documents_count} docs</span>
                          {getInterestLevelBadge(supplier.farmer_interest_level)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredSuppliers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t('backoffice:validation.no_suppliers')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Supplier Details */}
        <div className="lg:col-span-2">
          {selectedSupplier ? (
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList>
                <TabsTrigger value="profile">{t('backoffice:tabs.profile')}</TabsTrigger>
                <TabsTrigger value="documents">{t('backoffice:tabs.documents')}</TabsTrigger>
                <TabsTrigger value="history">{t('backoffice:tabs.history')}</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {selectedSupplier.business_name}
                        </CardTitle>
                        <CardDescription>
                          {t('backoffice:validation.created_on')} {new Date(selectedSupplier.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getValidationStatusBadge(selectedSupplier.validation_status)}
                        {getInterestLevelBadge(selectedSupplier.farmer_interest_level)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h4 className="font-medium mb-3">{t('backoffice:sections.contact_info')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">{t('backoffice:fields.contact_person')}</Label>
                          <div>{selectedSupplier.contact_person}</div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">{t('backoffice:fields.business_type')}</Label>
                          <div>{selectedSupplier.business_type}</div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">{t('backoffice:fields.email')}</Label>
                          <div>{selectedSupplier.email}</div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">{t('backoffice:fields.phone')}</Label>
                          <div>{selectedSupplier.phone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <h4 className="font-medium mb-3">{t('backoffice:sections.location')}</h4>
                      <div className="text-sm">
                        <Label className="text-muted-foreground">{t('backoffice:fields.address')}</Label>
                        <div>{selectedSupplier.city}, {selectedSupplier.county}</div>
                      </div>
                    </div>

                    {/* Agricultural Information */}
                    <div>
                      <h4 className="font-medium mb-3">{t('backoffice:sections.agricultural_info')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">{t('backoffice:fields.grain_types')}</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedSupplier.grain_types.map(grain => (
                              <Badge key={grain} variant="outline" className="text-xs">{grain}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">{t('backoffice:fields.estimated_volume')}</Label>
                          <div>{selectedSupplier.estimated_volume || 'N/A'} tone</div>
                        </div>
                      </div>
                    </div>

                    {/* Agent Notes */}
                    {selectedSupplier.agent_notes && (
                      <div>
                        <h4 className="font-medium mb-3">{t('backoffice:sections.agent_notes')}</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          {selectedSupplier.agent_notes}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {t('backoffice:fields.assigned_agent')}: {selectedSupplier.assigned_agent}
                        </div>
                      </div>
                    )}

                    {/* Validation Actions */}
                    {selectedSupplier.validation_status === 'not_reviewed' && (
                      <div className="border-t pt-4">
                        <div className="flex gap-2">
                          <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => setValidationDecision({ ...validationDecision, decision: 'approve' })}
                                className="gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                {t('backoffice:actions.approve')}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('backoffice:validation.confirm_title')}</DialogTitle>
                                <DialogDescription>
                                  {t('backoffice:validation.confirm_description')}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="decision">{t('backoffice:validation.decision')}</Label>
                                  <Select
                                    value={validationDecision.decision}
                                    onValueChange={(value: 'approve' | 'reject' | 'request_changes') =>
                                      setValidationDecision({ ...validationDecision, decision: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="approve">{t('backoffice:decisions.approve')}</SelectItem>
                                      <SelectItem value="reject">{t('backoffice:decisions.reject')}</SelectItem>
                                      <SelectItem value="request_changes">{t('backoffice:decisions.request_changes')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="notes">{t('backoffice:validation.notes')}</Label>
                                  <Textarea
                                    id="notes"
                                    value={validationDecision.notes}
                                    onChange={(e) => setValidationDecision({ ...validationDecision, notes: e.target.value })}
                                    placeholder={t('backoffice:validation.notes_placeholder')}
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
                                    {t('common:buttons.cancel')}
                                  </Button>
                                  <Button onClick={handleValidationSubmit} disabled={isLoading}>
                                    {isLoading ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {t('common:buttons.confirm')}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            onClick={() => {
                              setValidationDecision({ ...validationDecision, decision: 'reject' })
                              setShowValidationDialog(true)
                            }}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            {t('backoffice:actions.reject')}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => {
                              setValidationDecision({ ...validationDecision, decision: 'request_changes' })
                              setShowValidationDialog(true)
                            }}
                            className="gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            {t('backoffice:actions.request_changes')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('backoffice:documents.title')}</CardTitle>
                    <CardDescription>{t('backoffice:documents.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {supplierDocuments.map((document) => (
                        <div key={document.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <h4 className="font-medium">{document.filename}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {t(`documents:types.${document.document_type}`)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {getValidationStatusBadge(document.validation_status)}
                                {getOCRConfidenceBadge(document.ocr_confidence)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                {t('backoffice:actions.view')}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                {t('backoffice:actions.download')}
                              </Button>
                              {document.ocr_status === 'completed' && (
                                <Button variant="outline" size="sm">
                                  <Brain className="h-4 w-4 mr-1" />
                                  OCR
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {supplierDocuments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        {t('backoffice:documents.no_documents')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('backoffice:history.title')}</CardTitle>
                    <CardDescription>{t('backoffice:history.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      {t('backoffice:history.coming_soon')}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('backoffice:validation.select_supplier')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}