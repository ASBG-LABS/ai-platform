export type AIProviderType = "ollama" | "openai";

export type AIModel = {
  id: string;
  name: string;
  model: string;
  provider: AIProviderType;
};

export type AIStreamEvent =
  | {
      type: "message";
      content: string;
    }
  | {
      type: "done";
    }
  | {
      type: "error";
      message: string;
    };
