import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Brain,
  FileText,
  Edit,
  Check,
  X
} from 'lucide-react'

interface OCRResult {
  id: string
  documentId: string
  extractedText: string
  structuredData: Record<string, any>
  confidenceScore: number
  processedAt: string
  processingDuration: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

interface OCRResultsProps {
  documentId: string
  documentType: string
  documentName: string
  onApproveData?: (data: Record<string, any>) => void
  onRejectData?: (reason: string) => void
}

// Mock OCR result for demonstration
const mockOCRResult: OCRResult = {
  id: '1',
  documentId: '123',
  extractedText: 'ONRC J23/1234/2023\nSC FERMELE VERZI SRL\nCUI: RO12345678\nAdresa: Str. Principala nr. 15, Cluj-Napoca\nTelefon: 0264-123456\nEmail: contact@fermele-verzi.ro\nIBAN: RO49AAAA1B31007593840000',
  structuredData: {
    business_name: 'SC FERMELE VERZI SRL',
    cui: 'RO12345678',
    onrc_number: 'J23/1234/2023',
    address: 'Str. Principala nr. 15, Cluj-Napoca',
    phone: '0264-123456',
    email: 'contact@fermele-verzi.ro',
    iban: 'RO49AAAA1B31007593840000'
  },
  confidenceScore: 0.92,
  processedAt: new Date().toISOString(),
  processingDuration: 2340,
  status: 'completed'
}

export const OCRResults = ({
  documentName,
  onApproveData,
  onRejectData
}: OCRResultsProps) => {
  const { t } = useTranslation(['common', 'documents'])
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(mockOCRResult)
  const [isProcessing, setIsProcessing] = useState(false)
  const [editableData, setEditableData] = useState<Record<string, any>>(
    mockOCRResult.structuredData
  )
  const [isEditing, setIsEditing] = useState(false)

  const handleStartOCR = async () => {
    setIsProcessing(true)

    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      setOcrResult(mockOCRResult)
    } catch (error) {
      console.error('OCR processing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditField = (field: string, value: string) => {
    setEditableData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveEdits = () => {
    if (ocrResult) {
      setOcrResult({
        ...ocrResult,
        structuredData: editableData
      })
    }
    setIsEditing(false)
  }

  const handleCancelEdits = () => {
    setEditableData(ocrResult?.structuredData || {})
    setIsEditing(false)
  }

  const handleApprove = () => {
    onApproveData?.(editableData)
  }

  const handleReject = () => {
    onRejectData?.('Date OCR incorecte sau incomplete')
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) return 'default'
    if (score >= 0.6) return 'secondary'
    return 'destructive'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {t('documents:ocr.title')}
        </CardTitle>
        <CardDescription>
          Rezultatele procesării OCR pentru: <strong>{documentName}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Processing Status */}
        {isProcessing && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Se procesează documentul cu tehnologie OCR... Acest proces poate dura câteva minute.
            </AlertDescription>
          </Alert>
        )}

        {/* No OCR Results Yet */}
        {!ocrResult && !isProcessing && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Procesare OCR disponibilă</h3>
            <p className="text-muted-foreground mb-4">
              Faceți clic pe butonul de mai jos pentru a extrage automat datele din document.
            </p>
            <Button onClick={handleStartOCR}>
              <Brain className="mr-2 h-4 w-4" />
              Începe procesarea OCR
            </Button>
          </div>
        )}

        {/* OCR Results */}
        {ocrResult && (
          <div className="space-y-6">
            {/* Status and Confidence */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={getConfidenceBadge(ocrResult.confidenceScore)}>
                  {ocrResult.status === 'completed' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : ocrResult.status === 'failed' ? (
                    <XCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  )}
                  {t(`documents:ocr.status.${ocrResult.status}`)}
                </Badge>

                <Badge variant="outline">
                  Încredere: {Math.round(ocrResult.confidenceScore * 100)}%
                </Badge>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editează
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdits}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Anulează
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdits}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Salvează
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Confidence Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Încrederea în extragerea datelor</span>
                <span className={getConfidenceColor(ocrResult.confidenceScore)}>
                  {Math.round(ocrResult.confidenceScore * 100)}%
                </span>
              </div>
              <Progress value={ocrResult.confidenceScore * 100} className="h-2" />
            </div>

            <Separator />

            {/* Extracted Data */}
            <div className="space-y-4">
              <h4 className="font-medium">Date extrase din document</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(editableData).map(([field, value]) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {t(`documents:ocr.extracted_fields.${field}`, { defaultValue: field })}
                    </Label>
                    <Input
                      id={field}
                      value={value as string}
                      onChange={(e) => handleEditField(field, e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? 'border-primary' : ''}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Raw Text */}
            <div className="space-y-2">
              <h4 className="font-medium">Text extras (brut)</h4>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {ocrResult.extractedText}
                </pre>
              </div>
            </div>

            {/* Processing Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Procesat în: {(ocrResult.processingDuration / 1000).toFixed(1)} secunde</p>
              <p>Data procesării: {new Date(ocrResult.processedAt).toLocaleString('ro-RO')}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleApprove}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobă datele extrase
              </Button>

              <Button
                variant="destructive"
                onClick={handleReject}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Respinge datele
              </Button>
            </div>

            {/* Validation Notes */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Verificați cu atenție:</strong> Datele extrase automat trebuie verificate manual
                pentru a asigura acuratețea informațiilor. Editați câmpurile necesar înainte de aprobare.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}