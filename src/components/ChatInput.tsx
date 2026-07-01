"use client";
import { useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled: boolean;
};

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState<string>("");
  async function handleSubmit() {
    if (!message.trim()) return;

    console.log("sending:", message);
    onSend(message);
    setMessage("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !disabled) {
      handleSubmit();
    }
  }
  return (
    <>
      <div className="input-container flex flex-row justify-between">
        <input
          type="text"
          placeholder="Type your message here..."
          className="border border-white p-1 rounded-md flex flex-row w-full"
          value={message}
          onChange={(e) => {
            console.log(e.target.value);
            setMessage(e.target.value);
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          className={
            disabled
              ? "p-1 border rounded-md border-white bg-red-500 opacity-50 cursor-not-allowed"
              : "p-1 border rounded-md border-white bg-red-500 opacity-100"
          }
          onClick={handleSubmit}
          disabled={disabled}
        >
          Send
        </button>
      </div>
    </>
  );
}
