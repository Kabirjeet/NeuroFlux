import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Clock,
  Play,
  Trash2,
  Eye,
  Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import flashcardService from '../../../services/flashcardService'
import Spinner from '../../../components/common/Spinner'
import Button from '../../../components/common/Button'

const FlashcardsListPage = () => {
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedFlashcard, setSelectedFlashcard] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchFlashcards()
  }, [])

  const fetchFlashcards = async () => {
    try {
      const response = await flashcardService.getAllFlashcardSets()
      // Service returns { success: true, count: n, data: [...] }
      // So response is already { success, count, data }
      setFlashcards(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch flashcards')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = (flashcard) => {
    setSelectedFlashcard(flashcard)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedFlashcard) return
    setDeleting(true)
    try {
      await flashcardService.deleteFlashcardSet(selectedFlashcard._id)
      toast.success('Flashcard deleted successfully!')
      setFlashcards(flashcards.filter(f => f._id !== selectedFlashcard._id))
      setDeleteModalOpen(false)
      setSelectedFlashcard(null)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete flashcard')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-dark-100 tracking-tight mb-2">
              My Flashcards
            </h1>
            <p className="text-dark-400 text-sm">
              Review and study your flashcard decks
            </p>
          </div>
          <Link to="/documents">
            <Button>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Create New
            </Button>
          </Link>
        </div>

        {/* Flashcards Grid */}
        {flashcards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((flashcard, index) => (
              <div 
                key={flashcard._id || index}
                className="group glass-card p-6 hover:shadow-xl hover:border-dark-600 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <button
                    onClick={() => handleDeleteRequest(flashcard)}
                    className="p-2 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-dark-100 mb-2 line-clamp-2">
                    {flashcard.title || flashcard.documentTitle || 'Untitled Flashcards'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-dark-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      {flashcard.cards?.length || flashcard.cardCount || 0} cards
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatDate(flashcard.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Source Document */}
                {flashcard.documentId && (
                  <div className="mb-4 p-3 rounded-xl bg-dark-900/50 border border-dark-700">
                    <div className="flex items-center gap-2 text-sm text-dark-400">
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{flashcard.documentTitle || 'Source Document'}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-dark-700">
                  <Link to={`/documents/${flashcard.documentId?._id || flashcard.documentId}/flashcards`} className="flex-1">
                    <Button className="w-full">
                      <Play className="w-4 h-4" />
                      Study
                    </Button>
                  </Link>
                  <button 
                    onClick={() => navigate(`/documents/${flashcard.documentId}`)}
                    className="p-2.5 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 transition-all"
                    title="View flashcards in document">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-purple-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-dark-100 mb-2">No flashcards yet</h3>
            <p className="text-dark-400 text-center max-w-sm mb-6">
              Create flashcards from your documents to start studying with AI-powered learning.
            </p>
            <Link to="/documents">
              <Button>
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Create Your First Flashcards
              </Button>
            </Link>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-md p-6 scale-in">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-dark-100 mb-2">Delete Flashcards?</h2>
                <p className="text-dark-400 mb-6">
                  Are you sure you want to delete "{selectedFlashcard?.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="secondary"
                    onClick={() => setDeleteModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex-1"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FlashcardsListPage

