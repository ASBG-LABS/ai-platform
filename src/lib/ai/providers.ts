import type { Message } from "@/types/chat";
import { ollamaProvider } from "./ollama";

export const AI_PROVIDERS = {
  ollama: ollamaProvider,
};

export type AIProviderType = keyof typeof AI_PROVIDERS;

export interface AIProvider {
  sendMessage(messages: Message[], model: string): Promise<Response>;
}
