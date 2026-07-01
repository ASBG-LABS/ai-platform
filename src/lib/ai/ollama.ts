import type { Message } from "@/types/chat";
import type { AIProvider } from "./providers";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_HEALTH_URL = "http://localhost:11434/api/tags";

async function checkOllama(model: string) {
  try {
    const response = await fetch(OLLAMA_HEALTH_URL, {
      signal: AbortSignal.timeout(3000),
    });

    console.log("OLLAMA HEALTH:", response.status);

    if (!response.ok) {
      throw new Error("OLLAMA_OFFLINE");
    }

    const data = await response.json();

    const exists = data.models?.some(
      (item: { name: string }) => item.name === model,
    );

    if (!exists) {
      throw new Error(`MODEL_NOT_FOUND:${model}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("OLLAMA_OFFLINE");
  }
}

export const ollamaProvider: AIProvider = {
  async sendMessage(messages: Message[], model: string) {
    console.log("OLAMMA PROVIDER START", messages);

    await checkOllama(model);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;

    try {
      response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          messages,
          stream: true,
        }),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Ollama svarar inte. Försök igen.");
      }

      throw new Error("Kunde inte ansluta till Ollama.");
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Ollama skickade inget svar.");
    }

    return response;
  },
};
