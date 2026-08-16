const router = require('express').Router();
const ctrl = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.myEnrollments);
router.post('/:id/purchase', ctrl.purchaseCourse);
router.get('/:id/progress', ctrl.courseProgress);
router.post('/:id/video/:moduleId/complete', ctrl.markVideoComplete);
router.post('/:id/quiz/:moduleId/submit', ctrl.submitQuiz);
router.get('/:id/certificate', ctrl.getCertificate);

module.exports = router;
