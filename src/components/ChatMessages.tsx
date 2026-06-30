"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types/chat";

type ChatMessagesProps = {
  messages: Message[];
};

export function ChatMessages({ messages }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  return (
    <div className="flex flex-col overflow-y-auto scroll-auto">
      {messages.map((message, index) => (
        <p className="p-1" key={index}>
          {message.role} : {message.content}
        </p>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
