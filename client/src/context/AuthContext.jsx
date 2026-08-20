import {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('astha_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(({ user }) => {
        setUser(user);
      })
      .catch(() => {
        localStorage.removeItem('astha_token');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  /* ============================================================
     LOGIN
     ============================================================ */

  async function login(email, password) {
    const { token, user } = await api.post(
      '/auth/login',
      {
        email,
        password
      }
    );

    localStorage.setItem(
      'astha_token',
      token
    );

    setUser(user);

    return {
      token,
      user
    };
  }


  /* ============================================================
     SIGNUP — SEND OTP
     ============================================================ */

  async function signup(
    name,
    email,
    password,
    phone
  ) {
    const response = await api.post(
      '/auth/register',
      {
        name,
        email,
        password,
        phone
      }
    );

    /*
     * New signup flow:
     * Backend sends OTP first.
     * Account is NOT created until OTP verification.
     */

    return response;
  }


  /* ============================================================
     SIGNUP — VERIFY OTP
     ============================================================ */

  async function verifySignupOtp(
    name,
    email,
    password,
    phone,
    otp
  ) {
    const response = await api.post(
      '/auth/register',
      {
        name,
        email,
        password,
        phone,
        otp
      }
    );

    /*
     * Backend creates the account only after
     * successful OTP verification.
     */

    const {
      token,
      user
    } = response;

    if (token) {
      localStorage.setItem(
        'astha_token',
        token
      );
    }

    if (user) {
      setUser(user);
    }

    return response;
  }


  /* ============================================================
     RESEND SIGNUP OTP
     ============================================================ */

  async function resendSignupOtp(email) {
    return await api.post(
      '/auth/register/resend-otp',
      {
        email
      }
    );
  }


  /* ============================================================
     FORGOT PASSWORD — SEND OTP
     ============================================================ */

  async function forgotPassword(email) {
    return await api.post(
      '/auth/forgot-password',
      {
        email
      }
    );
  }


  /* ============================================================
     FORGOT PASSWORD — VERIFY OTP
     ============================================================ */

  async function verifyPasswordResetOtp(
    email,
    otp
  ) {
    return await api.post(
      '/auth/forgot-password/verify-otp',
      {
        email,
        otp
      }
    );
  }


  /* ============================================================
     RESET PASSWORD
     ============================================================ */

  async function resetPassword(
    email,
    resetToken,
    newPassword
  ) {
    return await api.post(
      '/auth/reset-password',
      {
        email,
        resetToken,
        newPassword
      }
    );
  }


  /* ============================================================
     LOGOUT
     ============================================================ */

  function logout() {
    localStorage.removeItem(
      'astha_token'
    );

    setUser(null);
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        login,

        signup,
        verifySignupOtp,
        resendSignupOtp,

        forgotPassword,
        verifyPasswordResetOtp,
        resetPassword,

        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}