import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import {Toaster} from 'react-hot-toast';
import { MultiplayerProvider } from './games/common/MultiplayerManager.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <MultiplayerProvider>
          <Toaster position='top-right' toastOptions={{duration:3000}}/>
          <App />
        </MultiplayerProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
