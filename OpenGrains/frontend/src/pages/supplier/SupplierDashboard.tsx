import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  MapPin,
  Phone,
  Mail,
  Euro
} from 'lucide-react'
import { SupplierService, type SupplierProfile } from '@/services/supplier-service'
import { DocumentService, type Document } from '@/services/document-service'
import { DocumentViewer } from '@/components/documents/DocumentViewer'
import { DocumentUpload } from '@/components/documents/DocumentUpload'

interface SalesOffer {
  id: string
  grainType: string
  quantity: number
  price: number
  quality: string
  availableFrom: Date
  location: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  createdAt: Date
}

interface PurchaseRequest {
  id: string
  grainType: string
  quantity: number
  maxPrice: number
  targetDate: Date
  location: string
  status: 'pending' | 'matched' | 'completed' | 'cancelled'
  createdAt: Date
}

export const SupplierDashboard = () => {
  const [profile, setProfile] = useState<SupplierProfile | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [salesOffers] = useState<SalesOffer[]>([])
  const [purchaseRequests] = useState<PurchaseRequest[]>([])
  const [, setError] = useState<string | null>(null)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)

  useEffect(() => {
    loadSupplierData()
  }, [])

  const loadSupplierData = async () => {
    try {
      const [supplierProfile, supplierDocuments] = await Promise.all([
        SupplierService.getMyProfile(),
        DocumentService.getMyDocuments()
      ])

      setProfile(supplierProfile)
      setDocuments(supplierDocuments)

      // TODO: Load sales offers and purchase requests
      // const offers = await SalesOfferService.getMyOffers()
      // const requests = await PurchaseRequestService.getMyRequests()
      // setSalesOffers(offers)
      // setPurchaseRequests(requests)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      'pending': { variant: 'secondary', label: 'În așteptare', icon: Clock },
      'under_review': { variant: 'default', label: 'În evaluare', icon: AlertCircle },
      'approved': { variant: 'default', label: 'Aprobat', icon: CheckCircle },
      'rejected': { variant: 'destructive', label: 'Respins', icon: AlertCircle },
      'draft': { variant: 'outline', label: 'Ciornă', icon: FileText }
    }

    const config = variants[status] || variants['pending']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Se încarcă profilul...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profil negăsit</CardTitle>
            <CardDescription>
              Nu ați completat încă formularul de înregistrare ca furnizor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Completează profilul
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bun venit, {profile.contact_person}
            </h1>
            <p className="text-muted-foreground">
              {profile.business_name} • {getStatusBadge(profile.validation_status || 'pending')}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <User className="h-4 w-4 mr-2" />
            Editează profilul
          </Button>
        </div>

        {/* Status Alert */}
        {profile.validation_status === 'under_review' && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profilul dumneavoastră este în curs de evaluare. Veți fi notificat când procesul va fi finalizat.
            </AlertDescription>
          </Alert>
        )}

        {profile.validation_status === 'rejected' && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profilul dumneavoastră a fost respins. Vă rugăm să contactați echipa noastră pentru mai multe detalii.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Prezentare</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="documents">Documente</TabsTrigger>
            <TabsTrigger value="sales">Oferte Vânzare</TabsTrigger>
            <TabsTrigger value="purchases">Cereri Cumpărare</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oferte Active</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesOffers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {salesOffers.filter(o => o.status === 'pending').length} în așteptare
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cereri Cumpărare</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{purchaseRequests.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {purchaseRequests.filter(r => r.status === 'pending').length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documente</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documents.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {documents.filter(d => d.validationStatus === 'approved').length} aprobate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volume Estimat</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {profile.estimated_volume ? `${profile.estimated_volume}t` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    per sezon
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activitate recentă</CardTitle>
                <CardDescription>
                  Ultimele activități din contul dumneavoastră
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Profil completat</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString('ro-RO') : ''}
                      </p>
                    </div>
                  </div>

                  {profile.validation_status === 'approved' && (
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profil aprobat</p>
                        <p className="text-xs text-muted-foreground">
                          Puteți începe să trimiteți oferte
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informații de business
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nume business</label>
                    <p className="text-sm">{profile.business_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tip business</label>
                    <p className="text-sm">{profile.business_type === 'PF' ? 'Persoană Fizică' : 'Persoană Juridică'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CUI</label>
                    <p className="text-sm">{profile.cui || 'Nu este specificat'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Număr ONRC</label>
                    <p className="text-sm">{profile.onrc_number || 'Nu este specificat'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informații de contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Persoană de contact</label>
                    <p className="text-sm">{profile.contact_person}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{profile.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{profile.phone}</p>
                  </div>
                  {profile.alternative_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{profile.alternative_phone} (alternativ)</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Adresă
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm">{profile.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.city}, {profile.county}
                      {profile.postal_code && `, ${profile.postal_code}`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tipuri de cereale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.grain_types?.map((grain, index) => (
                      <Badge key={index} variant="secondary">
                        {grain}
                      </Badge>
                    )) || <p className="text-sm text-muted-foreground">Nu sunt specificate</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Documentele mele</h2>
                <p className="text-muted-foreground">Gestionează documentele încărcate</p>
              </div>
              <Button onClick={() => setShowDocumentUpload(!showDocumentUpload)}>
                <FileText className="h-4 w-4 mr-2" />
                {showDocumentUpload ? 'Ascunde încărcarea' : 'Încarcă documente'}
              </Button>
            </div>

            {showDocumentUpload && (
              <DocumentUpload
                onUploadComplete={() => {
                  // Refresh documents list
                  loadSupplierData()
                  setShowDocumentUpload(false)
                }}
                className="mb-6"
              />
            )}

            {documents.length > 0 ? (
              <DocumentViewer
                documents={documents}
                readOnly={true}
              />
            ) : (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nu aveți documente încărcate</h3>
                    <p className="text-muted-foreground mb-4">
                      Încărcați documentele necesare pentru verificarea profilului
                    </p>
                    <Button onClick={() => setShowDocumentUpload(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Încarcă primul document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sales Offers Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Ofertele mele de vânzare</h2>
                <p className="text-muted-foreground">Gestionează ofertele tale de cereale</p>
              </div>
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Ofertă nouă
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Sistemul de oferte</h3>
                  <p className="text-muted-foreground mb-4">
                    Funcționalitatea pentru crearea și gestionarea ofertelor de vânzare va fi implementată în curând
                  </p>
                  <Button variant="outline" disabled>
                    Creează prima ofertă
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Requests Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Cererile mele de cumpărare</h2>
                <p className="text-muted-foreground">Cere oferte pentru cereale de care ai nevoie</p>
              </div>
              <Button>
                <TrendingDown className="h-4 w-4 mr-2" />
                Cerere nouă
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <TrendingDown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Sistemul de cereri</h3>
                  <p className="text-muted-foreground mb-4">
                    Funcționalitatea pentru crearea și gestionarea cererilor de cumpărare va fi implementată în curând
                  </p>
                  <Button variant="outline" disabled>
                    Creează prima cerere
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}