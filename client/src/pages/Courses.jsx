import { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (q = '') => {
    setLoading(true);
    api.get('/courses', { params: q ? { search: q } : {} })
      .then(res => setCourses(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <h1 className="mb-0">All Courses</h1>
        <form onSubmit={onSubmit} className="d-flex" style={{ minWidth: 280 }}>
          <input
            className="form-control me-2"
            placeholder="Search courses by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-primary glow-btn">Search</button>
        </form>
      </div>

      {loading ? <Loader /> : (
        <div className="row g-4">
          {courses.map(c => (
            <div className="col-md-4" key={c.id}><CourseCard course={c} /></div>
          ))}
          {courses.length === 0 && <p className="text-muted">No courses found.</p>}
        </div>
      )}
    </div>
  );
}
