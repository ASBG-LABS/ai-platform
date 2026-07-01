import { useRef, useState, useSyncExternalStore } from "react";
import type { Message } from "@/types/chat";
import { parseAIStream } from "@/lib/ai/streamParser";
import type { Conversation } from "@/types/conversation";
import {
  getActiveConversation,
  saveConversation,
  subscribeToConversations,
} from "@/lib/chat/conversationStore";

interface UseChatOptions {
  provider: string;
  model: string;
  projectId: string;
}

function getConversationSnapshot() {
  return getActiveConversation();
}

export function useChat({ provider, model, projectId }: UseChatOptions) {
  const activeConversation = useSyncExternalStore(
    subscribeToConversations,
    getConversationSnapshot,
    () => null,
  );

  const [conversation, setConversation] = useState<Conversation>(
    () =>
      activeConversation ?? {
        id: crypto.randomUUID(),
        projectId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
  );

  const [messages, setMessages] = useState<Message[]>(
    activeConversation?.messages ?? [],
  );

  const messagesRef = useRef(messages);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function sendMessage(message: string) {
    setErrorMessage(null);
    setErrorCode(null);

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

    const currentMessages = [...messagesRef.current, userMessage];
    const updatedMessages = [...currentMessages, assistantMessage];

    setIsLoading(true);
    setMessages(updatedMessages);
    messagesRef.current = updatedMessages;

    const updatedConversation: Conversation = {
      ...conversation,
      projectId,
      messages: updatedMessages,
      updatedAt: new Date(),
    };

    setConversation(updatedConversation);
    saveConversation(updatedConversation);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: currentMessages,
          provider,
          model,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("No stream response received from AI.");
      }

      for await (const data of parseAIStream(response.body)) {
        switch (data.type) {
          case "message": {
            const updatedMessages = [...messagesRef.current];
            const lastMessage = updatedMessages[updatedMessages.length - 1];

            if (lastMessage) {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + data.content,
              };

              const updatedConversation: Conversation = {
                ...conversation,
                projectId,
                messages: updatedMessages,
                updatedAt: new Date(),
              };

              setMessages(updatedMessages);
              messagesRef.current = updatedMessages;
              setConversation(updatedConversation);
              saveConversation(updatedConversation);
            }

            break;
          }

          case "error":
            setErrorMessage(data.message);
            setErrorCode(data.code ?? null);
            break;

          case "done":
            break;
        }
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function clearError() {
    setErrorMessage(null);
    setErrorCode(null);
  }

  return {
    messages,
    sendMessage,
    isLoading,
    errorMessage,
    errorCode,
    clearError,
  };
}
