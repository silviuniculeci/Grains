import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Share,
  Mail,
  Phone,
  Copy,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  QrCode,
  MessageSquare
} from 'lucide-react'

interface FarmerInvite {
  id: string
  farmer_name: string
  farmer_phone: string
  farmer_email?: string
  invitation_method: 'email' | 'whatsapp' | 'sms'
  invitation_status: 'pending' | 'sent' | 'opened' | 'completed' | 'expired'
  share_link: string
  sent_at?: string
  opened_at?: string
  completed_at?: string
  expires_at: string
  agent_notes?: string
}

interface FarmerInvitationSystemProps {
  farmerId?: string
  farmerName?: string
  farmerPhone?: string
  farmerEmail?: string
  onInvitationSent?: (inviteId: string) => void
}

export const FarmerInvitationSystem = ({
  farmerId,
  farmerName,
  farmerPhone,
  farmerEmail,
  onInvitationSent
}: FarmerInvitationSystemProps) => {
  const { t } = useTranslation(['common', 'agent'])
  const [invitationData, setInvitationData] = useState({
    farmer_name: farmerName || '',
    farmer_phone: farmerPhone || '',
    farmer_email: farmerEmail || '',
    invitation_method: 'whatsapp' as 'email' | 'whatsapp' | 'sms',
    custom_message: '',
    expires_in_days: 7
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatedInvite, setGeneratedInvite] = useState<FarmerInvite | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)

  const handleInputChange = (field: keyof typeof invitationData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInvitationData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSelectChange = (field: keyof typeof invitationData) => (value: string) => {
    setInvitationData(prev => ({ ...prev, [field]: value }))
  }

  const generateInvitation = async () => {
    if (!invitationData.farmer_name || !invitationData.farmer_phone) {
      setError(t('agent:invitation.required_fields'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // TODO: Replace with actual API call
      console.log('Generating invitation:', invitationData)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const shareId = 'share-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      const shareLink = `${window.location.origin}/supplier/register/${shareId}`

      const invite: FarmerInvite = {
        id: 'invite-' + Date.now(),
        farmer_name: invitationData.farmer_name,
        farmer_phone: invitationData.farmer_phone,
        farmer_email: invitationData.farmer_email,
        invitation_method: invitationData.invitation_method,
        invitation_status: 'pending',
        share_link: shareLink,
        expires_at: new Date(Date.now() + invitationData.expires_in_days * 24 * 60 * 60 * 1000).toISOString(),
        agent_notes: invitationData.custom_message
      }

      setGeneratedInvite(invite)
      setSuccess(t('agent:invitation.generated_success'))
    } catch (err: any) {
      setError(err.message || t('agent:invitation.generation_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const sendInvitation = async () => {
    if (!generatedInvite) return

    setIsLoading(true)
    setError('')

    try {
      // TODO: Replace with actual API call
      console.log('Sending invitation via:', generatedInvite.invitation_method)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setGeneratedInvite(prev => prev ? {
        ...prev,
        invitation_status: 'sent',
        sent_at: new Date().toISOString()
      } : null)

      setSuccess(t('agent:invitation.sent_success'))
      onInvitationSent?.(generatedInvite.id)
    } catch (err: any) {
      setError(err.message || t('agent:invitation.send_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setSuccess(t('agent:invitation.copied_to_clipboard'))
    } catch (err) {
      setError(t('agent:invitation.copy_failed'))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default"><Send className="w-3 h-3 mr-1" />{t('agent:invitation.status.sent')}</Badge>
      case 'opened':
        return <Badge variant="secondary"><ExternalLink className="w-3 h-3 mr-1" />{t('agent:invitation.status.opened')}</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{t('agent:invitation.status.completed')}</Badge>
      case 'expired':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />{t('agent:invitation.status.expired')}</Badge>
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{t('agent:invitation.status.pending')}</Badge>
    }
  }

  const getInvitationMessage = () => {
    const baseMessage = `Bună ziua ${invitationData.farmer_name},

Sunt agent de vânzări la OpenGrains și vă invit să vă înregistrați ca furnizor de cereale pe platforma noastră.

Vă rugăm să accesați linkul de mai jos pentru a completa profilul dumneavoastră:
${generatedInvite?.share_link}

${invitationData.custom_message ? `\n${invitationData.custom_message}\n` : ''}

Pentru întrebări sau asistență, mă puteți contacta la acest număr.

Cu stimă,
Echipa OpenGrains`

    return baseMessage
  }

  const openWhatsApp = () => {
    const message = encodeURIComponent(getInvitationMessage())
    const phone = invitationData.farmer_phone.replace(/[^\d]/g, '')
    const url = `https://wa.me/${phone}?text=${message}`
    window.open(url, '_blank')
  }

  const openSMS = () => {
    const message = encodeURIComponent(getInvitationMessage())
    const phone = invitationData.farmer_phone.replace(/[^\d]/g, '')
    const url = `sms:${phone}?body=${message}`
    window.open(url, '_blank')
  }

  const composeEmail = () => {
    const subject = encodeURIComponent('Invitație OpenGrains - Înregistrare Furnizor Cereale')
    const body = encodeURIComponent(getInvitationMessage())
    const url = `mailto:${invitationData.farmer_email}?subject=${subject}&body=${body}`
    window.open(url, '_blank')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share className="h-5 w-5" />
          {t('agent:invitation.title')}
        </CardTitle>
        <CardDescription>
          {t('agent:invitation.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
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

        {!generatedInvite ? (
          // Invitation Setup
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmer_name">{t('agent:invitation.farmer_name')} *</Label>
                <Input
                  id="farmer_name"
                  value={invitationData.farmer_name}
                  onChange={handleInputChange('farmer_name')}
                  placeholder={t('agent:invitation.farmer_name_placeholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmer_phone">{t('agent:invitation.farmer_phone')} *</Label>
                <Input
                  id="farmer_phone"
                  value={invitationData.farmer_phone}
                  onChange={handleInputChange('farmer_phone')}
                  placeholder={t('agent:invitation.farmer_phone_placeholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmer_email">{t('agent:invitation.farmer_email')}</Label>
                <Input
                  id="farmer_email"
                  type="email"
                  value={invitationData.farmer_email}
                  onChange={handleInputChange('farmer_email')}
                  placeholder={t('agent:invitation.farmer_email_placeholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_in_days">{t('agent:invitation.expires_in_days')}</Label>
                <Select
                  onValueChange={(value) => handleSelectChange('expires_in_days')(value)}
                  value={invitationData.expires_in_days.toString()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 {t('agent:invitation.days')}</SelectItem>
                    <SelectItem value="7">7 {t('agent:invitation.days')}</SelectItem>
                    <SelectItem value="14">14 {t('agent:invitation.days')}</SelectItem>
                    <SelectItem value="30">30 {t('agent:invitation.days')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invitation_method">{t('agent:invitation.method')}</Label>
              <Select onValueChange={handleSelectChange('invitation_method')} value={invitationData.invitation_method}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_message">{t('agent:invitation.custom_message')}</Label>
              <Textarea
                id="custom_message"
                value={invitationData.custom_message}
                onChange={handleInputChange('custom_message')}
                placeholder={t('agent:invitation.custom_message_placeholder')}
                rows={3}
              />
            </div>

            <Button
              onClick={generateInvitation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Clock className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share className="mr-2 h-4 w-4" />
              )}
              {t('agent:invitation.generate')}
            </Button>
          </div>
        ) : (
          // Generated Invitation
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-green-800">{t('agent:invitation.invitation_ready')}</h3>
                {getStatusBadge(generatedInvite.invitation_status)}
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div><strong>{t('agent:invitation.farmer')}:</strong> {generatedInvite.farmer_name}</div>
                <div><strong>{t('agent:invitation.phone')}:</strong> {generatedInvite.farmer_phone}</div>
                <div><strong>{t('agent:invitation.expires')}:</strong> {new Date(generatedInvite.expires_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('agent:invitation.share_link')}</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedInvite.share_link}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(generatedInvite.share_link)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('agent:invitation.qr_code')}</DialogTitle>
                      <DialogDescription>
                        {t('agent:invitation.qr_code_description')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center p-4">
                      <div className="bg-gray-200 w-48 h-48 flex items-center justify-center">
                        <span className="text-gray-500">{t('agent:invitation.qr_placeholder')}</span>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {generatedInvite.invitation_status === 'pending' && (
              <div className="space-y-3">
                <Label>{t('agent:invitation.send_options')}</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {invitationData.invitation_method === 'whatsapp' && (
                    <Button onClick={openWhatsApp} className="flex-1 gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {t('agent:invitation.open_whatsapp')}
                    </Button>
                  )}
                  {invitationData.invitation_method === 'email' && invitationData.farmer_email && (
                    <Button onClick={composeEmail} className="flex-1 gap-2">
                      <Mail className="h-4 w-4" />
                      {t('agent:invitation.compose_email')}
                    </Button>
                  )}
                  {invitationData.invitation_method === 'sms' && (
                    <Button onClick={openSMS} className="flex-1 gap-2">
                      <Phone className="h-4 w-4" />
                      {t('agent:invitation.open_sms')}
                    </Button>
                  )}
                  <Button onClick={sendInvitation} disabled={isLoading} variant="outline" className="gap-2">
                    <Send className="h-4 w-4" />
                    {t('agent:invitation.mark_as_sent')}
                  </Button>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <Label>{t('agent:invitation.message_preview')}</Label>
              <div className="bg-gray-50 border rounded-lg p-3 text-sm whitespace-pre-line">
                {getInvitationMessage()}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setGeneratedInvite(null)
                setSuccess('')
                setError('')
              }}
              className="w-full"
            >
              {t('agent:invitation.create_new')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}