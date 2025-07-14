import OpenAI from "openai";
import env from "dotenv";
env.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Bot's system prompt (strict app-only guidance)
const systemPrompt = `
You are a helpful assistant for a social media app.
Only answer questions related to this app — like its features, usage, profile settings, privacy, and updates.
If the user asks about "settings", explain that they can go to Profile > Settings to change preferences like password, notifications, and privacy.
If the question is outside the app, reply: "Sorry, I can only help with app-related questions."
`;

// ✅ Bot response function
const getBotResponse = async (userMessage) => {
  try {
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userMessage,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    return {
      success: true,
      reply: completion.choices[0].message.content,
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




