import { ollamaProvider } from "./ollama";
import type { Message } from "@/types/chat";
import { AIProviderType } from "./providers";

export function getAIProvider(type: AIProviderType) {
  switch (type) {
    case "ollama":
      return ollamaProvider;
  }
}

export async function sendAIMessage(
  messages: Message[],
  providerType: AIProviderType,
  model: string,
) {
  const provider = getAIProvider(providerType);

  return provider.sendMessage(messages, model);
}
