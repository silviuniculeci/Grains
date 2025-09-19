import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Users, MapPin, Plus, Search, Filter, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface Farmer {
  id: string
  business_name: string
  contact_person: string
  phone: string
  city: string
  county: string
  registration_status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  created_at: string
  last_contact?: string
  assigned_agent: string
  grain_types: string[]
  estimated_volume?: number
}

interface AgentStats {
  totalFarmers: number
  activeFarmers: number
  pendingValidation: number
  thisMonthRegistrations: number
  targetProgress: number
}

export const AgentDashboard = () => {
  const { t } = useTranslation(['common', 'agent'])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [stats, setStats] = useState<AgentStats>({
    totalFarmers: 0,
    activeFarmers: 0,
    pendingValidation: 0,
    thisMonthRegistrations: 0,
    targetProgress: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [countyFilter, setCountyFilter] = useState<string>('all')

  useEffect(() => {
    loadAgentData()
  }, [])

  const loadAgentData = async () => {
    // TODO: Replace with actual API calls
    // Mock data for now
    setStats({
      totalFarmers: 45,
      activeFarmers: 32,
      pendingValidation: 8,
      thisMonthRegistrations: 12,
      targetProgress: 67
    })

    setFarmers([
      {
        id: '1',
        business_name: 'Ferma Popescu SRL',
        contact_person: 'Ion Popescu',
        phone: '+40 765 432 109',
        city: 'Cluj-Napoca',
        county: 'Cluj',
        registration_status: 'approved',
        created_at: '2024-01-15',
        last_contact: '2024-01-20',
        assigned_agent: 'current-agent',
        grain_types: ['wheat', 'corn'],
        estimated_volume: 500
      },
      {
        id: '2',
        business_name: 'Gheorghe Ionescu PF',
        contact_person: 'Gheorghe Ionescu',
        phone: '+40 765 432 108',
        city: 'Dej',
        county: 'Cluj',
        registration_status: 'under_review',
        created_at: '2024-01-18',
        assigned_agent: 'current-agent',
        grain_types: ['barley', 'oats'],
        estimated_volume: 200
      }
    ])
  }

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch =
      farmer.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.phone.includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || farmer.registration_status === statusFilter
    const matchesCounty = countyFilter === 'all' || farmer.county === countyFilter

    return matchesSearch && matchesStatus && matchesCounty
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{t('agent:status.approved')}</Badge>
      case 'under_review':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t('agent:status.under_review')}</Badge>
      case 'submitted':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />{t('agent:status.submitted')}</Badge>
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />{t('agent:status.rejected')}</Badge>
      default:
        return <Badge variant="secondary">{t('agent:status.draft')}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('agent:dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('agent:dashboard.subtitle')}</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t('agent:actions.new_farmer')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('agent:stats.total_farmers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFarmers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('agent:stats.active_farmers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeFarmers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('agent:stats.pending_validation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingValidation}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('agent:stats.this_month')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonthRegistrations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('agent:stats.target_progress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.targetProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="farmers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="farmers">{t('agent:tabs.farmers')}</TabsTrigger>
          <TabsTrigger value="visits">{t('agent:tabs.visits')}</TabsTrigger>
          <TabsTrigger value="targets">{t('agent:tabs.targets')}</TabsTrigger>
        </TabsList>

        <TabsContent value="farmers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('agent:farmers.title')}</CardTitle>
              <CardDescription>{t('agent:farmers.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('agent:search.placeholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={t('agent:filters.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('agent:filters.all_status')}</SelectItem>
                    <SelectItem value="draft">{t('agent:status.draft')}</SelectItem>
                    <SelectItem value="submitted">{t('agent:status.submitted')}</SelectItem>
                    <SelectItem value="under_review">{t('agent:status.under_review')}</SelectItem>
                    <SelectItem value="approved">{t('agent:status.approved')}</SelectItem>
                    <SelectItem value="rejected">{t('agent:status.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={countyFilter} onValueChange={setCountyFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={t('agent:filters.county')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('agent:filters.all_counties')}</SelectItem>
                    <SelectItem value="Cluj">Cluj</SelectItem>
                    <SelectItem value="Bihor">Bihor</SelectItem>
                    <SelectItem value="Sălaj">Sălaj</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Farmers List */}
              <div className="space-y-3">
                {filteredFarmers.map((farmer) => (
                  <div key={farmer.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{farmer.business_name}</h3>
                          {getStatusBadge(farmer.registration_status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {farmer.contact_person} • {farmer.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {farmer.city}, {farmer.county}
                          </div>
                          <div>
                            {t('agent:farmers.grain_types')}: {farmer.grain_types.join(', ')}
                            {farmer.estimated_volume && ` • ${farmer.estimated_volume}t`}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          {t('agent:actions.view')}
                        </Button>
                        <Button variant="outline" size="sm">
                          {t('agent:actions.contact')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFarmers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('agent:farmers.no_results')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('agent:visits.title')}</CardTitle>
              <CardDescription>{t('agent:visits.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {t('agent:visits.coming_soon')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('agent:targets.title')}</CardTitle>
              <CardDescription>{t('agent:targets.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {t('agent:targets.coming_soon')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}