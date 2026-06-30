import type { Message } from "@/types/chat";
import type { AIProvider } from "./providers";

const OLLAMA_URL = "http://localhost:11434/api/chat";
export const ollamaProvider: AIProvider = {
  async sendMessage(messages: Message[]) {
    console.log("OLAMMA PROVIDER START", messages);

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3:8b",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error("failed to communicate with Ollama");
    }

    const data = await response.json();
    console.log("OLLAMA RAW", data);
    return data.message.content;
  },
};
