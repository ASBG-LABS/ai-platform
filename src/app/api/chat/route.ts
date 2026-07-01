import { createOllamaStream } from "@/lib/ai/ollamaParser";
import { sendAIMessage } from "@/lib/ai/service";

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

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 503 },
    );
  }
}
