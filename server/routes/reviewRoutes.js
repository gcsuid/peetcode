const express = require('express');
const router = express.Router();
const { submitReview, getDueProblems } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/due', protect, getDueProblems);
router.post('/:problemId', protect, submitReview);

module.exports = router;
