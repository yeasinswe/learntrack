const { readDB, writeDB } = require('../config/db');

exports.listUsers = (req, res) => {
  const db = readDB();
  const users = db.users.map(({ password, ...rest }) => rest);
  res.json(users);
};

exports.deleteUser = (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.users = db.users.filter(u => u.id !== id);
  db.enrollments = db.enrollments.filter(e => e.user_id !== id);
  writeDB(db);
  res.json({ message: 'User deleted' });
};

exports.listEnrollments = (req, res) => {
  const db = readDB();
  const data = db.enrollments.map(e => {
    const user = db.users.find(u => u.id === e.user_id);
    const course = db.courses.find(c => c.id === e.course_id);
    const results = db.quiz_results.filter(r => r.enrollment_id === e.id);
    const videoModules = db.course_modules.filter(m => m.course_id === e.course_id && m.type === 'video');
    const quizModules = db.course_modules.filter(m => m.course_id === e.course_id && m.type === 'quiz');
    const passedQuizIds = new Set(results.filter(r => r.is_correct).map(r => r.module_id));
    const videoPct = videoModules.length ? ((e.completed_videos || []).length / videoModules.length) * 70 : 0;
    const quizPct = quizModules.length ? ([...passedQuizIds].length / quizModules.length) * 30 : 0;
    return {
      enrollmentId: e.id,
      userId: user?.user_id,
      userName: user?.full_name,
      courseTitle: course?.title,
      progress: Math.round(videoPct + quizPct),
      quizScores: results
    };
  });
  res.json(data);
};

exports.getSiteContent = (req, res) => {
  const db = readDB();
  res.json(db.site_content);
};

exports.updateSiteContent = (req, res) => {
  const db = readDB();
  const { about, contact } = req.body;
  if (about !== undefined) db.site_content.about = about;
  if (contact !== undefined) db.site_content.contact = { ...db.site_content.contact, ...contact };
  writeDB(db);
  res.json(db.site_content);
};

exports.listContactMessages = (req, res) => {
  const db = readDB();
  res.json(db.contact_messages.slice().reverse());
};
