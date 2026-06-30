import { ollamaProvider } from "./ollama";
import type { Message } from "@/types/chat";

export type AIProviderType = "ollama";

export function getAIProvider(type: AIProviderType) {
  switch (type) {
    case "ollama":
      return ollamaProvider;
  }
}

export async function sendAIMessage(
  messages: Message[],
  providerType: AIProviderType,
) {
  const provider = getAIProvider(providerType);

  return provider.sendMessage(messages);
}
