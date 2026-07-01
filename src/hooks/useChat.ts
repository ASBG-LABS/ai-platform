import { useState, useSyncExternalStore } from "react";
import type { Message } from "@/types/chat";
import {
  getGenerationMessages,
  hasActiveGeneration,
  setGenerationMessages,
  shouldSaveGeneration,
  startGeneration,
} from "@/lib/ai/generationRuntime";
import { generationManager } from "@/lib/ai/generationManager";
import type { Conversation } from "@/types/conversation";
import {
  getActiveConversation,
  getConversationRuntime,
  saveConversation,
  setConversationLoading,
  subscribeToConversations,
  subscribeToConversationRuntime,
} from "@/lib/chat/conversationStore";

interface UseChatOptions {
  provider: string;
  model: string;
  projectId: string;
}

function getConversationSnapshot() {
  return getActiveConversation();
}

const defaultConversationRuntime = { isLoading: false, error: null };

function getGenerationSnapshot(conversationId: string) {
  return generationManager.getByConversation(conversationId) ?? null;
}

export function useChat({ provider, model, projectId }: UseChatOptions) {
  const activeConversation = useSyncExternalStore(
    subscribeToConversations,
    getConversationSnapshot,
    () => null,
  );

  const [fallbackConversation] = useState<Conversation>(() => ({
    id: crypto.randomUUID(),
    projectId,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const conversation = activeConversation ?? fallbackConversation;

  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, Message[]>
  >({});

  const messages =
    messagesByConversation[conversation.id] ?? conversation.messages;

  const conversationId = activeConversation?.id ?? conversation.id;
  const conversationRuntime = useSyncExternalStore(
    subscribeToConversationRuntime,
    () => getConversationRuntime(conversationId),
    () => defaultConversationRuntime,
  );

  const generation = useSyncExternalStore(
    generationManager.subscribe.bind(generationManager),
    () => getGenerationSnapshot(conversationId),
    () => null,
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function sendMessage(message: string) {
    setErrorMessage(null);
    setErrorCode(null);
    const conversationAtSend = activeConversation ?? conversation;

    if (hasActiveGeneration(conversationAtSend.id)) {
      return;
    }

    const generation = generationManager.create(conversationAtSend.id);
    console.log("GENERATION CREATED", generation);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    const currentMessages = [
      ...(activeConversation?.messages ??
        (getGenerationMessages(conversationAtSend.id) as Message[])),
      userMessage,
    ];
    const updatedMessages = [...currentMessages, assistantMessage];

    setMessagesByConversation((current) => ({
      ...current,
      [conversationAtSend.id]: updatedMessages,
    }));
    setGenerationMessages(conversationAtSend.id, updatedMessages);

    const updatedConversation: Conversation = {
      ...conversationAtSend,
      projectId,
      messages: updatedMessages,
      updatedAt: new Date(),
    };

    saveConversation(updatedConversation);

    try {
      await startGeneration(
        currentMessages,
        model,
        provider,
        conversationAtSend.id,
        {
          onStart: () => {
            console.log("GENERATION STARTED", generation.id);
            generationManager.update(generation.id, {
              status: "running",
            });
            setConversationLoading(conversationAtSend.id, true);
          },
          onMessage: (content) => {
            const updatedMessages = [
              ...(getGenerationMessages(conversationAtSend.id) as Message[]),
            ];
            const lastMessage = updatedMessages[updatedMessages.length - 1];

            if (lastMessage) {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + content,
              };

              const updatedConversation: Conversation = {
                ...conversationAtSend,
                projectId,
                messages: updatedMessages,
                updatedAt: new Date(),
              };

              setMessagesByConversation((current) => ({
                ...current,
                [conversationAtSend.id]: updatedMessages,
              }));
              setGenerationMessages(conversationAtSend.id, updatedMessages);

              if (shouldSaveGeneration(conversationAtSend.id)) {
                saveConversation(updatedConversation);
              }
            }
          },
          onDone: () => {
            console.log("GENERATION COMPLETED", generation.id);
            const finalMessages = getGenerationMessages(
              conversationAtSend.id,
            ) as Message[];

            const finalConversation: Conversation = {
              ...conversationAtSend,
              projectId,
              messages: finalMessages,
              updatedAt: new Date(),
            };

            saveConversation(finalConversation);
            generationManager.update(generation.id, {
              status: "completed",
            });
            setConversationLoading(conversationAtSend.id, false);
          },
          onError: (message) => {
            console.log("GENERATION FAILED", generation.id, message);
            setErrorMessage(message);
            generationManager.update(generation.id, {
              status: "failed",
              error: message,
            });
            setConversationLoading(conversationAtSend.id, false);
          },
        },
      );
    } catch (error) {
      console.log("GENERATION CATCH FAILED", generation.id, error);
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown error occurred.",
      );
      generationManager.update(generation.id, {
        status: "failed",
        error:
          error instanceof Error ? error.message : "Unknown error occurred.",
      });
      setConversationLoading(conversationAtSend.id, false);
    }
  }

  function clearError() {
    setErrorMessage(null);
    setErrorCode(null);
  }

  const isLoading =
    generation?.status === "queued" || generation?.status === "running";

  return {
    messages: isLoading ? messages : (activeConversation?.messages ?? messages),
    sendMessage,
    isLoading,
    errorMessage,
    errorCode,
    clearError,
  };
}
