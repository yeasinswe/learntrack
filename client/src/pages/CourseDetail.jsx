import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const load = async () => {
    setLoading(true);
    const { data } = await api.get(`/courses/${id}`);
    setCourse(data);
    const storedReviews =
  JSON.parse(localStorage.getItem('course_reviews')) || [];

setReviews(
  storedReviews.filter(
    (review) => review.course === data.title
  )
);
    if (user) {
      try {
        await api.get(`/enrollments/${id}/progress`);
        setEnrolled(true);
      } catch {
        setEnrolled(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user]);

  const goToPayment = () => {
    setError('');
    if (!user) return navigate('/login');
    navigate(`/payment/${id}`);
  };

  if (loading) return <Loader />;
  if (!course) return <div className="container py-5">Course not found.</div>;

  const videoCount = course.modules.filter(m => m.type === 'video').length;
  const quizCount = course.modules.filter(m => m.type === 'quiz').length;

  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-md-8">
          <span className="badge bg-light text-primary-brand border mb-2">{course.category}</span>
          <h1>{course.title}</h1>
          <p className="text-muted fs-5">{course.description}</p>
          <div className="d-flex gap-4 text-muted mb-4">
            <span>🎬 {videoCount} video lessons</span>
            <span>📝 {quizCount} quizzes</span>
          </div>
          <h5>Course Content</h5>
          <ul className="list-group">
            {course.modules.map((m, i) => (
              <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{i + 1}. {m.title}</span>
                <span className={`badge ${m.type === 'quiz' ? 'badge-quiz' : 'bg-secondary'}`}>{m.type}</span>
              </li>
            ))}
          </ul>
           
           <div className="mt-5">
  <h4 className="mb-3">
    Student Reviews ({reviews.length})
  </h4>

  {reviews.length === 0 ? (
    <div className="alert alert-light border">
      No reviews yet.
    </div>
  ) : (
    reviews.map((review) => (
      <div
        key={review.id}
        className="card border-0 shadow-sm p-3 mb-3"
      >
        <div className="mb-2">
          {'⭐'.repeat(review.rating)}
        </div>

        <p className="mb-2">
          {review.comment}
        </p>

        <small className="text-muted">
          — {review.user}
        </small>
      </div>
    ))
  )}
</div>


        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 p-4 sticky-top" style={{ top: 90 }}>
            <div className="banner rounded mb-3" style={{ height: 140 }}>
              {course.banner_url
                ? <img src={course.banner_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span className="text-white fw-semibold">{course.category}</span>}
            </div>
            <h3 className="text-primary-brand mb-3">${Number(course.price).toFixed(2)}</h3>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {enrolled ? (
              <button className="btn btn-primary glow-btn btn-lg" onClick={() => navigate(`/learn/${id}`)}>Continue Learning</button>
            ) : (
              <button className="btn btn-primary glow-btn btn-lg" onClick={goToPayment}>
                Buy Course
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
