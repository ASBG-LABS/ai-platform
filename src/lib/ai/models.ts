import type { AIModel } from "./types";

export const AI_MODELS: AIModel[] = [
  {
    id: "qwen3-8b",
    name: "Qwen 3 8B",
    model: "qwen3:8b",
    provider: "ollama",
  },
  {
    id: "llama3",
    name: "Llama 3",
    model: "llama3",
    provider: "ollama",
  },
  {
    id: "gpt-5",
    name: "ChatGPT",
    model: "gpt-5",
    provider: "openai",
  },
];
