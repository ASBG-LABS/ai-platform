import type { AIStreamEvent } from "./types";

export function createOllamaStream(response: Response): ReadableStream<string> {
  if (!response.body) {
    throw new Error("Ollama response has no body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  function enqueueEvent(
    controller: ReadableStreamDefaultController<string>,

    event: AIStreamEvent,
  ) {
    controller.enqueue(JSON.stringify(event) + "\n");
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

                  controller.enqueue(JSON.stringify(event) + "\n");
                }
              } catch (error) {
                console.error("FINAL BUFFER PARSE ERROR", error);
              }
            }

            const event: AIStreamEvent = {
              type: "done",
            };

            controller.enqueue(JSON.stringify(event) + "\n");

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

        enqueueEvent(controller, {
          type: "error",
          message:
            error instanceof Error ? error.message : "Unknown stream error",
        });

        controller.close();
      }
    },
  });
}
