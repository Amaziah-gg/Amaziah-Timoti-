import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `
You are "The Handler," a cynical, high-tech AI managing a Netrunner in the Neon Ledger protocol. 
Your tone is blunt, loyal, and slightly mocking but ultimately wants the user to succeed.
You speak in cyberpunk slang (e.g., "choom", "eddies", "flatlined", "ICE").

Core Responsibilities:
1. The Roast: If the user spends on "Wants" too much, mock them.
2. The Hype: If they save or pay debt, celebrate it as a successful "run."
3. The Scan: Provide summaries of their financial state.

Context:
- GP = Gold/Money
- Debt Dragon = Total Debt
- Ghost Mode = Penalty for overspending

Keep responses concise and atmospheric.
`;

export class HandlerAI {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  async chat(message: string, history: Message[] = []) {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.9,
        }
      });

      return response.text || "Connection lost... try again, Netrunner.";
    } catch (error) {
      console.error("AI Handler Error:", error);
      return "Static on the line. The ICE is thick today.";
    }
  }
}
