const router = require('express').Router();
const ctrl = require('../controllers/contactController');

router.post('/', ctrl.submitMessage);
router.get('/site-content', ctrl.getSiteContent);

module.exports = router;
