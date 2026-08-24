import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Toaster } from 'sonner';

import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ShopProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
              <Toaster position="top-center" richColors duration={2000} />
            </WishlistProvider>
          </CartProvider>
        </ShopProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
