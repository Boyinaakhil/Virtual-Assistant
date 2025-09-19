import axios from "axios";

const MODELS = [
  "gemini-2.5-flash",  // ✅ first choice
  "gemini-2.0-flash",  // 🔄 fallback
  "gemini-pro"         // 🛟 final fallback
];

const geminiResponse = async (command,assistantName,userName) => {
  const apiKey = process.env.GEMINI_API_KEY;

  for (const model of MODELS) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
    You are not Google. You will now behave like a voice-enabled assistant.

    Your task is to understand the user's natural language input and respond with a JSON object like this:

    {
      "type": "general" | "google_search" | "youtube_search" | "youtube_play" |
               "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" |
               "instagram_open" | "facebook_open" | "weather-show",
      "userInput": "<original user input>" (only remove your name from userinput if exists) 
                   mariyu evaraina google leda youtube lo edaina search cheyyamani cheppite 
                   userInput lo matrame aa search unna text veyali,
      "response": "<a short spoken response to read out loud to the user>"
    }

    Instructions:
    - "type": determine the intent of the user.
    - "userinput": original sentence the user spoke.
    - "response": A short voice-friendly reply, e.g., "Sure, playing it now", 
                  "Here's what I found", "Today is Tuesday", etc.

    Type meanings:
    - "general": if it’s a factual or informational question. 
     Mariyu evaro alanti prashna adigithe, dani samadhanam neeku telisina pattikini, danini kooda general category lo unchi, kevalam chinna samadhanam ivvali.
    - "google_search": if user wants to search something on Google.
    - "youtube_search": if user wants to search something on YouTube.
    - "youtube_play": if user wants to directly play a video or song.
    - "calculator_open": if user wants to open a calculator.
    - "instagram_open": if user wants to open instagram.
    - "facebook_open": if user wants to open facebook.
    - "weather-show": if user wants to know weather.
    - "get_time": if user asks for current time.
    - "get_date": if user asks for today's date.
    - "get_day": if user asks what day it is.
    - "get_month": if user asks for the current month.

    Important:
    - Use ${userName} evaraina adigithe ninnu evaru create chesaru ani
    - Only respond with the JSON object, nothing else.

    now your userInput- ${command}
    `;


      const result = await axios.post(
        apiUrl,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
        }
      );

      console.log(`✅ Success with model: ${model}`);
      return result.data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error(`❌ Failed with model: ${model}`);
      console.error(error.response?.data || error.message);
    }
  }

  throw new Error("All Gemini models failed.");
};

export default geminiResponse;
