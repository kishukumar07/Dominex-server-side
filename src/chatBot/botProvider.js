// src/chatBot/botProvider.js
// Single entry point for bot responses.
// Switch AI provider by changing AI_PROVIDER in .env
// Supported values: "gemini" | "openai"

import getGeminiResponse from "./botLogic_geminiAi.js";
import getOpenAiResponse from "./botLogic_OpenAi.js";

const provider = process.env.AI_PROVIDER?.toLowerCase();

if (!provider) {
  throw new Error("AI_PROVIDER is not set in .env — set it to 'gemini' or 'openai'");
}

const providerMap = {
  gemini: getGeminiResponse,
  openai: getOpenAiResponse,
};

const getBotResponse = providerMap[provider];

if (!getBotResponse) {
  throw new Error(
    `Unknown AI_PROVIDER: "${provider}". Valid options are: ${Object.keys(providerMap).join(", ")}`
  );
}

export default getBotResponse;