import { ollamaProvider } from "./ollama";
import type { Message } from "@/types/chat";
import { AIProviderType } from "./providers";
import { createAIError } from "./errors";

export function getAIProvider(providerType: AIProviderType) {
  switch (providerType) {
    case "ollama":
      return ollamaProvider;

    default:
      throw createAIError(
        "UNKNOWN",
        `AI provider ${providerType} is not supported.`,
        {
          provider: providerType,
        },
      );
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
