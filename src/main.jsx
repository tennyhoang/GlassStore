import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <WishlistProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,.12)',
              },
              success: { iconTheme: { primary: '#2e7d32', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#c62828', secondary: '#fff' } },
            }}
          />
        </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
