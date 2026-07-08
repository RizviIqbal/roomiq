import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#181c27',
            color: '#e8eaf0',
            border: '1px solid #2a2f42',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#181c27' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#181c27' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
