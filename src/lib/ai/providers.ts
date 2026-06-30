import { Message } from "@/types/chat";
import { ollamaProvider } from "./ollama";

export const AI_PROVIDERS = [
  {
    ollama: ollamaProvider,
  },
];

export interface AIProvider {
  sendMessage(
    messages: Message[],
    model: string,
  ): Promise<ReadableStream<string>>;
}
