import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Building2, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { SupplierRegistrationForm } from '@/components/forms/SupplierRegistrationForm'
import { useAuth } from '@/hooks/useAuth'

interface InvitationData {
  id: string
  agentName: string
  agentEmail: string
  supplierName?: string
  expiresAt: Date
  isValid: boolean
  metadata?: {
    region?: string
    grainTypes?: string[]
    notes?: string
  }
}

export const SupplierRegistrationPage = () => {
  const { t } = useTranslation(['common', 'supplier'])
  const { invitationId } = useParams<{ invitationId: string }>()
  const navigate = useNavigate()
  const { user, login } = useAuth()

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'form'>('form')

  useEffect(() => {
    if (invitationId) {
      validateInvitation(invitationId)
    } else {
      setError('Link de invitație invalid')
      setLoading(false)
    }
  }, [invitationId])

  const validateInvitation = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/invitations/${id}/validate`)
      // const data = await response.json()

      // Mock validation for development
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockInvitation: InvitationData = {
        id,
        agentName: 'Ion Popescu',
        agentEmail: 'ion.agent@opengrains.ro',
        supplierName: 'S.C. Agro Farm S.R.L.',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isValid: true,
        metadata: {
          region: 'Timiș',
          grainTypes: ['wheat', 'corn', 'sunflower'],
          notes: 'Fermă cu potențial mare în regiunea Timiș'
        }
      }

      if (mockInvitation.isValid) {
        setInvitation(mockInvitation)
      } else {
        setError('Acest link de invitație a expirat sau nu este valid')
      }
    } catch (err: any) {
      setError('Eroare la validarea invitației: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrationSuccess = (supplierId: string) => {
    console.log('Supplier registered successfully:', supplierId)
    setRegistrationComplete(true)

    // TODO: Create supplier account automatically and log them in
    // For now, redirect to login
    setTimeout(() => {
      navigate('/', {
        state: {
          message: 'Înregistrarea a fost completată cu succes! Vă rugăm să vă autentificați.'
        }
      })
    }, 3000)
  }

  const handleSaveDraft = (supplierId: string) => {
    console.log('Draft saved:', supplierId)
    // Show success message but keep form open
  }

  const getDaysUntilExpiry = () => {
    if (!invitation) return 0
    const now = new Date()
    const expiry = new Date(invitation.expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Se validează invitația...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0">
              <LanguageSwitcher />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              OpenGrains
            </h1>
            <p className="text-lg text-muted-foreground">
              Supplier Registration
            </p>
          </header>

          <main className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Eroare de validare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full"
                  >
                    Înapoi la pagina principală
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              OpenGrains
            </h1>
          </header>

          <main className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Înregistrare completă
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Profilul dumneavoastră a fost creat cu succes și va fi evaluat de echipa noastră.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Veți fi redirecționat automat către pagina de autentificare...
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full"
                  >
                    Continuă către autentificare
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <LanguageSwitcher />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            OpenGrains
          </h1>
          <p className="text-lg text-muted-foreground">
            Înregistrare Furnizor
          </p>
          <Badge variant="secondary" className="mt-2">
            Invitație validă
          </Badge>
        </header>

        {invitation && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Invitație de la agent
                </CardTitle>
                <CardDescription>
                  Ați fost invitat să vă înregistrați ca furnizor pentru OpenGrains
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agent de vânzări</label>
                    <p className="text-sm">{invitation.agentName}</p>
                    <p className="text-xs text-muted-foreground">{invitation.agentEmail}</p>
                  </div>

                  {invitation.supplierName && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Numele furnizorului</label>
                      <p className="text-sm">{invitation.supplierName}</p>
                    </div>
                  )}

                  {invitation.metadata?.region && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Regiunea</label>
                      <p className="text-sm">{invitation.metadata.region}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Invitația expiră în</label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        {getDaysUntilExpiry()} {getDaysUntilExpiry() === 1 ? 'zi' : 'zile'}
                      </p>
                    </div>
                  </div>
                </div>

                {invitation.metadata?.grainTypes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipuri de cereale sugerate</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {invitation.metadata.grainTypes.map((grain, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {grain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {invitation.metadata?.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Note de la agent</label>
                    <p className="text-sm bg-muted p-2 rounded-md">{invitation.metadata.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <main className="max-w-4xl mx-auto">
          <SupplierRegistrationForm
            onSuccess={handleRegistrationSuccess}
            onSaveDraft={handleSaveDraft}
          />
        </main>
      </div>
    </div>
  )
}