import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyTheme, getInitialTheme } from './lib/theme/theme'
import './index.css'
import App from './App.tsx'

// Apply theme before React mounts to avoid a flash of the wrong theme.
applyTheme(getInitialTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
