import React from 'react'
import Button from '../common/Button'
import { Check, Loader2, Play, FileText } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import aiService from '../../services/aiService'
import toast from 'react-hot-toast'

const SummaryCard = ({ document, summary, generatingSummary, onGenerateSummary, className = '' }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showFullSummary, setShowFullSummary] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleViewFullSummary = () => {
    if (document?.summary || summary) {
      navigate(`/documents/${id}/summary`)
    }
  }

  const handleRegenerate = async () => {
    setLoading(true)
    try {
      const response = await aiService.generateSummary(id)
      onGenerateSummary(response.summary || response.data?.summary)
      toast.success('Summary regenerated!')
    } catch (error) {
      toast.error('Failed to regenerate summary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`glass-card p-6 hover:shadow-xl hover:border-dark-600 transition-all duration-300 group ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
          <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-dark-100 text-base mb-1 line-clamp-1">Document Summary</h3>
          <p className="text-sm text-dark-400 line-clamp-2 mb-3 leading-relaxed">
            AI-powered summary of key points from {document?.title || 'this document'}
          </p>
          
          <Button 
            size="sm"
            onClick={generatingSummary ? undefined : (onGenerateSummary || handleRegenerate)}
            disabled={generatingSummary || loading}
            className="w-full mb-2"
          >
            {generatingSummary ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Generating...</span>
              </>
            ) : (document?.summary || summary) ? (
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

          {(document?.summary || summary) && (
            <div className="text-xs text-emerald-400 font-medium mb-1">
              Summary ready!{' '}
              <Button
                size="sm"
                variant="link"
                onClick={handleViewFullSummary}
                className="h-auto p-0 text-xs text-emerald-400 hover:text-emerald-300 -ml-1"
              >
                View full page →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SummaryCard

