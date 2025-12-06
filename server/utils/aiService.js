const { GoogleGenerativeAI } = require('@google/generative-ai');

const compareAttempts = async (problemDescription, originalApproach, originalCode, newApproach, newCode) => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not found, returning mock response');
        return {
            summary: 'AI Feedback unavailable (API Key missing).',
            rating: 'REMEMBERED',
        };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    You are an expert coding tutor. Compare the user's current review attempt with their original solution and the problem description.
    
    Problem: ${problemDescription}
    
    Original Approach: ${originalApproach}
    Original Code: ${originalCode}
    
    Current Approach: ${newApproach}
    Current Code: ${newCode}
    
    Provide a JSON response with two fields:
    1. "summary": A brief feedback summary (max 3 sentences) on how well they remembered the solution and any improvements/regressions.
    2. "rating": One of ["REMEMBERED", "PARTIAL", "FORGOT"].
       - REMEMBERED: Logic is correct and matches optimal/original approach.
       - PARTIAL: Some details missing or suboptimal but core idea is there.
       - FORGOT: Completely wrong or stuck.
       
    Output ONLY valid JSON.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('AI Service Error:', error);
        return {
            summary: 'Error generating AI feedback.',
            rating: 'PARTIAL', // Default to partial on error to be safe
        };
    }
};

module.exports = { compareAttempts };
