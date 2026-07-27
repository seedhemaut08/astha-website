import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Instagram } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const INSTAGRAM_URL = 'https://instagram.com/astha.silvers';

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'Our Craft' },
  { to: '/contact', label: 'Get in Touch' }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [navigate]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-mark">अ</span>
          <span className="navbar__brand-text">ASTHA</span>
        </Link>

        <nav className="navbar__links navbar__links--desktop">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar__link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__icon-btn"
            aria-label="Astha on Instagram"
          >
            <Instagram size={19} strokeWidth={1.5} />
          </a>

          <Link to="/cart" className="navbar__icon-btn navbar__cart" aria-label="View cart">
            <ShoppingBag size={19} strokeWidth={1.5} />
            {count > 0 && <span className="navbar__badge">{count}</span>}
          </Link>

          {user ? (
            <div className="navbar__user">
              <Link to="/account" className="navbar__icon-btn" aria-label="My account">
                <User size={19} strokeWidth={1.5} />
              </Link>
              <button onClick={logout} className="navbar__logout">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="navbar__cta">Sign In</Link>
          )}

          <button
            className="navbar__hamburger"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="navbar__mobile">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} className="navbar__mobile-link" onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          {!user && (
            <Link to="/login" className="navbar__mobile-link" onClick={() => setOpen(false)}>
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
