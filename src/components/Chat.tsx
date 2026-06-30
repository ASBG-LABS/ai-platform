"use client";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { useState } from "react";
import type { Message } from "@/types/chat";

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);

  async function sendMessage(message: string) {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    console.log("Updating state message", message);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });
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
      <ChatMessages messages={messages} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
