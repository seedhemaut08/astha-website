import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(form.name, form.email, form.password, form.phone);
      navigate('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Join Astha</span>
        <h1>Create Account</h1>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
          </label>
          <label>
            Phone
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
          </label>
          <button className="btn btn--primary btn--full" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
