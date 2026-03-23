const express = require('express');
const router = express.Router();
const { getAdminOverview } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/overview').get(protect, admin, getAdminOverview);

module.exports = router;
