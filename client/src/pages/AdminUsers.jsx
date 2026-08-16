import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/admin/users'), api.get('/admin/enrollments')])
      .then(([u, e]) => { setUsers(u.data); setEnrollments(e.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const removeUser = async (id) => {
    if (!confirm('Delete this user? Their enrollments will also be removed.')) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="mb-4">Registered Users</h1>
      <div className="table-responsive mb-5">
        <table className="table table-striped bg-white align-middle">
          <thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Address</th><th></th></tr></thead>
          <tbody>
            {users.filter(u => u.role === 'user').map(u => (
              <tr key={u.id}>
                <td>{u.user_id}</td><td>{u.full_name}</td><td>{u.email}</td><td>{u.address}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeUser(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.filter(u => u.role === 'user').length === 0 && (
              <tr><td colSpan={5} className="text-muted">No students registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h1 className="mb-4">Purchases & Progress</h1>
      <div className="table-responsive">
        <table className="table table-striped bg-white align-middle">
          <thead><tr><th>User</th><th>Course</th><th>Progress</th><th>Quiz Results</th></tr></thead>
          <tbody>
            {enrollments.map(e => (
              <tr key={e.enrollmentId}>
                <td>{e.userName} ({e.userId})</td>
                <td>{e.courseTitle}</td>
                <td>{e.progress}%</td>
                <td>
                  {e.quizScores.length === 0 ? '—' : e.quizScores.map((r, i) => (
                    <span key={i} className={`badge me-1 ${r.is_correct ? 'bg-success' : 'bg-danger'}`}>
                      {r.is_correct ? '✓' : '✗'}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && <tr><td colSpan={4} className="text-muted">No purchases yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
