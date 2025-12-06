import os
import google.generativeai as genai
import json
from typing import Optional

# Configure Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def compare_attempts(problem_description: str,
                     original_approach: str,
                     original_code: Optional[str],
                     new_approach: str,
                     new_code: Optional[str]) -> dict:
    """
    Calls Gemini and returns a dict:
    {
      "summary": str,
      "rating": str  # one of "REMEMBERED", "PARTIAL", "FORGOT"
    }
    """
    if not GEMINI_API_KEY:
        return {
            "summary": "Gemini API key not configured.",
            "rating": "FORGOT"
        }

    model = genai.GenerativeModel('gemini-pro')

    prompt = f"""
    You are an expert coding tutor. Compare the user's new attempt to solve a problem with their original attempt.
    
    Problem Description:
    {problem_description}

    Original Approach:
    {original_approach}

    Original Code:
    {original_code if original_code else "N/A"}

    New Approach:
    {new_approach}

    New Code:
    {new_code if new_code else "N/A"}

    Analyze how well the user remembered the solution. 
    Provide a JSON response with two fields:
    1. "summary": A concise summary of the comparison and feedback (max 3 sentences).
    2. "rating": One of "REMEMBERED" (solved correctly/similarly), "PARTIAL" (remembered core idea but missed details), or "FORGOT" (completely different or wrong).

    JSON Response:
    """

    try:
        response = model.generate_content(prompt)
        text = response.text
        # Clean up potential markdown code blocks
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        result = json.loads(text)
        
        # Validate rating
        if result.get("rating") not in ["REMEMBERED", "PARTIAL", "FORGOT"]:
            result["rating"] = "FORGOT"
            
        return result
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {
            "summary": "Error analyzing attempt.",
            "rating": "FORGOT"
        }
