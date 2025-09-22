import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContactService } from '@/services/contact-service'
import type { Contact, ContactDocument, ValidationStatus } from '../../../../shared/types/contact-types'
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Loader2,
  Image,
  File,
  Camera,
  Shield
} from 'lucide-react'

interface DocumentUploadFormProps {
  contact?: Contact | null
  isReadOnly: boolean
}

interface DocumentUploadState {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  contact,
  isReadOnly
}) => {
  const { t } = useTranslation()

  const [documents, setDocuments] = useState<ContactDocument[]>(contact?.documents || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null)

  // Upload state
  const [uploads, setUploads] = useState<Map<string, DocumentUploadState>>(new Map())
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('')
  const [documentDescription, setDocumentDescription] = useState<string>('')

  // Load documents when contact changes
  useEffect(() => {
    if (contact?.documents) {
      setDocuments(contact.documents)
    }
  }, [contact])

  // Document types
  const documentTypes = [
    { value: 'onrc_certificate', label: t('contacts.documents.types.onrc_certificate') },
    { value: 'farmer_id_card', label: t('contacts.documents.types.farmer_id_card') },
    { value: 'apia_certificate', label: t('contacts.documents.types.apia_certificate') },
    { value: 'bank_statement', label: t('contacts.documents.types.bank_statement') },
    { value: 'identity_card', label: t('contacts.documents.types.identity_card') },
    { value: 'other', label: t('contacts.documents.types.other') }
  ]

  // File upload with drag and drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB max
    multiple: true,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setError(t('contacts.documents.uploadErrors.invalidFiles'))
        return
      }

      acceptedFiles.forEach(file => {
        handleFileUpload(file)
      })
    }
  })

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!contact) return

    if (!selectedDocumentType) {
      setError(t('contacts.documents.uploadErrors.typeRequired'))
      return
    }

    const uploadId = Math.random().toString(36).substr(2, 9)

    // Initialize upload state
    setUploads(prev => new Map(prev.set(uploadId, {
      file,
      progress: 0,
      status: 'uploading'
    })))

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploads(prev => {
          const newMap = new Map(prev)
          const upload = newMap.get(uploadId)
          if (upload && upload.progress < 90) {
            newMap.set(uploadId, { ...upload, progress: upload.progress + 10 })
          }
          return newMap
        })
      }, 200)

      const result = await ContactService.uploadDocument(
        contact.id,
        file,
        selectedDocumentType,
        documentDescription || undefined
      )

      clearInterval(progressInterval)

      // Complete upload
      setUploads(prev => {
        const newMap = new Map(prev)
        newMap.set(uploadId, {
          file,
          progress: 100,
          status: 'completed'
        })
        return newMap
      })

      // Add to documents list
      setDocuments(prev => [...prev, result])

      // Remove upload state after delay
      setTimeout(() => {
        setUploads(prev => {
          const newMap = new Map(prev)
          newMap.delete(uploadId)
          return newMap
        })
      }, 2000)

      // Reset form
      setSelectedDocumentType('')
      setDocumentDescription('')
    } catch (err: any) {
      console.error('Document upload failed:', err)

      setUploads(prev => {
        const newMap = new Map(prev)
        newMap.set(uploadId, {
          file,
          progress: 0,
          status: 'error',
          error: err.message
        })
        return newMap
      })
    }
  }

  // Handle delete document
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm(t('contacts.documents.confirmDelete'))) return

    try {
      setLoading(true)
      setError(null)

      await ContactService.deleteDocument(documentId)

      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (err: any) {
      console.error('Failed to delete document:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle view document
  const handleViewDocument = (document: ContactDocument) => {
    // This would typically generate a signed URL from the storage service
    const mockUrl = `https://storage.opengrains.com/${document.filePath}`
    setViewDocumentUrl(mockUrl)
  }

  // Handle download document
  const handleDownloadDocument = (document: ContactDocument) => {
    // This would typically generate a download URL
    const downloadUrl = `https://storage.opengrains.com/${document.filePath}?download=1`
    window.open(downloadUrl, '_blank')
  }

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-500" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  // Get validation status badge
  const getValidationBadge = (status: ValidationStatus) => {
    const variants: Record<ValidationStatus, { icon: any, variant: 'outline' | 'default' | 'destructive', color: string }> = {
      not_reviewed: { icon: Clock, variant: 'outline' as const, color: 'text-gray-600' },
      under_review: { icon: Loader2, variant: 'default' as const, color: 'text-yellow-600' },
      approved: { icon: CheckCircle, variant: 'default' as const, color: 'text-green-600' },
      rejected: { icon: AlertTriangle, variant: 'destructive' as const, color: 'text-red-600' }
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {t(`contacts.validation.${status}`)}
      </Badge>
    )
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('contacts.sections.documents')}
        </CardTitle>
        <CardDescription>
          {t('contacts.sections.documentsDescription')}
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

        {/* Upload Section */}
        {!isReadOnly && (
          <div className="space-y-4">
            {/* Document Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('contacts.fields.documentType')}
                </label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('contacts.placeholders.documentType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('contacts.fields.description')}
                </label>
                <Input
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder={t('contacts.placeholders.documentDescription')}
                />
              </div>
            </div>

            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-blue-600">{t('contacts.documents.dropFiles')}</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    {t('contacts.documents.uploadArea')}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('contacts.documents.uploadAreaDescription')}
                  </p>
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    {t('contacts.documents.selectFiles')}
                  </Button>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploads.size > 0 && (
              <div className="space-y-2">
                {Array.from(uploads.entries()).map(([uploadId, upload]) => (
                  <div key={uploadId} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getFileIcon(upload.file.type)}
                        <span className="text-sm font-medium">{upload.file.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(upload.file.size)}
                        </span>
                      </div>
                      {upload.status === 'uploading' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploads(prev => {
                              const newMap = new Map(prev)
                              newMap.delete(uploadId)
                              return newMap
                            })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {upload.status === 'uploading' && (
                      <Progress value={upload.progress} className="h-2" />
                    )}

                    {upload.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        {t('contacts.documents.uploadCompleted')}
                      </div>
                    )}

                    {upload.status === 'error' && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        {upload.error || t('contacts.documents.uploadFailed')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents List */}
        <div>
          <h4 className="font-medium mb-4">
            {t('contacts.documents.documentList')} ({documents.length})
          </h4>

          {documents.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('contacts.table.document')}</TableHead>
                    <TableHead>{t('contacts.table.type')}</TableHead>
                    <TableHead>{t('contacts.table.uploadedBy')}</TableHead>
                    <TableHead>{t('contacts.table.uploadedAt')}</TableHead>
                    <TableHead>{t('contacts.table.status')}</TableHead>
                    <TableHead className="text-right">{t('contacts.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(document.mimeType)}
                          <div>
                            <div className="font-medium">{document.filename}</div>
                            {document.description && (
                              <div className="text-sm text-muted-foreground">
                                {document.description}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(document.fileSize)}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {documentTypes.find(type => type.value === document.documentType)?.label || document.documentType}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm">{document.uploadedBy}</span>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm">
                          {document.uploadedAt.toLocaleDateString()}
                        </span>
                      </TableCell>

                      <TableCell>
                        {getValidationBadge(document.validationStatus)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(document)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadDocument(document)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {!isReadOnly && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(document.id)}
                              disabled={loading}
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('contacts.documents.noDocuments')}</p>
              {!isReadOnly && (
                <p className="text-sm mt-2">
                  {t('contacts.documents.uploadInstructions')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Document Validation Summary */}
        {documents.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                {t('contacts.documents.validationSummary')}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">{t('contacts.validation.not_reviewed')}:</span>
                <div className="text-blue-700">
                  {documents.filter(d => d.validationStatus === 'not_reviewed').length}
                </div>
              </div>
              <div>
                <span className="font-medium">{t('contacts.validation.under_review')}:</span>
                <div className="text-blue-700">
                  {documents.filter(d => d.validationStatus === 'under_review').length}
                </div>
              </div>
              <div>
                <span className="font-medium">{t('contacts.validation.approved')}:</span>
                <div className="text-blue-700">
                  {documents.filter(d => d.validationStatus === 'approved').length}
                </div>
              </div>
              <div>
                <span className="font-medium">{t('contacts.validation.rejected')}:</span>
                <div className="text-blue-700">
                  {documents.filter(d => d.validationStatus === 'rejected').length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Alert */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('contacts.documents.infoTitle')}:</strong>
            <br />
            {t('contacts.documents.infoDescription')}
          </AlertDescription>
        </Alert>

        {/* Document Viewer Dialog */}
        {viewDocumentUrl && (
          <Dialog open={!!viewDocumentUrl} onOpenChange={() => setViewDocumentUrl(null)}>
            <DialogContent className="max-w-4xl h-[80vh]">
              <DialogHeader>
                <DialogTitle>{t('contacts.documents.viewDocument')}</DialogTitle>
                <DialogDescription>
                  {t('contacts.documents.viewDocumentDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={viewDocumentUrl}
                  className="w-full h-full border rounded"
                  title={t('contacts.documents.documentViewer')}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}

export default DocumentUploadForm