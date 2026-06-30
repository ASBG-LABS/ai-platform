import { sendAIMessage } from "@/lib/ai/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("REQUEST BODY", body);

    const { messages, provider, model } = body;

    console.log("ROUTE MODEL:", model);

    const stream = await sendAIMessage(messages, provider, model);

    console.log("ROUTE AI RESPONSE", stream);

    return new Response(stream);
  } catch (error) {
    console.error("CHAT API ERROR", error);

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
