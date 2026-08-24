import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState('email');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [resetToken, setResetToken] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  /* =========================================================
     SEND OTP
  ========================================================= */

  async function handleSendOtp(e) {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const data = await api.post(
        '/auth/forgot-password',
        {
          email: email.trim(),
        }
      );

      setMessage(
        data?.message ||
        'OTP has been sent to your registered email address.'
      );

      setStep('otp');
    } catch (err) {
      setError(
        err?.message ||
        'Unable to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     VERIFY OTP
  ========================================================= */

  async function handleVerifyOtp(e) {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }

    if (otp.trim().length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }

    setLoading(true);

    try {
      const data = await api.post(
        '/auth/forgot-password/verify-otp',
        {
          email: email.trim(),
          otp: otp.trim(),
        }
      );

      if (!data?.resetToken) {
        throw new Error(
          'Password reset session could not be created.'
        );
      }

      setResetToken(data.resetToken);

      setMessage(
        'OTP verified successfully. Create your new password.'
      );

      setStep('password');
    } catch (err) {
      setError(
        err?.message ||
        'Unable to verify OTP.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     RESET PASSWORD
  ========================================================= */

  async function handleResetPassword(e) {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter your new password twice.');
      return;
    }

    if (newPassword.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    if (!resetToken) {
      setError(
        'Password reset session is missing. Please start again.'
      );
      return;
    }

    setLoading(true);

    try {
      const data = await api.post(
        '/auth/reset-password',
        {
          email: email.trim(),
          resetToken,
          newPassword,
        }
      );

      setMessage(
        data?.message ||
        'Password changed successfully. Redirecting to Sign In...'
      );

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError(
        err?.message ||
        'Unable to reset password.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     GO BACK
  ========================================================= */

  function handleBack() {
    setError('');
    setMessage('');

    if (step === 'otp') {
      setStep('email');
      setOtp('');
      return;
    }

    if (step === 'password') {
      setStep('otp');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      return;
    }

    navigate('/login');
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* =====================================================
            EMAIL STEP
        ====================================================== */}

        {step === 'email' && (
          <>
            <span className="eyebrow">
              Password Recovery
            </span>

            <h1>
              Forgot Password
            </h1>

            <p className="auth-card__description">
              Enter your registered email address and
              we will send you a verification OTP.
            </p>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {message && (
              <div className="form-success">
                {message}
              </div>
            )}

            <form onSubmit={handleSendOtp}>

              <label>
                Registered Email

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </label>

              <button
                className="btn btn--primary btn--full"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Sending OTP...'
                  : 'Send OTP'}
              </button>

            </form>

            <p className="auth-card__footer">
              Remember your password?{' '}

              <Link to="/login">
                Sign In
              </Link>
            </p>
          </>
        )}

        {/* =====================================================
            OTP STEP
        ====================================================== */}

        {step === 'otp' && (
          <>
            <span className="eyebrow">
              Security Verification
            </span>

            <h1>
              Enter OTP
            </h1>

            <p className="auth-card__description">
              We sent a 6-digit verification code to
              <br />

              <strong>
                {email}
              </strong>
            </p>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {message && (
              <div className="form-success">
                {message}
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>

              <label>
                Verification Code

                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6)
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                />
              </label>

              <button
                className="btn btn--primary btn--full"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Verifying...'
                  : 'Verify OTP'}
              </button>

            </form>

            <button
              type="button"
              className="auth-back-button"
              onClick={handleBack}
            >
              ← Change Email
            </button>
          </>
        )}

        {/* =====================================================
            NEW PASSWORD STEP
        ====================================================== */}

        {step === 'password' && (
          <>
            <span className="eyebrow">
              Create New Password
            </span>

            <h1>
              Reset Password
            </h1>

            <p className="auth-card__description">
              OTP verified. Create a new password
              for your Astha account.
            </p>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            {message && (
              <div className="form-success">
                {message}
              </div>
            )}

            <form onSubmit={handleResetPassword}>

              {/* =================================================
                  NEW PASSWORD
              ================================================== */}

              <label>
                New Password

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                  }}
                >

                  <input
                    type={
                      showNewPassword
                        ? 'text'
                        : 'password'
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    style={{
                      paddingRight: '78px',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? 'Hide new password'
                        : 'Show new password'
                    }
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform:
                        'translateY(-50%)',
                      border: 'none',
                      background:
                        'transparent',
                      color: '#d8b45b',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '6px',
                    }}
                  >
                    {showNewPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>

                </div>

              </label>

              {/* =================================================
                  CONFIRM PASSWORD
              ================================================== */}

              <label>
                Confirm New Password

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                  }}
                >

                  <input
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    style={{
                      paddingRight: '78px',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform:
                        'translateY(-50%)',
                      border: 'none',
                      background:
                        'transparent',
                      color: '#d8b45b',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '6px',
                    }}
                  >
                    {showConfirmPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>

                </div>

              </label>

              {/* =================================================
                  CREATE PASSWORD BUTTON
              ================================================== */}

              <button
                className="btn btn--primary btn--full"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Updating Password...'
                  : 'Create New Password'}
              </button>

            </form>

            <button
              type="button"
              className="auth-back-button"
              onClick={handleBack}
            >
              ← Back
            </button>

          </>
        )}

      </div>

    </div>
  );
}