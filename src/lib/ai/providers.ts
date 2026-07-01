import { Message } from "@/types/chat";
import { ollamaProvider } from "./ollama";

export type AIProviderType = "ollama";

export const AI_PROVIDERS = [
  {
    ollama: ollamaProvider,
  },
];

export interface AIProvider {
  sendMessage(messages: Message[], model: string): Promise<Response>;
}
