
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ClipboardList, 
  Plus, 
  FileText, 
  Clock,
  Play,
  MoreVertical,
  Trash2,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  BrainCircuit
} from 'lucide-react'
import toast from 'react-hot-toast'
import quizService from '../../../services/quizService'
import Spinner from '../../../components/common/Spinner'
import Button from '../../../components/common/Button'

const QuizzesListPage = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await quizService.getAllQuizzes()
      setQuizzes(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch quizzes')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return
    setDeleting(true)
    try {
      await quizService.deleteQuiz(selectedQuiz._id)
      toast.success('Quiz deleted successfully!')
      setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id))
      setDeleteModalOpen(false)
      setSelectedQuiz(null)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete quiz')
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
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
              My Quizzes
            </h1>
            <p className="text-dark-400 text-sm">
              Review and take your quizzes
            </p>
          </div>
          <Link to="/documents">
            <Button>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Create New
            </Button>
          </Link>
        </div>

        {/* Quizzes Grid */}
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <div 
                key={quiz._id || index}
                className="group glass-card p-6 hover:shadow-xl hover:border-dark-500 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <BrainCircuit className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <button
                    onClick={() => handleDeleteRequest(quiz)}
                    className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-dark-100 mb-2 line-clamp-2">
                    {quiz.title || 'Untitled Quiz'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-dark-400">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {quiz.totalQuestions || quiz.questions?.length || 0} questions
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatDate(quiz.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Source Document */}
                {quiz.documentId && (
                  <div className="mb-4 p-3 rounded-xl bg-dark-900/50 border border-dark-700">
                    <div className="flex items-center gap-2 text-sm text-dark-400">
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{quiz.documentId.title || 'Source Document'}</span>
                    </div>
                  </div>
                )}

                {/* Score Status */}
                {quiz.completedAt ? (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-400">Completed</span>
                      <span className={`text-lg font-bold ${getScoreColor(quiz.score)}`}>
                        {quiz.score}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-2 text-sm text-yellow-400">
                      <Clock className="w-4 h-4" />
                      Not completed
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-dark-700">
                  {quiz.completedAt ? (
                    <Link to={`/quizzes/${quiz._id}/results`} className="flex-1">
                      <Button className="w-full">
                        <Eye className="w-4 h-4" />
                        View Results
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/quizzes/${quiz._id}`} className="flex-1">
                      <Button className="w-full">
                        <Play className="w-4 h-4" />
                        Take Quiz
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
              <ClipboardList className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-dark-100 mb-2">No quizzes yet</h3>
            <p className="text-dark-400 text-center max-w-sm mb-6">
              Create quizzes from your documents to test your knowledge with AI-powered questions.
            </p>
            <Link to="/documents">
              <Button>
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Create Your First Quiz
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
                <h2 className="text-xl font-semibold text-dark-100 mb-2">Delete Quiz?</h2>
                <p className="text-dark-400 mb-6">
                  Are you sure you want to delete "{selectedQuiz?.title}"? This action cannot be undone.
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
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
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

export default QuizzesListPage

