import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments').then(res => setRows(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const totalCourses = rows.length;
  const completed = rows.filter(r => r.progress.isComplete).length;
  const avgProgress = totalCourses ? Math.round(rows.reduce((s, r) => s + r.progress.total, 0) / totalCourses) : 0;
  const certificates = rows.filter(r => r.hasCertificate).length;
  const averageQuizScore = totalCourses
  ? Math.round(
      rows.reduce(
        (sum, row) =>
          sum +
          (
            row.progress.quizScores?.length
              ? (
                  row.progress.quizScores.filter(
                    score => score.is_correct
                  ).length /
                  row.progress.quizScores.length
                ) * 100
              : 0
          ),
        0
      ) / totalCourses
    )
  : 0;

const totalSpent = rows.reduce(
  (sum, row) => sum + Number(row.course.price || 0),
  0
);

const inProgress = totalCourses - completed;
const latestCourse =
  rows.length > 0 ? rows[rows.length - 1] : null;

const latestCompleted =
  rows.find((r) => r.progress.isComplete);

const latestCertificate =
  rows.find((r) => r.hasCertificate);

const latestQuiz =
  rows.find(
    (r) => r.progress.quizScores?.length
  );

  return (
    <div className="container py-5">
      <h1 className="mb-1">Welcome back, {user?.fullName?.split(' ')[0] || user?.userId}!</h1>
      <p className="text-muted mb-4">Here's how your learning is going.</p>

    <div className="row g-3 mb-5">
  <StatCard
    label="Purchased Courses"
    value={totalCourses}
  />

  <StatCard
    label="Completed Courses"
    value={completed}
  />

  <StatCard
    label="Courses In Progress"
    value={inProgress}
  />

  <StatCard
    label="Overall Progress"
    value={`${avgProgress}%`}
  />

  <StatCard
    label="Average Quiz Score"
    value={`${averageQuizScore}%`}
  />

  <StatCard
    label="Certificates Earned"
    value={certificates}
  />

  <StatCard
    label="Total Money Spent"
    value={`$${totalSpent}`}
  />
</div>
        <div className="card border-0 shadow-sm p-4 mb-5">

  <h4 className="mb-4">
    Learning Activity
  </h4>

  <div className="row g-3">

    <div className="col-md-3">

      <div className="border rounded p-3 h-100">

        <div className="text-muted small">
          Last Purchased Course
        </div>

        <div className="fw-bold">
          {latestCourse
            ? latestCourse.course.title
            : "No data"}
        </div>

      </div>

    </div>

    <div className="col-md-3">

      <div className="border rounded p-3 h-100">

        <div className="text-muted small">
          Last Completed Course
        </div>

        <div className="fw-bold">
          {latestCompleted
            ? latestCompleted.course.title
            : "Not completed"}
        </div>

      </div>

    </div>

    <div className="col-md-3">

      <div className="border rounded p-3 h-100">

        <div className="text-muted small">
          Certificate Status
        </div>

        <div className="fw-bold">
          {latestCertificate
            ? "Available"
            : "Not earned"}
        </div>

      </div>

    </div>

    <div className="col-md-3">

      <div className="border rounded p-3 h-100">

        <div className="text-muted small">
          Learning Status
        </div>

        <div className="fw-bold">
          {avgProgress}% Complete
        </div>

      </div>

    </div>

  </div>

</div>
      <h4 className="mb-3">My Courses</h4>
      {rows.length === 0 && (
        <div className="alert alert-light border">You haven't purchased any courses yet. <Link to="/courses">Browse courses</Link>.</div>
      )}
      <div className="row g-4">
        {rows.map(r => (
          <div className="col-md-6" key={r.enrollment.id}>
            <div className="card border-0 shadow-sm p-3 h-100">
              <h5>{r.course.title}</h5>
              <ProgressBar value={r.progress.total} />
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Link to={`/learn/${r.course.id}`} className="btn btn-sm btn-primary glow-btn">
                  {r.progress.isComplete ? 'Review Course' : 'Continue'}
                </Link>
                {r.progress.isComplete && (
                  <a href={`/api/enrollments/${r.course.id}/certificate`} target="_blank" rel="noreferrer"
                     className="btn btn-sm btn-outline-secondary"
                     onClick={(e) => { e.preventDefault(); downloadCertificate(r.course.id); }}>
                    🎓 Certificate
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card border-0 shadow-sm text-center p-3 h-100">
        <div className="fs-3 fw-bold text-primary-brand">{value}</div>
        <div className="text-muted small">{label}</div>
      </div>
    </div>
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
