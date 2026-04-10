import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  BookOpen, 
  BrainCircuit, 
  Check, 
  Clock, 
  Loader2,
  File,
  Play,
  Sparkles,
  MessageSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import documentService from '../../../services/documentService'
import aiService from '../../../services/aiService'
import Spinner from '../../../components/common/Spinner'
import Button from '../../../components/common/Button'

const DocumentDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [summary, setSummary] = useState(null)
  const [showFullSummary, setShowFullSummary] = useState(false)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await documentService.getDocumentById(id)
        // API returns { success: true, data: documentData }
        setDocument(response.data || response)
        if (response.data?.summary) {
          setSummary(response.data.summary)
        }
      } catch (error) {
        toast.error('Failed to load document')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchDocument()
  }, [id])

  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true)
    try {
      const response = await aiService.generateFlashcards(id)
  toast.success('Flashcards generated successfully!')
      navigate(`/documents/${id}/flashcards`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate flashcards')
    } finally {
      setGeneratingFlashcards(false)
    }
  }

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true)
    try {
      const response = await aiService.generateQuiz(id)
      toast.success('Quiz generated successfully!')
      navigate(`/quizzes/${response.quizId}`)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate quiz')
    } finally {
      setGeneratingQuiz(false)
    }
  }

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true)
    try {
      const response = await aiService.generateSummary(id)
      setSummary(response.summary || response.data?.summary || 'Summary generated successfully!')
      toast.success('Summary generated and saved to document!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate summary')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleChat = () => {
    navigate(`/documents/${id}/chat`)
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
          <h3 className="text-xl font-semibold text-dark-100 mb-2">Document not found</h3>
          <p className="text-dark-400 mb-6">The document you're looking for doesn't exist.</p>
          <Link to="/documents">
            <Button>
              <ArrowLeft className="w-4 h-4" />
              Back to Documents
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </button>
          
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Document Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <FileText className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              
              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-dark-100 mb-2">
                  {document.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
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
                      <span className="w-4 h-4 flex items-center justify-center text-xs font-medium">
                        {document.pageCount}
                      </span>
                      pages
                    </span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
{document.filePath && (
                  <a
                    href={document.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700 text-dark-200 font-medium hover:bg-dark-600 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Actions Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            AI Learning Tools
          </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {/* Generate Flashcards */}
            <div className="glass-card p-6 hover:shadow-xl hover:border-dark-600 transition-all duration-300 group h-52">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-100 text-base mb-1 line-clamp-1">Generate Flashcards</h3>
                  <p className="text-sm text-dark-400 line-clamp-2 mb-3 leading-relaxed">
                    Create AI-powered flashcards from this document for effective learning.
                  </p>
                  <Button 
                    size="sm"
                    onClick={handleGenerateFlashcards}
                    disabled={generatingFlashcards}
                    className="w-full"
                  >
                    {generatingFlashcards ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span className="text-xs">Generate Flashcards</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Generate Quiz */}
            <div className="glass-card p-6 hover:shadow-xl hover:border-dark-600 transition-all duration-300 group h-52">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                  <BrainCircuit className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-100 text-base mb-1 line-clamp-1">Generate Quiz</h3>
                  <p className="text-sm text-dark-400 line-clamp-2 mb-3 leading-relaxed">
                    Create an interactive quiz to test your understanding of the material.
                  </p>
                  <Button 
                    size="sm"
                    onClick={handleGenerateQuiz}
                    disabled={generatingQuiz}
                    className="w-full"
                  >
                    {generatingQuiz ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span className="text-xs">Generate Quiz</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Generate Summary */}
            <div className="glass-card p-6 hover:shadow-xl hover:border-dark-600 transition-all duration-300 group h-52">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-100 text-base mb-1 line-clamp-1">Generate Summary</h3>
                  <p className="text-sm text-dark-400 line-clamp-2 mb-3 leading-relaxed">
                    Get AI-powered summary of key points from this document.
                  </p>
                  <Button 
                    size="sm"
                    onClick={handleGenerateSummary}
                    disabled={generatingSummary}
                    className="w-full"
                  >
                    {generatingSummary ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Generating...</span>
                      </>
                    ) : document.summary ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span className="text-xs">View Summary</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span className="text-xs">Generate Summary</span>
                      </>
                    )}
                  </Button>
                  {document.summary && (
                    <div className="text-xs text-emerald-400 mt-2 text-center">
                      Summary generated! <Button variant="link" size="sm" onClick={() => navigate(`/documents/${id}/summary`)} className="h-auto p-0 -ml-1 text-emerald-400 hover:text-emerald-300 text-xs">View full summary →</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat with Document */}
            <div className="glass-card p-6 hover:shadow-xl hover:border-dark-600 transition-all duration-300 group h-52">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-100 text-base mb-1 line-clamp-1">Chat with Document</h3>
                  <p className="text-sm text-dark-400 line-clamp-2 mb-3 leading-relaxed">
                    Ask AI questions about this document content.
                  </p>
                  <Button 
                    size="sm"
                    onClick={handleChat}
                    className="w-full"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-xs">Open Chat</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="text-lg font-semibold text-dark-100 mb-4">Quick Stats</h2>
          <div className="glass-card p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-dark-100 mb-1">
                  {document.flashcardCount || 0}
                </div>
                <div className="text-sm text-dark-400">Flashcards</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-dark-100 mb-1">
                  {document.quizCount || 0}
                </div>
                <div className="text-sm text-dark-400">Quizzes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-dark-100 mb-1">
                  {document.viewCount || 0}
                </div>
                <div className="text-sm text-dark-400">Views</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-dark-100 mb-1">
                  {document.lastAccessed ? formatDate(document.lastAccessed).split(',')[0] : 'Never'}
                </div>
                <div className="text-sm text-dark-400">Last Accessed</div>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          {document.filePath && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-dark-100 mb-4">Document Preview</h3>
              <div className="glass-card p-6">
                <iframe
                  src={`${document.filePath}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-96 md:h-[500px] rounded-xl border-0 shadow-lg bg-white"
                  title={`Preview of ${document.title}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentDetailsPage

