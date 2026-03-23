const express = require('express');
const router = express.Router();
const { createPixPayment, webhookNotification } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/pix').post(protect, createPixPayment);
router.route('/webhook').post(webhookNotification);

module.exports = router;
