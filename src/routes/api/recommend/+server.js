// src/routes/api/recommend/+server.js
// API endpoint for generating essay recommendations using OpenAI

import { json } from '@sveltejs/kit';
import OpenAI from 'openai';
import { env } from '$env/dynamic/private';
const OPENAI_API_KEY = env.OPENAI_API_KEY;

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * POST handler for essay recommendations
 * 
 * @param {Object} request - The request object
 * @returns {Response} JSON response with recommendations
 */
export async function POST({ request }) {
  try {
    const data = await request.json();
    const { topic, grades, guidance, exclude = [] } = data;
    
    if (!topic || !grades || !grades.length) {
      return json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Extract grade level number
    const gradeNum = parseInt(grades[0].replace('grade', ''));
    
    // Get the education level based on grade number
    const educationLevel = gradeNum <= 6 ? 'elementary' : 
                           gradeNum <= 9 ? 'middle school' : 'high school';
    
    // Generate prompt based on input data - without reading materials, always 4 prompts
    const prompt = `
      Create 4 thoughtful argumentative essay prompts for ${gradeNum}th grade students on the topic of "${topic}".
      ${guidance ? `IMPORTANT: Use this additional guidance to focus the prompts: "${guidance}"` : ''}
      ${exclude.length > 0 ? `DO NOT suggest any of these previously used prompts (avoid similar concepts too): ${exclude.join(', ')}` : ''}
      
      Each prompt should:
      1. Have a specific, thought-provoking title that clearly presents an argumentative angle
      2. Include a detailed description (3-4 sentences) that:
         - Clearly states what position students should take or what question they should answer
         - Provides context about why this is a debatable issue
         - Suggests specific aspects to address or arguments to consider
         - Is appropriately challenging for ${gradeNum}th grade ${educationLevel} students
      
      Make each prompt genuinely argumentative (requiring students to take a position and defend it), 
      not merely informative or explanatory.
      
      Format the response as a JSON object with this structure:
      {
        "subtopics": [
          {
            "title": "Clear argumentative title that presents a position or question",
            "description": "Detailed description that gives context and guidance for writing an argumentative essay"
          }
        ]
      }
      
      VERY IMPORTANT: Return ONLY the JSON with NO markdown formatting, NO code blocks, and NO explanatory text.
    `;

    // Call OpenAI API with GPT-3.5-turbo for compatibility
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that always responds in valid JSON format only. Never use markdown formatting like ```json or ``` code blocks around your JSON. Your entire response should be valid JSON only, with no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    // Extract the response
    const responseText = completion.choices[0].message.content;
    
    // Clean up the response to handle possible markdown formatting
    let cleanedResponse = responseText;
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*$/g, '');
    cleanedResponse = cleanedResponse.replace(/```/g, '');
    
    // Remove any leading/trailing whitespace
    cleanedResponse = cleanedResponse.trim();
    
    console.log("OpenAI response:", responseText);
    console.log("Cleaned response:", cleanedResponse);
    
    // Parse the JSON response
    try {
      const subtopics = JSON.parse(cleanedResponse);
      return json(subtopics);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', responseText);
      
      // Fallback response
      return json({ 
        subtopics: [
          {
            title: "Error Parsing Generated Prompts",
            description: "There was an issue with the response format. Please try again with a different topic or refresh the page."
          }
        ] 
      }, { status: 200 });
    }
    
  } catch (error) {
    console.error('Error processing recommendation request:', error);
    return json({ error: 'Failed to process request' }, { status: 500 });
  }
}