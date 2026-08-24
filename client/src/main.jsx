// =============================================================
// REACT
// =============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';

// =============================================================
// ROUTER
// =============================================================

import { BrowserRouter } from 'react-router-dom';

// =============================================================
// MAIN APPLICATION
// =============================================================

import App from './App.jsx';

// =============================================================
// GLOBAL CONTEXT PROVIDERS
// =============================================================

import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

// =============================================================
// GLOBAL STYLES
// =============================================================

import './styles/index.css';

// =============================================================
// ROOT ELEMENT
// =============================================================
// React mounts the complete application inside the #root
// element defined in index.html.
// =============================================================

const rootElement = document.getElementById('root');

// =============================================================
// REACT ROOT
// =============================================================

const root = ReactDOM.createRoot(rootElement);

// =============================================================
// APPLICATION RENDER
// =============================================================
// Provider order is intentionally kept the same.
//
// BrowserRouter
//   └── AuthProvider
//         └── CartProvider
//               └── App
//
// This ensures that routing, authentication and cart state are
// available throughout the complete application.
// =============================================================

root.render(
  <React.StrictMode>

    {/* =======================================================
        APPLICATION ROUTER
    ======================================================= */}

    <BrowserRouter>

      {/* =====================================================
          AUTHENTICATION CONTEXT
      ===================================================== */}

      <AuthProvider>

        {/* ===================================================
            SHOPPING CART CONTEXT
        =================================================== */}

        <CartProvider>

          {/* ================================================
              MAIN APPLICATION
          ================================================ */}

          <App />

        </CartProvider>

      </AuthProvider>

    </BrowserRouter>

  </React.StrictMode>
);