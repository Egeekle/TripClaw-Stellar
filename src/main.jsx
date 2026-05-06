import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { OpenClawProvider } from './context/OpenClawContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <OpenClawProvider>
        <App />
      </OpenClawProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
