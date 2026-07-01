import { createOllamaStream } from "@/lib/ai/ollamaParser";
import { sendAIMessage } from "@/lib/ai/service";
import { isAIError } from "@/lib/ai/errors";

function createErrorStream(error: unknown) {
  const payload = isAIError(error)
    ? {
        type: "error",
        code: error.code,
        message: error.message,
      }
    : {
        type: "error",
        code: "UNKNOWN",
        message: "Something went wrong",
      };

  return new ReadableStream({
    start(controller) {
      controller.enqueue(JSON.stringify(payload));
      controller.close();
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("REQUEST BODY", body);

    const { messages, provider, model } = body;

    console.log("ROUTE MODEL:", model);

    const response = await sendAIMessage(messages, provider, model);

    const stream = await createOllamaStream(response);

    console.log("ROUTE AI RESPONSE", stream);

    return new Response(stream);
  } catch (error) {
    console.error("CHAT API ERROR", error);

    return new Response(createErrorStream(error), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
