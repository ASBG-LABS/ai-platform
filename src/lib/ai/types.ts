export type AIProviderType = "ollama" | "openai";

export type AIModel = {
  id: string;
  name: string;
  model: string;
  provider: AIProviderType;
};

import type { AIErrorCode } from "./errors";

export type AIStreamEvent =
  | {
      type: "message";
      content: string;
    }
  | {
      type: "error";
      code: AIErrorCode;
      message: string;
    }
  | {
      type: "done";
    };
