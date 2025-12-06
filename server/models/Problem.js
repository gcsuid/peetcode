const mongoose = require('mongoose');

const problemSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    leetcodeRef: {
        type: String,
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
    },
    tags: {
        type: String, // Comma-separated
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    firstSolvedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
