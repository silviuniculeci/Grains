import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { ROMANIAN_DOCUMENT_TYPES, type RomanianDocumentType } from '../../../shared/types/romanian-documents'
import type { OCRResult } from '../../../shared/types/ocr-types'

interface DocumentFile {
  id: string
  file: File
  type: RomanianDocumentType
  uploadProgress: number
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed'
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed'
  ocrResult?: OCRResult
  error?: string
  url?: string
}

interface DocumentUploadProps {
  supplierId?: string
  onUploadComplete?: (documents: DocumentFile[]) => void
  onDocumentSelect?: (document: DocumentFile) => void
  allowedTypes?: RomanianDocumentType[]
  maxFiles?: number
  className?: string
}

export const DocumentUpload = ({
  supplierId,
  onUploadComplete,
  onDocumentSelect,
  allowedTypes,
  maxFiles = 10,
  className
}: DocumentUploadProps) => {
  const { t } = useTranslation(['common', 'documents'])
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [selectedType, setSelectedType] = useState<RomanianDocumentType>('onrc_certificate')
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocuments: DocumentFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: selectedType,
      uploadProgress: 0,
      uploadStatus: 'pending',
      ocrStatus: 'pending'
    }))

    setDocuments(prev => [...prev, ...newDocuments])

    // Start uploading immediately
    newDocuments.forEach(doc => {
      uploadDocument(doc)
    })
  }, [selectedType])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: maxFiles - documents.length,
    disabled: documents.length >= maxFiles
  })

  const uploadDocument = async (document: DocumentFile) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === document.id
          ? { ...doc, uploadStatus: 'uploading' }
          : doc
      )
    )

    try {
      // Simulate file upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setDocuments(prev =>
          prev.map(doc =>
            doc.id === document.id
              ? { ...doc, uploadProgress: progress }
              : doc
          )
        )
      }

      // Mock upload completion
      const mockUrl = URL.createObjectURL(document.file)

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? {
                ...doc,
                uploadStatus: 'completed',
                uploadProgress: 100,
                url: mockUrl,
                ocrStatus: 'processing'
              }
            : doc
        )
      )

      // Start OCR processing
      await processOCR(document)

    } catch (error: any) {
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? {
                ...doc,
                uploadStatus: 'failed',
                error: error.message || 'Upload failed'
              }
            : doc
        )
      )
    }
  }

  const processOCR = async (document: DocumentFile) => {
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock OCR result
      const mockOCRResult: OCRResult = {
        id: 'ocr-' + document.id,
        documentId: document.id,
        documentType: document.type,
        rawText: 'Sample extracted text from ' + document.file.name,
        extractedData: {
          businessName: 'S.C. AGRO FARM S.R.L.',
          cui: 'RO12345678',
          onrcNumber: 'J12/1234/2023',
          address: 'Str. Exemplu nr. 123, Cluj-Napoca',
          iban: 'RO49AAAA1B31007593840000'
        },
        overallConfidence: 85,
        fieldConfidences: {
          businessName: 90,
          cui: 88,
          onrcNumber: 92,
          address: 80,
          iban: 85
        },
        confidenceLevel: 'medium',
        processingTime: 3000,
        processedAt: new Date(),
        ocrProvider: 'openai',
        errors: [],
        warnings: ['Low image quality detected'],
        requiresReview: false
      }

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? {
                ...doc,
                ocrStatus: 'completed',
                ocrResult: mockOCRResult
              }
            : doc
        )
      )

    } catch (error: any) {
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? {
                ...doc,
                ocrStatus: 'failed',
                error: error.message || 'OCR processing failed'
              }
            : doc
        )
      )
    }
  }

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const retryProcessing = async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId)
    if (!document) return

    if (document.uploadStatus === 'failed') {
      await uploadDocument(document)
    } else if (document.ocrStatus === 'failed') {
      await processOCR(document)
    }
  }

  const getStatusIcon = (document: DocumentFile) => {
    if (document.uploadStatus === 'uploading') {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    if (document.uploadStatus === 'failed' || document.ocrStatus === 'failed') {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (document.ocrStatus === 'processing') {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (document.ocrStatus === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getStatusText = (document: DocumentFile) => {
    if (document.uploadStatus === 'uploading') {
      return `Uploading... ${document.uploadProgress}%`
    }
    if (document.uploadStatus === 'failed') {
      return 'Upload failed'
    }
    if (document.ocrStatus === 'processing') {
      return 'Processing OCR...'
    }
    if (document.ocrStatus === 'failed') {
      return 'OCR failed'
    }
    if (document.ocrStatus === 'completed') {
      return `OCR completed (${document.ocrResult?.overallConfidence}% confidence)`
    }
    return 'Ready for processing'
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return <Badge variant="default" className="bg-green-500">High ({confidence}%)</Badge>
    } else if (confidence >= 70) {
      return <Badge variant="secondary">Medium ({confidence}%)</Badge>
    } else {
      return <Badge variant="destructive">Low ({confidence}%)</Badge>
    }
  }

  const allowedDocumentTypes = allowedTypes || Object.keys(ROMANIAN_DOCUMENT_TYPES) as RomanianDocumentType[]

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Încărcare documente
          </CardTitle>
          <CardDescription>
            Încărcați documentele necesare pentru verificarea profilului
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipul documentului</label>
            <Select value={selectedType} onValueChange={(value: RomanianDocumentType) => setSelectedType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedDocumentTypes.map((type) => {
                  const docInfo = ROMANIAN_DOCUMENT_TYPES[type]
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center justify-between w-full">
                        <span>{docInfo.nameRo}</span>
                        {docInfo.required && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Obligatoriu
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-muted-foreground">
                {ROMANIAN_DOCUMENT_TYPES[selectedType].description}
              </p>
            )}
          </div>

          {/* Drop Zone */}
          {documents.length < maxFiles && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Eliberați pentru a încărca...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Trageți documentele aici sau faceți clic pentru a selecta
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Acceptă: JPG, PNG, PDF • Max {maxFiles} fișiere
                  </p>
                  <Button variant="outline" type="button">
                    Selectează fișiere
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Document List */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Documente încărcate ({documents.length})</h3>

              {documents.map((document) => (
                <Card key={document.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(document)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {document.file.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {ROMANIAN_DOCUMENT_TYPES[document.type].nameRo}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          {getStatusText(document)}
                        </p>

                        {/* Upload Progress */}
                        {document.uploadStatus === 'uploading' && (
                          <Progress value={document.uploadProgress} className="w-full h-2 mb-2" />
                        )}

                        {/* OCR Results */}
                        {document.ocrResult && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Confidence:</span>
                              {getConfidenceBadge(document.ocrResult.overallConfidence)}
                            </div>

                            {document.ocrResult.extractedData && (
                              <div className="bg-muted p-2 rounded text-xs">
                                <p><strong>Business:</strong> {document.ocrResult.extractedData.businessName || 'N/A'}</p>
                                <p><strong>CUI:</strong> {document.ocrResult.extractedData.cui || 'N/A'}</p>
                                <p><strong>IBAN:</strong> {document.ocrResult.extractedData.iban || 'N/A'}</p>
                              </div>
                            )}

                            {document.ocrResult.warnings.length > 0 && (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  {document.ocrResult.warnings.join(', ')}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}

                        {/* Error Display */}
                        {document.error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {document.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {document.url && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDocumentSelect?.(document)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = document.url!
                              link.download = document.file.name
                              link.click()
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {(document.uploadStatus === 'failed' || document.ocrStatus === 'failed') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryProcessing(document.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(document.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Summary */}
          {documents.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {documents.filter(d => d.ocrStatus === 'completed').length} of {documents.length} processed
                </div>
                <Button
                  onClick={() => onUploadComplete?.(documents)}
                  disabled={documents.some(d => d.uploadStatus !== 'completed' || d.ocrStatus === 'processing')}
                >
                  Finalizează încărcarea
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}