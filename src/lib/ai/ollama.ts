import type { Message } from "@/types/chat";
import type { AIProvider } from "./providers";

const OLLAMA_URL = "http://localhost:11434/api/chat";
export const ollamaProvider: AIProvider = {
  async sendMessage(messages: Message[], model: string) {
    console.log("OLAMMA PROVIDER START", messages);

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages,
        stream: true,
      }),
    });

    if (!response.body) {
      throw new Error("failed to communicate with Ollama");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

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

            const json = JSON.parse(line);
            const content = json.message?.content;
            const thinking = json.message?.thinking;

            if (thinking) {
              console.log("OLLAMA THINKING:", thinking);

              controller.enqueue(
                JSON.stringify({
                  type: "thinking",
                  content: thinking,
                }),
              );
            }

            if (content) {
              console.log("OLLAMA CONTENT:", content);

              controller.enqueue(
                JSON.stringify({
                  type: "message",
                  content,
                }),
              );
            }
          }
        }
      },
    });
  },
};
