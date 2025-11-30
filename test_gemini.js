const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = "AIzaSyC0wxMtsDtvmSv5N1WaGquQkpyECxp7T6c";

async function testGemini() {
  console.log('🔑 Testing Gemini API...');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    console.log('📦 Creating model: gemini-2.0-flash-exp');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
    
    console.log('💬 Sending message: "Hello, who are you?"');
    const result = await model.generateContent("Hello, who are you?");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS!');
    console.log('📝 Response:', text);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testGemini();
