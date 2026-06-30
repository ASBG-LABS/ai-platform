"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types/chat";
import Markdown from "react-markdown";

type ChatMessagesProps = {
  messages: Message[];
  isLoading: boolean;
};

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  return (
    <div className="flex flex-col overflow-y-auto scroll-auto">
      {messages.map((message, index) => {
        if (message.role === "assistant" && !message.content) {
          return null;
        }

        return (
          <div className="p-1" key={index}>
            <strong>{message.role}:</strong>

            <Markdown>{message.content}</Markdown>
          </div>
        );
      })}
      {isLoading && !messages.at(-1)?.content && (
        <div>
          <p>Tänker...</p>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
