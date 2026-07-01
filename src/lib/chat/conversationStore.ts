import type { Conversation } from "@/types/conversation";

const STORAGE_KEY = "asbg-conversations";

export function getConversations(): Conversation[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  return JSON.parse(stored) as Conversation[];
}

export function saveConversation(conversation: Conversation) {
  const conversations = getConversations();

  const existingIndex = conversations.findIndex(
    (item) => item.id === conversation.id,
  );

  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.push(conversation);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function deleteConversation(id: string) {
  const conversations = getConversations().filter(
    (conversation) => conversation.id !== id,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}
