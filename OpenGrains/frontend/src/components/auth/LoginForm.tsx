import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signInWithEmail } from '@/lib/supabase'
import { Loader2, LogIn } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
  onSignUpClick?: () => void
}

export const LoginForm = ({ onSuccess, onSignUpClick }: LoginFormProps) => {
  const { t } = useTranslation(['common', 'auth'])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await signInWithEmail(formData.email, formData.password)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || t('auth:errors.loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          {t('auth:login.title')}
        </CardTitle>
        <CardDescription>
          {t('auth:login.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth:fields.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder={t('auth:placeholders.email')}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth:fields.password')}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              placeholder={t('auth:placeholders.password')}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth:login.signing_in')}
              </>
            ) : (
              t('auth:login.button')
            )}
          </Button>

          {onSignUpClick && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={onSignUpClick}
                disabled={isLoading}
              >
                {t('auth:login.no_account')}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}