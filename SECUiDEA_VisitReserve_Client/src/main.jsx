import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'

import './styles/main.scss'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
