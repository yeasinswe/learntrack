import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.userId, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="mb-4 text-center">Login</h1>
      <form onSubmit={submit} className="card p-4 shadow-sm border-0">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="mb-3">
          <label className="form-label">User ID</label>
          <input className="form-control" required value={form.userId}
            onChange={e => setForm({ ...form, userId: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" required value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn btn-primary glow-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <p className="text-muted small mt-3 mb-0">
          Admin demo: <code>admin</code> / <code>admin123</code>
        </p>
        <p className="text-center mt-2 mb-0">
          No account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}
