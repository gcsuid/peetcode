const mongoose = require('mongoose');

const attemptSchema = mongoose.Schema({
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
    attemptType: {
        type: String,
        enum: ['ORIGINAL', 'REVIEW'],
        required: true,
    },
    approachText: {
        type: String,
        required: true,
    },
    code: {
        type: String,
    },
    language: {
        type: String,
    },
    aiFeedbackSummary: {
        type: String,
    },
    aiMemoryRating: {
        type: String,
        enum: ['REMEMBERED', 'PARTIAL', 'FORGOT'],
    },
    attemptDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;
