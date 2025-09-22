import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { ContactService } from '@/services/contact-service'
import type {
  Contact,
  ContactFilters,
  ContactListResponse,
  ContactStatus,
  ContactType,
  ContactLegalType,
  ValidationStatus
} from '../../../../shared/types/contact-types'
import { useAuth } from '@/hooks/useAuth'

interface ContactListProps {
  navigate: {
    toList: () => void
    toNew: () => void
    toEdit: (id: string) => void
    toView: (id: string) => void
  }
}

const ContactList: React.FC<ContactListProps> = ({ navigate }) => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all')
  const [legalTypeFilter, setLegalTypeFilter] = useState<ContactLegalType | 'all'>('all')
  const [validationStatusFilter, setValidationStatusFilter] = useState<ValidationStatus | 'all'>('all')

  // Load contacts
  const loadContacts = async (newFilters: ContactFilters = filters) => {
    try {
      setLoading(true)
      setError(null)

      const response: ContactListResponse = await ContactService.getAll(newFilters)

      setContacts(response.contacts)
      setTotalCount(response.totalCount)
      setCurrentPage(response.page)
      setHasMore(response.hasMore)
    } catch (err: any) {
      console.error('Failed to load contacts:', err)
      setError(err.message || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const applyFilters = () => {
    const newFilters: ContactFilters = {
      ...filters,
      page: 1,
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : [statusFilter],
      contactType: typeFilter === 'all' ? undefined : [typeFilter],
      legalType: legalTypeFilter === 'all' ? undefined : [legalTypeFilter],
      validationStatus: validationStatusFilter === 'all' ? undefined : [validationStatusFilter],
      // Only show contacts for current agent if user is sales agent
      agentId: user?.role === 'sales_agent' ? user.id : undefined
    }

    setFilters(newFilters)
    loadContacts(newFilters)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
    setLegalTypeFilter('all')
    setValidationStatusFilter('all')

    const newFilters: ContactFilters = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      agentId: user?.role === 'sales_agent' ? user.id : undefined
    }

    setFilters(newFilters)
    loadContacts(newFilters)
  }

  // Handle pagination
  const handlePagination = (direction: 'prev' | 'next') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    loadContacts(newFilters)
  }

  // Handle contact actions
  const handleViewContact = (contactId: string) => {
    navigate.toView(contactId)
  }

  const handleEditContact = (contactId: string) => {
    navigate.toEdit(contactId)
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm(t('contacts.confirmDelete'))) return

    try {
      await ContactService.delete(contactId)
      loadContacts() // Reload the list
    } catch (err: any) {
      console.error('Failed to delete contact:', err)
      alert(t('contacts.deleteError'))
    }
  }

  // Status badge styling
  const getStatusBadge = (status: ContactStatus) => {
    const variants: Record<ContactStatus, { variant: 'secondary' | 'default' | 'destructive', color: string }> = {
      draft: { variant: 'secondary' as const, color: 'text-gray-600' },
      pending_validation: { variant: 'default' as const, color: 'text-yellow-600' },
      valid: { variant: 'default' as const, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, color: 'text-red-600' }
    }

    return (
      <Badge variant={variants[status].variant} className={variants[status].color}>
        {t(`contacts.status.${status}`)}
      </Badge>
    )
  }

  // Contact type badge
  const getTypeBadge = (type: ContactType) => {
    const colors: Record<ContactType, string> = {
      supplier: 'bg-blue-100 text-blue-800',
      buyer: 'bg-green-100 text-green-800',
      both: 'bg-purple-100 text-purple-800'
    }

    return (
      <Badge variant="outline" className={colors[type]}>
        {t(`contacts.type.${type}`)}
      </Badge>
    )
  }

  // Legal type icon
  const getLegalTypeIcon = (legalType: ContactLegalType) => {
    return legalType === 'individual' ? (
      <User className="h-4 w-4 text-blue-500" />
    ) : (
      <Building2 className="h-4 w-4 text-green-500" />
    )
  }

  useEffect(() => {
    loadContacts()
  }, [])

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={() => loadContacts()} className="mt-4">
                {t('common.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('contacts.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('contacts.description')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
          <Button onClick={() => navigate.toNew()}>
            <Plus className="h-4 w-4 mr-2" />
            {t('contacts.addNew')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('common.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('contacts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder={t('contacts.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="draft">{t('contacts.status.draft')}</SelectItem>
                <SelectItem value="pending_validation">{t('contacts.status.pending_validation')}</SelectItem>
                <SelectItem value="valid">{t('contacts.status.valid')}</SelectItem>
                <SelectItem value="rejected">{t('contacts.status.rejected')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder={t('contacts.filterByType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="supplier">{t('contacts.type.supplier')}</SelectItem>
                <SelectItem value="buyer">{t('contacts.type.buyer')}</SelectItem>
                <SelectItem value="both">{t('contacts.type.both')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Legal Type Filter */}
            <Select value={legalTypeFilter} onValueChange={(value) => setLegalTypeFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder={t('contacts.filterByLegalType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="individual">{t('contacts.legalType.individual')}</SelectItem>
                <SelectItem value="legal_entity">{t('contacts.legalType.legal_entity')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Validation Status Filter */}
            <Select value={validationStatusFilter} onValueChange={(value) => setValidationStatusFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder={t('contacts.filterByValidation')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="not_reviewed">{t('contacts.validation.not_reviewed')}</SelectItem>
                <SelectItem value="under_review">{t('contacts.validation.under_review')}</SelectItem>
                <SelectItem value="approved">{t('contacts.validation.approved')}</SelectItem>
                <SelectItem value="rejected">{t('contacts.validation.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters}>
              {t('common.applyFilters')}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              {t('common.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('contacts.list')} ({totalCount})
          </CardTitle>
          <CardDescription>
            {loading ? t('common.loading') : t('contacts.listDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>{t('common.loading')}</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('contacts.noContacts')}</p>
              <Button onClick={() => navigate.toNew()} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                {t('contacts.addFirst')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('contacts.table.id')}</TableHead>
                    <TableHead>{t('contacts.table.name')}</TableHead>
                    <TableHead>{t('contacts.table.legalType')}</TableHead>
                    <TableHead>{t('contacts.table.taxId')}</TableHead>
                    <TableHead>{t('contacts.table.type')}</TableHead>
                    <TableHead>{t('contacts.table.status')}</TableHead>
                    <TableHead>{t('contacts.table.contact')}</TableHead>
                    <TableHead>{t('contacts.table.location')}</TableHead>
                    <TableHead className="text-right">{t('contacts.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell
                        onClick={() => handleViewContact(contact.id)}
                        className="font-mono text-sm"
                      >
                        <span className="text-blue-600 hover:underline">
                          {contact.id.slice(0, 8)}
                        </span>
                      </TableCell>

                      <TableCell onClick={() => handleViewContact(contact.id)}>
                        <div className="flex items-center gap-2">
                          {getLegalTypeIcon(contact.legalType)}
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            {contact.legalType === 'individual' && contact.individualData && (
                              <div className="text-sm text-muted-foreground">
                                {contact.individualData.firstName} {contact.individualData.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getLegalTypeIcon(contact.legalType)}
                          <span className="text-sm">
                            {t(`contacts.legalType.${contact.legalType}`)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-sm">
                          {contact.taxId || '-'}
                        </span>
                      </TableCell>

                      <TableCell>
                        {getTypeBadge(contact.contactType)}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(contact.status)}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-32">{contact.basicInfo.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{contact.basicInfo.phone}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-32">
                            {contact.basicInfo.city}, {contact.basicInfo.county}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewContact(contact.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContact(contact.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {(user?.role === 'admin' || user?.role === 'back_office') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalCount > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {t('common.showing')} {((currentPage - 1) * (filters.limit || 20)) + 1} - {Math.min(currentPage * (filters.limit || 20), totalCount)} {t('common.of')} {totalCount}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePagination('prev')}
                  disabled={currentPage === 1}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePagination('next')}
                  disabled={!hasMore}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactList