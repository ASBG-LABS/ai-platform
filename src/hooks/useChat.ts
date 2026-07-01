import { useState } from "react";
import type { Message } from "@/types/chat";
import { parseAIStream } from "@/lib/ai/streamParser";
import type { Conversation } from "@/types/conversation";
import { saveConversation } from "@/lib/chat/conversationStore";

interface UseChatOptions {
  provider: string;
  model: string;
}

export function useChat({ provider, model }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const [conversation, setConversation] = useState<Conversation>({
    id: crypto.randomUUID(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

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

    const currentMessages = [...messages, userMessage];

    setIsLoading(true);
    const updatedMessages = [...currentMessages, assistantMessage];

    setMessages(updatedMessages);

    const updatedConversation: Conversation = {
      ...conversation,
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
            setMessages((prev) => {
              const updatedMessages = [...prev];
              const lastMessage = updatedMessages[updatedMessages.length - 1];

              if (!lastMessage) {
                return prev;
              }

              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + data.content,
              };

              const updatedConversation: Conversation = {
                ...conversation,
                messages: updatedMessages,
                updatedAt: new Date(),
              };

              setConversation(updatedConversation);
              saveConversation(updatedConversation);

              return updatedMessages;
            });

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
