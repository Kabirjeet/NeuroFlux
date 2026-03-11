import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  BookOpen, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Check,
  X,
  Loader2,
  Sparkles,
  Zap,
  Award,
  Flame,
  Target
} from 'lucide-react'
import toast from 'react-hot-toast'
import flashcardService from '../../../services/flashcardService'
import Spinner from '../../../components/common/Spinner'
import Button from '../../../components/common/Button'

const FlashcardPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studiedCards, setStudiedCards] = useState(new Set())
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    streak: 0,
    maxStreak: 0
  })

  useEffect(() => {
    fetchFlashcards()
  }, [id])

  const fetchFlashcards = async () => {
    try {
      const response = await flashcardService.getFlashcardsByDocument(id)
      // Service returns { success: true, count: n, data: [flashcardSets] }
      // So response is { success, count, data: [...] }
      const flashcardData = response.data || []
      if (flashcardData && flashcardData.length > 0) {
        // Get all cards from all flashcard sets
        const allCards = flashcardData.flatMap(set => set.cards || [])
        setFlashcards(allCards)
      } else {
        setFlashcards([])
      }
    } catch (error) {
      toast.error('Failed to load flashcards')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleMarkAsKnown = () => {
    setStudiedCards(new Set([...studiedCards, currentIndex]))
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + 1,
      streak: prev.streak + 1,
      maxStreak: Math.max(prev.maxStreak, prev.streak + 1)
    }))
    handleNext()
  }

  const handleMarkAsUnknown = () => {
    setSessionStats(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      streak: 0
    }))
    handleNext()
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setStudiedCards(new Set())
    setSessionStats({
      correct: 0,
      incorrect: 0,
      streak: 0,
      maxStreak: 0
    })
  }

  const progress = flashcards.length > 0 
    ? Math.round(((currentIndex + 1) / flashcards.length) * 100) 
    : 0

  const currentCard = flashcards[currentIndex]

  if (loading) {
    return <Spinner />
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-dark-100 mb-2">No flashcards found</h3>
          <p className="text-dark-400 mb-6">Generate flashcards from a document to start studying.</p>
          <Link to="/documents">
            <Button>
              <ArrowLeft className="w-4 h-4" />
              Go to Documents
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
      
      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/flashcards')}
            className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Flashcards
          </button>
          
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              {/* Progress */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-dark-100">
                    Card {currentIndex + 1} of {flashcards.length}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-dark-500">{progress}%</span>
                  </div>
                </div>
              </div>

              {/* Restart Button */}
              <button
                onClick={handleRestart}
                className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-2">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-dark-100">{sessionStats.correct}</div>
            <div className="text-xs text-dark-500">Correct</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-2">
              <X className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-dark-100">{sessionStats.incorrect}</div>
            <div className="text-xs text-dark-500">Review</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-dark-100">{sessionStats.streak}</div>
            <div className="text-xs text-dark-500">Streak</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-dark-100">{sessionStats.maxStreak}</div>
            <div className="text-xs text-dark-500">Best</div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <div 
            className="glass-card p-8 min-h-[400px] cursor-pointer"
            onClick={handleFlip}
          >
            {/* Card Inner */}
            <div className="relative w-full h-full min-h-[350px] transition-transform duration-500"
              style={{
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Front */}
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">Question</p>
                  <h2 className="text-xl md:text-2xl font-medium text-dark-100 leading-relaxed">
                    {currentCard?.question || currentCard?.front}
                  </h2>
                </div>
                <p className="absolute bottom-4 text-sm text-dark-500">Click to reveal answer</p>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">Answer</p>
                  <h2 className="text-xl md:text-2xl font-medium text-dark-100 leading-relaxed">
                    {currentCard?.answer || currentCard?.back}
                  </h2>
                </div>
                <p className="absolute bottom-4 text-sm text-dark-500">Click to see question</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center justify-between gap-4">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Action Buttons */}
          <div className="flex-1 flex gap-3 max-w-md mx-auto">
            <Button 
              onClick={handleMarkAsUnknown}
              variant="danger"
              className="flex-1"
            >
              <X className="w-4 h-4" />
              Review
            </Button>
            <Button 
              onClick={handleMarkAsKnown}
              className="flex-1"
            >
              <Check className="w-4 h-4" />
              Got It
            </Button>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="p-3 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Completion Message */}
        {currentIndex === flashcards.length - 1 && (
          <div className="mt-8 glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-dark-100 mb-2">Session Complete! 🎉</h3>
            <p className="text-dark-400 mb-4">
              You've reviewed all {flashcards.length} flashcards.
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div>
                <div className="text-2xl font-bold text-green-400">{sessionStats.correct}</div>
                <div className="text-xs text-dark-500">Correct</div>
              </div>
              <div className="w-px h-10 bg-dark-700" />
              <div>
                <div className="text-2xl font-bold text-red-400">{sessionStats.incorrect}</div>
                <div className="text-xs text-dark-500">To Review</div>
              </div>
              <div className="w-px h-10 bg-dark-700" />
              <div>
                <div className="text-2xl font-bold text-purple-400">{sessionStats.maxStreak}</div>
                <div className="text-xs text-dark-500">Best Streak</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={handleRestart}>
                <RotateCcw className="w-4 h-4" />
                Study Again
              </Button>
              <Link to="/flashcards">
                <Button>
                  View All Flashcards
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FlashcardPage

