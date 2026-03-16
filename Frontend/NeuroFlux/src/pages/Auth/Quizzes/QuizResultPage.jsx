import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  BrainCircuit, 
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  RotateCcw,
  Award,
  Star,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import quizService from '../../../services/quizService'
import Spinner from '../../../components/common/Spinner'
import Button from '../../../components/common/Button'

const QuizResultPage = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get results from location state or fetch
  useEffect(() => {
    if (location.state?.results) {
      setResults(location.state.results)
      setLoading(false)
    } else {
      fetchResults()
    }
  }, [quizId, location.state])

  const fetchResults = async () => {
    try {
      const data = await quizService.getQuizResults(quizId)
      setResults(data.data?.results || [])
    } catch (error) {
      toast.error('Failed to load quiz results')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 60) return 'text-yellow-400'
    if (percentage >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Outstanding! 🌟'
    if (percentage >= 80) return 'Excellent! 🎉'
    if (percentage >= 70) return 'Great job! 👍'
    if (percentage >= 60) return 'Good effort! 💪'
    if (percentage >= 50) return 'Keep practicing! 📚'
    return 'Need more practice! 🔄'
  }

  if (loading) {
    return <Spinner />
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-dark-100 mb-2">Results not found</h3>
          <p className="text-dark-400 mb-6">Take a quiz to see your results here.</p>
          <Link to="/documents">
            <Button>Go to Documents</Button>
          </Link>
        </div>
      </div>
    )
  }

  const correctAnswers = results.filter(r => r.isCorrect).length
  const totalQuestions = results.length
  const percentage = Math.round((correctAnswers / totalQuestions) * 100)
  const timeTaken = results.timeTaken || 0

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
          onClick={() => navigate('/quizzes')}
            className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </button>
        </div>

        {/* Score Card */}
        <div className="glass-card p-8 mb-8 text-center">
          {/* Trophy Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              percentage >= 60 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30' 
                : 'bg-dark-700'
            }`}>
              <Trophy className={`w-12 h-12 ${percentage >= 60 ? 'text-white' : 'text-dark-500'}`} />
            </div>
          </div>

          {/* Score */}
          <h1 className="text-4xl font-bold mb-2">
            <span className={getScoreColor(percentage)}>{percentage}%</span>
          </h1>
          <p className="text-xl text-dark-200 mb-2">{getScoreMessage(percentage)}</p>
          <p className="text-dark-400 mb-8">
            You got {correctAnswers} out of {totalQuestions} questions correct
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="glass-card p-4">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-dark-100">{correctAnswers}</div>
              <div className="text-xs text-dark-500">Correct</div>
            </div>
            <div className="glass-card p-4">
              <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-dark-100">{totalQuestions - correctAnswers}</div>
              <div className="text-xs text-dark-500">Incorrect</div>
            </div>
            <div className="glass-card p-4">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-dark-100">{formatTime(timeTaken)}</div>
              <div className="text-xs text-dark-500">Time</div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-dark-100 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Question Review
          </h2>
          
          <div className="space-y-4">
            {results.map((result, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border ${
                  result.isCorrect 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    result.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {result.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-dark-100 mb-2">{result.question}</p>
                    <div className="text-sm space-y-1">
                      {result.userAnswer && (
                        <p className="text-dark-400">
                          Your answer: <span className={result.isCorrect ? 'text-green-400' : 'text-red-400'}>{result.userAnswer}</span>
                        </p>
                      )}
                      {!result.isCorrect && result.correctAnswer && (
                        <p className="text-dark-400">
                          Correct answer: <span className="text-green-400">{result.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="secondary" onClick={() => navigate(`/quizzes/${quizId}`)}>
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </Button>
          <Link to="/documents">
            <Button>
              Take Another Quiz
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default QuizResultPage

