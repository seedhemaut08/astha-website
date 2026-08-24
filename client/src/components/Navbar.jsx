import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  Link,
  NavLink,
} from 'react-router-dom';

import {
  Menu,
  X,
  ShoppingBag,
  User,
  Instagram,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';


/*
=========================================================
INSTAGRAM
=========================================================
*/

const INSTAGRAM_URL =
  'https://instagram.com/astha.silvers';


/*
=========================================================
NAVIGATION LINKS
=========================================================
*/

const links = [
  {
    to: '/',
    label: 'Home'
  },
  {
    to: '/shop',
    label: 'Shop'
  },
  {
    to: '/about',
    label: 'Our Craft'
  },
  {
    to: '/contact',
    label: 'Get in Touch'
  }
];


/*
=========================================================
NAVBAR
=========================================================
*/

export default function Navbar() {

  /*
  ========================================================
  NAVBAR SCROLL STATE
  ========================================================
  */

  const [scrolled, setScrolled] =
    useState(false);


  /*
  ========================================================
  MOBILE MENU STATE
  ========================================================
  */

  const [open, setOpen] =
    useState(false);


  /*
  ========================================================
  AUTHENTICATION
  ========================================================
  */

  const {
    user,
    logout
  } = useAuth();


  /*
  ========================================================
  CART
  ========================================================
  */

  const {
    count
  } = useCart();


  /*
  ========================================================
  SCROLL HANDLER
  ========================================================

  requestAnimationFrame prevents React state updates from
  happening repeatedly during the same browser frame.

  This is lighter than updating state on every raw scroll
  event.
  ========================================================
  */

  useEffect(() => {

    let animationFrameId = null;


    const handleScroll = () => {

      /*
      Don't schedule multiple animation frames for the
      same period of scrolling.
      */

      if (
        animationFrameId !== null
      ) {
        return;
      }


      animationFrameId =
        window.requestAnimationFrame(() => {

          const shouldBeScrolled =
            window.scrollY > 24;


          setScrolled(
            (previous) => {

              /*
              Avoid a React state update if the value
              has not actually changed.
              */

              if (
                previous ===
                shouldBeScrolled
              ) {
                return previous;
              }


              return shouldBeScrolled;
            }
          );


          animationFrameId = null;

        });

    };


    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true
      }
    );


    /*
    ======================================================
    CLEANUP
    ======================================================
    */

    return () => {

      window.removeEventListener(
        'scroll',
        handleScroll
      );


      if (
        animationFrameId !== null
      ) {

        window.cancelAnimationFrame(
          animationFrameId
        );

      }

    };

  }, []);


  /*
  ========================================================
  MOBILE BODY SCROLL LOCK
  ========================================================
  */

  useEffect(() => {

    if (open) {

      document.body.style.overflow =
        'hidden';

    } else {

      document.body.style.overflow =
        '';

    }


    /*
    ======================================================
    CLEANUP
    ======================================================
    */

    return () => {

      document.body.style.overflow =
        '';

    };

  }, [open]);


  /*
  ========================================================
  CLOSE MOBILE MENU
  ========================================================
  */

  const closeMobileMenu =
    useCallback(() => {

      setOpen(false);

    }, []);


  /*
  ========================================================
  LOGOUT
  ========================================================
  */

  const handleLogout =
    useCallback(() => {

      logout();

      setOpen(false);

    }, [logout]);


  /*
  ========================================================
  TOGGLE MOBILE MENU
  ========================================================
  */

  const toggleMobileMenu =
    useCallback(() => {

      setOpen(
        (previous) =>
          !previous
      );

    }, []);


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (

    <header
      className={
        `navbar ${
          scrolled
            ? 'navbar--scrolled'
            : ''
        }`
      }
    >

      <div className="navbar__inner">


        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          className="navbar__logo"
          aria-label="Astha Silvers Home"
          onClick={
            closeMobileMenu
          }
        >

          <img
            src="/images/Aastha%20Logo-3.png"
            alt="Astha Silvers"
            className="navbar__logo-img"

            /*
            The logo is part of the global navigation and
            should be available immediately.
            */

            loading="eager"

            decoding="async"
          />

        </Link>


        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav
          className={
            'navbar__links navbar__links--desktop'
          }
        >

          {links.map((link) => (

            <NavLink
              key={link.to}
              to={link.to}

              className={({
                isActive
              }) =>
                `navbar__link ${
                  isActive
                    ? 'is-active'
                    : ''
                }`
              }
            >

              {link.label}

            </NavLink>

          ))}

        </nav>


        {/* =================================================
            RIGHT ACTIONS
        ================================================= */}

        <div className="navbar__actions">


          {/* =================================================
              INSTAGRAM
          ================================================= */}

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


          {/* =================================================
              CART
          ================================================= */}

          <Link
            to="/cart"
            className={
              'navbar__icon-btn navbar__cart'
            }
            aria-label="View cart"
          >

            <ShoppingBag
              size={19}
              strokeWidth={1.5}
            />


            {count > 0 && (

              <span
                className="navbar__badge"
              >
                {count}
              </span>

            )}

          </Link>


          {/* =================================================
              ACCOUNT / LOGIN
          ================================================= */}

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


          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            className="navbar__hamburger"
            onClick={
              toggleMobileMenu
            }

            aria-label={
              open
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }

            aria-expanded={open}
          >

            {open ? (

              <X
                size={22}
              />

            ) : (

              <Menu
                size={22}
              />

            )}

          </button>


        </div>

      </div>


      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {open && (

        <nav
          className="navbar__mobile"
        >


          {links.map((link) => (

            <NavLink
              key={link.to}
              to={link.to}

              className={({
                isActive
              }) =>
                `navbar__mobile-link ${
                  isActive
                    ? 'is-active'
                    : ''
                }`
              }

              onClick={
                closeMobileMenu
              }
            >

              {link.label}

            </NavLink>

          ))}


          {/* =================================================
              MOBILE SIGN IN
          ================================================= */}

          {!user && (

            <Link
              to="/login"
              className="navbar__mobile-link"
              onClick={
                closeMobileMenu
              }
            >
              Sign In
            </Link>

          )}


          {/* =================================================
              MOBILE ACCOUNT
          ================================================= */}

          {user && (

            <>

              <Link
                to="/account"
                className="navbar__mobile-link"
                onClick={
                  closeMobileMenu
                }
              >
                My Account
              </Link>


              <button
                type="button"
                className={
                  'navbar__mobile-link navbar__mobile-logout'
                }
                onClick={
                  handleLogout
                }
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