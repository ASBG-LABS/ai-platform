import { askOllama } from "@/lib/ollama";

export async function POST(request: Request) {
  const { message } = await request.json();

  const response = await askOllama(message);

  return Response.json({ response });
}
