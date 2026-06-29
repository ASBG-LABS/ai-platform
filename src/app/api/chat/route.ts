import { askOllama } from "@/lib/ollama";
export async function POST(request: Request) {
  const body = await request.json();
  const message = body.message;
  const respone = await askOllama(message);
  return Response.json({ respone });
}
