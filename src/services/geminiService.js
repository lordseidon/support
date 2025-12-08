const API_URL = process.env.REACT_APP_API_URL;

// Note: System prompt is now managed in server/system_prompt.md
// All prompt configuration should be done there

export const generateResponse = async (message, conversationHistory = [], sessionId = null) => {
  try {
    console.log('💬 Sending message to backend API');
    console.log('📍 API URL:', API_URL);
    console.log('📝 Session ID:', sessionId);

    const response = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        sessionId
      })
    });

    console.log('📡 Response status:', response.status);

    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate response');
    }

    console.log('✅ Got response from backend');

    if (data.userDetails) {
      console.log('✅ User details extracted and stored in database!');
    }

    return {
      success: true,
      text: data.text,
      userDetails: data.userDetails,
      conversationId: data.conversationId,
      userId: data.userId
    };
  } catch (error) {
    console.error('❌ Error generating response:', error);
    return {
      success: false,
      text: 'Sorry, I encountered an error. Please try again.',
      error: error.message
    };
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get all stored user details from backend
export const getAllUserDetails = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    const data = await response.json();
    
    if (data.success) {
      console.log('\n📦 ALL STORED USER DETAILS FROM DATABASE:');
      console.log(JSON.stringify(data.data, null, 2));
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user details:', error);
    return [];
  }
};

export const streamResponse = async (message, conversationHistory = [], onChunk, sessionId = null) => {
  try {
    console.log('💬 Streaming message to backend API');
    console.log('📍 API URL:', API_URL);
    console.log('📝 Session ID:', sessionId);
    console.log('📨 Message:', message.substring(0, 100));

    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
        sessionId
      })
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', errorText);
      throw new Error(`Failed to stream response: ${response.status} - ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';
    let responseData = { showImages: false, images: [] };

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            if (data.done) {
              fullText = data.fullText;
              responseData.showImages = data.showImages || false;
              responseData.images = data.images || [];
              console.log('✅ Streaming complete. Show images:', responseData.showImages);
            } else if (data.chunk) {
              // Split chunk into words for smooth streaming
              const words = data.chunk.split(/(\s+)/);
              for (const word of words) {
                if (word) {
                  fullText += word;
                  onChunk(word, fullText);
                  await sleep(30);
                }
              }
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError);
          }
        }
      }
    }

    return {
      success: true,
      text: fullText,
      showImages: responseData.showImages,
      images: responseData.images
    };
  } catch (error) {
    console.error('❌ Error streaming response:', error);
    return {
      success: false,
      text: 'Sorry, I encountered an error. Please try again.',
      error: error.message
    };
  }
};
