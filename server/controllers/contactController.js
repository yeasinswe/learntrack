const { readDB, writeDB, nextId } = require('../config/db');

exports.submitMessage = (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'name, email and message are required' });
  }
  const db = readDB();
  db.contact_messages.push({
    id: nextId(db, 'contact_messages'),
    name,
    email,
    message,
    created_at: new Date().toISOString()
  });
  writeDB(db);
  res.status(201).json({ message: 'Thanks! Your message has been sent.' });
};

exports.getSiteContent = (req, res) => {
  const db = readDB();
  res.json(db.site_content);
};
