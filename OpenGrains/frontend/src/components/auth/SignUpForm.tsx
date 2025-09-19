import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { signUpWithEmail } from '@/lib/supabase'
import { Loader2, UserPlus } from 'lucide-react'

interface SignUpFormProps {
  onSuccess?: () => void
  onLoginClick?: () => void
}

export const SignUpForm = ({ onSuccess, onLoginClick }: SignUpFormProps) => {
  const { t } = useTranslation(['common', 'auth'])
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'supplier' as 'supplier' | 'sales_agent',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth:errors.passwordMismatch'))
      setIsLoading(false)
      return
    }

    try {
      await signUpWithEmail(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
      })
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || t('auth:errors.signupFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ ...prev, role: role as 'supplier' | 'sales_agent' }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {t('auth:signup.title')}
        </CardTitle>
        <CardDescription>
          {t('auth:signup.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('auth:fields.firstName')}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                placeholder={t('auth:placeholders.firstName')}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('auth:fields.lastName')}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                placeholder={t('auth:placeholders.lastName')}
                required
                disabled={isLoading}
              />
            </div>
          </div>

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
            <Label htmlFor="role">{t('auth:fields.role')}</Label>
            <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
              <SelectTrigger>
                <SelectValue placeholder={t('auth:placeholders.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supplier">{t('auth:roles.supplier')}</SelectItem>
                <SelectItem value="sales_agent">{t('auth:roles.sales_agent')}</SelectItem>
              </SelectContent>
            </Select>
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
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth:fields.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder={t('auth:placeholders.confirmPassword')}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth:signup.creating_account')}
              </>
            ) : (
              t('auth:signup.button')
            )}
          </Button>

          {onLoginClick && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={onLoginClick}
                disabled={isLoading}
              >
                {t('auth:signup.have_account')}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}