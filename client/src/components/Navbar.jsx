import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Instagram,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const INSTAGRAM_URL = 'https://instagram.com/astha.silvers';

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'Our Craft' },
  { to: '/contact', label: 'Get in Touch' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { user, logout } = useAuth();
  const { count } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const closeMobileMenu = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
    >
      <div className="navbar__inner">

        {/* ================= LOGO ================= */}
        <Link
          to="/"
          className="navbar__logo"
          aria-label="Astha Silvers Home"
          onClick={closeMobileMenu}
        >
          <img
            src="/images/Aastha%20Logo-3.png"
            alt="Astha Silvers"
            className="navbar__logo-img"
          />
        </Link>

        {/* ================= DESKTOP NAVIGATION ================= */}
        <nav className="navbar__links navbar__links--desktop">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `navbar__link ${
                  isActive ? 'is-active' : ''
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ================= RIGHT ACTIONS ================= */}
        <div className="navbar__actions">

          {/* Instagram */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__icon-btn"
            aria-label="Astha Silvers on Instagram"
          >
            <Instagram
              size={19}
              strokeWidth={1.5}
            />
          </a>

          {/* Cart */}
          <Link
            to="/cart"
            className="navbar__icon-btn navbar__cart"
            aria-label="View cart"
          >
            <ShoppingBag
              size={19}
              strokeWidth={1.5}
            />

            {count > 0 && (
              <span className="navbar__badge">
                {count}
              </span>
            )}
          </Link>

          {/* Account / Login */}
          {user ? (
            <div className="navbar__user">

              <Link
                to="/account"
                className="navbar__icon-btn"
                aria-label="My account"
              >
                <User
                  size={19}
                  strokeWidth={1.5}
                />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="navbar__logout"
              >
                Logout
              </button>

            </div>
          ) : (
            <Link
              to="/login"
              className="navbar__cta"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="navbar__hamburger"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={
              open
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={open}
          >
            {open ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {open && (
        <nav className="navbar__mobile">

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `navbar__mobile-link ${
                  isActive ? 'is-active' : ''
                }`
              }
              onClick={closeMobileMenu}
            >
              {link.label}
            </NavLink>
          ))}

          {/* Mobile Sign In */}
          {!user && (
            <Link
              to="/login"
              className="navbar__mobile-link"
              onClick={closeMobileMenu}
            >
              Sign In
            </Link>
          )}

          {/* Mobile Account */}
          {user && (
            <>
              <Link
                to="/account"
                className="navbar__mobile-link"
                onClick={closeMobileMenu}
              >
                My Account
              </Link>

              <button
                type="button"
                className="navbar__mobile-link navbar__mobile-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

        </nav>
      )}
    </header>
  );
}