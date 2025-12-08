const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Uses Gemini Flash (fast model) to determine if the user's message
 * would benefit from seeing before/after dental images
 * @param {string} userMessage - The user's message
 * @returns {Promise<boolean>} - true if images should be shown, false otherwise
 */
async function shouldShowImages(userMessage) {
  try {
    // Use Gemini 2.0 Flash for fast decision-making
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are a dental assistant AI. Analyze if the following user message would benefit from seeing before/after dental treatment images.

User message: "${userMessage}"

Context: We have before/after photos showing dental transformations including veneers, implants, teeth whitening, smile makeovers, and various cosmetic dental procedures.

Respond with ONLY "yes" if the user is:
- Asking about results or outcomes
- Inquiring about cosmetic procedures (veneers, whitening, smile makeover, implants)
- Wanting to see examples or proof of work
- Asking "what can you do for me"
- Expressing interest in visual transformations
- Asking about before/after results
- Curious about the quality or appearance of treatments

Respond with ONLY "no" if the user is:
- Just greeting or making small talk
- Asking about prices, location, or contact details only
- Scheduling appointments
- Asking about pain or medical concerns without interest in results
- Making general inquiries that don't relate to visual outcomes

Response (only "yes" or "no"):`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toLowerCase();
    
    console.log(`🤖 Gemini decision for message "${userMessage.substring(0, 50)}...": ${text}`);
    
    return text === "yes";
  } catch (error) {
    console.error('❌ Error in Gemini decision service:', error);
    // Default to not showing images if there's an error
    return false;
  }
}

module.exports = {
  shouldShowImages
};
