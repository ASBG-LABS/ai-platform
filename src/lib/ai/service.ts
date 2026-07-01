import type { Message } from "@/types/chat";
import { AI_PROVIDERS, AIProviderType } from "./providers";

export function getAIProvider(providerType: AIProviderType) {
  return AI_PROVIDERS[providerType];
}

export async function sendAIMessage(
  messages: Message[],
  providerType: AIProviderType,
  model: string,
) {
  const provider = getAIProvider(providerType);

  return provider.sendMessage(messages, model);
}
