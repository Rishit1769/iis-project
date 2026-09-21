import OpenAI from "openai";

export const ai = new OpenAI({
  baseURL: "https://ai.tcetcercd.in/v1",
  apiKey: process.env.AI_KEY,
});
