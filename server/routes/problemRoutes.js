const express = require('express');
const router = express.Router();
const { createProblem, getProblems, getProblemById } = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createProblem).get(protect, getProblems);
router.route('/:id').get(protect, getProblemById);

module.exports = router;
