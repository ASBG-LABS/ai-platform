"use client";
import { useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
};

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState<string>("");
  async function handleSubmit() {
    console.log("sending:", message);
    onSend(message);
    setMessage("");
  }
  return (
    <>
      <div className="input-container flex flex-row justify-between">
        <input
          type="text"
          placeholder="Skriv meddelande här..."
          className="border border-white p-1 rounded-md flex flex-row w-full"
          onChange={(e) => {
            console.log(e.target.value);
            setMessage(e.target.value);
          }}
        />
        <button
          className=" p-1 border rounded-md border-white bg-red-500"
          onClick={handleSubmit}
        >
          Skicka
        </button>
      </div>
    </>
  );
}
