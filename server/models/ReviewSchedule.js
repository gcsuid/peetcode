const mongoose = require('mongoose');

const reviewScheduleSchema = mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Problem',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    nextReviewDate: {
        type: Date,
        required: true,
    },
    lastReviewDate: {
        type: Date,
    },
    currentIntervalDays: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
});

const ReviewSchedule = mongoose.model('ReviewSchedule', reviewScheduleSchema);

module.exports = ReviewSchedule;
