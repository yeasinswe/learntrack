// Lightweight JSON file "database" for the prototype.
// Same table shape as database.sql (see project root) so swapping to MySQL later is a 1:1 mapping.
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_DATA = {
  users: [],
  courses: [],
  course_modules: [],
  enrollments: [],
  quiz_results: [],
  payments: [],
  certificates: [],
  contact_messages: [],
  site_content: {
    about: "LearnTrack is an online learning platform helping students build real, job-ready skills through short, focused video courses and hands-on quizzes.",
    contact: { email: "support@learntrack.dev", phone: "+1 (555) 010-1234", address: "123 Learning Ave, Remote City" }
  },
  _seq: { users: 0, courses: 0, course_modules: 0, enrollments: 0, quiz_results: 0, payments: 0, certificates: 0, contact_messages: 0 }
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify(DEFAULT_DATA, null, 2));
}

function readDB() {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
}

function writeDB(db) {
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

function nextId(db, table) {
  db._seq[table] = (db._seq[table] || 0) + 1;
  return db._seq[table];
}

module.exports = { readDB, writeDB, nextId, ensureFile };
