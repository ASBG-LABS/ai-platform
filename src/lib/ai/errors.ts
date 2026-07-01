export type AIErrorCode =
  | "OLLAMA_OFFLINE"
  | "MODEL_NOT_FOUND"
  | "OLLAMA_TIMEOUT"
  | "UNKNOWN";

export type AIError = {
  code: AIErrorCode;
  message: string;
  model?: string;
  provider?: string;
};

export function createAIError(
  code: AIErrorCode,
  message: string,
  options?: {
    model?: string;
    provider?: string;
  },
): AIError {
  return {
    code,
    message,
    ...options,
  };
}

export function isAIError(error: unknown): error is AIError {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return [
    "OLLAMA_OFFLINE",
    "MODEL_NOT_FOUND",
    "OLLAMA_TIMEOUT",
    "UNKNOWN",
  ].includes((error as { code: string }).code as AIErrorCode);
}
