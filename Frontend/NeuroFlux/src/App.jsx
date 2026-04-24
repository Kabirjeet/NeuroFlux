import React from 'react';
import {BrowserRouter as Router,Routes,Route,Navigate} from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import NotFoundPage from './pages/Auth/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashBoardPage from './pages/Auth/Dashboard/DashboardPage';
import DocumentListPage from './pages/Auth/Documents/DocumentListPage';
import DocumentDetailsPage from './pages/Auth/Documents/DocumentDetailsPage';
import FlashcardsListPage from './pages/Auth/Flashcards/FlashcardsListPage';
import FlashcardPage from './pages/Auth/Flashcards/FlashcardPage';
import QuizzesListPage from './pages/Auth/Quizzes/QuizzesListPage';
import QuizTakePage from './pages/Auth/Quizzes/QuizTakePage';
import QuizResultPage from './pages/Auth/Quizzes/QuizResultPage';
import ProfilePage from './pages/Auth/Profile/ProfilePage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import DocumentSummaryPage from './pages/Auth/Documents/DocumentSummaryPage';
import DocumentChatPage from './pages/Auth/Documents/DocumentChatPage';
import GamesPage from './pages/Games/GamesPage.jsx';
import MindSnapGame from './games/mindSnap/Game.jsx';
import MemoryMatrix from './games/memoryMatrix/MemoryMatrix';
import MathPuzzleRace from './games/mathPuzzleRace/MathPuzzleRace';
import KenKenDuel from './games/kenkenDuel/KenKenDuel';
import ConceptClashGame from './games/conceptClash/ConceptClashGame';
import { useAuth } from './context/AuthContext';

const App = () => {
  const {isAuthenticated, loading} = useAuth();

  if(loading){
    return(
      <div className='flex items-center justify-center h-screen'>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element = {isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace/>}
        />

        <Route path='/login' element={<LoginPage />}/>
        <Route path='/register' element={<RegisterPage />}/>
        <Route path='/forgot-password' element={<ForgotPasswordPage />}/>


        {/* Proteced Routes  */}

        <Route element={<ProtectedRoute />}>
        <Route path='/dashboard' element={<DashBoardPage/> }/>
        <Route path='/games' element={<GamesPage/> }/>
        <Route path='/games/mindSnap' element={<MindSnapGame/> }/>
        <Route path='/games/kenken' element={<KenKenDuel/> }/>
        <Route path='/games/mathPuzzle' element={<MathPuzzleRace/> }/>
        <Route path='/games/memoryMatrix' element={<MemoryMatrix/> }/>
        <Route path='/games/conceptClash' element={<ConceptClashGame/> }/>

        <Route path='/documents' element={<DocumentListPage/> }/>
        <Route path='/documents/:id' element={<DocumentDetailsPage/> }/>
        <Route path='/documents/:id/summary' element={<DocumentSummaryPage/> }/>
        <Route path='/documents/:id/chat' element={<DocumentChatPage/> }/>
        <Route path='/flashcards' element={<FlashcardsListPage/> }/>
        <Route path='/documents/:id/flashcards' element={<FlashcardPage/> }/>
        <Route path='/quizzes' element={<QuizzesListPage/> }/>
        <Route path='/quizzes/:quizId' element={<QuizTakePage/> }/>
        <Route path='/quizzes/:quizId/results' element={<QuizResultPage/> }/>
        <Route path='/profile' element={<ProfilePage/> }/>
        <Route path='/leaderboard' element={<LeaderboardPage/> }/>
        </Route>

        <Route path='*' element={<NotFoundPage />}/>



        
      </Routes>
    </Router>
  )
}

export default App
