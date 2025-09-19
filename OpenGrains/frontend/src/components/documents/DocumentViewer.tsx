import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Download,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  RefreshCw,
  X
} from 'lucide-react'
import { ROMANIAN_DOCUMENT_TYPES, type RomanianDocumentType, type DocumentValidationStatus } from '../../../shared/types/romanian-documents'
import type { OCRResult } from '../../../shared/types/ocr-types'

interface Document {
  id: string
  supplierId: string
  documentType: RomanianDocumentType
  filename: string
  fileSize: number
  mimeType: string
  url: string
  thumbnailUrl?: string

  // Upload metadata
  uploadedAt: Date
  uploadedBy: string

  // Processing status
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed'
  validationStatus: DocumentValidationStatus

  // OCR results
  ocrResult?: OCRResult
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed'

  // Validation metadata
  validatedBy?: string
  validatedAt?: Date
  validationNotes?: string

  // Flags
  requiresReview: boolean
  isRequired: boolean
}

interface DocumentViewerProps {
  documents: Document[]
  currentDocumentId?: string
  onDocumentSelect?: (document: Document) => void
  onDocumentUpdate?: (documentId: string, updates: Partial<Document>) => void
  onDocumentDelete?: (documentId: string) => void
  showValidationControls?: boolean
  readOnly?: boolean
  className?: string
}

export const DocumentViewer = ({
  documents,
  currentDocumentId,
  onDocumentSelect,
  onDocumentUpdate,
  onDocumentDelete,
  showValidationControls = false,
  readOnly = true,
  className
}: DocumentViewerProps) => {
  const { t } = useTranslation(['common', 'documents'])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  const currentDocument = currentDocumentId
    ? documents.find(doc => doc.id === currentDocumentId)
    : null

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document)
    setViewerOpen(true)
    onDocumentSelect?.(document)
  }

  const getStatusIcon = (status: DocumentValidationStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'under_review':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: DocumentValidationStatus) => {
    const variants: Record<DocumentValidationStatus, { variant: any; label: string }> = {
      'not_reviewed': { variant: 'secondary', label: 'Nu a fost evaluat' },
      'under_review': { variant: 'default', label: 'În evaluare' },
      'approved': { variant: 'default', label: 'Aprobat' },
      'rejected': { variant: 'destructive', label: 'Respins' },
      'expired': { variant: 'destructive', label: 'Expirat' },
      'invalid': { variant: 'destructive', label: 'Invalid' }
    }

    const config = variants[status]
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {config.label}
      </Badge>
    )
  }

  const getOCRConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return <Badge className="bg-green-500">Încredere mare ({confidence}%)</Badge>
    } else if (confidence >= 70) {
      return <Badge variant="secondary">Încredere medie ({confidence}%)</Badge>
    } else {
      return <Badge variant="destructive">Încredere scăzută ({confidence}%)</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.documentType]) {
      acc[doc.documentType] = []
    }
    acc[doc.documentType].push(doc)
    return acc
  }, {} as Record<RomanianDocumentType, Document[]>)

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentele mele ({documents.length})
          </CardTitle>
          <CardDescription>
            Vizualizați și gestionați documentele încărcate
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="by-type" className="w-full">
            <TabsList>
              <TabsTrigger value="by-type">Grupate pe tip</TabsTrigger>
              <TabsTrigger value="chronological">Cronologic</TabsTrigger>
              <TabsTrigger value="status">După status</TabsTrigger>
            </TabsList>

            <TabsContent value="by-type" className="space-y-6">
              {Object.entries(groupedDocuments).map(([type, docs]) => {
                const docInfo = ROMANIAN_DOCUMENT_TYPES[type as RomanianDocumentType]
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-medium">{docInfo.nameRo}</h3>
                      {docInfo.required && (
                        <Badge variant="secondary" className="text-xs">Obligatoriu</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">({docs.length})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {docs.map((document) => (
                        <Card
                          key={document.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleDocumentClick(document)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(document.validationStatus)}
                                  <span className="text-sm font-medium truncate">
                                    {document.filename}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(document.url, '_blank')
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex items-center justify-between">
                                {getStatusBadge(document.validationStatus)}
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(document.fileSize)}
                                </span>
                              </div>

                              {document.ocrResult && (
                                <div className="text-xs">
                                  {getOCRConfidenceBadge(document.ocrResult.overallConfidence)}
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground">
                                Încărcat: {document.uploadedAt.toLocaleDateString('ro-RO')}
                              </div>

                              {document.validationNotes && (
                                <div className="text-xs bg-muted p-2 rounded">
                                  {document.validationNotes}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </TabsContent>

            <TabsContent value="chronological" className="space-y-4">
              {documents
                .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
                .map((document) => (
                  <Card
                    key={document.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleDocumentClick(document)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(document.validationStatus)}
                          <div>
                            <p className="font-medium">{document.filename}</p>
                            <p className="text-sm text-muted-foreground">
                              {ROMANIAN_DOCUMENT_TYPES[document.documentType].nameRo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(document.validationStatus)}
                          <span className="text-xs text-muted-foreground">
                            {document.uploadedAt.toLocaleDateString('ro-RO')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="status" className="space-y-6">
              {Object.entries(
                documents.reduce((acc, doc) => {
                  if (!acc[doc.validationStatus]) {
                    acc[doc.validationStatus] = []
                  }
                  acc[doc.validationStatus].push(doc)
                  return acc
                }, {} as Record<DocumentValidationStatus, Document[]>)
              ).map(([status, docs]) => (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(status as DocumentValidationStatus)}
                    <span className="text-sm text-muted-foreground">({docs.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {docs.map((document) => (
                      <Card
                        key={document.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleDocumentClick(document)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <p className="font-medium truncate">{document.filename}</p>
                            <p className="text-sm text-muted-foreground">
                              {ROMANIAN_DOCUMENT_TYPES[document.documentType].nameRo}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {document.uploadedAt.toLocaleDateString('ro-RO')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDocument?.filename}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument && ROMANIAN_DOCUMENT_TYPES[selectedDocument.documentType].nameRo}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="flex h-full">
              {/* Document Display */}
              <div className="flex-1 bg-muted rounded-lg overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.max(25, zoom - 25))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">{zoom}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.min(200, zoom + 25))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRotation((rotation + 90) % 360)}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedDocument.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descarcă
                  </Button>
                </div>

                <div className="p-4 flex justify-center">
                  {selectedDocument.mimeType.startsWith('image/') ? (
                    <img
                      src={selectedDocument.url}
                      alt={selectedDocument.filename}
                      style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        maxWidth: '100%',
                        maxHeight: '100%'
                      }}
                      className="transition-transform duration-200"
                    />
                  ) : (
                    <iframe
                      src={selectedDocument.url}
                      className="w-full h-full"
                      style={{ minHeight: '400px' }}
                    />
                  )}
                </div>
              </div>

              {/* Document Info Panel */}
              <div className="w-80 border-l p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Detalii document</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tip:</span><br />
                      {ROMANIAN_DOCUMENT_TYPES[selectedDocument.documentType].nameRo}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mărime:</span><br />
                      {formatFileSize(selectedDocument.fileSize)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Încărcat:</span><br />
                      {selectedDocument.uploadedAt.toLocaleDateString('ro-RO')}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span><br />
                      {getStatusBadge(selectedDocument.validationStatus)}
                    </div>
                  </div>
                </div>

                {selectedDocument.ocrResult && (
                  <div>
                    <h4 className="font-medium mb-2">Rezultat OCR</h4>
                    <div className="space-y-2">
                      {getOCRConfidenceBadge(selectedDocument.ocrResult.overallConfidence)}

                      <div className="bg-muted p-3 rounded text-xs space-y-1">
                        {Object.entries(selectedDocument.ocrResult.extractedData).map(([key, value]) => (
                          value && (
                            <div key={key}>
                              <strong>{key}:</strong> {String(value)}
                            </div>
                          )
                        ))}
                      </div>

                      {selectedDocument.ocrResult.warnings.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {selectedDocument.ocrResult.warnings.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}

                {selectedDocument.validationNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Note de validare</h4>
                    <div className="bg-muted p-3 rounded text-sm">
                      {selectedDocument.validationNotes}
                    </div>
                  </div>
                )}

                {showValidationControls && !readOnly && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Acțiuni</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobă
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <X className="h-4 w-4 mr-2" />
                        Respinge
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reprocesează OCR
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}