import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', userId: '', email: '', address: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <h1 className="mb-4 text-center">Create your account</h1>
      <form onSubmit={submit} className="card p-4 shadow-sm border-0">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input className="form-control" required value={form.fullName} onChange={update('fullName')} />
        </div>
        <div className="mb-3">
          <label className="form-label">User ID</label>
          <input className="form-control" required value={form.userId} onChange={update('userId')} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" required value={form.email} onChange={update('email')} />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <input className="form-control" value={form.address} onChange={update('address')} />
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" required value={form.password} onChange={update('password')} />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-control" required value={form.confirmPassword} onChange={update('confirmPassword')} />
          </div>
        </div>
        <button className="btn btn-primary glow-btn" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        <p className="text-center mt-3 mb-0">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
