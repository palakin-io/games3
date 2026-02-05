const Groq = require('groq-sdk');
const config = require('../config');
const Game = require('../models/game_schema');
const User = require('../models/user_schema');
const Movie = require('../models/movie_schema');

// Initialize Groq client
// Ensure GROQ_API_KEY is set in your .env variables
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Helper: Get global stats
async function getGlobalStats() {
  try {
    const [totalGames, totalUsers, totalMovies] = await Promise.all([
      Game.countDocuments(),
      User.countDocuments(),
      Movie.countDocuments()
    ]);
    return { totalGames, totalUsers, totalMovies };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return null;
  }
}

// Helper: Find relevant games based on keywords in the query
async function findRelevantGames(query) {
  try {
    // Extract potential keywords (very basic extraction)
    // In a production app, you might use a vector DB or finer text search
    // Here we just look for matches in title, genre, or description
    
    // Clean query
    const cleanQuery = query.replace(/[^\w\s]/gi, '').split(' ').filter(word => word.length > 3);
    
    if (cleanQuery.length === 0) return [];

    // Construct regex for OR search
    const regexQueries = cleanQuery.map(word => ({ 
      $or: [
        { title: { $regex: word, $options: 'i' } },
        { genre: { $regex: word, $options: 'i' } },
        { 'characteristics.main': { $regex: word, $options: 'i' } } // Assuming charateristics might be relevant
      ]
    }));

    // Find up to 5 matching games
    const games = await Game.find({ $or: regexQueries })
      .select('title genre description ratings dateStart')
      .limit(5)
      .lean();

    return games;
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
}

// Helper: Get top rated games (fallback context)
async function getTopGames() {
    try {
        return await Game.find({ 'ratings.main': { $ne: null } })
            .sort({ 'ratings.main': -1 })
            .limit(3)
            .select('title ratings.main genre')
            .lean();
    } catch (e) {
        return [];
    }
}

async function generateChatbotResponse(userMessage) {
  try {
    if (!process.env.GROQ_API_KEY) {
        return "I'm sorry, I cannot think right now because my brain (API Key) is missing.";
    }

    // 1. Retrieval (RAG)
    const stats = await getGlobalStats();
    let contextData = {};
    
    // Search for relevant games
    const relevantGames = await findRelevantGames(userMessage);
    
    // If no specific games found, maybe bring top games as general context
    let topGames = [];
    if (relevantGames.length === 0) {
        topGames = await getTopGames();
    }

    // Construct Context String
    let contextString = `Current Database Stats: ${JSON.stringify(stats)}\n`;
    
    if (relevantGames.length > 0) {
        contextString += `\nRelevant Games found in database:\n${JSON.stringify(relevantGames, null, 2)}\n`;
    } else if (topGames.length > 0) {
        contextString += `\nNo specific matching games found for the query, but here are the Top Rated Games:\n${JSON.stringify(topGames, null, 2)}\n`;
    }

    // 2. System Prompt
    const systemPrompt = `You are an intelligent gaming assistant for a personal game collection website.
    Your goal is to answer user questions about the games in the database based ONLY on the provided context.
    
    - If the user asks about a specific game and it is in the "Relevant Games" list, use that data to answer deeply (ratings, description, etc.).
    - If the user asks for recommendations, use the "Relevant Games" or "Top Rated Games" to suggest something.
    - If the game is NOT in the context, politely say you don't have information about that game in this collection.
    - Be enthusiastic and helpful.
    - Keep responses concise (under 3-4 sentences) unless asked for details.
    
    CONTEXT DATA:
    ${contextString}
    `;

    // 3. Call Groq Llama 3
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      model: 'llama-3.1-8b-instant', // Fast and effective for this
      temperature: 0.7,
      max_tokens: 300,
    });

    return chatCompletion.choices[0]?.message?.content || "I'm not sure what you mean.";

  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm having trouble connecting to my AI brain. Please try again later.";
  }
}

module.exports = { generateChatbotResponse };
