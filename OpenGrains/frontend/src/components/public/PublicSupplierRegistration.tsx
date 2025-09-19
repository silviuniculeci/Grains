import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { SupplierRegistrationForm } from '@/components/forms/SupplierRegistrationForm'
import { DocumentUpload } from '@/components/upload/DocumentUpload'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { Building2, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface PublicSupplierRegistrationProps {
  shareId?: string
}

export const PublicSupplierRegistration = ({ shareId }: PublicSupplierRegistrationProps) => {
  const [registrationCompleted, setRegistrationCompleted] = useState(false)
  const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(null)
  const [linkStatus, setLinkStatus] = useState<'valid' | 'expired' | 'invalid' | 'loading'>('loading')
  const [agentInfo, setAgentInfo] = useState<any>(null)

  useEffect(() => {
    if (shareId) {
      validateShareLink(shareId)
    } else {
      setLinkStatus('invalid')
    }
  }, [shareId])

  const validateShareLink = async (id: string) => {
    try {
      // Simulate API call to validate the share link
      // In real implementation, this would validate against your backend
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate different scenarios based on the ID
      if (id.includes('expired')) {
        setLinkStatus('expired')
      } else if (id.includes('invalid')) {
        setLinkStatus('invalid')
      } else {
        setLinkStatus('valid')
        // Simulate agent info
        setAgentInfo({
          name: 'Ana Popescu',
          email: 'ana.popescu@opengrains.com',
          phone: '+40 765 432 109'
        })
      }
    } catch (error) {
      setLinkStatus('invalid')
    }
  }

  const handleRegistrationSuccess = (supplierId: string) => {
    setCurrentSupplierId(supplierId)
    setRegistrationCompleted(true)
  }

  if (linkStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Se verifică link-ul...</p>
        </div>
      </div>
    )
  }

  if (linkStatus === 'expired') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0">
              <LanguageSwitcher />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">OpenGrains</h1>
          </header>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Clock className="h-5 w-5" />
                  Link expirat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Acest link de înregistrare a expirat. Vă rugăm să contactați agentul dumneavoastră de vânzări pentru un link nou.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (linkStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0">
              <LanguageSwitcher />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">OpenGrains</h1>
          </header>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Link invalid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Acest link de înregistrare nu este valid. Vă rugăm să verificați link-ul sau să contactați agentul dumneavoastră de vânzări.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <LanguageSwitcher />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">OpenGrains</h1>
          <p className="text-lg text-muted-foreground">
            Înregistrare furnizor cereale
          </p>
          <Badge variant="default" className="mt-2">
            Înregistrare prin invitație
          </Badge>
        </header>

        <main className="max-w-4xl mx-auto">
          {/* Agent Information */}
          {agentInfo && !registrationCompleted && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Ați fost invitat de agentul dumneavoastră de vânzări:
                  </p>
                  <div className="font-medium">{agentInfo.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {agentInfo.email} • {agentInfo.phone}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registration Form */}
          {!registrationCompleted ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Completați profilul de furnizor
                  </CardTitle>
                  <CardDescription>
                    Vă rugăm să completați informațiile pentru a deveni furnizor OpenGrains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SupplierRegistrationForm
                    onSuccess={handleRegistrationSuccess}
                    onSaveDraft={(id) => setCurrentSupplierId(id)}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Success State with Document Upload */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Înregistrare completată cu succes!
                  </CardTitle>
                  <CardDescription>
                    Profilul dumneavoastră a fost trimis pentru verificare. Puteți încărca documentele justificative mai jos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Următorii pași:</strong><br />
                      1. Încărcați documentele justificative mai jos<br />
                      2. Așteptați confirmarea din partea echipei OpenGrains<br />
                      3. Veți fi contactat în maxim 48 de ore
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Document Upload */}
              {currentSupplierId && (
                <DocumentUpload
                  supplierId={currentSupplierId}
                  onUploadSuccess={(documentId) => {
                    console.log('Document uploaded:', documentId)
                  }}
                />
              )}

              {/* Contact Information */}
              {agentInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informații de contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Agentul dumneavoastră de vânzări:</strong> {agentInfo.name}
                      </p>
                      <p className="text-sm">
                        <strong>Email:</strong> {agentInfo.email}
                      </p>
                      <p className="text-sm">
                        <strong>Telefon:</strong> {agentInfo.phone}
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        Pentru întrebări sau asistență, vă rugăm să contactați agentul dumneavoastră.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}