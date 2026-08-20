import { lazy, Suspense, useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Loader from './components/Loader.jsx';

// Home is the first page users see, so keep it loaded immediately.
import Home from './pages/Home.jsx';

// Lazy-loaded pages
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const TermsAndPolicies = lazy(
  () => import('./pages/TermsAndPolicies.jsx')
);
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// =============================================================
// SMOOTH PAGE SCROLL
// =============================================================

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return null;
}

// =============================================================
// APP
// =============================================================

export default function App() {
  return (
    <div className="app-shell">

      <ScrollToTop />

      <Navbar />

      <main>
        <Suspense
          fallback={
            <Loader label="Loading..." />
          }
        >
          <Routes>

            {/* =================================================
                HOME
            ================================================= */}

            <Route
              path="/"
              element={<Home />}
            />

            {/* =================================================
                SHOP
            ================================================= */}

            <Route
              path="/shop"
              element={<Shop />}
            />

            <Route
              path="/shop/:category"
              element={<Shop />}
            />

            {/* =================================================
                PRODUCT
            ================================================= */}

            <Route
              path="/product/:id"
              element={<ProductDetail />}
            />

            {/* =================================================
                CART
            ================================================= */}

            <Route
              path="/cart"
              element={<Cart />}
            />

            {/* =================================================
                INFORMATION
            ================================================= */}

            <Route
              path="/about"
              element={<About />}
            />

            <Route
              path="/contact"
              element={<Contact />}
            />

            <Route
              path="/terms-and-policies"
              element={<TermsAndPolicies />}
            />

            {/* =================================================
                AUTH
            ================================================= */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            {/* =================================================
                CHECKOUT
            ================================================= */}

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                ORDER SUCCESS
            ================================================= */}

            <Route
              path="/order-success/:id"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                ACCOUNT
            ================================================= */}

            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                404
            ================================================= */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </Suspense>
      </main>

      <Footer />

      <WhatsAppButton />

    </div>
  );
}