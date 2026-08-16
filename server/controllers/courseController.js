const { readDB, writeDB, nextId } = require('../config/db');

function courseWithModules(db, course) {
  const modules = db.course_modules
    .filter(m => m.course_id === course.id)
    .sort((a, b) => a.order_index - b.order_index);
  return { ...course, modules };
}

// Strip correct_answer from quiz modules for non-admin consumption during learning
// (kept simple: correct answer is checked server-side on submit)
function safeModules(modules) {
  return modules.map(m => {
    if (m.type === 'quiz') {
      const { correct_answer, ...rest } = m;
      return rest;
    }
    return m;
  });
}

exports.listCourses = (req, res) => {
  const db = readDB();
  const { search, category } = req.query;
  let courses = db.courses;
  if (search) {
    const q = search.toLowerCase();
    courses = courses.filter(c => c.title.toLowerCase().includes(q));
  }
  if (category) {
    courses = courses.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }
  res.json(courses);
};

exports.getCourse = (req, res) => {
  const db = readDB();
  const course = db.courses.find(c => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const full = courseWithModules(db, course);
  res.json({ ...full, modules: safeModules(full.modules) });
};

// ---- Admin ----

exports.createCourse = (req, res) => {
  const db = readDB();
  const { title, category, description, price } = req.body;
  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ message: 'title, category, description, price are required' });
  }
  const course = {
    id: nextId(db, 'courses'),
    title,
    category,
    description,
    price: Number(price),
    banner_url: req.file ? `/uploads/${req.file.filename}` : (req.body.banner_url || ''),
    created_at: new Date().toISOString()
  };
  db.courses.push(course);
  writeDB(db);
  res.status(201).json(course);
};

exports.updateCourse = (req, res) => {
  const db = readDB();
  const course = db.courses.find(c => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const { title, category, description, price } = req.body;
  if (title) course.title = title;
  if (category) course.category = category;
  if (description) course.description = description;
  if (price !== undefined) course.price = Number(price);
  if (req.file) course.banner_url = `/uploads/${req.file.filename}`;
  writeDB(db);
  res.json(course);
};

exports.deleteCourse = (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.courses = db.courses.filter(c => c.id !== id);
  db.course_modules = db.course_modules.filter(m => m.course_id !== id);
  writeDB(db);
  res.json({ message: 'Course deleted' });
};

// A course must end up with exactly 5 videos + 2 quizzes per the spec.
// Admin sends the full modules array; we replace all modules for the course.
exports.setModules = (req, res) => {
  const db = readDB();
  const courseId = Number(req.params.id);
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const { modules } = req.body; // [{ type: 'video'|'quiz', title, youtube_url?, question?, options?, correct_answer?, order_index }]
  const videos = modules.filter(m => m.type === 'video');
  const quizzes = modules.filter(m => m.type === 'quiz');
  if (videos.length !== 5 || quizzes.length !== 2) {
    return res.status(400).json({ message: 'A course requires exactly 5 videos and 2 quizzes' });
  }

  db.course_modules = db.course_modules.filter(m => m.course_id !== courseId);
  modules.forEach((m, idx) => {
    db.course_modules.push({
      id: nextId(db, 'course_modules'),
      course_id: courseId,
      type: m.type,
      title: m.title,
      youtube_url: m.youtube_url || null,
      question: m.question || null,
      options: m.options || null, // array of 4 strings
      correct_answer: m.correct_answer ?? null, // index 0-3
      order_index: m.order_index ?? idx
    });
  });
  writeDB(db);
  res.json(courseWithModules(db, course));
};

exports.getCourseAdmin = (req, res) => {
  const db = readDB();
  const course = db.courses.find(c => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(courseWithModules(db, course)); // includes correct_answer, for editing
};
