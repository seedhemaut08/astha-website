import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { api } from '../api';


/*
=========================================================
AUTH CONTEXT
=========================================================
*/

const AuthContext = createContext(null);


/*
=========================================================
AUTH PROVIDER
=========================================================
*/

export function AuthProvider({ children }) {

  /*
  ========================================================
  USER STATE
  ========================================================
  */

  const [user, setUser] = useState(null);


  /*
  ========================================================
  AUTH LOADING STATE
  ========================================================
  */

  const [loading, setLoading] =
    useState(true);


  /*
  ========================================================
  RESTORE AUTHENTICATION
  ========================================================

  On application startup:

  1. Check for the saved authentication token.
  2. If there is no token, stop loading immediately.
  3. If a token exists, ask the backend for the current user.
  4. If the token is invalid, remove it.
  ========================================================
  */

  useEffect(() => {

    let isMounted = true;


    const token =
      localStorage.getItem(
        'astha_token'
      );


    /*
    ======================================================
    NO TOKEN
    ======================================================
    */

    if (!token) {

      if (isMounted) {
        setLoading(false);
      }

      return () => {
        isMounted = false;
      };
    }


    /*
    ======================================================
    RESTORE USER
    ======================================================
    */

    api
      .get('/auth/me')
      .then(({ user }) => {

        if (isMounted) {
          setUser(user);
        }

      })
      .catch(() => {

        /*
        Invalid/expired token.
        */

        localStorage.removeItem(
          'astha_token'
        );

        if (isMounted) {
          setUser(null);
        }

      })
      .finally(() => {

        if (isMounted) {
          setLoading(false);
        }

      });


    /*
    ======================================================
    CLEANUP
    ======================================================
    */

    return () => {
      isMounted = false;
    };

  }, []);


  /*
  ========================================================
  LOGIN
  ========================================================
  */

  const login = useCallback(
    async (
      email,
      password
    ) => {

      const {
        token,
        user
      } = await api.post(
        '/auth/login',
        {
          email,
          password
        }
      );


      /*
      Save authentication token.
      */

      localStorage.setItem(
        'astha_token',
        token
      );


      /*
      Update current user.
      */

      setUser(user);


      return {
        token,
        user
      };

    },
    []
  );


  /*
  ========================================================
  SIGNUP — SEND OTP
  ========================================================
  */

  const signup = useCallback(
    async (
      name,
      email,
      password,
      phone
    ) => {

      const response =
        await api.post(
          '/auth/register',
          {
            name,
            email,
            password,
            phone
          }
        );


      /*
      New signup flow:

      Backend sends OTP first.

      Account is NOT created until
      OTP verification.
      */

      return response;

    },
    []
  );


  /*
  ========================================================
  SIGNUP — VERIFY OTP
  ========================================================
  */

  const verifySignupOtp =
    useCallback(
      async (
        name,
        email,
        password,
        phone,
        otp
      ) => {

        const response =
          await api.post(
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
        Backend creates the account only after
        successful OTP verification.
        */

        const {
          token,
          user
        } = response;


        /*
        Save token when backend returns one.
        */

        if (token) {

          localStorage.setItem(
            'astha_token',
            token
          );

        }


        /*
        Update authenticated user.
        */

        if (user) {
          setUser(user);
        }


        return response;

      },
      []
    );


  /*
  ========================================================
  RESEND SIGNUP OTP
  ========================================================
  */

  const resendSignupOtp =
    useCallback(
      async (email) => {

        return api.post(
          '/auth/register/resend-otp',
          {
            email
          }
        );

      },
      []
    );


  /*
  ========================================================
  FORGOT PASSWORD — SEND OTP
  ========================================================
  */

  const forgotPassword =
    useCallback(
      async (email) => {

        return api.post(
          '/auth/forgot-password',
          {
            email
          }
        );

      },
      []
    );


  /*
  ========================================================
  FORGOT PASSWORD — VERIFY OTP
  ========================================================
  */

  const verifyPasswordResetOtp =
    useCallback(
      async (
        email,
        otp
      ) => {

        return api.post(
          '/auth/forgot-password/verify-otp',
          {
            email,
            otp
          }
        );

      },
      []
    );


  /*
  ========================================================
  RESET PASSWORD
  ========================================================
  */

  const resetPassword =
    useCallback(
      async (
        email,
        resetToken,
        newPassword
      ) => {

        return api.post(
          '/auth/reset-password',
          {
            email,
            resetToken,
            newPassword
          }
        );

      },
      []
    );


  /*
  ========================================================
  LOGOUT
  ========================================================
  */

  const logout =
    useCallback(() => {

      localStorage.removeItem(
        'astha_token'
      );

      setUser(null);

    }, []);


  /*
  ========================================================
  MEMOIZED CONTEXT VALUE
  ========================================================

  Without useMemo, this object would be recreated on every
  AuthProvider render.

  Memoizing it helps prevent unnecessary renders in components
  that consume AuthContext when the actual authentication data
  has not changed.
  ========================================================
  */

  const contextValue =
    useMemo(
      () => ({
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
      }),
      [
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
      ]
    );


  /*
  ========================================================
  PROVIDER
  ========================================================
  */

  return (

    <AuthContext.Provider
      value={contextValue}
    >

      {children}

    </AuthContext.Provider>

  );
}


/*
=========================================================
USE AUTH HOOK
=========================================================
*/

export function useAuth() {

  return useContext(
    AuthContext
  );

}