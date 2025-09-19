import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Building2, FileCheck, LogOut } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { SupplierRegistrationForm } from '@/components/forms/SupplierRegistrationForm'
import { DocumentUpload } from '@/components/upload/DocumentUpload'
import { getCurrentUser, signOut } from '@/lib/supabase'

function App() {
  const { t } = useTranslation(['common', 'forms'])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [supplierFormCompleted, setSupplierFormCompleted] = useState(false)
  const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(null)

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
      setSupplierFormCompleted(false)
      setCurrentSupplierId(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSupplierRegistrationSuccess = (supplierId: string) => {
    setCurrentSupplierId(supplierId)
    setSupplierFormCompleted(true)
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

        <main className="max-w-4xl mx-auto">
          <Tabs defaultValue="supplier" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="agent">Sales Agent</TabsTrigger>
              <TabsTrigger value="supplier">{t('common:navigation.suppliers')}</TabsTrigger>
              <TabsTrigger value="backoffice">Back Office</TabsTrigger>
            </TabsList>

            <TabsContent value="agent" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Agent Dashboard
                  </CardTitle>
                  <CardDescription>
                    Register suppliers and manage farmer relationships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SupplierRegistrationForm
                    onSuccess={handleSupplierRegistrationSuccess}
                    onSaveDraft={(id) => setCurrentSupplierId(id)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supplier" className="space-y-6">
              {!supplierFormCompleted ? (
                <SupplierRegistrationForm
                  onSuccess={handleSupplierRegistrationSuccess}
                  onSaveDraft={(id) => setCurrentSupplierId(id)}
                />
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Registration Complete
                      </CardTitle>
                      <CardDescription>
                        Your supplier profile has been submitted. Upload supporting documents below.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="default" className="mb-4">
                        Registration Submitted Successfully
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        You can now upload supporting documents for verification.
                      </p>
                    </CardContent>
                  </Card>

                  {currentSupplierId && (
                    <DocumentUpload
                      supplierId={currentSupplierId}
                      onUploadSuccess={(documentId) => {
                        console.log('Document uploaded:', documentId)
                      }}
                    />
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="backoffice" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Supplier Validation Dashboard
                  </CardTitle>
                  <CardDescription>
                    Review and validate pending supplier registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Back Office Dashboard</h3>
                    <p className="text-muted-foreground mb-4">
                      This feature will display pending supplier registrations for review and approval.
                    </p>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default App