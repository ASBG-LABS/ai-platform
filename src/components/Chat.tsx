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

  async function sendMessage(message: string) {
    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const updateMessages = [...messages, userMessage];

    setMessages(updateMessages);

    console.log("Updating state message", message);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updateMessages,
        provider: selectedModel.provider,
      }),
    });

    console.log("Response Status", response.status);
    console.log("Content POST", message);

    const data = await response.json();
    console.log("API response", data);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.response,
      },
    ]);
    console.log("returned answer", data.response);
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
        <ChatMessages messages={messages} />
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}
