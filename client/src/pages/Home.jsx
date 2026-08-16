import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import Loader from '../components/Loader';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(res => setCourses(res.data.slice(0, 3))).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero text-center">
        <div className="container">
          <h1 className="display-5 fw-bold mb-3">Learn Skills That <span className="text-primary-brand">Move You Forward</span></h1>
          <p className="lead text-muted mb-4">Bite-sized video courses, hands-on quizzes, and certificates — all in one place.</p>
          <Link to="/courses" className="btn btn-primary btn-lg glow-btn px-4">Browse Courses</Link>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="mb-4 text-center">Featured Courses</h2>
        {loading ? <Loader /> : (
          <div className="row g-4">
            {courses.map(c => (
              <div className="col-md-4" key={c.id}><CourseCard course={c} /></div>
            ))}
            {courses.length === 0 && <p className="text-center text-muted">No courses yet — check back soon!</p>}
          </div>
        )}
      </section>

      <section className="bg-light py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-6">
              <h2>Why LearnTrack?</h2>
              <p className="text-muted">
                Every course is structured around 5 focused video lessons and 2 practical quizzes,
                so you always know exactly how far you've come — and what's left. Finish a course
                and download a certificate to show for it.
              </p>
            </div>
            <div className="col-md-6">
              <ul className="list-unstyled">
                <li className="mb-2">✅ Track your progress automatically</li>
                <li className="mb-2">✅ Learn from embedded video lessons</li>
                <li className="mb-2">✅ Test yourself with quizzes</li>
                <li className="mb-2">✅ Earn a downloadable certificate</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
