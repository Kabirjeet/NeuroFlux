import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  BrainCircuit, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Flag
} from 'lucide-react'
import toast from 'react-hot-toast'
import quizService from '../../../services/quizService'
import Spinner from '../../../components/common/Spinner'
import Button from '../../../components/common/Button'

const QuizTakePage = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  useEffect(() => {
    if (quiz?.questions && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quiz, timeLeft])

  const fetchQuiz = async () => {
    try {
      const response = await quizService.getQuizById(quizId)
      // Service returns { success: true, data: quiz }
      // So response is { success, data: {...quiz} }
      const quizData = response.data || response
      setQuiz(quizData)
      // Set time limit (default 30 minutes if not provided)
      setTimeLeft(quizData?.timeLimit || 1800)
    } catch (error) {
      toast.error('Failed to load quiz')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnswer = (option) => {
    setSelectedAnswer(option)
    setAnswers({
      ...answers,
      [currentQuestion]: option
    })
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(answers[currentQuestion + 1] || null)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1] || null)
    }
  }

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true)
    try {
      const response = await quizService.submitQuiz(quizId, answers)
      // Backend returns: { success: true, data: { quizId, score, correctCount, totalQuestions, percentage, userAnswers }, message }
      const result = response.data || response
      toast.success('Quiz submitted successfully!')
      navigate(`/quizzes/${quizId}/results`, { 
        state: { 
          result: result.userAnswers || result.results, 
          score: result.score || result.percentage,
          quiz: quiz
        } 
      })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit quiz')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = quiz?.questions 
    ? Math.round(((currentQuestion + 1) / quiz.questions.length) * 100) 
    : 0

  const currentQ = quiz?.questions?.[currentQuestion]

  if (loading) {
    return <Spinner />
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-dark-100 mb-2">Quiz not found</h3>
          <p className="text-dark-400 mb-6">The quiz you're looking for doesn't exist.</p>
          <Link to="/documents">
            <Button>Go to Documents</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              {/* Quiz Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-dark-100">{quiz.title}</h1>
                  <p className="text-sm text-dark-400">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                  </p>
                </div>
              </div>

              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-dark-700 text-dark-200'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentQuestion(idx)
                setSelectedAnswer(answers[idx] || null)
              }}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                idx === currentQuestion
                  ? 'bg-emerald-500 text-white'
                  : answers[idx]
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Question */}
        {currentQ && (
          <div className="glass-card p-8 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center shrink-0">
                <span className="font-semibold text-dark-200">{currentQuestion + 1}</span>
              </div>
              <h2 className="text-xl font-medium text-dark-100 leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(option)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedAnswer === option
                      ? 'border-emerald-500 bg-emerald-500/10 text-dark-100'
                      : 'border-dark-600 bg-dark-800/50 text-dark-200 hover:border-dark-500 hover:bg-dark-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedAnswer === option
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-dark-500'
                    }`}>
                      {selectedAnswer === option && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="p-3 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-3">
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Quiz
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizTakePage

