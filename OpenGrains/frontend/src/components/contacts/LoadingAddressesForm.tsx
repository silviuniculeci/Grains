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
import type { Contact, LoadingAddress } from '../../../shared/types/contact-types'
import {
  Truck,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Star,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Save
} from 'lucide-react'

// Loading address form schema
const loadingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  unloadingLocation: z.string().min(1, 'Unloading location is required'),
  secondaryAddress: z.string().optional(),
  secondaryAddress2: z.string().optional(),
  isPrimary: z.boolean().default(false)
})

type LoadingAddressFormData = z.infer<typeof loadingAddressSchema>

interface LoadingAddressesFormProps {
  contact?: Contact | null
  isReadOnly: boolean
}

const LoadingAddressesForm: React.FC<LoadingAddressesFormProps> = ({
  contact,
  isReadOnly
}) => {
  const { t } = useTranslation()

  const [addresses, setAddresses] = useState<LoadingAddress[]>(contact?.loadingAddresses || [])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingAddress, setEditingAddress] = useState<LoadingAddress | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form for adding/editing addresses
  const form = useForm<LoadingAddressFormData>({
    resolver: zodResolver(loadingAddressSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      postalCode: '',
      unloadingLocation: '',
      secondaryAddress: '',
      secondaryAddress2: '',
      isPrimary: false
    }
  })

  // Load addresses when contact changes
  useEffect(() => {
    if (contact?.loadingAddresses) {
      setAddresses(contact.loadingAddresses)
    }
  }, [contact])

  // Reset form when editing address changes
  useEffect(() => {
    if (editingAddress) {
      form.reset({
        name: editingAddress.name,
        phone: editingAddress.phone,
        address: editingAddress.address,
        postalCode: editingAddress.postalCode,
        unloadingLocation: editingAddress.unloadingLocation,
        secondaryAddress: editingAddress.secondaryAddress || '',
        secondaryAddress2: editingAddress.secondaryAddress2 || '',
        isPrimary: editingAddress.isPrimary
      })
    } else {
      form.reset({
        name: '',
        phone: '',
        address: '',
        postalCode: '',
        unloadingLocation: '',
        secondaryAddress: '',
        secondaryAddress2: '',
        isPrimary: false
      })
    }
  }, [editingAddress, form])

  // Handle save address
  const handleSaveAddress = async (data: LoadingAddressFormData) => {
    if (!contact) return

    try {
      setSaving(true)
      setError(null)

      let result: LoadingAddress

      if (editingAddress) {
        // Update existing address
        result = await ContactService.updateLoadingAddress(editingAddress.id, {
          name: data.name,
          phone: data.phone,
          address: data.address,
          postal_code: data.postalCode,
          unloading_location: data.unloadingLocation,
          secondary_address: data.secondaryAddress || undefined,
          secondary_address_2: data.secondaryAddress2 || undefined,
          is_primary: data.isPrimary
        })

        // Update local state
        setAddresses(prev => prev.map(addr =>
          addr.id === editingAddress.id ? result : addr
        ))
      } else {
        // Add new address
        result = await ContactService.addLoadingAddress(contact.id, {
          name: data.name,
          phone: data.phone,
          address: data.address,
          postal_code: data.postalCode,
          unloading_location: data.unloadingLocation,
          secondary_address: data.secondaryAddress || undefined,
          secondary_address_2: data.secondaryAddress2 || undefined,
          is_primary: data.isPrimary
        })

        // Add to local state
        setAddresses(prev => [...prev, result])
      }

      // Close dialog and reset form
      setDialogOpen(false)
      setEditingAddress(null)
      form.reset()
    } catch (err: any) {
      console.error('Failed to save loading address:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm(t('contacts.loading.confirmDelete'))) return

    try {
      setLoading(true)
      setError(null)

      await ContactService.deleteLoadingAddress(addressId)

      // Remove from local state
      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
    } catch (err: any) {
      console.error('Failed to delete loading address:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit address
  const handleEditAddress = (address: LoadingAddress) => {
    setEditingAddress(address)
    setDialogOpen(true)
  }

  // Handle set primary address
  const handleSetPrimary = async (addressId: string) => {
    try {
      setLoading(true)
      setError(null)

      await ContactService.updateLoadingAddress(addressId, {
        is_primary: true
      })

      // Update local state - set all to false except the selected one
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isPrimary: addr.id === addressId
      })))
    } catch (err: any) {
      console.error('Failed to set primary address:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Open new address dialog
  const handleNewAddress = () => {
    setEditingAddress(null)
    setDialogOpen(true)
  }

  const primaryAddress = addresses.find(addr => addr.isPrimary)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          {t('contacts.sections.loadingInfo')}
        </CardTitle>
        <CardDescription>
          {t('contacts.sections.loadingInfoDescription')}
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

        {/* Primary Address Summary */}
        {primaryAddress && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">
                {t('contacts.loading.primaryAddress')}
              </span>
            </div>
            <div className="text-sm text-green-700">
              <div className="font-medium">{primaryAddress.name}</div>
              <div>{primaryAddress.address}</div>
              <div>{primaryAddress.phone}</div>
            </div>
          </div>
        )}

        {/* Add New Address Button */}
        {!isReadOnly && (
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{t('contacts.loading.addressList')}</h4>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewAddress}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('contacts.loading.addAddress')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress
                      ? t('contacts.loading.editAddress')
                      : t('contacts.loading.newAddress')
                    }
                  </DialogTitle>
                  <DialogDescription>
                    {t('contacts.loading.addressFormDescription')}
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSaveAddress)} className="space-y-4">
                    {/* Name and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('contacts.fields.loadingName')}
                              <Badge variant="outline" className="ml-2">
                                {t('common.required')}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('contacts.placeholders.loadingName')}
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

                    {/* Address and Postal Code */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>
                              {t('contacts.fields.address')}
                              <Badge variant="outline" className="ml-2">
                                {t('common.required')}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('contacts.placeholders.address')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('contacts.fields.postalCode')}
                              <Badge variant="outline" className="ml-2">
                                {t('common.required')}
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('contacts.placeholders.postalCode')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Unloading Location */}
                    <FormField
                      control={form.control}
                      name="unloadingLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('contacts.fields.unloadingLocation')}
                            <Badge variant="outline" className="ml-2">
                              {t('common.required')}
                            </Badge>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t('contacts.placeholders.unloadingLocation')}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('contacts.help.unloadingLocation')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Secondary Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="secondaryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contacts.fields.secondaryAddress')}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                placeholder={t('contacts.placeholders.secondaryAddress')}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('contacts.help.secondaryAddress')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="secondaryAddress2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contacts.fields.secondaryAddress2')}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={2}
                                placeholder={t('contacts.placeholders.secondaryAddress2')}
                              />
                            </FormControl>
                            <FormDescription>
                              {t('contacts.help.secondaryAddress2')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Primary Address Checkbox */}
                    <FormField
                      control={form.control}
                      name="isPrimary"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {t('contacts.fields.setPrimaryAddress')}
                            </FormLabel>
                            <FormDescription>
                              {t('contacts.help.setPrimaryAddress')}
                            </FormDescription>
                          </div>
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
                        {t('contacts.loading.saveAddress')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Addresses Table */}
        {addresses.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('contacts.table.name')}</TableHead>
                  <TableHead>{t('contacts.table.address')}</TableHead>
                  <TableHead>{t('contacts.table.contact')}</TableHead>
                  <TableHead>{t('contacts.table.unloading')}</TableHead>
                  <TableHead>{t('contacts.table.status')}</TableHead>
                  {!isReadOnly && (
                    <TableHead className="text-right">{t('contacts.table.actions')}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {addresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {address.isPrimary && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        <span className="font-medium">{address.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{address.address}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {address.postalCode}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{address.phone}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm">{address.unloadingLocation}</span>
                    </TableCell>

                    <TableCell>
                      {address.isPrimary ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          {t('contacts.loading.primary')}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {t('contacts.loading.secondary')}
                        </Badge>
                      )}
                    </TableCell>

                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!address.isPrimary && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetPrimary(address.id)}
                              disabled={loading}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
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
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('contacts.loading.noAddresses')}</p>
            {!isReadOnly && (
              <Button onClick={handleNewAddress} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                {t('contacts.loading.addFirstAddress')}
              </Button>
            )}
          </div>
        )}

        {/* Information Alert */}
        <Alert>
          <Truck className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('contacts.loading.infoTitle')}:</strong>
            <br />
            {t('contacts.loading.infoDescription')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default LoadingAddressesForm