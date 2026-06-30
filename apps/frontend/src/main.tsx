import React from 'react'
import ReactDOM from 'react-dom/client'
import './setupApi'
import App from './App.tsx'
import '@atlas/ui/design-tokens.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
