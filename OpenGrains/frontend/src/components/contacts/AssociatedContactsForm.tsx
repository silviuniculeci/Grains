import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContactService } from '@/services/contact-service'
import type { Contact, AssociatedContact } from '../../../../shared/types/contact-types'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Save,
  UserPlus
} from 'lucide-react'

// Associated contact form schema
const associatedContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  role: z.string().optional(),
  notes: z.string().optional()
})

type AssociatedContactFormData = z.infer<typeof associatedContactSchema>

interface AssociatedContactsFormProps {
  contact?: Contact | null
  isReadOnly: boolean
}

const AssociatedContactsForm: React.FC<AssociatedContactsFormProps> = ({
  contact,
  isReadOnly
}) => {
  const { t } = useTranslation()

  const [associatedContacts, setAssociatedContacts] = useState<AssociatedContact[]>(
    contact?.associatedContacts || []
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingContact, setEditingContact] = useState<AssociatedContact | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form for adding/editing associated contacts
  const form = useForm<AssociatedContactFormData>({
    resolver: zodResolver(associatedContactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      notes: ''
    }
  })

  // Load associated contacts when contact changes
  useEffect(() => {
    if (contact?.associatedContacts) {
      setAssociatedContacts(contact.associatedContacts)
    }
  }, [contact])

  // Reset form when editing contact changes
  useEffect(() => {
    if (editingContact) {
      form.reset({
        firstName: editingContact.firstName,
        lastName: editingContact.lastName,
        email: editingContact.email,
        phone: editingContact.phone,
        role: editingContact.role || '',
        notes: editingContact.notes || ''
      })
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        notes: ''
      })
    }
  }, [editingContact, form])

  // Clear messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Handle save associated contact
  const handleSaveContact = async (data: AssociatedContactFormData) => {
    if (!contact) return

    try {
      setSaving(true)
      setError(null)

      let result: AssociatedContact

      if (editingContact) {
        // Update existing contact
        result = await ContactService.updateAssociatedContact(editingContact.id, {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role || undefined,
          notes: data.notes || undefined
        })

        // Update local state
        setAssociatedContacts(prev => prev.map(contact =>
          contact.id === editingContact.id ? result : contact
        ))

        setSuccessMessage(t('contacts.associated.contactUpdated'))
      } else {
        // Add new contact
        result = await ContactService.addAssociatedContact(contact.id, {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role || undefined,
          notes: data.notes || undefined
        })

        // Add to local state
        setAssociatedContacts(prev => [...prev, result])

        setSuccessMessage(t('contacts.associated.contactAdded'))
      }

      // Close dialog and reset form
      setDialogOpen(false)
      setEditingContact(null)
      form.reset()
    } catch (err: any) {
      console.error('Failed to save associated contact:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle delete associated contact
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm(t('contacts.associated.confirmDelete'))) return

    try {
      setLoading(true)
      setError(null)

      await ContactService.deleteAssociatedContact(contactId)

      // Remove from local state
      setAssociatedContacts(prev => prev.filter(contact => contact.id !== contactId))

      setSuccessMessage(t('contacts.associated.contactDeleted'))
    } catch (err: any) {
      console.error('Failed to delete associated contact:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit contact
  const handleEditContact = (contact: AssociatedContact) => {
    setEditingContact(contact)
    setDialogOpen(true)
  }

  // Open new contact dialog
  const handleNewContact = () => {
    setEditingContact(null)
    setDialogOpen(true)
  }

  // Common roles for suggestions
  const commonRoles = [
    'Manager',
    'Director',
    'Assistant',
    'Accountant',
    'Operations Manager',
    'Sales Representative',
    'Technical Contact',
    'Emergency Contact'
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('contacts.sections.associatedContacts')}
        </CardTitle>
        <CardDescription>
          {t('contacts.sections.associatedContactsDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-600">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Add New Contact Button */}
        {!isReadOnly && (
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{t('contacts.associated.contactList')}</h4>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewContact}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('contacts.associated.addContact')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingContact
                      ? t('contacts.associated.editContact')
                      : t('contacts.associated.newContact')
                    }
                  </DialogTitle>
                  <DialogDescription>
                    {t('contacts.associated.contactFormDescription')}
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSaveContact)} className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('contacts.fields.firstName')}
                              <Badge variant="outline" className="ml-2">
                                {t('common.required')}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('contacts.placeholders.firstName')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('contacts.fields.lastName')}
                              <Badge variant="outline" className="ml-2">
                                {t('common.required')}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('contacts.placeholders.lastName')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('contacts.fields.email')}
                              <Badge variant="outline" className="ml-2">
                                {t('common.required')}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder={t('contacts.placeholders.email')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('contacts.fields.phone')}
                              <Badge variant="outline" className="ml-2">
                                {t('common.required')}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('contacts.placeholders.phone')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Role */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contacts.fields.role')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t('contacts.placeholders.role')}
                              list="common-roles"
                            />
                          </FormControl>
                          <datalist id="common-roles">
                            {commonRoles.map(role => (
                              <option key={role} value={role} />
                            ))}
                          </datalist>
                          <FormDescription>
                            {t('contacts.help.role')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contacts.fields.notes')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder={t('contacts.placeholders.notes')}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('contacts.help.associatedContactNotes')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        disabled={saving}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {t('contacts.associated.saveContact')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Associated Contacts Table */}
        {associatedContacts.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('contacts.table.name')}</TableHead>
                  <TableHead>{t('contacts.table.email')}</TableHead>
                  <TableHead>{t('contacts.table.phone')}</TableHead>
                  <TableHead>{t('contacts.table.role')}</TableHead>
                  <TableHead>{t('contacts.table.notes')}</TableHead>
                  {!isReadOnly && (
                    <TableHead className="text-right">{t('contacts.table.actions')}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {associatedContacts.map((associatedContact) => (
                  <TableRow key={associatedContact.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {associatedContact.firstName} {associatedContact.lastName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-48">
                          {associatedContact.email}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{associatedContact.phone}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {associatedContact.role ? (
                        <Badge variant="outline">
                          {associatedContact.role}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {associatedContact.notes ? (
                        <div className="max-w-48 truncate text-sm text-muted-foreground">
                          {associatedContact.notes}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>

                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContact(associatedContact)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContact(associatedContact.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('contacts.associated.noContacts')}</p>
            {!isReadOnly && (
              <Button onClick={handleNewContact} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                {t('contacts.associated.addFirstContact')}
              </Button>
            )}
          </div>
        )}

        {/* Summary */}
        {associatedContacts.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                {t('contacts.associated.summary')}
              </span>
            </div>
            <div className="text-sm text-blue-700">
              {t('contacts.associated.totalContacts', { count: associatedContacts.length })}
              {associatedContacts.some(c => c.role) && (
                <>
                  <br />
                  {t('contacts.associated.rolesAssigned', {
                    count: associatedContacts.filter(c => c.role).length
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* Information Alert */}
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('contacts.associated.infoTitle')}:</strong>
            <br />
            {t('contacts.associated.infoDescription')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default AssociatedContactsForm