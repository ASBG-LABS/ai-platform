export type ChatApiEvent =
  | { type: "message"; content: string }
  | { type: "done" }
  | { type: "error"; message: string; code?: string };

export async function* streamChat(
  messages: unknown[],
  model: string,
  provider: string,
): AsyncGenerator<ChatApiEvent> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      model,
      provider,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Chat request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let receivedDoneEvent = false;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const event = JSON.parse(line) as ChatApiEvent;

        if (event.type === "done") {
          receivedDoneEvent = true;
        }

        yield event;
      } catch {
        continue;
      }
    }
  }

  if (!receivedDoneEvent) {
    throw new Error("Chat stream ended unexpectedly");
  }
}
