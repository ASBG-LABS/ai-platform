const OLLAMA_URL = "http://localhost:11434/api/generate";

export async function askOllama(prompt: string) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen3:8b",
      prompt,
      stream: false,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to Communicate with Ollama");
  }
  const data = await response.json();
  console.log("Ollama raw response:", data);
  return data.response;
}
