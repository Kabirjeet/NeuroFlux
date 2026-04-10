import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  File, 
  Loader2,
  Download,
  Sparkles,
  Check 
} from 'lucide-react'
import toast from 'react-hot-toast'
import documentService from '../../../services/documentService'
import aiService from '../../../services/aiService'
import Spinner from '../../../components/common/Spinner'
import Button from '../../../components/common/Button'
import SummaryCard from '../../../components/documents/SummaryCard'

const DocumentSummaryPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await documentService.getDocumentById(id)
        setDocument(response.data || response)
        if (response.data?.summary) {
          setSummary(response.data.summary)
        }
      } catch (error) {
        toast.error('Failed to load document')
        navigate('/documents')
      } finally {
        setLoading(false)
      }
    }
    fetchDocument()
  }, [id, navigate])

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true)
    try {
      const response = await aiService.generateSummary(id)
      const newSummary = response.summary || response.data?.summary
      setSummary(newSummary)
      toast.success('Summary generated and saved!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate summary')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return <Spinner />
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-dark-100 mb-2">Summary not found</h3>
          <Button onClick={() => navigate('/documents')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/documents/${id}`)}
            className="mb-6 gap-2 text-dark-400 hover:text-dark-100"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Document
          </Button>

          <div className="glass-card p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/30 flex-shrink-0">
                <FileText className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-dark-100 mb-3">{document.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-dark-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDate(document.createdAt || document.uploadedAt)}
                  </span>
                  {document.fileSize && (
                    <span className="inline-flex items-center gap-1.5">
                      <File className="w-4 h-4" />
                      {formatFileSize(document.fileSize)}
                    </span>
                  )}
                  {document.pageCount && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-5 h-5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full p-1">
                        {document.pageCount}
                      </span>
                      pages
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {document.filePath && (
                  <a
                    href={document.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                )}
                <Button 
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="px-6 py-3"
                >
                  {generatingSummary ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Regenerate Summary
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {document.summary ? 'Regenerate Summary' : 'Generate Summary'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Summary Content */}
        <div className="space-y-6">
          {/* Summary Card */}
          <SummaryCard 
            document={document}
            summary={summary}
            generatingSummary={generatingSummary}
            onGenerateSummary={setSummary}
          />

          {/* Full Summary Preview */}
          {(document.summary || summary) && (
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-3">
                  <Check className="w-6 h-6 text-emerald-400" />
                  AI Generated Summary
                </h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const fullText = document.summary || summary
                      navigator.clipboard.writeText(fullText)
                      toast.success('Summary copied!')
                    }}
                  >
                    Copy
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/documents/${id}`)}
                  >
                    Back to Document
                  </Button>
                </div>
              </div>
              
              <div className="prose prose-headings:text-dark-100 prose-p:text-dark-200 prose-strong:text-dark-100 prose-a:text-emerald-400 max-w-none p-6 bg-gradient-to-b from-emerald-500/2 to-transparent rounded-2xl border border-emerald-500/20 max-h-[70vh] overflow-y-auto">
                <div className="whitespace-pre-wrap leading-relaxed text-lg">
                  {document.summary || summary}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentSummaryPage

