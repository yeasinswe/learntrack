require('dotenv').config();
const { readDB, writeDB, nextId } = require('./config/db');

const db = readDB();

if (db.courses.length > 0) {
  console.log('Database already has courses. Skipping seed. Delete server/data/db.json to reseed.');
  process.exit(0);
}

function addCourse({ title, category, description, price, banner_url, videos, quizzes }) {
  const course = {
    id: nextId(db, 'courses'),
    title,
    category,
    description,
    price,
    banner_url: banner_url || '',
    created_at: new Date().toISOString()
  };
  db.courses.push(course);

  videos.forEach((v, i) => {
    db.course_modules.push({
      id: nextId(db, 'course_modules'),
      course_id: course.id,
      type: 'video',
      title: v.title,
      youtube_url: v.youtube_url,
      question: null,
      options: null,
      correct_answer: null,
      order_index: i
    });
  });

  quizzes.forEach((q, i) => {
    db.course_modules.push({
      id: nextId(db, 'course_modules'),
      course_id: course.id,
      type: 'quiz',
      title: q.title,
      youtube_url: null,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      order_index: 5 + i
    });
  });
}

addCourse({
  title: 'JavaScript Fundamentals',
  category: 'Programming',
  description: 'Learn the core building blocks of JavaScript: variables, functions, arrays, objects, and control flow — with hands-on examples.',
  price: 29.99,
  videos: [
    { title: 'Variables & Data Types', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'Functions & Scope', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'Arrays & Objects', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'Control Flow & Loops', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'DOM Basics', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' }
  ],
  quizzes: [
    { title: 'Quiz 1: Basics', question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'function', 'global'], correct_answer: 1 },
    { title: 'Quiz 2: Functions', question: 'What does a function without a return statement return?', options: ['null', '0', 'undefined', 'NaN'], correct_answer: 2 }
  ]
});

addCourse({
  title: 'React for Beginners',
  category: 'Programming',
  description: 'Build interactive user interfaces with React: components, props, state, and hooks explained from scratch.',
  price: 39.99,
  videos: [
    { title: 'Introduction to Components', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'Props & State', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'Handling Events', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'useEffect & Side Effects', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'Building a Small App', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' }
  ],
  quizzes: [
    { title: 'Quiz 1: Components', question: 'What do you call reusable pieces of UI in React?', options: ['Modules', 'Components', 'Templates', 'Widgets'], correct_answer: 1 },
    { title: 'Quiz 2: State', question: 'Which hook lets you add state to a function component?', options: ['useRef', 'useMemo', 'useState', 'useContext'], correct_answer: 2 }
  ]
});

addCourse({
  title: 'Digital Marketing Essentials',
  category: 'Marketing',
  description: 'A practical introduction to SEO, social media marketing, email campaigns, and analytics for beginners.',
  price: 24.99,
  videos: [
    { title: 'Intro to Digital Marketing', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'SEO Basics', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'Social Media Strategy', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'Email Marketing', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
    { title: 'Analytics & KPIs', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk' }
  ],
  quizzes: [
    { title: 'Quiz 1: SEO', question: 'What does SEO stand for?', options: ['Search Engine Optimization', 'Site Element Ordering', 'Social Engagement Outreach', 'Search Efficiency Output'], correct_answer: 0 },
    { title: 'Quiz 2: Analytics', question: 'Which metric measures the percentage of visitors who leave after one page?', options: ['CTR', 'Bounce rate', 'Conversion rate', 'Impressions'], correct_answer: 1 }
  ]
});

writeDB(db);
console.log(`Seeded ${db.courses.length} courses with modules.`);
