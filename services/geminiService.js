import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `You are a friendly and knowledgeable health coach assistant for the ShastoHive app. Your role is to:

1. Provide helpful, accurate health and wellness advice
2. Answer questions about nutrition, diet, exercise, sleep, and general wellness
3. Suggest healthy meal ideas based on user preferences
4. Offer workout tips and motivation
5. Help users understand their health data and metrics
6. Be encouraging and supportive in helping users reach their health goals

Important guidelines:
- Always be supportive and non-judgmental
- Provide general health information, not medical diagnoses
- Recommend consulting healthcare professionals for medical concerns
- Keep responses concise but informative
- Use simple, easy-to-understand language
- Be culturally sensitive and inclusive
- Write in plain text DO NOT use markdown syntax`;

class GeminiService {
  constructor() {
    this.ai = null;
    this.initialized = false;
  }

  initialize() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set. Chat functionality will be limited.');
      return false;
    }

    try {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      this.initialized = true;
      console.log('Gemini AI service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      return false;
    }
  }

  calculateBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(1);
  }

  async generateResponse(userMessage, conversationHistory = [], userContext = null) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.ai) {
      throw new Error('Gemini AI service not available. Please configure GEMINI_API_KEY.');
    }

    try {
      // Build conversation contents with system instruction
      const contents = [];

      // Customize system prompt with user context if available
      let finalSystemPrompt = SYSTEM_PROMPT;
      
      if (userContext) {
        const parts = ['\n\nUser Context:'];
        if (userContext.age) parts.push(`- Age: ${userContext.age}`);
        if (userContext.sex) parts.push(`- Sex: ${userContext.sex}`);
        if (userContext.heightCm) parts.push(`- Height: ${userContext.heightCm} cm`);
        if (userContext.weightKg) parts.push(`- Weight: ${userContext.weightKg} kg`);
        
        const bmi = this.calculateBMI(userContext.weightKg, userContext.heightCm);
        if (bmi) parts.push(`- BMI: ${bmi}`);
        
        if (userContext.activityLevel) parts.push(`- Activity Level: ${userContext.activityLevel}`);
        if (userContext.primaryGoal) parts.push(`- Primary Goal: ${userContext.primaryGoal.replace('_', ' ')}`);
        
        if (parts.length > 1) {
          finalSystemPrompt += parts.join('\n');
          finalSystemPrompt += '\n\nPlease tailor your advice considering these personal metrics and goals.';
        }
      }

      // Add conversation history (limit to recent messages to stay within context window)
      const recentHistory = conversationHistory.slice(-10); // Last 10 messages
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }

      // Add the current user message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: finalSystemPrompt,
          maxOutputTokens: 1024,
          temperature: 0.7,
          topP: 0.9,
          topK: 40
        }
      });

      return response.text || 'I apologize, but I couldn\'t generate a response. Please try again.';
    } catch (error) {
      console.error('Gemini API error:', error);
      
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error('Service is temporarily busy. Please try again in a moment.');
      }
      
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  // Generate a title for a new chat session based on the first message
  async generateSessionTitle(firstMessage) {
    if (!this.ai) {
      return 'Health Chat';
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [{ text: `Generate a very short title (3-5 words max) for a health chat that starts with this message: "${firstMessage}". Only respond with the title, nothing else.` }]
          }
        ],
        config: {
          maxOutputTokens: 100,
          temperature: 0.5
        }
      });

      let rawTitle;
      if (typeof response.text === 'function') {
        rawTitle = response.text();
      } else {
        rawTitle = response.text;
      }
      
      if (!rawTitle) {
         rawTitle = response.candidates?.[0]?.content?.parts?.[0]?.text;
      }

      const title = rawTitle?.trim().replace(/"/g, '') || 'Health Chat';
      return title;
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Health Chat';
    }
  }

  async generateSupportResponse(userMessage, conversationHistory = [], documentation) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.ai) {
      throw new Error('Gemini AI service not available. Please configure GEMINI_API_KEY.');
    }

    const supportSystemPrompt = `You are a friendly and helpful Live Support assistant for the ShasthoHive health and wellness app. Your role is to:

1. Help users with app-related questions and issues
2. Guide users on how to use app features
3. Troubleshoot common problems
4. Provide clear step-by-step instructions

IMPORTANT GUIDELINES:
- ONLY answer questions based on the provided documentation below
- If a question is outside the scope of the documentation, politely say you can only help with app-related questions and suggest contacting email support for other inquiries
- Be friendly, patient, and professional
- Keep responses concise and easy to follow
- Use simple language
- If you don't know the answer from the documentation, admit it and suggest emailing support@shasthohive.app
- Write in plain text, DO NOT use markdown syntax

APP DOCUMENTATION:
${documentation}`;

    try {
      const contents = [];

      // Add conversation history
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: supportSystemPrompt,
          maxOutputTokens: 1024,
          temperature: 0.5,
          topP: 0.9,
          topK: 40
        }
      });

      return response.text || 'I apologize, but I couldn\'t generate a response. Please try again or contact support@shasthohive.app.';
    } catch (error) {
      console.error('Gemini Support API error:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  // Curated list of verified working YouTube workout videos as fallback
  getVerifiedWorkoutVideos(goal, difficulty) {
    const videos = {
      beginner: {
        weight_loss: [
          { youtubeId: 'ml6cT4AZdqI', title: '30 Min Fat Burning Cardio Workout', channelName: 'POPSUGAR Fitness', duration: '30 min' },
          { youtubeId: 'gC_L9qAHVJ8', title: '30 Minute Fat Burning Home Workout - Beginner', channelName: 'Body Project', duration: '30 min' },
          { youtubeId: 'UBMk30rjy0o', title: '20 MIN FULL BODY WORKOUT - Beginner', channelName: 'MadFit', duration: '20 min' },
          { youtubeId: 'IT94xC35u6k', title: '25 Min Full Body Workout for Beginners', channelName: 'growwithjo', duration: '25 min' },
        ],
        general: [
          { youtubeId: 'ml6cT4AZdqI', title: '30 Min Fat Burning Cardio Workout', channelName: 'POPSUGAR Fitness', duration: '30 min' },
          { youtubeId: 'VHyGqsPOUHs', title: '15-Minute Beginner At-Home Cardio Workout', channelName: 'PS Fit', duration: '15 min' },
          { youtubeId: 'UBMk30rjy0o', title: '20 MIN FULL BODY WORKOUT - Beginner', channelName: 'MadFit', duration: '20 min' },
          { youtubeId: '50kH47ZztHs', title: 'Low Impact 30 Minute Cardio Workout - Beginner', channelName: 'Body Project', duration: '30 min' },
        ],
        muscle_gain: [
          { youtubeId: 'UItWltVZZmE', title: '30 Min FULL BODY Workout with Dumbbells', channelName: 'Sydney Cummings', duration: '30 min' },
          { youtubeId: 'oAPCPjnU1wA', title: '30 Min Strength Training for Beginners', channelName: 'Heather Robertson', duration: '30 min' },
          { youtubeId: 'cbKkB3POqaY', title: '25 MIN FULL BODY HIIT for Beginners', channelName: 'MadFit', duration: '25 min' },
          { youtubeId: 'UBMk30rjy0o', title: '20 MIN FULL BODY WORKOUT - Beginner', channelName: 'MadFit', duration: '20 min' },
        ]
      },
      intermediate: {
        weight_loss: [
          { youtubeId: 'kZDvg92tTMc', title: 'Intense 30 Min HIIT Workout', channelName: 'THENX', duration: '30 min' },
          { youtubeId: 'Mvo2snJGhtM', title: '20 MIN HOME HIIT WORKOUT - No Equipment', channelName: 'Natacha Oceane', duration: '20 min' },
          { youtubeId: 'ml6cT4AZdqI', title: '30 Min Fat Burning Cardio', channelName: 'POPSUGAR Fitness', duration: '30 min' },
          { youtubeId: 'H6mRkx1x77k', title: '40 Min Full Body HIIT', channelName: 'Sydney Cummings', duration: '40 min' },
        ],
        muscle_gain: [
          { youtubeId: 'UItWltVZZmE', title: '30 Min Full Body Dumbbell Workout', channelName: 'Sydney Cummings', duration: '30 min' },
          { youtubeId: 'H6mRkx1x77k', title: '40 Min Full Body Strength', channelName: 'Sydney Cummings', duration: '40 min' },
          { youtubeId: 'oAPCPjnU1wA', title: 'Full Body Strength Training', channelName: 'Heather Robertson', duration: '30 min' },
          { youtubeId: 'cbKkB3POqaY', title: '25 MIN FULL BODY HIIT', channelName: 'MadFit', duration: '25 min' },
        ],
        general: [
          { youtubeId: 'ml6cT4AZdqI', title: '30 Min Cardio Workout', channelName: 'POPSUGAR Fitness', duration: '30 min' },
          { youtubeId: 'Mvo2snJGhtM', title: '20 MIN HOME HIIT WORKOUT', channelName: 'Natacha Oceane', duration: '20 min' },
          { youtubeId: 'H6mRkx1x77k', title: '40 Min Full Body Workout', channelName: 'Sydney Cummings', duration: '40 min' },
          { youtubeId: 'kZDvg92tTMc', title: '30 Min HIIT Workout', channelName: 'THENX', duration: '30 min' },
        ]
      }
    };
    
    const level = difficulty === 'beginner' ? 'beginner' : 'intermediate';
    const goalKey = goal?.includes('weight') ? 'weight_loss' : 
                    goal?.includes('muscle') ? 'muscle_gain' : 'general';
    
    return videos[level][goalKey] || videos[level].general;
  }

  async generateWorkoutPlan(userContext) {
    if (!this.initialized) {
      this.initialize();
    }
    
    const goal = userContext?.primaryGoal?.replace('_', ' ') || 'general fitness';
    const difficulty = userContext?.activityLevel === 'sedentary' || userContext?.activityLevel === 'lightly_active' 
      ? 'beginner' : 'intermediate';

    try {
      // Get verified fallback videos
      const fallbackVideos = this.getVerifiedWorkoutVideos(goal, difficulty);
      
      // Use AI to create a personalized workout plan title and structure
      const prompt = `Create a personalized workout plan for a user.

User Profile:
- Goal: ${goal}
- Difficulty Level: ${difficulty}
${userContext?.age ? `- Age: ${userContext.age}` : ''}
${userContext?.sex ? `- Sex: ${userContext.sex}` : ''}
${userContext?.weightKg ? `- Weight: ${userContext.weightKg}kg` : ''}

Create a workout routine with a motivating title and select 3-4 videos from this list that best match the user's goals:

Available Videos:
${fallbackVideos.map((v, i) => `${i + 1}. "${v.title}" by ${v.channelName} (${v.duration})`).join('\n')}

Return JSON with this structure:
{
  "title": "<motivating workout routine title>",
  "focus": "<main focus like Full Body, Cardio, Strength, HIIT>",
  "difficulty": "${difficulty === 'beginner' ? 'Beginner' : 'Intermediate'}",
  "totalDuration": <sum of selected video durations in minutes>,
  "caloriesBurned": <estimated calories for the full routine>,
  "selectedVideoIndices": [<indices of selected videos, 0-based, pick 3-4>]
}`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });

      const text = response.text;
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const planData = JSON.parse(jsonStr);
      
      // Map selected indices to actual videos
      const selectedVideos = (planData.selectedVideoIndices || [0, 1, 2])
        .filter(i => i >= 0 && i < fallbackVideos.length)
        .map(i => fallbackVideos[i]);
      
      // Ensure we have at least 3 videos
      while (selectedVideos.length < 3 && fallbackVideos.length > selectedVideos.length) {
        const nextVideo = fallbackVideos.find(v => !selectedVideos.includes(v));
        if (nextVideo) selectedVideos.push(nextVideo);
        else break;
      }

      return {
        title: planData.title || `${difficulty === 'beginner' ? 'Beginner' : 'Power'} ${goal} Routine`,
        focus: planData.focus || 'Full Body',
        difficulty: difficulty === 'beginner' ? 'Beginner' : 'Intermediate',
        totalDuration: planData.totalDuration || selectedVideos.reduce((sum, v) => sum + parseInt(v.duration) || 30, 0),
        caloriesBurned: planData.caloriesBurned || selectedVideos.length * 150,
        videos: selectedVideos
      };
    } catch (error) {
      console.error('Error generating workout plan:', error);
      
      // Ultimate fallback - return verified videos with default structure
      const fallbackVideos = this.getVerifiedWorkoutVideos(goal, difficulty);
      return {
        title: `${difficulty === 'beginner' ? 'Beginner' : 'Intermediate'} Workout`,
        focus: 'Full Body',
        difficulty: difficulty === 'beginner' ? 'Beginner' : 'Intermediate',
        totalDuration: 90,
        caloriesBurned: 450,
        videos: fallbackVideos.slice(0, 3)
      };
    }
  }
}

export default new GeminiService();

