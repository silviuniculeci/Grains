import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, User, Building2, FileCheck } from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'

function App() {
  const [supplierName, setSupplierName] = useState('')
  const { t } = useTranslation(['common', 'forms'])

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
            Development Preview
          </Badge>
        </header>

        <main className="max-w-4xl mx-auto">
          <Tabs defaultValue="agent" className="w-full">
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
                    New Supplier Registration
                  </CardTitle>
                  <CardDescription>
                    Register a new grain supplier on behalf of a farmer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplierName">{t('forms:supplier.fields.businessName')}</Label>
                      <Input
                        id="supplierName"
                        placeholder={t('forms:supplier.placeholders.businessName')}
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">{t('forms:supplier.fields.businessType')}</Label>
                      <Input
                        id="businessType"
                        placeholder="e.g., Family Farm"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Progress</Label>
                    <Progress value={33} className="w-full" />
                    <p className="text-sm text-muted-foreground">Step 1 of 3: Basic Information</p>
                  </div>
                  <div className="flex gap-2">
                    <Button>{t('common:buttons.continue')}</Button>
                    <Button variant="outline">{t('common:buttons.save')}</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supplier" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Supplier Self-Registration
                  </CardTitle>
                  <CardDescription>
                    Complete your supplier profile to start working with OpenGrains
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Welcome to OpenGrains</h3>
                    <p className="text-muted-foreground mb-4">
                      Please complete the registration form to become an approved supplier
                    </p>
                    <Button>Start Registration</Button>
                  </div>
                </CardContent>
              </Card>
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Green Valley Farms</h4>
                        <p className="text-sm text-muted-foreground">Submitted 2 hours ago</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Pending Review</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">Mountain View Cooperative</h4>
                        <p className="text-sm text-muted-foreground">Submitted 1 day ago</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Pending Review</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Development Status</CardTitle>
              <CardDescription>
                Setup phase completed - Ready for TDD implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant="default" className="mb-2">✅ Setup Complete</Badge>
                  <p className="text-sm text-muted-foreground">
                    React + TypeScript + shadcn/ui configured
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">⏳ Tests Next</Badge>
                  <p className="text-sm text-muted-foreground">
                    API contract & component tests to be written
                  </p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">🚧 Implementation</Badge>
                  <p className="text-sm text-muted-foreground">
                    Core components and business logic
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default App