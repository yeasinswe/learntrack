import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import ProgressBar from '../components/ProgressBar';

export default function CourseLearn() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [rating, setRating] = useState(5);
const [review, setReview] = useState('');

  const load = async () => {
    setLoading(true);
    const [courseRes, progressRes] = await Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/enrollments/${id}/progress`)
    ]);
    setCourse(courseRes.data);
    setEnrollment(progressRes.data.enrollment);
    setProgress(progressRes.data.progress);
    setQuizResults(progressRes.data.quizResults);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <Loader />;
  if (!course) return <div className="container py-5">Course not found.</div>;

  const modules = course.modules;
  const current = modules[active];
  const completedVideos = enrollment.completed_videos || [];

  const markComplete = async () => {
    await api.post(`/enrollments/${id}/video/${current.id}/complete`);
    await load();
  };

  const submitQuiz = async () => {
    if (quizAnswer === null) return;
    const { data } = await api.post(`/enrollments/${id}/quiz/${current.id}/submit`, { selectedOption: quizAnswer });
    setQuizFeedback(data.isCorrect ? 'correct' : 'incorrect');
    setProgress(data.progress);
    const res = await api.get(`/enrollments/${id}/progress`);
    setQuizResults(res.data.quizResults);
  };

  const selectModule = (idx) => {
    setActive(idx);
    setQuizAnswer(null);
    setQuizFeedback(null);
  };

  const resultFor = (moduleId) => quizResults.find(r => r.module_id === moduleId);
  const submitReview = () => {
  if (!review.trim()) return;

  const reviews =
    JSON.parse(localStorage.getItem('course_reviews')) || [];

  reviews.push({
    id: Date.now(),
    user: localStorage.getItem('lt_user_id') || 'Student',
    course: course.title,
    rating,
    comment: review
  });

  localStorage.setItem(
    'course_reviews',
    JSON.stringify(reviews)
  );

  alert('Review submitted.');

  setReview('');
  setRating(5);
};

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="mb-0">{course.title}</h1>
        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">← Back to Dashboard</Link>
      </div>
      <div style={{ maxWidth: 400 }} className="mb-4">
        <ProgressBar value={progress.total} />
      </div>

      {progress.isComplete && (
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          <span>🎉 You've completed this course!</span>
          <button className="btn btn-sm btn-success" onClick={() => downloadCertificate(id)}>Download Certificate</button>
        </div>
      )}
         
         {progress.isComplete && (
  <div className="card border-0 shadow-sm p-4 mb-4">
    <h5 className="mb-3">⭐ Leave a Review</h5>

    <div className="mb-3">
      <select
        className="form-select"
        value={rating}
        onChange={(e) =>
          setRating(Number(e.target.value))
        }
      >
        <option value={5}>⭐⭐⭐⭐⭐</option>
        <option value={4}>⭐⭐⭐⭐</option>
        <option value={3}>⭐⭐⭐</option>
        <option value={2}>⭐⭐</option>
        <option value={1}>⭐</option>
      </select>
    </div>

    <textarea
      className="form-control mb-3"
      rows="3"
      placeholder="Write your review..."
      value={review}
      onChange={(e) => setReview(e.target.value)}
    />

    <button
      className="btn btn-primary glow-btn"
      onClick={submitReview}
    >
      Submit Review
    </button>
  </div>
)}

      <div className="row g-4">
        <div className="col-md-4">
          <div className="list-group">
            {modules.map((m, i) => {
              const isVideo = m.type === 'video';
              const done = isVideo ? completedVideos.includes(m.id) : resultFor(m.id)?.is_correct;
              return (
                <button
                  key={m.id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${active === i ? 'active' : ''}`}
                  onClick={() => selectModule(i)}
                >
                  <span>{i + 1}. {m.title}</span>
                  {done ? <span>✅</span> : <span className={`badge ${m.type === 'quiz' ? 'badge-quiz' : 'bg-secondary'}`}>{m.type}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-md-8">
          <div className="card border-0 shadow-sm p-4">
            {current.type === 'video' ? (
              <>
                <h4>{current.title}</h4>
                <div className="ratio ratio-16x9 my-3">
                  <iframe src={current.youtube_url} title={current.title} allowFullScreen></iframe>
                </div>
                <button
                  className="btn btn-primary glow-btn"
                  disabled={completedVideos.includes(current.id)}
                  onClick={markComplete}
                >
                  {completedVideos.includes(current.id) ? 'Completed ✓' : 'Mark as Completed'}
                </button>
              </>
            ) : (
              <QuizBlock
                module={current}
                quizAnswer={quizAnswer}
                setQuizAnswer={setQuizAnswer}
                onSubmit={submitQuiz}
                feedback={quizFeedback}
                priorResult={resultFor(current.id)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizBlock({ module, quizAnswer, setQuizAnswer, onSubmit, feedback, priorResult }) {
  return (
    <>
      <h4>{module.title}</h4>
      <p className="fs-5 mt-3">{module.question}</p>
      <div className="mb-3">
        {module.options.map((opt, idx) => (
          <div className="form-check mb-2" key={idx}>
            <input
              className="form-check-input"
              type="radio"
              name="quiz-option"
              id={`opt-${idx}`}
              checked={quizAnswer === idx}
              onChange={() => setQuizAnswer(idx)}
            />
            <label className="form-check-label" htmlFor={`opt-${idx}`}>{opt}</label>
          </div>
        ))}
      </div>
      <button className="btn btn-primary glow-btn" onClick={onSubmit} disabled={quizAnswer === null}>
        Submit Answer
      </button>
      {feedback && (
        <div className={`alert mt-3 ${feedback === 'correct' ? 'alert-success' : 'alert-danger'}`}>
          {feedback === 'correct' ? '✅ Correct!' : '❌ Not quite — try again next time.'}
        </div>
      )}
      {!feedback && priorResult && (
        <div className={`alert mt-3 ${priorResult.is_correct ? 'alert-success' : 'alert-warning'}`}>
          Previously answered: {priorResult.is_correct ? 'Correct ✅' : 'Incorrect — you can resubmit.'}
        </div>
      )}
    </>
  );
}

async function downloadCertificate(courseId) {
  const token = localStorage.getItem('lt_token');
  const res = await fetch(`/api/enrollments/${courseId}/certificate`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `certificate-${courseId}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}
