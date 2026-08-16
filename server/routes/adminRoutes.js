const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/users', ctrl.listUsers);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/enrollments', ctrl.listEnrollments);
router.get('/site-content', ctrl.getSiteContent);
router.put('/site-content', ctrl.updateSiteContent);
router.get('/contact-messages', ctrl.listContactMessages);

module.exports = router;
