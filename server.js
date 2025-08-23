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
// Store active response streams for interruption
const activeResponses = new Map();

// Initialize Gemini Live model with better error handling
let model = null;
let useFallbackMode = false;

try {
  // Try to use the native audio dialog model first
  model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-preview-native-audio-dialog" 
  });
  console.log('✅ Using Gemini 2.5 Flash Preview Native Audio Dialog model');
} catch (error) {
  console.log('⚠️ Falling back to gemini-2.0-flash-live-001 for development');
  try {
    model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-live-001" 
    });
    console.log('✅ Using Gemini 2.0 Flash Live model');
  } catch (fallbackError) {
    console.log('❌ Both Gemini models failed, using fallback mode');
    useFallbackMode = true;
  }
}

// Fallback responses for common Revolt Motors questions
const FALLBACK_RESPONSES = {
  'electric motorcycles': "Revolt Motors is India's first electric motorcycle manufacturer! Our flagship models include the RV400 and RV300, featuring cutting-edge electric technology with ranges up to 150km and top speeds of 85km/h. These bikes are designed for urban commuting with zero emissions and low maintenance costs.",
  'specifications': "The Revolt RV400 features a 3.24 kWh battery, 150km range, 85km/h top speed, and 0-40km/h in 3.9 seconds. The RV300 offers a 2.7 kWh battery with 150km range and 65km/h top speed. Both models come with smart features like geo-fencing and mobile app connectivity.",
  'dealerships': "Revolt Motors has dealerships across major Indian cities including Delhi, Mumbai, Bangalore, Chennai, and Hyderabad. You can find our complete dealer network on our official website or contact our customer support for the nearest location.",
  'technology': "Revolt Motors uses advanced lithium-ion battery technology with intelligent battery management systems. Our bikes feature regenerative braking, smart connectivity, and are built with lightweight materials for optimal performance and efficiency.",
  'sustainability': "Revolt Motors is committed to sustainable mobility. Our electric motorcycles produce zero emissions, helping reduce air pollution in cities. We also use eco-friendly materials and promote renewable energy charging solutions.",
  'default': "Revolt Motors is revolutionizing the two-wheeler industry in India with our innovative electric motorcycles. We're committed to sustainable mobility and cutting-edge technology. What specific aspect of Revolt Motors would you like to know more about?"
};

// Function to get fallback response based on user message
function getFallbackResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  if (message.includes('electric') || message.includes('motorcycle')) {
    return FALLBACK_RESPONSES['electric motorcycles'];
  } else if (message.includes('spec') || message.includes('feature') || message.includes('battery') || message.includes('range')) {
    return FALLBACK_RESPONSES['specifications'];
  } else if (message.includes('dealer') || message.includes('service') || message.includes('where') || message.includes('location')) {
    return FALLBACK_RESPONSES['dealerships'];
  } else if (message.includes('technology') || message.includes('tech') || message.includes('battery') || message.includes('smart')) {
    return FALLBACK_RESPONSES['technology'];
  } else if (message.includes('sustain') || message.includes('environment') || message.includes('green') || message.includes('eco')) {
    return FALLBACK_RESPONSES['sustainability'];
  } else {
    return FALLBACK_RESPONSES['default'];
  }
}

// Initialize conversation
app.post('/api/start-conversation', async (req, res) => {
  try {
    const sessionId = Date.now().toString();
    
    if (useFallbackMode || !model) {
      // Use fallback mode
      conversations.set(sessionId, { type: 'fallback' });
      console.log('📝 Using fallback mode for session:', sessionId);
    } else {
      try {
        // Initialize the conversation with Gemini API
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
        conversations.set(sessionId, { type: 'gemini', chat });
        console.log('🤖 Using Gemini API for session:', sessionId);
      } catch (geminiError) {
        console.log('⚠️ Gemini API failed, switching to fallback mode for session:', sessionId);
        conversations.set(sessionId, { type: 'fallback' });
        useFallbackMode = true;
      }
    }
    
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

// Send message and get response with interruption support
app.post('/api/send-message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    const conversation = conversations.get(sessionId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation session not found' });
    }

    let response;
    
    if (conversation.type === 'fallback') {
      // Use fallback responses
      response = getFallbackResponse(message);
      console.log('📝 Fallback response for:', message);
    } else if (conversation.type === 'gemini' && conversation.chat) {
      try {
        // Try Gemini API
        const fullMessage = `${SYSTEM_INSTRUCTIONS}\n\nUser message: ${message}`;
        const result = await conversation.chat.sendMessage(fullMessage);
        const apiResponse = await result.response;
        response = apiResponse.text();
        console.log('🤖 Gemini API response for:', message);
      } catch (geminiError) {
        console.log('⚠️ Gemini API failed, using fallback for:', message);
        response = getFallbackResponse(message);
        // Switch this session to fallback mode
        conversations.set(sessionId, { type: 'fallback' });
      }
    } else {
      response = getFallbackResponse(message);
    }

    res.json({ 
      response: response,
      sessionId 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    // Provide a helpful fallback response even on error
    const fallbackResponse = getFallbackResponse(req.body.message || 'general inquiry');
    res.json({ 
      response: fallbackResponse,
      sessionId: req.body.sessionId 
    });
  }
});

// New endpoint for streaming responses with interruption support
app.post('/api/send-message-stream', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    const conversation = conversations.get(sessionId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation session not found' });
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Store this response stream for potential interruption
    activeResponses.set(sessionId, res);

    let response;
    
    if (conversation.type === 'fallback') {
      // Use fallback responses with streaming simulation
      response = getFallbackResponse(message);
      console.log('📝 Fallback response for:', message);
      
      // Simulate streaming for fallback responses
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (activeResponses.has(sessionId)) { // Check if not interrupted
          res.write(words[i] + ' ');
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate typing delay
        } else {
          break; // Response was interrupted
        }
      }
    } else if (conversation.type === 'gemini' && conversation.chat) {
      try {
        // Try Gemini API with streaming
        const fullMessage = `${SYSTEM_INSTRUCTIONS}\n\nUser message: ${message}`;
        const result = await conversation.chat.sendMessage(fullMessage);
        const apiResponse = await result.response;
        response = apiResponse.text();
        console.log('🤖 Gemini API response for:', message);
        
        // Stream the response word by word
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          if (activeResponses.has(sessionId)) { // Check if not interrupted
            res.write(words[i] + ' ');
            await new Promise(resolve => setTimeout(resolve, 80)); // Typing speed
          } else {
            break; // Response was interrupted
          }
        }
      } catch (geminiError) {
        console.log('⚠️ Gemini API failed, using fallback for:', message);
        response = getFallbackResponse(message);
        
        // Stream fallback response
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          if (activeResponses.has(sessionId)) {
            res.write(words[i] + ' ');
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            break;
          }
        }
        
        // Switch this session to fallback mode
        conversations.set(sessionId, { type: 'fallback' });
      }
    } else {
      response = getFallbackResponse(message);
      
      // Stream fallback response
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (activeResponses.has(sessionId)) {
          res.write(words[i] + ' ');
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          break;
        }
      }
    }

    // Clean up
    activeResponses.delete(sessionId);
    res.end();
    
  } catch (error) {
    console.error('Error in streaming response:', error);
    activeResponses.delete(req.body.sessionId);
    res.status(500).end('Error occurred');
  }
});

// Interruption endpoint
app.post('/api/interrupt', (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const responseStream = activeResponses.get(sessionId);
    if (responseStream) {
      // Close the response stream
      responseStream.end();
      activeResponses.delete(sessionId);
      console.log('🛑 Response interrupted for session:', sessionId);
      
      res.json({ 
        success: true, 
        message: 'Response interrupted successfully',
        sessionId 
      });
    } else {
      res.json({ 
        success: false, 
        message: 'No active response to interrupt',
        sessionId 
      });
    }
  } catch (error) {
    console.error('Error interrupting response:', error);
    res.status(500).json({ error: 'Failed to interrupt response' });
  }
});

// Audio input endpoint (for future audio integration)
app.post('/api/audio-input', async (req, res) => {
  try {
    const { sessionId, audioData } = req.body;
    
    if (!sessionId || !audioData) {
      return res.status(400).json({ error: 'Session ID and audio data are required' });
    }

    const conversation = conversations.get(sessionId);
    if (!conversation) {
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
  const conversation = conversations.get(sessionId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation session not found' });
  }

  // Return basic session info
  res.json({ 
    sessionId,
    active: true,
    mode: conversation.type,
    systemInstructions: SYSTEM_INSTRUCTIONS
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    model: model ? 'Gemini Live API initialized' : 'Model not initialized',
    fallbackMode: useFallbackMode,
    activeSessions: conversations.size,
    activeResponses: activeResponses.size
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
  console.log(`🔄 Fallback Mode: ${useFallbackMode ? 'Enabled' : 'Disabled'}`);
  console.log(`🛑 Interruption System: Enabled`);
});

