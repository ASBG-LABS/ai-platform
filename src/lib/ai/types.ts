export type AIProviderType = "ollama" | "openai";

export type AIModel = {
  id: string;
  name: string;
  model: string;
  provider: AIProviderType;
};
