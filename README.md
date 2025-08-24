# Revolt Motors AI Chat Application

A server-to-server AI chat application built with Node.js/Express and Google's Gemini Live API, specifically designed to provide information about Revolt Motors electric vehicles.

## 🚀 Features

* **AI-Powered Chat**: Intelligent conversations about Revolt Motors using Gemini Live API
* **Server-to-Server Architecture**: Secure backend communication with Gemini API
* **Responsive Web Interface**: Modern, mobile-friendly chat interface
* **System Instructions**: AI is programmed to only discuss Revolt Motors topics
* **Real-time Chat**: Live conversation with typing indicators and smooth UX
* **Session Management**: Persistent conversation sessions for better context
* **AI Response Interruption**: Stop AI responses mid-stream with the Stop button
* **Streaming Responses**: Word-by-word AI responses for better user experience
* **Fallback System**: Intelligent fallback responses when Gemini API is unavailable

## 🛠️ Technical Stack

- **Backend**: Node.js with Express.js
- **AI Integration**: Google Gemini Live API (gemini-2.5-flash-preview-native-audio-dialog)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Architecture**: Server-to-server (as required by task specifications)
- **Styling**: Modern CSS with gradients, animations, and responsive design

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Google Gemini API key (already configured)

## 🚀 Installation & Setup

### 1. Clone or Download the Project
```bash
# If you have git installed
git clone <repository-url>
cd revolt-motors-ai-chat

# Or simply extract the downloaded files to a folder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configuration
The API key is already configured in `config.js`. If you need to change it:
```javascript
// config.js
module.exports = {
  GEMINI_API_KEY: 'YOUR_NEW_API_KEY_HERE',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};
```

### 4. Start the Application
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 5. Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

## 🎯 Usage

### Starting a Conversation
1. Open the application in your browser
2. Click the "Start Conversation" button
3. The AI will greet you with information about Revolt Motors
4. Start asking questions about Revolt Motors products and services

### Example Questions You Can Ask
- "Tell me about Revolt Motors electric motorcycles"
- "What are the specifications of Revolt RV400?"
- "Where can I find Revolt Motors dealerships?"
- "What makes Revolt Motors unique in the EV market?"
- "Tell me about Revolt Motors' sustainability initiatives"

### System Instructions

The AI is programmed with specific system instructions to:

* Only discuss Revolt Motors topics
* Provide accurate product information
* Share company history and achievements
* Guide users to dealerships and service centers
* Explain electric vehicle technology as it relates to Revolt Motors

### AI Response Interruption

The application now features a powerful interruption system:

* **Stop Button**: Appears during AI responses and allows you to stop them mid-stream
* **Test Interruption**: Use the green "Test Interruption" button to demonstrate the feature
* **Streaming Responses**: AI responds word-by-word for better user control
* **Visual Feedback**: Clear indicators when responses are interrupted
* **Debug Tools**: Purple "Debug" button shows current system state

#### How to Use Interruption:
1. Start a conversation and ask a question
2. Click "Test Interruption" to see a long response
3. While the AI is responding, click the red "Stop" button
4. The response will immediately stop and show "[Response interrupted]"

## 🔧 API Endpoints

### Backend API Routes

* `POST /api/start-conversation` - Initialize a new chat session
* `POST /api/send-message` - Send a message and get AI response (legacy)
* `POST /api/send-message-stream` - Send a message and get streaming AI response with interruption support
* `POST /api/interrupt` - Interrupt an active streaming response
* `POST /api/test-interruption` - Test the interruption feature with a long response
* `POST /api/audio-input` - Audio input endpoint (for future implementation)
* `GET /api/conversation/:sessionId` - Get conversation session info
* `GET /api/health` - Server health check

### Frontend Features

* Real-time chat interface
* Typing indicators
* Responsive design for mobile and desktop
* Error handling and user feedback
* Session persistence
* **Streaming AI responses** with word-by-word display
* **Stop button** for interrupting AI responses mid-stream
* **Test Interruption button** for demonstrating the feature
* **Debug button** for troubleshooting system state
* Visual feedback for interrupted responses

## 🏗️ Architecture Details

### Server-to-Server Implementation
This application follows the server-to-server architecture as required:
- **Backend Server**: Node.js/Express server handles all Gemini API communication
- **Frontend**: Static HTML/CSS/JS served by the backend
- **API Communication**: Frontend communicates with backend, backend communicates with Gemini API
- **Security**: API keys are stored server-side, never exposed to client

### Gemini Live API Integration
- **Primary Model**: `gemini-2.5-flash-preview-native-audio-dialog` (as specified)
- **Fallback Model**: `gemini-2.0-flash-live-001` for development/testing
- **System Instructions**: Hardcoded to ensure AI only discusses Revolt Motors
- **Conversation Management**: Maintains chat history and context

## 📱 UI/UX Features

- **Modern Design**: Gradient backgrounds, rounded corners, and smooth animations
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, button animations, and visual feedback
- **Accessibility**: Clear visual hierarchy and intuitive navigation
- **Real-time Updates**: Live typing indicators and smooth message flow

## 🔒 Security Features

- API keys stored server-side only
- CORS enabled for cross-origin requests
- Input validation and sanitization
- Error handling without exposing sensitive information
- Session-based conversation management

## 🚧 Future Enhancements

- **Audio Integration**: Full implementation of Gemini Live API audio features
- **User Authentication**: User accounts and conversation history
- **File Upload**: Support for images and documents
- **Multi-language Support**: Localization for different regions
- **Analytics Dashboard**: Conversation insights and usage statistics

## 📊 Performance Considerations

- Efficient session management
- Optimized API calls to Gemini
- Responsive UI with minimal latency
- Error handling and retry mechanisms
- Memory-efficient conversation storage

## 🐛 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 3000 is available
   - Verify Node.js version (v14+)
   - Ensure all dependencies are installed

2. **API errors**
   - Verify Gemini API key is valid
   - Check API rate limits
   - Ensure internet connectivity

3. **Frontend not loading**
   - Check browser console for errors
   - Verify server is running on correct port
   - Clear browser cache

### Debug Mode
Enable debug logging by setting environment variable:
```bash
NODE_ENV=development npm start
```

## 📄 License

This project is created for the AI Candidate Task assessment.

## 🤝 Support

For technical support or questions about this implementation:
- Check the console logs for detailed error information
- Verify your Gemini API key and quota
- Ensure all dependencies are properly installed

## 🎥 Demo Requirements

As per the task requirements, you'll need to create a 30-60 second demo video showing:
1. Natural conversation with the AI
2. Clear interruption of the AI mid-response
3. Overall responsiveness and latency

Upload the video to Google Drive with public viewing permissions and include the link in your submission.

---

**Note**: This application is built according to the specific requirements of the AI Candidate Task, implementing a server-to-server architecture with Node.js/Express backend and Gemini Live API integration, focused exclusively on Revolt Motors topics.

