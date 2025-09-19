import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Building2, FileCheck, LogOut } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { SupplierRegistrationForm } from '@/components/forms/SupplierRegistrationForm'
import { SupplierSharingLink } from '@/components/sharing/SupplierSharingLink'
import { SupplierValidation } from '@/pages/backoffice/SupplierValidation'
import { getCurrentUser, signOut } from '@/lib/supabase'

function App() {
  const { t } = useTranslation(['common', 'forms'])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    checkUser()
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common:loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0">
              <LanguageSwitcher />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {t('common:appName')}
            </h1>
            <p className="text-lg text-muted-foreground">
              Supplier Engagement Module
            </p>
            <Badge variant="secondary" className="mt-2">
              Production Ready
            </Badge>
          </header>

          <main className="max-w-md mx-auto">
            {authMode === 'login' ? (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSignUpClick={() => setAuthMode('signup')}
              />
            ) : (
              <SignUpForm
                onSuccess={handleAuthSuccess}
                onLoginClick={() => setAuthMode('login')}
              />
            )}
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 relative">
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              {t('common:logout')}
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('common:appName')}
          </h1>
          <p className="text-lg text-muted-foreground">
            Supplier Engagement Module
          </p>
          <Badge variant="default" className="mt-2">
            Production Ready
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            Welcome, {user?.email}
          </p>
        </header>

        <main className="max-w-7xl mx-auto">
          <Tabs defaultValue="supplier" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="agent" className="text-xs sm:text-sm">Agent vânzări</TabsTrigger>
              <TabsTrigger value="supplier" className="text-xs sm:text-sm">{t('common:navigation.suppliers')}</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">{t('common:navigation.documents')}</TabsTrigger>
              <TabsTrigger value="backoffice" className="text-xs sm:text-sm">Back Office</TabsTrigger>
            </TabsList>

            <TabsContent value="agent" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Înregistrare directă
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Înregistrează un furnizor în numele fermierului
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <SupplierRegistrationForm
                        onSuccess={(id) => console.log('Supplier registered:', id)}
                        onSaveDraft={(id) => console.log('Draft saved:', id)}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <SupplierSharingLink
                    onLinkGenerated={(link) => {
                      console.log('Generated link:', link)
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="supplier" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Acces Furnizori
                  </CardTitle>
                  <CardDescription>
                    Înregistrarea furnizorilor se face prin link-uri de invitație trimise de agenți
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-3">Pentru Furnizori</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Dacă sunteți furnizor, veți primi un link de înregistrare prin email sau WhatsApp de la agentul dumneavoastră de vânzări.
                    </p>
                    <div className="space-y-3">
                      <Badge variant="outline" className="block w-fit mx-auto">
                        📧 Link prin Email
                      </Badge>
                      <Badge variant="outline" className="block w-fit mx-auto">
                        📱 Link prin WhatsApp
                      </Badge>
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      <strong>Nu aveți link de înregistrare?</strong><br />
                      Contactați agentul dumneavoastră de vânzări OpenGrains pentru a primi link-ul de înregistrare personalizat.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Managementul Documentelor
                  </CardTitle>
                  <CardDescription>
                    Documentele sunt încărcate prin formularul de înregistrare sau prin link-urile de invitație
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-3">Încărcare Documente</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Documentele sunt încărcate automat în timpul procesului de înregistrare prin:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                      <div className="border rounded-lg p-4">
                        <User className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <h4 className="font-medium mb-1">Agent Vânzări</h4>
                        <p className="text-sm text-muted-foreground">În timpul vizitei la fermier</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <h4 className="font-medium mb-1">Link Invitație</h4>
                        <p className="text-sm text-muted-foreground">Furnizor auto-înregistrare</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backoffice" className="space-y-6">
              <SupplierValidation />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default App