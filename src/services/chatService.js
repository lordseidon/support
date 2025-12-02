const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const saveMessage = async (sessionId, message, isUser) => {
  try {
    const response = await fetch(`${API_URL}/conversations/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        isUser
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    return { success: false, error: error.message };
  }
};

export const getChatHistory = async (sessionId, maxMessages = 50) => {
  try {
    const response = await fetch(`${API_URL}/conversations/${sessionId}`);
    
    if (response.status === 404) {
      // Conversation doesn't exist yet
      return { success: true, messages: [] };
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      // Return messages in chronological order
      const messages = data.data.messages || [];
      return { 
        success: true, 
        messages: messages.slice(-maxMessages).map(msg => ({
          text: msg.text,
          isUser: msg.isUser,
          timestamp: msg.timestamp
        }))
      };
    }

    return { success: true, messages: [] };
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { success: true, messages: [] };
  }
};

export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
