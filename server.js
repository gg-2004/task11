const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// System instructions for Revolt Motors
const SYSTEM_INSTRUCTIONS = `You are an AI assistant specialized in Revolt Motors. You can only talk about:
- Revolt Motors electric vehicles and motorcycles
- Revolt Motors company information, history, and achievements
- Revolt Motors product specifications, features, and benefits
- Revolt Motors dealerships, service centers, and customer support
- Electric vehicle technology as it relates to Revolt Motors
- Sustainability and environmental benefits of Revolt Motors vehicles

If asked about anything unrelated to Revolt Motors, politely redirect the conversation back to Revolt Motors topics. Always be helpful, informative, and enthusiastic about Revolt Motors products and services.`;

// Store conversation history for each session
const conversations = new Map();

// Initialize Gemini Live model
let model;
try {
  // Try to use the native audio dialog model first
  model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-preview-native-audio-dialog" 
  });
} catch (error) {
  console.log('Falling back to gemini-2.0-flash-live-001 for development');
  model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-live-001" 
  });
}

// Initialize conversation
app.post('/api/start-conversation', async (req, res) => {
  try {
    const sessionId = Date.now().toString();
    
    // Initialize the conversation with system instructions
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Hello, I'd like to learn about Revolt Motors." }]
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm excited to tell you all about Revolt Motors! We're India's first electric motorcycle manufacturer, revolutionizing the two-wheeler industry with cutting-edge electric technology. What would you like to know about our amazing electric motorcycles?" }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    conversations.set(sessionId, chat);
    
    res.json({ 
      sessionId, 
      message: "Conversation started successfully",
      systemInstructions: SYSTEM_INSTRUCTIONS
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Send message and get response
app.post('/api/send-message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    const chat = conversations.get(sessionId);
    if (!chat) {
      return res.status(404).json({ error: 'Conversation session not found' });
    }

    // Send message with system instructions context
    const fullMessage = `${SYSTEM_INSTRUCTIONS}\n\nUser message: ${message}`;
    
    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ 
      response: text,
      sessionId 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Audio input endpoint (for future audio integration)
app.post('/api/audio-input', async (req, res) => {
  try {
    const { sessionId, audioData } = req.body;
    
    if (!sessionId || !audioData) {
      return res.status(400).json({ error: 'Session ID and audio data are required' });
    }

    const chat = conversations.get(sessionId);
    if (!chat) {
      return res.status(404).json({ error: 'Conversation session not found' });
    }

    // For now, we'll use a placeholder response
    // In a full implementation, you would process the audio and send it to Gemini
    const response = "I received your audio input! Currently, this is a text-based interface, but audio integration is planned for the full Gemini Live API implementation.";

    res.json({ 
      response,
      sessionId 
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// Get conversation history
app.get('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const chat = conversations.get(sessionId);
  
  if (!chat) {
    return res.status(404).json({ error: 'Conversation session not found' });
  }

  // Return basic session info
  res.json({ 
    sessionId,
    active: true,
    systemInstructions: SYSTEM_INSTRUCTIONS
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    model: model ? 'Gemini Live API initialized' : 'Model not initialized'
  });
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Revolt Motors AI Chat Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
  console.log(`🤖 Using Gemini API with key: ${config.GEMINI_API_KEY.substring(0, 10)}...`);
  console.log(`📋 System Instructions: ${SYSTEM_INSTRUCTIONS.substring(0, 100)}...`);
});

