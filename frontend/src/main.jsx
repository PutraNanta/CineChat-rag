import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom"
import App from './App.jsx'
import { AuthProvider } from "@/context/AuthContext"
import { NotifyProvider } from "@/context/NotifyContext"
import { LoadingProvider } from "@/context/LoadingContext"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LoadingProvider>
        <NotifyProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </NotifyProvider>
      </LoadingProvider>
    </BrowserRouter>
  </StrictMode>,
)
