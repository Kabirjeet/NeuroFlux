import React from 'react'
import { useState, useEffect } from 'react'
import Spinner from '../../../components/common/Spinner'
import progressService from '../../../services/progressService'
import toast from 'react-hot-toast'
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock, ArrowRight, Star, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const DashBoardPage = () => {

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("Dashboard Data:", data);
        // API returns: { success: true, data: { overview: {}, recentActivity: {} } }
        setDashboardData(data.data);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError(error.message || "Failed to fetch dashboard data");
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  // Handle error state
  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4'>
            <TrendingUp className="w-8 h-8 text-red-400" />
          </div>
          <p className='text-dark-400'>{error}</p>
        </div>
      </div>
    )
  }

  // Get overview data (API returns lowercase 'overview')
  const overview = dashboardData?.overview;
  
  // Check if we have any data
  const hasData = overview && (
    (overview.totalDocuments > 0) ||
    (overview.totalFlashcards > 0) ||
    (overview.totalQuizzes > 0)
  );

  if (!hasData) {
    return (
      <div className='min-h-screen'>
        <div className='absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none' />
        <div className='relative max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-6'>
            <h1 className='text-2xl font-medium text-dark-100 tracking-light mb-2'>
              Dashboard
            </h1>
            <p className='text-dark-400 text-sm'>
              Track your learning progress and activity
            </p>
          </div>

          {/* Empty State */}
          <div className='flex flex-col items-center justify-center py-20'>
            <div className='w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-6'>
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h3 className='text-xl font-semibold text-dark-100 mb-2'>Welcome to NeuroFlux!</h3>
            <p className='text-dark-400 text-center max-w-md mb-8'>
              Start by uploading a document to create flashcards and quizzes powered by AI.
            </p>
            <Link 
              to="/documents"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200"
            >
              <FileText className="w-5 h-5" />
              Upload Your First Document
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Documents',
      value: overview.totalDocuments || 0,
      icon: FileText,
      gradient: 'from-blue-400 to-blue-600',
      shadowColor: 'shadow-blue-500/20',
      link: '/documents'
    },
    {
      label: 'Total Flashcards',
      value: overview.totalFlashcards || 0,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-600',
      shadowColor: 'shadow-pink-500/20',
      link: '/flashcards'
    },
    {
      label: 'Total Quizzes',
      value: overview.totalQuizzes || 0,
      icon: BrainCircuit,
      gradient: 'from-emerald-400 to-teal-600',
      shadowColor: 'shadow-green-500/20',
      link: '/documents'
    },
  ]

  const recentActivity = dashboardData?.recentActivity || {};
  const recentDocs = recentActivity.documents || [];
  const recentQuizzes = recentActivity.quizzes || [];
  
  // Combine and sort recent activity
  const allActivity = [
    ...recentDocs.map(doc => ({
      id: doc._id,
      type: 'document',
      title: doc.title || doc.fileName,
      timestamp: doc.lastAccessed || doc.createdAt,
      link: `/documents/${doc._id}`,
      status: doc.status
    })),
    ...recentQuizzes.map(quiz => ({
      id: quiz._id,
      type: 'quiz',
      title: quiz.title,
      timestamp: quiz.completedAt || quiz.createdAt,
      link: `/quizzes/${quiz._id}/results`,
      score: quiz.score,
      totalQuestions: quiz.totalQuestions
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  return (
    <div className='min-h-screen'>
      <div className='absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none' />
      <div className='relative max-w-7xl mx-auto' >
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl font-medium text-dark-100 tracking-light mb-2'>
            Dashboard
          </h1>
          <p className='text-dark-400 text-sm'>
            Track your learning progress and activity
          </p>
        </div>

        {/* Stats grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          {stats.map((stat, index) => (
            <Link
              to={stat.link}
              key={index}
              className='group relative bg-dark-800/80 backdrop-blur-xl border border-dark-700/60 rounded-2xl shadow-xl shadow-black/20 p-6 hover:shadow-2xl hover:border-dark-600 transition-all duration-300 hover:-translate-y-1'
            >
              <div className='flex items-center justify-between mb-4'>
                <span className='text-xs font-semibold text-dark-400 uppercase tracking-wider'>
                  {stat.label}
                </span>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className='w-5 h-5 text-white' strokeWidth={2} />
                </div>
              </div>
              <div className='text-4xl font-bold text-dark-100 tracking-tight'>
                {stat.value}
              </div>
            </Link>
          ))}
        </div>

        {/* Recent activity section */}
        <div className='bg-dark-800/80 backdrop-blur-xl border border-dark-700/60 rounded-2xl shadow-xl shadow-black/20 p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center'>
              <Clock className='w-5 h-5 text-dark-300' strokeWidth={2} />
            </div>
            <h3 className='text-xl font-medium text-dark-100 tracking-light'>
              Recent Activity
            </h3>
          </div>

          {allActivity.length > 0 ? (
            <div className='space-y-3'>
              {allActivity.map((activity, index) => (
                <Link
                  to={activity.link}
                  key={activity.id || index}
                  className='group flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-dark-700/60 hover:bg-dark-700 hover:border-dark-600 transition-all duration-200'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activity.type === 'document'
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                        : 'bg-gradient-to-br from-emerald-400 to-teal-600'
                    }`}>
                      {activity.type === 'document' ? (
                        <FileText className="w-4 h-4 text-white" />
                      ) : (
                        <BrainCircuit className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className='min-w-0'>
                      <p className='text-sm font-medium text-dark-100 truncate'>
                        {activity.title}
                      </p>
                      <p className='text-xs text-dark-500'>
                        {activity.type === 'document' ? 'Document uploaded' : `Quiz completed - ${activity.score}/${activity.totalQuestions} questions`}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 shrink-0'>
                    <span className='text-xs text-dark-500'>
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-dark-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-700 mb-4'>
                <Clock className="w-8 h-8 text-dark-500" />
              </div>
              <p className='text-dark-400'>No recent activity yet.</p>
              <p className='text-dark-500 text-sm mt-1'>Start learning to see your progress here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashBoardPage

