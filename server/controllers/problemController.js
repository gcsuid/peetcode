const Problem = require('../models/Problem');
const Attempt = require('../models/Attempt');
const ReviewSchedule = require('../models/ReviewSchedule');
const { getInitialSchedule } = require('../utils/scheduler'); // We need to implement this

// @desc    Create a new problem
// @route   POST /api/problems
// @access  Private
const createProblem = async (req, res) => {
    const { leetcodeRef, title, difficulty, tags, description, approachText, code, language } = req.body;

    try {
        const problem = await Problem.create({
            user: req.user._id,
            leetcodeRef,
            title,
            difficulty,
            tags,
            description,
        });

        // Create Original Attempt
        await Attempt.create({
            problem: problem._id,
            user: req.user._id,
            attemptType: 'ORIGINAL',
            approachText,
            code,
            language,
        });

        // Create Schedule
        const initialSchedule = getInitialSchedule();
        await ReviewSchedule.create({
            problem: problem._id,
            user: req.user._id,
            nextReviewDate: initialSchedule.nextReviewDate,
            currentIntervalDays: initialSchedule.currentIntervalDays,
            active: true,
        });

        res.status(201).json(problem);
    } catch (error) {
        res.status(400).json({ message: 'Invalid problem data', error: error.message });
    }
};

// @desc    Get all problems for user
// @route   GET /api/problems
// @access  Private
const getProblems = async (req, res) => {
    const problems = await Problem.find({ user: req.user._id });
    res.json(problems);
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Private
const getProblemById = async (req, res) => {
    const problem = await Problem.findById(req.params.id);

    if (problem && problem.user.toString() === req.user._id.toString()) {
        res.json(problem);
    } else {
        res.status(404).json({ message: 'Problem not found' });
    }
};

module.exports = {
    createProblem,
    getProblems,
    getProblemById,
};
