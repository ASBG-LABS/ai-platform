import type { AIStreamEvent } from "./types";
import { createAIError, isAIError } from "./errors";

function serializeEvent(event: AIStreamEvent) {
  return JSON.stringify(event) + "\n";
}

export function createOllamaStream(response: Response): ReadableStream<string> {
  if (!response.body) {
    throw createAIError("UNKNOWN", "Ollama response has no body", {
      provider: "ollama",
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  function enqueueEvent(
    controller: ReadableStreamDefaultController<string>,
    event: AIStreamEvent,
  ) {
    controller.enqueue(serializeEvent(event));
  }

  return new ReadableStream<string>({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            buffer += decoder.decode();

            if (buffer.trim()) {
              try {
                const json = JSON.parse(buffer);
                const content = json.message?.content;
                if (content) {
                  const event: AIStreamEvent = {
                    type: "message",
                    content,
                  };
                  controller.enqueue(serializeEvent(event));
                }
              } catch (error) {
                console.error("FINAL BUFFER PARSE ERROR", error);
              }
            }

            const event: AIStreamEvent = {
              type: "done",
            };
            controller.enqueue(serializeEvent(event));
            controller.close();
            break;
          }

          if (value) {
            buffer += decoder.decode(value, { stream: true });
          }

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const json = JSON.parse(line);
              const content = json.message?.content;

              if (content) {
                if (process.env.NODE_ENV === "development") {
                  console.log("OLLAMA CONTENT:", content);
                }

                enqueueEvent(controller, {
                  type: "message",
                  content,
                });
              }
            } catch (error) {
              console.error("OLLAMA STREAM PARSE ERROR:", error);
            }
          }
        }
      } catch (error) {
        console.error("OLLAMA STREAM ERROR:", error);

        if (isAIError(error)) {
          enqueueEvent(controller, {
            type: "error",
            code: error.code,
            message: error.message,
          });
        } else {
          enqueueEvent(controller, {
            type: "error",
            code: "UNKNOWN",
            message: "Unknown stream error",
          });
        }

        controller.close();
      }
    },
  });
}
