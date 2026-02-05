<template>
  <div class="chatbot-container">
    <!-- Floating Chat Button -->
    <button @click="toggleChat" class="chat-button" :class="{ 'chat-button--active': isChatOpen }">
      <svg v-if="!isChatOpen" class="chat-icon" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
      <svg v-else class="chat-icon" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </button>

    <!-- Chat Window -->
    <div v-if="isChatOpen" class="chat-window">
      <div class="chat-header">
        <h3>Gaming Assistant</h3>
        <button @click="toggleChat" class="close-button">×</button>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" class="message" :class="message.type">
          <div class="message-content">{{ message.text }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <div class="chat-input-container">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..." class="chat-input"
          :disabled="!isConnected" />
        <button @click="sendMessage" class="send-button" :disabled="!isConnected || !newMessage.trim()">
          <svg class="send-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      <div v-if="!isConnected" class="connection-status">
        Connecting...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { io } from 'socket.io-client'
import API_CONFIG from '../config/api'

const isChatOpen = ref(false)
const messages = ref([])
const newMessage = ref('')
const isConnected = ref(false)
const isTyping = ref(false)
const socket = ref(null)
const messagesContainer = ref(null)

const initSocket = () => {
  if (socket.value) return

  socket.value = io(API_CONFIG.SOCKET_URL)

  socket.value.on('connect', () => {
    isConnected.value = true
    // Only add greeting if it's the first time connecting or no messages
    if (messages.value.length === 0) {
      messages.value.push({
        text: 'Hello! I\'m your gaming assistant. How can I help you today?',
        type: 'bot',
        timestamp: new Date()
      })
    }
  })

  socket.value.on('disconnect', () => {
    isConnected.value = false
  })

  socket.value.on('chat_response', (data) => {
    isTyping.value = false
    messages.value.push({
      text: data.message,
      type: 'bot',
      timestamp: new Date(data.timestamp)
    })

    nextTick(() => {
      scrollToBottom()
    })
  })
}

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    if (!socket.value) {
      initSocket()
    }
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !isConnected.value) return

  const messageData = {
    text: newMessage.value,
    type: 'user',
    timestamp: new Date()
  }

  messages.value.push(messageData)
  socket.value.emit('chat_message', { message: newMessage.value })
  newMessage.value = ''
  isTyping.value = true

  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}

.chat-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.chat-button--active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.chat-icon {
  width: 24px;
  height: 24px;
}

.chat-window {
  position: absolute;
  bottom: 80px;
  left: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 6px;
}

.message.bot {
  align-self: flex-start;
  background: #f1f3f4;
  color: #333;
  border-bottom-left-radius: 6px;
}

.message-content {
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.chat-input-container {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #667eea;
}

.chat-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  width: 18px;
  height: 18px;
}

.connection-status {
  padding: 10px 20px;
  background-color: #fff3cd;
  color: #856404;
  text-align: center;
  font-size: 12px;
  border-top: 1px solid #ffeaa7;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive design */
@media (max-width: 480px) {
  .chat-window {
    width: 300px;
    height: 400px;
    left: -20px;
  }

  .chat-button {
    width: 50px;
    height: 50px;
  }

  .chat-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
