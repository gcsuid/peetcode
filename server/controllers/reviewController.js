const Attempt = require('../models/Attempt');
const Problem = require('../models/Problem');
const ReviewSchedule = require('../models/ReviewSchedule');
const { calculateNextReview } = require('../utils/scheduler');
const { compareAttempts } = require('../utils/aiService');

// @desc    Submit a review attempt
// @route   POST /api/reviews/:problemId
// @access  Private
const submitReview = async (req, res) => {
    const { approachText, code, language } = req.body;
    const problemId = req.params.problemId;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        // Get Original Attempt
        const originalAttempt = await Attempt.findOne({
            problem: problemId,
            attemptType: 'ORIGINAL',
        });

        // Call AI Service
        const aiResult = await compareAttempts(
            problem.description,
            originalAttempt ? originalAttempt.approachText : 'N/A',
            originalAttempt ? originalAttempt.code : '',
            approachText,
            code
        );

        // Create Review Attempt
        const attempt = await Attempt.create({
            problem: problemId,
            user: req.user._id,
            attemptType: 'REVIEW',
            approachText,
            code,
            language,
            aiFeedbackSummary: aiResult.summary,
            aiMemoryRating: aiResult.rating,
        });

        // Update Schedule
        const schedule = await ReviewSchedule.findOne({ problem: problemId });
        if (schedule) {
            const scheduleUpdate = calculateNextReview(
                schedule.currentIntervalDays,
                aiResult.rating
            );

            schedule.currentIntervalDays = scheduleUpdate.currentIntervalDays;
            schedule.nextReviewDate = scheduleUpdate.nextReviewDate;
            schedule.lastReviewDate = new Date();
            await schedule.save();
        }

        res.status(201).json(attempt);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get due problems for review
// @route   GET /api/reviews/due
// @access  Private
const getDueProblems = async (req, res) => {
    const today = new Date();

    try {
        const schedules = await ReviewSchedule.find({
            user: req.user._id,
            active: true,
            nextReviewDate: { $lte: today },
        }).populate('problem');

        const problems = schedules.map(s => s.problem);
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    submitReview,
    getDueProblems,
};
