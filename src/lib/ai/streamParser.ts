import type { AIStreamEvent } from "./types";

function parseAIStreamEvent(value: string): AIStreamEvent {
  const parsed = JSON.parse(value);

  if (!parsed || typeof parsed.type !== "string") {
    throw new Error("Invalid AI stream event");
  }

  switch (parsed.type) {
    case "message":
      if (typeof parsed.content !== "string") {
        throw new Error("Invalid AI message event");
      }

      return {
        type: "message",
        content: parsed.content,
      };

    case "error":
      if (
        typeof parsed.message !== "string" ||
        typeof parsed.code !== "string"
      ) {
        throw new Error("Invalid AI error event");
      }

      return {
        type: "error",
        code: parsed.code,
        message: parsed.message,
      };

    case "done":
      return {
        type: "done",
      };

    default:
      throw new Error("Unknown AI stream event type");
  }
}

export async function* parseAIStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<AIStreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n");

    buffer = parts.pop() ?? "";

    for (const part of parts) {
      if (!part.trim()) continue;

      yield parseAIStreamEvent(part);
    }
  }

  if (buffer.trim()) {
    yield parseAIStreamEvent(buffer);
  }
}
