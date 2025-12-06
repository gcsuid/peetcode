const getInitialSchedule = () => {
    const today = new Date();
    const nextReviewDate = new Date(today);
    nextReviewDate.setDate(today.getDate() + 1); // Default 1 day interval

    return {
        nextReviewDate,
        currentIntervalDays: 1,
    };
};

const calculateNextReview = (currentInterval, rating) => {
    let nextInterval;

    if (rating === 'REMEMBERED') {
        nextInterval = currentInterval * 2;
    } else if (rating === 'PARTIAL') {
        nextInterval = Math.max(1, Math.floor(currentInterval * 1.5));
    } else {
        nextInterval = 1; // Reset to 1 day if forgot
    }

    const today = new Date();
    const nextReviewDate = new Date(today);
    nextReviewDate.setDate(today.getDate() + nextInterval);

    return {
        nextReviewDate,
        currentIntervalDays: nextInterval,
    };
};

module.exports = {
    getInitialSchedule,
    calculateNextReview,
};
