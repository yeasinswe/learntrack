import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';

const emptyVideo = () => ({ type: 'video', title: '', youtube_url: '' });
const emptyQuiz = () => ({ type: 'quiz', title: '', question: '', options: ['', '', '', ''], correct_answer: 0 });

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // course object being created/edited, or null

  const load = () => {
    setLoading(true);
    api.get('/courses').then(res => setCourses(res.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (id) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await api.delete(`/courses/${id}`);
    load();
  };

  if (editing) {
    return <CourseEditor course={editing} onDone={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Courses</h1>
        <button className="btn btn-primary glow-btn" onClick={() => setEditing({ isNew: true })}>+ New Course</button>
      </div>
      {loading ? <Loader /> : (
        <div className="table-responsive">
          <table className="table table-striped bg-white align-middle">
            <thead><tr><th>Title</th><th>Category</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>${Number(c.price).toFixed(2)}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditing({ id: c.id })}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && <tr><td colSpan={4} className="text-muted">No courses yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CourseEditor({ course, onDone, onCancel }) {
  const [form, setForm] = useState({ title: '', category: '', description: '', price: '' });
  const [bannerFile, setBannerFile] = useState(null);
  const [videos, setVideos] = useState([0, 1, 2, 3, 4].map(emptyVideo));
  const [quizzes, setQuizzes] = useState([0, 1].map(emptyQuiz));
  const [courseId, setCourseId] = useState(course.id || null);
  const [loading, setLoading] = useState(!course.isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (course.isNew) { setLoading(false); return; }
    api.get(`/courses/${course.id}/admin`).then(res => {
      const c = res.data;
      setForm({ title: c.title, category: c.category, description: c.description, price: c.price });
      const v = c.modules.filter(m => m.type === 'video');
      const q = c.modules.filter(m => m.type === 'quiz');
      if (v.length === 5) setVideos(v.map(m => ({ type: 'video', title: m.title, youtube_url: m.youtube_url })));
      if (q.length === 2) setQuizzes(q.map(m => ({
        type: 'quiz', title: m.title, question: m.question, options: m.options, correct_answer: m.correct_answer
      })));
      setLoading(false);
    });
  }, [course]);

  if (loading) return <Loader />;

  const saveCourseInfo = async () => {
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (bannerFile) fd.append('banner', bannerFile);

      let id = courseId;
      if (id) {
        await api.put(`/courses/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const { data } = await api.post('/courses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        id = data.id;
        setCourseId(id);
      }
      return id;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveModules = async (id) => {
    const modules = [
      ...videos.map((v, i) => ({ ...v, order_index: i })),
      ...quizzes.map((q, i) => ({ ...q, order_index: 5 + i }))
    ];
    await api.put(`/courses/${id}/modules`, { modules });
  };

  const saveAll = async () => {
    const id = await saveCourseInfo();
    if (!id) return;
    setSaving(true);
    try {
      await saveModules(id);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save modules (need exactly 5 videos + 2 quizzes)');
    } finally {
      setSaving(false);
    }
  };

  const updateVideo = (i, field, val) => {
    const copy = [...videos];
    copy[i] = { ...copy[i], [field]: val };
    setVideos(copy);
  };

  const updateQuiz = (i, field, val) => {
    const copy = [...quizzes];
    copy[i] = { ...copy[i], [field]: val };
    setQuizzes(copy);
  };

  const updateQuizOption = (i, optIdx, val) => {
    const copy = [...quizzes];
    const opts = [...copy[i].options];
    opts[optIdx] = val;
    copy[i] = { ...copy[i], options: opts };
    setQuizzes(copy);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{courseId ? 'Edit Course' : 'New Course'}</h1>
        <button className="btn btn-outline-secondary" onClick={onCancel}>← Back</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h5 className="mb-3">Course Details</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Title</label>
            <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Category</label>
            <input className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Price ($)</label>
            <input type="number" step="0.01" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="col-12">
            <label className="form-label">Banner Image</label>
            <input type="file" className="form-control" accept="image/*" onChange={e => setBannerFile(e.target.files[0])} />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h5 className="mb-3">5 Video Lessons</h5>
        {videos.map((v, i) => (
          <div className="row g-2 mb-2 align-items-center" key={i}>
            <div className="col-auto fw-semibold">{i + 1}.</div>
            <div className="col-md-5">
              <input className="form-control" placeholder="Video title" value={v.title} onChange={e => updateVideo(i, 'title', e.target.value)} />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="YouTube embed URL (unlisted)" value={v.youtube_url} onChange={e => updateVideo(i, 'youtube_url', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <h5 className="mb-3">2 MCQ Quizzes</h5>
        {quizzes.map((q, i) => (
          <div key={i} className="mb-4 pb-3 border-bottom">
            <div className="row g-2 mb-2">
              <div className="col-md-4">
                <input className="form-control" placeholder="Quiz title" value={q.title} onChange={e => updateQuiz(i, 'title', e.target.value)} />
              </div>
              <div className="col-md-8">
                <input className="form-control" placeholder="Question" value={q.question} onChange={e => updateQuiz(i, 'question', e.target.value)} />
              </div>
            </div>
            <div className="row g-2">
              {q.options.map((opt, optIdx) => (
                <div className="col-md-6 d-flex align-items-center gap-2" key={optIdx}>
                  <input
                    type="radio"
                    name={`correct-${i}`}
                    checked={Number(q.correct_answer) === optIdx}
                    onChange={() => updateQuiz(i, 'correct_answer', optIdx)}
                  />
                  <input className="form-control" placeholder={`Option ${optIdx + 1}`} value={opt} onChange={e => updateQuizOption(i, optIdx, e.target.value)} />
                </div>
              ))}
            </div>
            <small className="text-muted">Select the radio button next to the correct answer.</small>
          </div>
        ))}
      </div>

      <button className="btn btn-primary glow-btn" disabled={saving} onClick={saveAll}>
        {saving ? 'Saving...' : 'Save Course'}
      </button>
    </div>
  );
}
