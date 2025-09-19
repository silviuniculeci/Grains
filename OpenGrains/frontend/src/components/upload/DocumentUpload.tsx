import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { uploadDocument } from '@/lib/supabase'
import { Upload, FileText, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react'

interface DocumentUploadProps {
  supplierId: string
  onUploadSuccess?: (documentId: string) => void
  maxFiles?: number
}

type DocumentType = 'onrc_certificate' | 'farmer_id_card' | 'apia_certificate' | 'bank_statement' | 'identity_card' | 'other'

interface UploadingFile {
  file: File
  documentType: DocumentType
  progress: number
  status: 'uploading' | 'completed' | 'failed'
  error?: string
  documentId?: string
}

const DOCUMENT_TYPES: { value: DocumentType; labelKey: string }[] = [
  { value: 'onrc_certificate', labelKey: 'onrc_certificate' },
  { value: 'farmer_id_card', labelKey: 'farmer_id_card' },
  { value: 'apia_certificate', labelKey: 'apia_certificate' },
  { value: 'bank_statement', labelKey: 'bank_statement' },
  { value: 'identity_card', labelKey: 'identity_card' },
  { value: 'other', labelKey: 'other' },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export const DocumentUpload = ({ supplierId, onUploadSuccess, maxFiles = 5 }: DocumentUploadProps) => {
  const { t } = useTranslation(['common', 'documents'])
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('other')
  const [dragActive, setDragActive] = useState(false)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return t('documents:errors.file_too_large')
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t('documents:errors.invalid_file_type')
    }
    return null
  }

  const handleFiles = useCallback(async (files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxFiles - uploadingFiles.length)

    for (const file of newFiles) {
      const validationError = validateFile(file)
      if (validationError) {
        // Add failed file to list
        setUploadingFiles(prev => [...prev, {
          file,
          documentType: selectedDocumentType,
          progress: 0,
          status: 'failed',
          error: validationError
        }])
        continue
      }

      // Add uploading file to list
      const uploadingFile: UploadingFile = {
        file,
        documentType: selectedDocumentType,
        progress: 0,
        status: 'uploading'
      }

      setUploadingFiles(prev => [...prev, uploadingFile])

      try {
        // Start upload
        const result = await uploadDocument(file, supplierId, selectedDocumentType)

        // Update file status to completed
        setUploadingFiles(prev => prev.map(f =>
          f.file.name === file.name
            ? { ...f, status: 'completed', progress: 100, documentId: result.id }
            : f
        ))

        onUploadSuccess?.(result.id)
      } catch (error: any) {
        // Update file status to failed
        setUploadingFiles(prev => prev.map(f =>
          f.file.name === file.name
            ? { ...f, status: 'failed', error: error.message }
            : f
        ))
      }
    }
  }, [supplierId, selectedDocumentType, maxFiles, uploadingFiles.length, onUploadSuccess, t])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file.name !== file.name))
  }

  const canAddMore = uploadingFiles.length < maxFiles

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('documents:upload.title')}
        </CardTitle>
        <CardDescription>
          {t('documents:upload.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="documentType">{t('documents:upload.document_type')}</Label>
          <Select onValueChange={(value: DocumentType) => setSelectedDocumentType(value)} defaultValue={selectedDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder={t('documents:upload.select_type')} />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {t(`documents:types.${type.labelKey}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Area */}
        {canAddMore && (
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('documents:upload.drop_files')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('documents:upload.or_click')}
            </p>
            <Button variant="secondary">
              {t('documents:upload.browse_files')}
            </Button>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>{t('documents:upload.max_size')}: 10MB</p>
              <p>{t('documents:upload.accepted_formats')}: JPG, PNG, WebP, PDF</p>
              <p>{t('documents:upload.remaining_slots')}: {maxFiles - uploadingFiles.length}</p>
            </div>
          </div>
        )}

        {/* File List */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">{t('documents:upload.uploaded_files')}</h4>

            {uploadingFiles.map((uploadingFile, index) => (
              <div key={`${uploadingFile.file.name}-${index}`} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{uploadingFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t(`documents:types.${uploadingFile.documentType}`)} • {(uploadingFile.file.size / 1024 / 1024).toFixed(2)}MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {uploadingFile.status === 'uploading' && (
                      <Badge variant="secondary">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        {t('documents:upload.uploading')}
                      </Badge>
                    )}

                    {uploadingFile.status === 'completed' && (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('documents:upload.completed')}
                      </Badge>
                    )}

                    {uploadingFile.status === 'failed' && (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {t('documents:upload.failed')}
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadingFile.file)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {uploadingFile.status === 'uploading' && (
                  <Progress value={uploadingFile.progress} className="h-2" />
                )}

                {uploadingFile.status === 'failed' && uploadingFile.error && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-sm">
                      {uploadingFile.error}
                    </AlertDescription>
                  </Alert>
                )}

                {uploadingFile.status === 'completed' && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      {t('documents:upload.view')}
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      {t('documents:upload.ocr_processing')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {uploadingFiles.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span>{t('documents:upload.total_files')}: {uploadingFiles.length}</span>
              <div className="flex gap-4">
                <span className="text-green-600">
                  {t('documents:upload.completed')}: {uploadingFiles.filter(f => f.status === 'completed').length}
                </span>
                <span className="text-red-600">
                  {t('documents:upload.failed')}: {uploadingFiles.filter(f => f.status === 'failed').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}