import type { Message } from "@/types/chat";
import type { AIProvider } from "./providers";
import { createAIError, isAIError } from "./errors";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_HEALTH_URL = "http://localhost:11434/api/tags";

async function validateOllamaAvailability(model: string) {
  try {
    const response = await fetch(OLLAMA_HEALTH_URL, {
      signal: AbortSignal.timeout(3000),
    });

    console.log("OLLAMA HEALTH:", response.status);

    if (!response.ok) {
      throw createAIError(
        "OLLAMA_OFFLINE",
        "Ollama is not running. Start Ollama and try again.",
        {
          provider: "ollama",
        },
      );
    }

    const data = await response.json();

    const exists = data.models?.some(
      (item: { name: string }) => item.name === model,
    );

    if (!exists) {
      throw createAIError(
        "MODEL_NOT_FOUND",
        `The model ${model} was not found.`,
        {
          model,
          provider: "ollama",
        },
      );
    }
  } catch (error) {
    if (isAIError(error)) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw createAIError(
        "OLLAMA_OFFLINE",
        "Ollama is not running. Start Ollama and try again.",
        {
          provider: "ollama",
        },
      );
    }

    throw createAIError(
      "UNKNOWN",
      "An unknown error occurred while checking Ollama.",
      {
        provider: "ollama",
      },
    );
  }
}

export const ollamaProvider: AIProvider = {
  async sendMessage(messages: Message[], model: string) {
    console.log("OLAMMA PROVIDER START", messages);

    await validateOllamaAvailability(model);

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
        throw createAIError(
          "OLLAMA_TIMEOUT",
          "Ollama is not responding. Try again.",
          {
            provider: "ollama",
          },
        );
      }

      throw createAIError("OLLAMA_OFFLINE", "Could not connect to Ollama.", {
        provider: "ollama",
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw createAIError(
        "UNKNOWN",
        `Ollama returnerade status ${response.status}.`,
        {
          provider: "ollama",
        },
      );
    }

    if (!response.body) {
      throw createAIError("UNKNOWN", "Ollama returned no response.", {
        provider: "ollama",
      });
    }

    return response;
  },
};
