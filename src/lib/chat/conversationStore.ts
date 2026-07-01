import type { Conversation } from "@/types/conversation";

const STORAGE_KEY = "asbg-conversations";

const listeners = new Set<() => void>();

let conversationsSnapshot: Conversation[] | null = null;
let latestConversationSnapshot: Conversation | undefined;

export function subscribeToConversations(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function getConversations(): Conversation[] {
  if (conversationsSnapshot) {
    return conversationsSnapshot;
  }

  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  conversationsSnapshot = (JSON.parse(stored) as Conversation[]).map(
    (conversation) => ({
      ...conversation,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      messages: conversation.messages.map((message) => ({
        ...message,
        createdAt: new Date(message.createdAt),
      })),
    }),
  );

  return conversationsSnapshot;
}

export function saveConversation(conversation: Conversation) {
  if (typeof window === "undefined") {
    return;
  }

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
  conversationsSnapshot = null;
  latestConversationSnapshot = undefined;
  notifyListeners();
}

export function deleteConversation(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const conversations = getConversations().filter(
    (conversation) => conversation.id !== id,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  conversationsSnapshot = null;
  latestConversationSnapshot = undefined;
  notifyListeners();
}

export function getLatestConversation(): Conversation | null {
  if (latestConversationSnapshot !== undefined) {
    return latestConversationSnapshot;
  }

  const conversations = getConversations();

  latestConversationSnapshot = conversations[conversations.length - 1];

  return latestConversationSnapshot ?? null;
}
