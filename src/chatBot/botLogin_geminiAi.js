import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Bot's system prompt
const systemPrompt = `
You are a helpful assistant for a social media app.
Only answer questions related to this app — like its features, usage, profile settings, privacy, and updates.
If the user asks about "settings", explain that they can go to Profile > Settings to change preferences like password, notifications, and privacy.
If the question is outside the app, reply: "Sorry, I can only help with app-related questions."
answer only in one line like human chat but if needed write in steps  
always use /n when new line required to create 
use some short of suitable emojie 
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getBotResponse = async (userMessage) => {
  try {
    // ✅ Use correct model: gemini-1.5-flash (fast + free)
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash",
    });

    // ✅ Combine system prompt + user input
    const prompt = `${systemPrompt}\n\nUser: ${userMessage}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return {
      success: true,
      reply: response.trim(),
    };
  } catch (err) {
    console.error("Bot error:", err.message);
    return {
      success: false,
      error: `⚠️ Sorry, I couldn't process your request right now. (${err.message})`,
    };
  }
};

export default getBotResponse;
