import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminCourses from './AdminCourses';
import AdminUsers from './AdminUsers';
import api from '../api/axios';
import Loader from '../components/Loader';
import AdminReports from "./AdminReports";
import AdminReviews from './AdminReviews';

const navItems = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/users', label: 'Users & Progress' },
  { to: '/admin/reports', label: 'Student Reports' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/content', label: 'Site Content & Messages' }
];
export default function AdminDashboard() {
  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3 col-lg-2 mb-4">
          <Sidebar items={navItems} />
        </div>
        <div className="col-md-9 col-lg-10">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="content" element={<AdminContent />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/courses'),
      api.get('/admin/users'),
      api.get('/admin/enrollments')
    ]).then(([courses, users, enrollments]) => {
      setStats({
        courses: courses.data.length,
        users: users.data.filter(u => u.role === 'user').length,
        enrollments: enrollments.data.length,
        avgProgress: enrollments.data.length
          ? Math.round(enrollments.data.reduce((s, e) => s + e.progress, 0) / enrollments.data.length)
          : 0
      });
    });
  }, []);

  if (!stats) return <Loader />;

  return (
    <div>
      <h1 className="mb-4">Admin Overview</h1>
      <div className="row g-3">
        <Card label="Total Courses" value={stats.courses} />
        <Card label="Registered Students" value={stats.users} />
        <Card label="Total Enrollments" value={stats.enrollments} />
        <Card label="Avg. Progress" value={`${stats.avgProgress}%`} />
      </div>
      <div className="mt-4 d-flex gap-2 flex-wrap">
  <Link to="/admin/courses" className="btn btn-primary glow-btn">
    Manage Courses
  </Link>

  <Link to="/admin/users" className="btn btn-outline-secondary">
    View Students
  </Link>

  <Link to="/admin/reports" className="btn btn-warning">
    Student Reports
  </Link>
</div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card border-0 shadow-sm text-center p-3">
        <div className="fs-3 fw-bold text-primary-brand">{value}</div>
        <div className="text-muted small">{label}</div>
      </div>
    </div>
  );
}

function AdminContent() {
  const [content, setContent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);

  const load = () => {
    api.get('/admin/site-content').then(res => setContent(res.data));
    api.get('/admin/contact-messages').then(res => setMessages(res.data));
  };
  useEffect(load, []);

  if (!content) return <Loader />;

  const save = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/admin/site-content', content);
    setContent(data);
    setStatus('Saved.');
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div>
      <h1 className="mb-4">Site Content</h1>
      <form onSubmit={save} className="card border-0 shadow-sm p-4 mb-4">
        {status && <div className="alert alert-success py-2">{status}</div>}
        <div className="mb-3">
          <label className="form-label">About Us Text</label>
          <textarea className="form-control" rows={4} value={content.about}
            onChange={e => setContent({ ...content, about: e.target.value })} />
        </div>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Contact Email</label>
            <input className="form-control" value={content.contact.email}
              onChange={e => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })} />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Phone</label>
            <input className="form-control" value={content.contact.phone}
              onChange={e => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })} />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Address</label>
            <input className="form-control" value={content.contact.address}
              onChange={e => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })} />
          </div>
        </div>
        <button className="btn btn-primary glow-btn align-self-start">Save Content</button>
      </form>

      <h4 className="mb-3">Contact Messages</h4>
      <div className="table-responsive">
        <table className="table table-striped bg-white">
          <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Date</th></tr></thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id}>
                <td>{m.name}</td><td>{m.email}</td><td>{m.message}</td>
                <td>{new Date(m.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {messages.length === 0 && <tr><td colSpan={4} className="text-muted">No messages yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
