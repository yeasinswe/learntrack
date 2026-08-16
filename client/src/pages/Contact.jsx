import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Contact() {
  const [content, setContent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/contact/site-content').then(res => setContent(res.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const { data } = await api.post('/contact', form);
      setStatus({ type: 'success', text: data.message });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ type: 'danger', text: err.response?.data?.message || 'Something went wrong' });
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-md-5">
          <h1 className="mb-4">Contact Us</h1>
          {content && (
            <ul className="list-unstyled text-muted">
              <li className="mb-2">📧 {content.contact.email}</li>
              <li className="mb-2">📞 {content.contact.phone}</li>
              <li className="mb-2">📍 {content.contact.address}</li>
            </ul>
          )}
        </div>
        <div className="col-md-7">
          <form onSubmit={submit} className="card p-4 shadow-sm border-0">
            {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={4} required value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <button className="btn btn-primary glow-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
