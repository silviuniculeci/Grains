import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Phone,
  Camera,
  FileText
} from 'lucide-react'

interface Visit {
  id: string
  farmer_id?: string
  farmer_name: string
  farmer_phone: string
  visit_date: string
  visit_time: string
  location: {
    address: string
    city: string
    county: string
    coordinates?: { lat: number; lng: number }
  }
  visit_type: 'initial_contact' | 'follow_up' | 'document_collection' | 'contract_signing' | 'other'
  visit_status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  visit_purpose: string
  visit_notes?: string
  visit_outcome?: string
  follow_up_required: boolean
  follow_up_date?: string
  follow_up_notes?: string
  photos_taken: number
  documents_collected: number
  farmer_interest_level?: 'low' | 'medium' | 'high'
  competitive_situation?: string
  recommended_next_steps?: string
  created_at: string
  updated_at: string
}

interface VisitTrackerProps {
  agentId?: string
  farmerId?: string
  mode?: 'dashboard' | 'farmer_detail'
}

export const VisitTracker = ({ agentId, farmerId, mode = 'dashboard' }: VisitTrackerProps) => {
  const { t } = useTranslation(['common', 'agent'])
  const [visits, setVisits] = useState<Visit[]>([])
  const [showNewVisitDialog, setShowNewVisitDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newVisit, setNewVisit] = useState<Partial<Visit>>({
    farmer_name: '',
    farmer_phone: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '10:00',
    location: {
      address: '',
      city: '',
      county: ''
    },
    visit_type: 'initial_contact',
    visit_status: 'planned',
    visit_purpose: '',
    follow_up_required: false,
    photos_taken: 0,
    documents_collected: 0
  })

  useEffect(() => {
    loadVisits()
  }, [agentId, farmerId])

  const loadVisits = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      const mockVisits: Visit[] = [
        {
          id: '1',
          farmer_id: 'farmer-1',
          farmer_name: 'Ion Popescu',
          farmer_phone: '+40 765 432 109',
          visit_date: '2024-01-15',
          visit_time: '10:00',
          location: {
            address: 'Str. Principală nr. 25',
            city: 'Cluj-Napoca',
            county: 'Cluj',
            coordinates: { lat: 46.7712, lng: 23.6236 }
          },
          visit_type: 'initial_contact',
          visit_status: 'completed',
          visit_purpose: 'Prezentare OpenGrains și evaluare fermă',
          visit_notes: 'Fermier foarte interesat. Ferma mare, echipamente moderne. Are deja contracte cu alți furnizori dar este deschis la colaborare.',
          visit_outcome: 'Pozitiv - dorește să afle mai multe despre prețuri și condiții',
          follow_up_required: true,
          follow_up_date: '2024-01-22',
          follow_up_notes: 'Să trimit oferta de preț și contractul',
          photos_taken: 5,
          documents_collected: 2,
          farmer_interest_level: 'high',
          competitive_situation: 'Lucrează cu Agricover și Ameropa',
          recommended_next_steps: 'Prezentare ofertă detaliată',
          created_at: '2024-01-15T08:30:00Z',
          updated_at: '2024-01-15T16:45:00Z'
        },
        {
          id: '2',
          farmer_name: 'Maria Ionescu',
          farmer_phone: '+40 765 432 108',
          visit_date: '2024-01-18',
          visit_time: '14:00',
          location: {
            address: 'Sat Gilău, nr. 15',
            city: 'Gilău',
            county: 'Cluj'
          },
          visit_type: 'follow_up',
          visit_status: 'planned',
          visit_purpose: 'Urmărire după prima vizită',
          follow_up_required: false,
          photos_taken: 0,
          documents_collected: 0,
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z'
        }
      ]

      setVisits(mockVisits)
    } catch (error) {
      console.error('Failed to load visits:', error)
      setError(t('agent:visits.load_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVisits = visits.filter(visit => {
    if (farmerId && visit.farmer_id !== farmerId) return false

    const matchesSearch =
      visit.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.farmer_phone.includes(searchTerm) ||
      visit.location.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || visit.visit_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{t('agent:visits.status.completed')}</Badge>
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />{t('agent:visits.status.in_progress')}</Badge>
      case 'planned':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t('agent:visits.status.planned')}</Badge>
      case 'cancelled':
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />{t('agent:visits.status.cancelled')}</Badge>
      case 'no_show':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />{t('agent:visits.status.no_show')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVisitTypeBadge = (type: string) => {
    const typeLabels = {
      'initial_contact': t('agent:visits.type.initial_contact'),
      'follow_up': t('agent:visits.type.follow_up'),
      'document_collection': t('agent:visits.type.document_collection'),
      'contract_signing': t('agent:visits.type.contract_signing'),
      'other': t('agent:visits.type.other')
    }

    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>
  }

  const getInterestLevelBadge = (level?: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="default" className="bg-green-500">{t('agent:visits.interest.high')}</Badge>
      case 'medium':
        return <Badge variant="secondary">{t('agent:visits.interest.medium')}</Badge>
      case 'low':
        return <Badge variant="outline">{t('agent:visits.interest.low')}</Badge>
      default:
        return null
    }
  }

  const handleCreateVisit = async () => {
    if (!newVisit.farmer_name || !newVisit.farmer_phone || !newVisit.visit_purpose) {
      setError(t('agent:visits.required_fields'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // TODO: Replace with actual API call
      console.log('Creating visit:', newVisit)

      await new Promise(resolve => setTimeout(resolve, 1000))

      const visit: Visit = {
        id: 'visit-' + Date.now(),
        ...newVisit,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Visit

      setVisits(prev => [visit, ...prev])
      setShowNewVisitDialog(false)
      setNewVisit({
        farmer_name: '',
        farmer_phone: '',
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: '10:00',
        location: { address: '', city: '', county: '' },
        visit_type: 'initial_contact',
        visit_status: 'planned',
        visit_purpose: '',
        follow_up_required: false,
        photos_taken: 0,
        documents_collected: 0
      })
      setSuccess(t('agent:visits.created_success'))
    } catch (err: any) {
      setError(err.message || t('agent:visits.create_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const updateVisitStatus = async (visitId: string, status: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Updating visit status:', visitId, status)

      setVisits(prev => prev.map(visit =>
        visit.id === visitId
          ? { ...visit, visit_status: status as any, updated_at: new Date().toISOString() }
          : visit
      ))

      setSuccess(t('agent:visits.status_updated'))
    } catch (error) {
      setError(t('agent:visits.update_failed'))
    }
  }

  const openDirections = (visit: Visit) => {
    const { address, city } = visit.location
    const query = encodeURIComponent(`${address}, ${city}`)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}`
    window.open(url, '_blank')
  }

  const callFarmer = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('agent:visits.title')}</h2>
          <p className="text-muted-foreground">{t('agent:visits.description')}</p>
        </div>
        <Dialog open={showNewVisitDialog} onOpenChange={setShowNewVisitDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('agent:visits.new_visit')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('agent:visits.create_visit')}</DialogTitle>
              <DialogDescription>{t('agent:visits.create_description')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Farmer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmer_name">{t('agent:visits.farmer_name')} *</Label>
                  <Input
                    id="farmer_name"
                    value={newVisit.farmer_name}
                    onChange={(e) => setNewVisit({ ...newVisit, farmer_name: e.target.value })}
                    placeholder={t('agent:visits.farmer_name_placeholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmer_phone">{t('agent:visits.farmer_phone')} *</Label>
                  <Input
                    id="farmer_phone"
                    value={newVisit.farmer_phone}
                    onChange={(e) => setNewVisit({ ...newVisit, farmer_phone: e.target.value })}
                    placeholder={t('agent:visits.farmer_phone_placeholder')}
                  />
                </div>
              </div>

              {/* Visit Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visit_date">{t('agent:visits.visit_date')} *</Label>
                  <Input
                    id="visit_date"
                    type="date"
                    value={newVisit.visit_date}
                    onChange={(e) => setNewVisit({ ...newVisit, visit_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visit_time">{t('agent:visits.visit_time')} *</Label>
                  <Input
                    id="visit_time"
                    type="time"
                    value={newVisit.visit_time}
                    onChange={(e) => setNewVisit({ ...newVisit, visit_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visit_type">{t('agent:visits.visit_type')} *</Label>
                  <Select
                    value={newVisit.visit_type}
                    onValueChange={(value) => setNewVisit({ ...newVisit, visit_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial_contact">{t('agent:visits.type.initial_contact')}</SelectItem>
                      <SelectItem value="follow_up">{t('agent:visits.type.follow_up')}</SelectItem>
                      <SelectItem value="document_collection">{t('agent:visits.type.document_collection')}</SelectItem>
                      <SelectItem value="contract_signing">{t('agent:visits.type.contract_signing')}</SelectItem>
                      <SelectItem value="other">{t('agent:visits.type.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="address">{t('agent:visits.address')}</Label>
                <Input
                  id="address"
                  value={newVisit.location?.address}
                  onChange={(e) => setNewVisit({
                    ...newVisit,
                    location: { ...newVisit.location!, address: e.target.value }
                  })}
                  placeholder={t('agent:visits.address_placeholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('agent:visits.city')}</Label>
                  <Input
                    id="city"
                    value={newVisit.location?.city}
                    onChange={(e) => setNewVisit({
                      ...newVisit,
                      location: { ...newVisit.location!, city: e.target.value }
                    })}
                    placeholder={t('agent:visits.city_placeholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">{t('agent:visits.county')}</Label>
                  <Input
                    id="county"
                    value={newVisit.location?.county}
                    onChange={(e) => setNewVisit({
                      ...newVisit,
                      location: { ...newVisit.location!, county: e.target.value }
                    })}
                    placeholder={t('agent:visits.county_placeholder')}
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="visit_purpose">{t('agent:visits.visit_purpose')} *</Label>
                <Textarea
                  id="visit_purpose"
                  value={newVisit.visit_purpose}
                  onChange={(e) => setNewVisit({ ...newVisit, visit_purpose: e.target.value })}
                  placeholder={t('agent:visits.purpose_placeholder')}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewVisitDialog(false)}>
                  {t('common:buttons.cancel')}
                </Button>
                <Button onClick={handleCreateVisit} disabled={isLoading}>
                  {t('common:buttons.create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      {mode === 'dashboard' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('agent:visits.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder={t('agent:visits.filter_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('agent:visits.all_status')}</SelectItem>
                  <SelectItem value="planned">{t('agent:visits.status.planned')}</SelectItem>
                  <SelectItem value="in_progress">{t('agent:visits.status.in_progress')}</SelectItem>
                  <SelectItem value="completed">{t('agent:visits.status.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('agent:visits.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visits List */}
      <div className="space-y-4">
        {filteredVisits.map((visit) => (
          <Card key={visit.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{visit.farmer_name}</h3>
                      {getStatusBadge(visit.visit_status)}
                      {getVisitTypeBadge(visit.visit_type)}
                      {getInterestLevelBadge(visit.farmer_interest_level)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(visit.visit_date).toLocaleDateString('ro-RO')} la {visit.visit_time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {visit.location.address}, {visit.location.city}, {visit.location.county}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {visit.visit_status === 'planned' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateVisitStatus(visit.id, 'in_progress')}
                      >
                        {t('agent:visits.start_visit')}
                      </Button>
                    )}
                    {visit.visit_status === 'in_progress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateVisitStatus(visit.id, 'completed')}
                      >
                        {t('agent:visits.complete_visit')}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openDirections(visit)}>
                      <Navigation className="w-4 h-4 mr-1" />
                      {t('agent:visits.directions')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => callFarmer(visit.farmer_phone)}>
                      <Phone className="w-4 h-4 mr-1" />
                      {t('agent:visits.call')}
                    </Button>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <Label className="text-sm font-medium">{t('agent:visits.purpose')}</Label>
                  <p className="text-sm text-muted-foreground">{visit.visit_purpose}</p>
                </div>

                {/* Visit Notes */}
                {visit.visit_notes && (
                  <div>
                    <Label className="text-sm font-medium">{t('agent:visits.notes')}</Label>
                    <p className="text-sm text-muted-foreground">{visit.visit_notes}</p>
                  </div>
                )}

                {/* Visit Outcome */}
                {visit.visit_outcome && (
                  <div>
                    <Label className="text-sm font-medium">{t('agent:visits.outcome')}</Label>
                    <p className="text-sm text-muted-foreground">{visit.visit_outcome}</p>
                  </div>
                )}

                {/* Visit Stats */}
                {visit.visit_status === 'completed' && (
                  <div className="flex gap-4 text-sm">
                    {visit.photos_taken > 0 && (
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        {visit.photos_taken} {t('agent:visits.photos')}
                      </div>
                    )}
                    {visit.documents_collected > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {visit.documents_collected} {t('agent:visits.documents')}
                      </div>
                    )}
                  </div>
                )}

                {/* Follow-up */}
                {visit.follow_up_required && visit.follow_up_date && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800 font-medium mb-1">
                      <Clock className="w-4 h-4" />
                      {t('agent:visits.follow_up_required')}
                    </div>
                    <div className="text-sm text-yellow-700">
                      <strong>{t('agent:visits.follow_up_date')}:</strong> {new Date(visit.follow_up_date).toLocaleDateString('ro-RO')}
                    </div>
                    {visit.follow_up_notes && (
                      <div className="text-sm text-yellow-700 mt-1">
                        <strong>{t('agent:visits.follow_up_notes')}:</strong> {visit.follow_up_notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Competitive Situation */}
                {visit.competitive_situation && (
                  <div>
                    <Label className="text-sm font-medium">{t('agent:visits.competitive_situation')}</Label>
                    <p className="text-sm text-muted-foreground">{visit.competitive_situation}</p>
                  </div>
                )}

                {/* Recommended Next Steps */}
                {visit.recommended_next_steps && (
                  <div>
                    <Label className="text-sm font-medium">{t('agent:visits.recommended_next_steps')}</Label>
                    <p className="text-sm text-muted-foreground">{visit.recommended_next_steps}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVisits.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('agent:visits.no_visits')}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}