import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Share2, Copy, Check, Loader2, Mail, MessageSquare } from 'lucide-react'

interface SupplierSharingLinkProps {
  onLinkGenerated?: (link: string) => void
  className?: string
}

export const SupplierSharingLink = ({ onLinkGenerated, className }: SupplierSharingLinkProps) => {
  const { t } = useTranslation(['common', 'sharing'])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [supplierInfo, setSupplierInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const generateLink = async () => {
    setIsGenerating(true)

    try {
      // Simulate API call to generate unique link
      // In real implementation, this would call your backend
      const uniqueId = Math.random().toString(36).substr(2, 9)
      const baseUrl = window.location.origin
      const shareLink = `${baseUrl}/supplier-registration/${uniqueId}`

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setGeneratedLink(shareLink)
      onLinkGenerated?.(shareLink)
    } catch (error) {
      console.error('Failed to generate link:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent('OpenGrains - Completează profilul de furnizor')
    const body = encodeURIComponent(
      `Bună ziua ${supplierInfo.name || ''},\n\n` +
      `Sunteți invitat să vă completați profilul de furnizor pentru OpenGrains.\n\n` +
      `Accesați următorul link pentru a începe:\n${generatedLink}\n\n` +
      `Link-ul va expira în 7 zile.\n\n` +
      `Cu stimă,\nEchipa OpenGrains`
    )
    window.open(`mailto:${supplierInfo.email}?subject=${subject}&body=${body}`)
  }

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `🌾 *OpenGrains - Completează profilul de furnizor*\n\n` +
      `Bună ziua ${supplierInfo.name || ''},\n\n` +
      `Sunteți invitat să vă completați profilul de furnizor pentru OpenGrains.\n\n` +
      `Accesați link-ul: ${generatedLink}\n\n` +
      `⏰ Link-ul va expira în 7 zile.`
    )
    window.open(`https://wa.me/${supplierInfo.phone?.replace(/\D/g, '')}?text=${message}`)
  }

  const handleInputChange = (field: keyof typeof supplierInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSupplierInfo(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          {t('common:sharing.title')}
        </CardTitle>
        <CardDescription>
          {t('common:sharing.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Supplier Information */}
        <div className="space-y-4">
          <h4 className="font-medium">Informații furnizor (opțional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Nume furnizor</Label>
              <Input
                id="supplier-name"
                value={supplierInfo.name}
                onChange={handleInputChange('name')}
                placeholder="Numele furnizorului"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-email">Email</Label>
              <Input
                id="supplier-email"
                type="email"
                value={supplierInfo.email}
                onChange={handleInputChange('email')}
                placeholder="email@exemplu.ro"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supplier-phone">Telefon (pentru WhatsApp)</Label>
              <Input
                id="supplier-phone"
                value={supplierInfo.phone}
                onChange={handleInputChange('phone')}
                placeholder="+40 7xx xxx xxx"
              />
            </div>
          </div>
        </div>

        {/* Generate Link Button */}
        {!generatedLink && (
          <Button
            onClick={generateLink}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common:sharing.generating')}
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Generează link de partajare
              </>
            )}
          </Button>
        )}

        {/* Generated Link */}
        {generatedLink && (
          <div className="space-y-4">
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                {t('common:sharing.generated')}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="generated-link">Link generat</Label>
              <div className="flex gap-2">
                <Input
                  id="generated-link"
                  value={generatedLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copiat!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      {t('common:sharing.copy')}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  ⏰ {t('common:sharing.expire')}
                </Badge>
              </div>

              <div className="flex gap-2">
                {supplierInfo.email && (
                  <Button
                    variant="outline"
                    onClick={shareViaEmail}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Trimite pe email
                  </Button>
                )}

                {supplierInfo.phone && (
                  <Button
                    variant="outline"
                    onClick={shareViaWhatsApp}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Trimite pe WhatsApp
                  </Button>
                )}
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Instrucțiuni:</strong><br />
                {t('common:sharing.instructions')}<br />
                <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 inline-block">
                  {generatedLink}
                </code>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}