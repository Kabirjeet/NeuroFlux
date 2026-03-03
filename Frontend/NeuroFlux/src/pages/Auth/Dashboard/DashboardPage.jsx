import React from 'react'
import { useState, useEffect } from 'react'
import Spinner from '../../../components/common/Spinner'
import progressService from '../../../services/progressService'
import toast from 'react-hot-toast'
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock } from 'lucide-react'

const DashBoardPage = () => {

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("Data___getDashboardData", data);
        setDashboardData(data);
        console.log(error);
      } catch (error) {
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

  if (!dashboardData || !dashboardData.Overview) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-4'>
            <TrendingUp className='w-8 h-8 text-slate-400' />
          </div>
          <p className='text-slate-600 text-sm'>No progress data available yet.</p>
        </div>
      </div >
    )
}

const stats=[
  {
    label:'Total Documents',
    value:dashboardData.Overview.totalDocuments,
    icon:FileText,
    gradient:'from-blue-400 to-blue-600',
    shadowColor:'shadow-pur[le-500/20'
  },
  {
    label:'Total Flashcards',
    value:dashboardData.Overview.totalFlashcards,
    icon:BookOpen,
    gradient:'from-purple-400 to-pink-600',
    shadowColor:'shadow-pink-500/20'
  },
  {
    label:'Total Quizzes',
    value:dashboardData.Overview.totalQuizzes,
    icon:BrainCircuit,
    gradient:'from-emerald-400 to-teal-600',  
    shadowColor:'shadow-green-500/20'
  },
]
return (
  <div>
    DashBoardPage
  </div>
)
}

export default DashBoardPage
