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
import PromoBanner from './components/PromoBanner.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Loader from './components/Loader.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

import Home from './pages/Home.jsx';

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
const TermsAndPolicies = lazy(() => import('./pages/TermsAndPolicies.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


function RouteLoader() {
  return (
    <div className="route-loader">
      <Loader label="Loading..." />
    </div>
  );
}


export default function App() {
  return (
    <div className="app-shell">

      <PromoBanner />

      <ScrollToTop />

      <Navbar />

      <main>

        <Suspense fallback={<RouteLoader />}>

          <Routes>

            <Route path="/" element={<Home />} />

            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<Shop />} />

            <Route path="/product/:id" element={<ProductDetail />} />

            <Route path="/cart" element={<Cart />} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms-and-policies" element={<TermsAndPolicies />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order-success/:id"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />

            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />

          </Routes>

        </Suspense>

      </main>

      <Footer />

      <WhatsAppButton />

    </div>
  );
}