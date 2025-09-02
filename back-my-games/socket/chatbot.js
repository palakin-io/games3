const { generateChatbotResponse } = require('../services/chatbot');

function setupChatbotSocket(io) {
  io.on('connection', (socket) => {
    console.log('A user connected to chatbot');

    // Handle chat messages
    socket.on('chat_message', async (data) => {
      try {
        console.log('Received message:', data.message);
        
        // Generate response using the chatbot service
        const response = await generateChatbotResponse(data.message);
        
        // Send response back to client
        socket.emit('chat_response', {
          message: response,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error processing message:', error);
        socket.emit('chat_response', {
          message: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from chatbot');
    });
  });
}

module.exports = { setupChatbotSocket };
