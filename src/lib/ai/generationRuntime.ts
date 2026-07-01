import { streamChat } from "@/lib/ai/chatApi";
import { queueManager } from "@/lib/ai/queueManager";

export type GenerationStatus = "queued" | "running" | "completed" | "failed";

export type GenerationState = {
  id: string;
  conversationId: string;
  status: GenerationStatus;
  createdAt: number;
};

const generationMessages = new Map<string, unknown[]>();
const generationLastSave = new Map<string, number>();

const activeGenerations = new Map<string, Promise<void>>();

const generationStates = new Map<string, GenerationState>();

export function getGenerationState(conversationId: string) {
  return generationStates.get(conversationId);
}

export function hasActiveGeneration(conversationId: string) {
  return activeGenerations.has(conversationId);
}

export function getGenerationMessages(conversationId: string) {
  return generationMessages.get(conversationId) ?? [];
}

export function setGenerationMessages(
  conversationId: string,
  messages: unknown[],
) {
  generationMessages.set(conversationId, messages);
}

export function shouldSaveGeneration(conversationId: string) {
  const now = Date.now();
  const lastSave = generationLastSave.get(conversationId) ?? 0;

  if (now - lastSave > 1000) {
    generationLastSave.set(conversationId, now);
    return true;
  }

  return false;
}

export async function startGeneration(
  messages: unknown[],
  model: string,
  provider: string,
  conversationId: string,
  callbacks?: {
    onStart?: () => void;
    onMessage?: (content: string) => void;
    onDone?: () => void;
    onError?: (message: string) => void;
  },
): Promise<void> {
  const generationId = crypto.randomUUID();

  generationStates.set(conversationId, {
    id: generationId,
    conversationId,
    status: "queued",
    createdAt: Date.now(),
  });

  const generation = new Promise<void>((resolve) => {
    queueManager.enqueue({
      id: conversationId,
      run: async () => {
        try {
          callbacks?.onStart?.();

          generationStates.set(conversationId, {
            ...generationStates.get(conversationId)!,
            status: "running",
          });

          for await (const event of streamChat(messages, model, provider)) {
            if (event.type === "message") {
              callbacks?.onMessage?.(event.content);
            }

            if (event.type === "done") {
              generationStates.set(conversationId, {
                ...generationStates.get(conversationId)!,
                status: "completed",
              });

              callbacks?.onDone?.();
            }
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Generation failed";
          generationStates.set(conversationId, {
            ...generationStates.get(conversationId)!,
            status: "failed",
          });
          callbacks?.onError?.(message);
        } finally {
          activeGenerations.delete(conversationId);
          resolve();
        }
      },
    });
  });

  activeGenerations.set(conversationId, generation);

  await generation;
}
