const { readDB, writeDB, nextId } = require('../config/db');
const { generateCertificatePdf } = require('../utils/certificate');

function computeProgress(db, enrollment, course) {
  const modules = db.course_modules.filter(m => m.course_id === course.id);
  const videoModules = modules.filter(m => m.type === 'video');
  const quizModules = modules.filter(m => m.type === 'quiz');

  const completedVideoIds = enrollment.completed_videos || [];
  const videoPct = videoModules.length
    ? (completedVideoIds.length / videoModules.length) * 70
    : 0;

  const results = db.quiz_results.filter(r => r.enrollment_id === enrollment.id);
  const passedQuizIds = new Set(results.filter(r => r.is_correct).map(r => r.module_id));
  const quizPct = quizModules.length
    ? ([...passedQuizIds].filter(id => quizModules.find(q => q.id === id)).length / quizModules.length) * 30
    : 0;

  const total = Math.round(videoPct + quizPct);
  const allVideosDone = videoModules.length > 0 && completedVideoIds.length === videoModules.length;
  const allQuizzesDone = quizModules.length > 0 && quizModules.every(q => passedQuizIds.has(q.id));

  return { total, allVideosDone, allQuizzesDone, isComplete: allVideosDone && allQuizzesDone };
}

// ---- Purchase (dummy payment) ----
exports.purchaseCourse = (req, res) => {
  const db = readDB();
  const courseId = Number(req.params.id);
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const already = db.enrollments.find(e => e.user_id === req.user.id && e.course_id === courseId);
  if (already) return res.status(409).json({ message: 'Already enrolled in this course' });

  const payment = {
    id: nextId(db, 'payments'),
    user_id: req.user.id,
    course_id: courseId,
    amount: course.price,
    status: 'success', // dummy payment gateway always succeeds
    created_at: new Date().toISOString()
  };
  db.payments.push(payment);

  const enrollment = {
    id: nextId(db, 'enrollments'),
    user_id: req.user.id,
    course_id: courseId,
    completed_videos: [],
    enrolled_at: new Date().toISOString()
  };
  db.enrollments.push(enrollment);
  writeDB(db);
  res.status(201).json({ message: 'Purchase successful', enrollment, payment });
};

exports.myEnrollments = (req, res) => {
  const db = readDB();
  const list = db.enrollments
    .filter(e => e.user_id === req.user.id)
    .map(e => {
      const course = db.courses.find(c => c.id === e.course_id);
      const progress = computeProgress(db, e, course);
      const cert = db.certificates.find(c => c.enrollment_id === e.id);
      return { enrollment: e, course, progress, hasCertificate: !!cert };
    });
  res.json(list);
};

exports.courseProgress = (req, res) => {
  const db = readDB();
  const courseId = Number(req.params.id);
  const enrollment = db.enrollments.find(e => e.user_id === req.user.id && e.course_id === courseId);
  if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });
  const course = db.courses.find(c => c.id === courseId);
  const progress = computeProgress(db, enrollment, course);
  const results = db.quiz_results.filter(r => r.enrollment_id === enrollment.id);
  res.json({ enrollment, progress, quizResults: results });
};

exports.markVideoComplete = (req, res) => {
  const db = readDB();
  const courseId = Number(req.params.id);
  const moduleId = Number(req.params.moduleId);
  const enrollment = db.enrollments.find(e => e.user_id === req.user.id && e.course_id === courseId);
  if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });
  const module = db.course_modules.find(m => m.id === moduleId && m.course_id === courseId && m.type === 'video');
  if (!module) return res.status(404).json({ message: 'Video not found' });

  enrollment.completed_videos = enrollment.completed_videos || [];
  if (!enrollment.completed_videos.includes(moduleId)) {
    enrollment.completed_videos.push(moduleId);
  }
  writeDB(db);
  const course = db.courses.find(c => c.id === courseId);
  res.json({ message: 'Marked as completed', progress: computeProgress(db, enrollment, course) });
};

exports.submitQuiz = (req, res) => {
  const db = readDB();
  const courseId = Number(req.params.id);
  const moduleId = Number(req.params.moduleId);
  const { selectedOption } = req.body;
  const enrollment = db.enrollments.find(e => e.user_id === req.user.id && e.course_id === courseId);
  if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });
  const module = db.course_modules.find(m => m.id === moduleId && m.course_id === courseId && m.type === 'quiz');
  if (!module) return res.status(404).json({ message: 'Quiz not found' });

  const isCorrect = Number(selectedOption) === Number(module.correct_answer);

  db.quiz_results = db.quiz_results.filter(r => !(r.enrollment_id === enrollment.id && r.module_id === moduleId));
  db.quiz_results.push({
    id: nextId(db, 'quiz_results'),
    enrollment_id: enrollment.id,
    module_id: moduleId,
    selected_option: Number(selectedOption),
    is_correct: isCorrect,
    submitted_at: new Date().toISOString()
  });
  writeDB(db);
  const course = db.courses.find(c => c.id === courseId);
  res.json({ isCorrect, correctAnswer: module.correct_answer, progress: computeProgress(db, enrollment, course) });
};

exports.getCertificate = (req, res) => {
  const db = readDB();
  const courseId = Number(req.params.id);
  const enrollment = db.enrollments.find(e => e.user_id === req.user.id && e.course_id === courseId);
  if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });
  const course = db.courses.find(c => c.id === courseId);
  const progress = computeProgress(db, enrollment, course);
  if (!progress.isComplete) {
    return res.status(400).json({ message: 'Course not yet completed' });
  }
  const user = db.users.find(u => u.id === req.user.id);

  let cert = db.certificates.find(c => c.enrollment_id === enrollment.id);
  if (!cert) {
    cert = {
      id: nextId(db, 'certificates'),
      enrollment_id: enrollment.id,
      user_id: req.user.id,
      course_id: courseId,
      issued_at: new Date().toISOString()
    };
    db.certificates.push(cert);
    writeDB(db);
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="certificate-${courseId}.pdf"`);
  generateCertificatePdf(res, { studentName: user.full_name, courseTitle: course.title, date: cert.issued_at });
};
