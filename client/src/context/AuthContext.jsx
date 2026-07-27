import { createContext, useContext, useState, useEffect } from 'react';
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
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('astha_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, user } = await api.post('/auth/login', { email, password });
    localStorage.setItem('astha_token', token);
    setUser(user);
  }

  async function signup(name, email, password, phone) {
    const { token, user } = await api.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('astha_token', token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('astha_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
