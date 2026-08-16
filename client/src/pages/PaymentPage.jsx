import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  const [form, setForm] = useState({ cardHolder: '', cardNumber: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/courses/${id}`);
        if (cancelled) return;
        setCourse(data);
        try {
          await api.get(`/enrollments/${id}/progress`);
          if (!cancelled) setAlreadyEnrolled(true);
        } catch {
          // not enrolled yet — expected for a fresh purchase
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: undefined });
  };

  // Formatting helpers keep this obviously a dummy card form (no real validation/luhn check needed)
  const formatCardNumber = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const validate = () => {
    const e = {};
    if (!form.cardHolder.trim()) e.cardHolder = 'Card holder name is required';
    const digits = form.cardNumber.replace(/\D/g, '');
    if (digits.length !== 16) e.cardNumber = 'Enter a 16-digit card number';
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Use MM/YY format';
    if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = 'Enter a valid CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const payNow = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setPaying(true);
    try {
      // Dummy payment: no card data is sent anywhere or charged — this simply
      // confirms the form, then creates the payment + enrollment records server-side.
      await new Promise((resolve) => setTimeout(resolve, 700)); // simulate processing
      await api.post(`/enrollments/${id}/purchase`);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loader />;
  if (!course) return <div className="container py-5">Course not found.</div>;

  if (alreadyEnrolled) {
    return (
      <div className="container py-5" style={{ maxWidth: 480 }}>
        <div className="alert alert-info">
          You're already enrolled in <strong>{course.title}</strong>.
        </div>
        <Link to="/dashboard" className="btn btn-primary glow-btn">Go to My Courses</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: 480 }}>
        <div className="alert alert-success fs-5 py-4">
          ✅ Payment Successful!
        </div>
        <p className="text-muted">Redirecting to My Courses...</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h1 className="mb-4">Checkout</h1>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted small">Course</div>
            <div className="fw-semibold fs-5">{course.title}</div>
          </div>
          <div className="text-end">
            <div className="text-muted small">Price</div>
            <div className="fw-bold fs-4 text-primary-brand">${Number(course.price).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <form onSubmit={payNow} className="card border-0 shadow-sm p-4">
        <h5 className="mb-3">Payment Details</h5>
        <p className="text-muted small mb-3">
          🔒 This is a dummy payment form for demo purposes. No real card is charged and no
          card details are stored or transmitted anywhere.
        </p>

        {serverError && <div className="alert alert-danger py-2">{serverError}</div>}

        <div className="mb-3">
          <label className="form-label">Card Holder Name</label>
          <input
            className={`form-control ${errors.cardHolder ? 'is-invalid' : ''}`}
            placeholder="Jane Doe"
            value={form.cardHolder}
            onChange={update('cardHolder')}
          />
          {errors.cardHolder && <div className="invalid-feedback">{errors.cardHolder}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Card Number</label>
          <input
            className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
            placeholder="1234 5678 9012 3456"
            value={form.cardNumber}
            onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
            inputMode="numeric"
          />
          {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
        </div>

        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Expiry Date</label>
            <input
              className={`form-control ${errors.expiry ? 'is-invalid' : ''}`}
              placeholder="MM/YY"
              value={form.expiry}
              onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
              inputMode="numeric"
            />
            {errors.expiry && <div className="invalid-feedback">{errors.expiry}</div>}
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">CVV</label>
            <input
              className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
              placeholder="123"
              value={form.cvv}
              onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              inputMode="numeric"
              type="password"
            />
            {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
          </div>
        </div>

        <button className="btn btn-primary glow-btn btn-lg mt-2" disabled={paying}>
          {paying ? 'Processing Payment...' : `Pay Now — $${Number(course.price).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
