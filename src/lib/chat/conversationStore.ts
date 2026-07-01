import type { Conversation } from "@/types/conversation";

const STORAGE_KEY = "asbg-conversations";
const ACTIVE_CONVERSATION_KEY = "asbg-active-conversation";

const listeners = new Set<() => void>();
const runtimeListeners = new Set<() => void>();
const conversationRuntime = new Map<
  string,
  { isLoading: boolean; error: string | null }
>();
const defaultConversationRuntime = {
  isLoading: false,
  error: null,
};

let conversationsSnapshot: Conversation[] | null = null;
let activeConversationSnapshot: Conversation | null | undefined;

export function subscribeToConversations(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function notifyRuntimeListeners() {
  runtimeListeners.forEach((listener) => listener());
}

export function subscribeToConversationRuntime(listener: () => void) {
  runtimeListeners.add(listener);

  return () => {
    runtimeListeners.delete(listener);
  };
}

export function getConversationRuntime(id: string) {
  return conversationRuntime.get(id) ?? defaultConversationRuntime;
}

export function setConversationLoading(id: string, isLoading: boolean) {
  const current = getConversationRuntime(id);

  conversationRuntime.set(id, {
    ...current,
    isLoading,
  });

  notifyRuntimeListeners();
}

export function setConversationError(id: string, error: string | null) {
  const current = getConversationRuntime(id);

  conversationRuntime.set(id, {
    ...current,
    error,
  });

  notifyRuntimeListeners();
}

export function getConversations(projectId?: string): Conversation[] {
  if (conversationsSnapshot === null) {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      conversationsSnapshot = [];
    } else {
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
    }
  }

  if (!projectId) {
    return conversationsSnapshot;
  }

  return conversationsSnapshot.filter(
    (conversation) => conversation.projectId === projectId,
  );
}

export function getConversation(id: string): Conversation | null {
  return (
    getConversations().find((conversation) => conversation.id === id) ?? null
  );
}

export function createConversation(projectId: string): Conversation {
  const conversation: Conversation = {
    id: crypto.randomUUID(),
    projectId,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  saveConversation(conversation);
  setActiveConversation(conversation.id);

  return conversation;
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

  conversationsSnapshot = conversations;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));

  activeConversationSnapshot = undefined;
  notifyListeners();
}

export function deleteConversation(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const conversations = getConversations().filter(
    (conversation) => conversation.id !== id,
  );

  conversationsSnapshot = conversations;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));

  activeConversationSnapshot = undefined;
  notifyListeners();
}

export function setActiveConversation(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
  activeConversationSnapshot = undefined;
  notifyListeners();
}

export function getActiveConversation(): Conversation | null {
  if (activeConversationSnapshot !== undefined) {
    return activeConversationSnapshot;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const activeId = localStorage.getItem(ACTIVE_CONVERSATION_KEY);

  activeConversationSnapshot = activeId ? getConversation(activeId) : null;

  return activeConversationSnapshot;
}
