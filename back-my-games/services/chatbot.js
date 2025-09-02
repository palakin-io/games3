const { Wit } = require('node-wit');
const config = require('../config');

// Initialize Wit.ai client
let witClient = null;

try {
  if (config.witAiToken && config.witAiToken !== 'YOUR_WIT_AI_ACCESS_TOKEN_HERE') {
    witClient = new Wit({ accessToken: config.witAiToken });
    console.log('✅ Wit.ai client initialized successfully');
  } else {
    console.log('⚠️ Wit.ai token not configured, using fallback responses');
  }
} catch (error) {
  console.log('⚠️ Failed to initialize Wit.ai client, using fallback responses');
}

// Fallback response system
const fallbackResponses = {
  greeting: [
    'Hello! I\'m your gaming assistant. How can I help you today?',
    'Hi there! Ready to talk about games?',
    'Welcome! What gaming questions do you have?'
  ],
  game_recommendation: [
    'I\'d be happy to recommend some games! What genre are you interested in? (RPG, Action, Strategy, etc.)',
    'Looking for game suggestions? Tell me what you like!',
    'I can help you discover new games! What type of games do you enjoy?'
  ],
  help: [
    'I can help you with game recommendations, searching for games, and answering questions about your gaming collection. What would you like to know?',
    'I\'m here to help with all things gaming! Just ask me anything.',
    'Need gaming advice? I\'m your bot! What can I help you with?'
  ],
  goodbye: [
    'Goodbye! Happy gaming!',
    'See you later! Enjoy your games!',
    'Take care! Have fun gaming!'
  ]
};

// Generate chatbot response
async function generateChatbotResponse(message) {
  try {
    // Try Wit.ai first if available
    if (witClient) {
      const result = await witClient.message(message, {});
      console.log('Wit.ai response:', result);
      
      const intent = result.intents[0]?.name || 'unknown';
      const entities = result.entities;
      
      return generateResponseFromIntent(intent, entities, message);
    }
  } catch (error) {
    console.error('Wit.ai error:', error);
  }
  
  // Fallback to keyword-based responses
  return generateFallbackResponse(message);
}

// Generate response based on Wit.ai intent
function generateResponseFromIntent(intent, entities, originalMessage) {
  const message = originalMessage.toLowerCase();
  
  switch (intent) {
    case 'greeting':
      return getRandomResponse('greeting');
    
    case 'game_recommendation':
      return getRandomResponse('game_recommendation');
    
    case 'game_search':
      return 'I can help you search for games. What are you looking for?';
    
    case 'help':
      return getRandomResponse('help');
    
    case 'goodbye':
      return getRandomResponse('goodbye');
    
    default:
      return generateFallbackResponse(originalMessage);
  }
}

// Generate fallback response based on keywords
function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return getRandomResponse('greeting');
  }
  
  // Check for game recommendations
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion') || lowerMessage.includes('game')) {
    return getRandomResponse('game_recommendation');
  }
  
  // Check for help
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return getRandomResponse('help');
  }
  
  // Check for goodbye
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
    return getRandomResponse('goodbye');
  }
  
  // Check for specific game types
  if (lowerMessage.includes('rpg') || lowerMessage.includes('role playing')) {
    return 'RPGs are great! Some popular ones include The Witcher 3, Persona 5, and Final Fantasy VII Remake.';
  } else if (lowerMessage.includes('action') || lowerMessage.includes('adventure')) {
    return 'Action-adventure games offer exciting gameplay! Check out God of War, The Last of Us, or Spider-Man.';
  } else if (lowerMessage.includes('strategy')) {
    return 'Strategy games require careful planning! Consider games like Civilization, XCOM, or Total War series.';
  } else if (lowerMessage.includes('indie')) {
    return 'Indie games often have unique and creative experiences! Some gems include Hollow Knight, Celeste, and Stardew Valley.';
  }
  
  // Default response
  return 'I\'m not sure I understood that. Could you rephrase or ask me about games, recommendations, or gaming in general?';
}

// Get random response from a category
function getRandomResponse(type) {
  const responses = fallbackResponses[type];
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = { generateChatbotResponse };
