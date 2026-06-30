"use client";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { useState } from "react";
import type { Message } from "@/types/chat";
import { AI_MODELS } from "@/lib/ai/models";

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(message: string) {
    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const updateMessages = [...messages, userMessage];

    setIsLoading(true);
    setMessages([
      ...updateMessages,
      {
        role: "assistant",
        content: "",
      },
    ]);

    console.log("Updating state message", message);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updateMessages,
          provider: selectedModel.provider,
          model: selectedModel.model,
        }),
      });

      console.log("Response Status", response.status);
      console.log("Content POST", message);

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const text = decoder.decode(value, { stream: true });

        const data = JSON.parse(text);

        if (data.type === "message") {
          setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];

            updated[updated.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + data.content,
            };

            return updated;
          });
        }

        console.log("returned answer", text);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="chat-container h-full w-full flex flex-col justify-between">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsModelOpen(!isModelOpen)}
          className="flex flex-row w-full items-center gap-1 cursor-pointer"
        >
          <span>{selectedModel.name}</span>
          <span>▾</span>
        </button>

        {isModelOpen && (
          <div className="absolute top-full mt-2 bg-black border rounded-md shadow-md">
            {AI_MODELS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedModel(item);
                  setIsModelOpen(false);
                }}
                className="block w-full text-left px-3 py-2 cursor-pointer"
              >
                {item.name} ({item.model})
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="h-full w-full flex flex-col justify-between">
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
