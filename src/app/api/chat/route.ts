import { sendAIMessage } from "@/lib/ai/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("REQUEST BODY", body);

    const { messages, provider } = body;

    const response = await sendAIMessage(messages, provider);

    console.log("ROUTE AI RESPONSE", response);

    return Response.json({ response });
  } catch (error) {
    console.error("CHAT API ERROR", error);

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
