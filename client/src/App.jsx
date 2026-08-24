import {
  lazy,
  Suspense,
  useEffect,
} from 'react';

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
import ForgotPassword from './pages/ForgotPassword.jsx';

// =============================================================
// HOME
// =============================================================
// Home is the first page users see, so we keep it loaded
// immediately instead of lazy-loading it.
//
// This helps the first screen appear faster and avoids an
// unnecessary Suspense delay on the homepage.
// =============================================================

import Home from './pages/Home.jsx';

// =============================================================
// LAZY-LOADED PAGES
// =============================================================
// Pages other than Home are loaded only when the user actually
// visits them.
//
// This keeps the initial JavaScript bundle smaller and helps
// improve the first page load.
// =============================================================

const Shop = lazy(() => import('./pages/Shop.jsx'));

const ProductDetail = lazy(
  () => import('./pages/ProductDetail.jsx')
);

const Cart = lazy(
  () => import('./pages/Cart.jsx')
);

const Checkout = lazy(
  () => import('./pages/Checkout.jsx')
);

const OrderSuccess = lazy(
  () => import('./pages/OrderSuccess.jsx')
);

const Login = lazy(
  () => import('./pages/Login.jsx')
);

const Signup = lazy(
  () => import('./pages/Signup.jsx')
);

const Account = lazy(
  () => import('./pages/Account.jsx')
);

const About = lazy(
  () => import('./pages/About.jsx')
);

const Contact = lazy(
  () => import('./pages/Contact.jsx')
);

const TermsAndPolicies = lazy(
  () => import('./pages/TermsAndPolicies.jsx')
);

const NotFound = lazy(
  () => import('./pages/NotFound.jsx')
);

// =============================================================
// SCROLL TO TOP
// =============================================================
// When the user changes pages, we immediately move the viewport
// to the top.
//
// IMPORTANT:
// We intentionally do NOT use behavior: 'smooth' here.
//
// Smooth scrolling during route navigation can make a new page
// feel like it is lagging because the browser is still animating
// the previous page's scroll position.
//
// Smooth scrolling should be used for intentional in-page
// navigation, not for every React route change.
// =============================================================

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// =============================================================
// ROUTE LOADING FALLBACK
// =============================================================
// Keeping the fallback in its own component makes the Suspense
// section cleaner and gives us one place to control the loading
// experience later.
// =============================================================

function RouteLoader() {
  return (
    <div className="route-loader">
      <Loader label="Loading..." />
    </div>
  );
}

// =============================================================
// APP
// =============================================================

export default function App() {
  return (
    <div className="app-shell">

      {/* =====================================================
          SCROLL MANAGEMENT
      ===================================================== */}

      <ScrollToTop />

      {/* =====================================================
          GLOBAL NAVIGATION
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          MAIN APPLICATION CONTENT
      ===================================================== */}

      <main>

        {/* ===================================================
            LAZY ROUTE SUSPENSE
        =================================================== */}

        <Suspense
          fallback={<RouteLoader />}
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
                PRODUCT DETAILS
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
                INFORMATION PAGES
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
                AUTHENTICATION
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
                PROTECTED CHECKOUT
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
                PROTECTED ORDER SUCCESS
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
                PROTECTED ACCOUNT
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

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

          </Routes>

        </Suspense>

      </main>

      {/* =====================================================
          GLOBAL FOOTER
      ===================================================== */}

      <Footer />

      {/* =====================================================
          WHATSAPP BUTTON
      ===================================================== */}

      <WhatsAppButton />

    </div>
  );
}