import google.generativeai as genai

# Your API key
API_KEY = "AIzaSyC0wxMtsDtvmSv5N1WaGquQkpyECxp7T6c"

# Configure the API
genai.configure(api_key=API_KEY)

# Test with Gemini 2.0 Flash
print("Testing Gemini 2.0 Flash...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content("Hello, how are you?")
    print("✅ Success!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
