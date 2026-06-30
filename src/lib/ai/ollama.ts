import type { Message } from "@/types/chat";
import type { AIProvider } from "./providers";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_HEALTH_URL = "http://localhost:11434/api/tags";

async function checkOllama() {
  try {
    const response = await fetch(OLLAMA_HEALTH_URL, {
      signal: AbortSignal.timeout(3000),
    });

    console.log("OLLAMA HEALTH:", response.status);

    return response.ok;
  } catch (error) {
    console.log("OLLAMA HEALTH ERROR:", error);

    return false;
  }
}

export const ollamaProvider: AIProvider = {
  async sendMessage(messages: Message[], model: string) {
    console.log("OLAMMA PROVIDER START", messages);

    const isOnline = await checkOllama();

    if (!isOnline) {
      throw new Error("Ollama körs inte. Starta Ollama och försök igen.");
    }

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

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    return new ReadableStream<string>({
      async start(controller) {
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const json = JSON.parse(line);
              const content = json.message?.content;

              if (content) {
                console.log("OLLAMA CONTENT:", content);

                controller.enqueue(
                  JSON.stringify({
                    type: "message",
                    content,
                  }),
                );
              }
            } catch (error) {
              console.error("OLLAMA STREAM PARSE ERROR:", error);
            }
          }
        }
      },
    });
  },
};
