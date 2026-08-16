const router = require('express').Router();
const ctrl = require('../controllers/courseController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', ctrl.listCourses);
router.get('/:id', ctrl.getCourse);

// Admin
router.post('/', protect, adminOnly, upload.single('banner'), ctrl.createCourse);
router.put('/:id', protect, adminOnly, upload.single('banner'), ctrl.updateCourse);
router.delete('/:id', protect, adminOnly, ctrl.deleteCourse);
router.get('/:id/admin', protect, adminOnly, ctrl.getCourseAdmin);
router.put('/:id/modules', protect, adminOnly, ctrl.setModules);

module.exports = router;
