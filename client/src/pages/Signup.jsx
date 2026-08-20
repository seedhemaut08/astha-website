import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    signup,
    verifySignupOtp,
    resendSignupOtp
  } = useAuth();

  const navigate = useNavigate();

  /* ============================================================
     RESEND COUNTDOWN
     ============================================================ */

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer(previous => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);


  /* ============================================================
     FORM UPDATE
     ============================================================ */

  function update(field, value) {
    setForm(previous => ({
      ...previous,
      [field]: value
    }));
  }


  /* ============================================================
     SEND SIGNUP OTP
     ============================================================ */

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    /*
     * STEP 1:
     * Send registration details and request OTP.
     */

    if (!otpSent) {
      setSubmitting(true);

      try {
        await signup(
          form.name,
          form.email,
          form.password,
          form.phone
        );

        setOtpSent(true);
        setOtp('');
        setResendTimer(60);

      } catch (err) {
        setError(
          err?.message ||
          'Unable to send verification code.'
        );
      } finally {
        setSubmitting(false);
      }

      return;
    }


    /*
     * STEP 2:
     * Verify OTP.
     */

    if (!otp || otp.length !== 6) {
      setError(
        'Please enter the 6-digit verification code.'
      );
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const result = await verifySignupOtp(
        form.name,
        form.email,
        form.password,
        form.phone,
        otp
      );

      if (result?.token || result?.user) {
        navigate('/account');
        return;
      }

      setError(
        result?.message ||
        'Unable to verify your account.'
      );

    } catch (err) {
      setError(
        err?.message ||
        'Invalid verification code.'
      );
    } finally {
      setOtpLoading(false);
    }
  }


  /* ============================================================
     RESEND OTP
     ============================================================ */

  async function handleResendOtp() {
    if (resendTimer > 0 || resending) {
      return;
    }

    setError('');
    setResending(true);

    try {
      await resendSignupOtp(form.email);

      setOtp('');
      setResendTimer(60);

    } catch (err) {
      setError(
        err?.message ||
        'Unable to resend verification code.'
      );
    } finally {
      setResending(false);
    }
  }


  /* ============================================================
     BACK TO SIGNUP FORM
     ============================================================ */

  function handleChangeEmail() {
    setOtpSent(false);
    setOtp('');
    setError('');
    setResendTimer(0);
  }


  return (
    <div className="auth-page">
      <div className="auth-card">

        {!otpSent ? (
          <>
            <span className="eyebrow">
              Join Astha
            </span>

            <h1>Create Account</h1>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* FULL NAME */}

              <label>
                Full Name

                <input
                  type="text"
                  value={form.name}
                  onChange={e =>
                    update(
                      'name',
                      e.target.value
                    )
                  }
                  required
                />
              </label>


              {/* EMAIL */}

              <label>
                Email

                <input
                  type="email"
                  value={form.email}
                  onChange={e =>
                    update(
                      'email',
                      e.target.value
                    )
                  }
                  required
                />
              </label>


              {/* PHONE */}

              <label>
                Phone

                <input
                  type="tel"
                  value={form.phone}
                  onChange={e =>
                    update(
                      'phone',
                      e.target.value
                    )
                  }
                />
              </label>


              {/* PASSWORD */}

              <label>
                Password

                <div
                  style={{
                    position: 'relative'
                  }}
                >
                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={form.password}
                    onChange={e =>
                      update(
                        'password',
                        e.target.value
                      )
                    }
                    required
                    minLength={6}
                    style={{
                      paddingRight: '48px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        previous =>
                          !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform:
                        'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '18px',
                      lineHeight: 1
                    }}
                  >
                    {showPassword
                      ? '🙈'
                      : '👁️'}
                  </button>
                </div>
              </label>


              {/* CONTINUE */}

              <button
                className="btn btn--primary btn--full"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? 'Sending verification code...'
                  : 'Continue'}
              </button>

            </form>

            <p className="auth-card__footer">
              Already have an account?{' '}
              <Link to="/login">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <span className="eyebrow">
              Verify Email
            </span>

            <h1>Enter OTP</h1>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <p
              style={{
                marginBottom: '24px'
              }}
            >
              We sent a 6-digit verification code
              to{' '}
              <strong>
                {form.email}
              </strong>.
            </p>

            <form onSubmit={handleSubmit}>

              {/* OTP */}

              <label>
                Verification Code

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={e => {
                    const value =
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6);

                    setOtp(value);
                  }}
                  placeholder="Enter 6-digit OTP"
                  required
                />
              </label>


              {/* VERIFY */}

              <button
                className="btn btn--primary btn--full"
                type="submit"
                disabled={
                  otpLoading ||
                  otp.length !== 6
                }
              >
                {otpLoading
                  ? 'Verifying...'
                  : 'Verify & Create Account'}
              </button>

            </form>


            {/* RESEND */}

            <div
              style={{
                textAlign: 'center',
                marginTop: '20px'
              }}
            >
              {resendTimer > 0 ? (
                <p
                  style={{
                    margin: 0,
                    opacity: 0.7
                  }}
                >
                  Resend code in{' '}
                  <strong>
                    {resendTimer}s
                  </strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    cursor: resending
                      ? 'default'
                      : 'pointer',
                    font: 'inherit',
                    color: 'inherit',
                    opacity: resending
                      ? 0.6
                      : 1
                  }}
                >
                  {resending
                    ? 'Sending...'
                    : 'Resend OTP'}
                </button>
              )}
            </div>


            {/* CHANGE EMAIL */}

            <p
              className="auth-card__footer"
              style={{
                marginTop: '18px'
              }}
            >
              Wrong email?{' '}

              <button
                type="button"
                onClick={handleChangeEmail}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  font: 'inherit',
                  color: 'inherit'
                }}
              >
                Change email
              </button>
            </p>

          </>
        )}

      </div>
    </div>
  );
}