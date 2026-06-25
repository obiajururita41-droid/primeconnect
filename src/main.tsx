import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'

// Redirect to onboarding on first launch
if (!localStorage.getItem('onboarding_done')) {
  window.location.hash = '';
  sessionStorage.setItem('redirect_to_onboarding', 'true');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </StrictMode>,
)
