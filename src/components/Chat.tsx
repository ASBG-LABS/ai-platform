"use client";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { AI_MODELS } from "@/lib/ai/models";
import { useProject } from "@/hooks/useProject";

export function Chat() {
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [isModelOpen, setIsModelOpen] = useState(false);

  const { project } = useProject();

  const {
    messages,
    sendMessage,
    isLoading,
    errorMessage,
    errorCode,
    clearError,
  } = useChat({
    provider: selectedModel.provider,
    model: selectedModel.model,
    projectId: project?.id ?? "asbg-labs",
  });

  return (
    <div className="chat-container h-full w-full flex flex-col justify-between">
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="rounded-md border bg-black px-6 py-5 shadow-lg max-w-md">
            <p className="mb-4">
              {errorCode === "OLLAMA_OFFLINE"
                ? "Ollama is not running. Start Ollama and try again."
                : errorCode === "MODEL_NOT_FOUND"
                  ? "The selected model was not found. Check your model settings."
                  : errorMessage}
            </p>
            <button
              type="button"
              onClick={clearError}
              className="text-sm underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
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
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
