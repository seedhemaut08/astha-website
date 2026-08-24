import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';


/* ============================================================
   PASSWORD EYE ICON
   ============================================================ */

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 3L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M10.6 5.2C11.05 5.07 11.52 5 12 5C18.5 5 22 12 22 12C22 12 20.65 14.7 18.15 16.65"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.05 6.05C3.4 8.15 2 12 2 12C2 12 5.5 19 12 19C13.15 19 14.25 18.8 15.25 18.45"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9.88 9.88C9.35 10.42 9 11.17 9 12C9 13.66 10.34 15 12 15C12.83 15 13.58 14.65 14.12 14.12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


/* ============================================================
   LOGIN PAGE
   ============================================================ */

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();


  /* ============================================================
     LOGIN SUBMIT
     ============================================================ */

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      await login(email, password);

      const dest =
        location.state?.from?.pathname || '/account';

      navigate(dest);

    } catch (err) {
      setError(err.message);

    } finally {
      setSubmitting(false);
    }
  }


  /* ============================================================
     PAGE
     ============================================================ */

  return (
    <div className="auth-page">

      <div className="auth-card">


        {/* ======================================================
            HEADER
        ====================================================== */}

        <span className="eyebrow">
          Welcome Back
        </span>

        <h1>
          Sign In
        </h1>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        {/* ======================================================
            LOGIN FORM
        ====================================================== */}

        <form onSubmit={handleSubmit}>


          {/* ====================================================
              EMAIL
          ==================================================== */}

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={e =>
                setEmail(e.target.value)
              }
              required
            />
          </label>


          {/* ====================================================
              PASSWORD
          ==================================================== */}

          <label>
            Password

            <div
              style={{
                position: 'relative',
                width: '100%'
              }}
            >

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={e =>
                  setPassword(e.target.value)
                }
                required
                style={{
                  width: '100%',
                  paddingRight: '52px',
                  boxSizing: 'border-box'
                }}
              />


              {/* ================================================
                  EYE TOGGLE
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    prev => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform:
                    'translateY(-50%)',

                  width: '34px',
                  height: '34px',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  padding: '0',
                  margin: '0',

                  border: 'none',
                  outline: 'none',

                  background:
                    'transparent',

                  color: showPassword
                    ? '#d9b45a'
                    : '#9b9b9b',

                  cursor: 'pointer',

                  borderRadius: '50%',

                  transition:
                    'color 0.2s ease, background 0.2s ease'
                }}

                onMouseEnter={e => {
                  e.currentTarget.style.background =
                    'rgba(217, 180, 90, 0.08)';
                }}

                onMouseLeave={e => {
                  e.currentTarget.style.background =
                    'transparent';
                }}
              >
                <EyeIcon
                  open={showPassword}
                />
              </button>

            </div>
          </label>


          {/* ====================================================
              FORGOT PASSWORD
          ==================================================== */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '-0.5rem',
              marginBottom: '1.25rem'
            }}
          >

            <Link
              to="/forgot-password"
              style={{
                color: '#d9b45a',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Forgot Password?
            </Link>

          </div>


          {/* ====================================================
              SIGN IN BUTTON
          ==================================================== */}

          <button
            className="btn btn--primary btn--full"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? 'Signing in...'
              : 'Sign In'}
          </button>

        </form>


        {/* ======================================================
            FOOTER
        ====================================================== */}

        <p className="auth-card__footer">

          New to Astha?{' '}

          <Link to="/signup">
            Create an account
          </Link>

        </p>

      </div>

    </div>
  );
}