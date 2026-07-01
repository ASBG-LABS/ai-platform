import { useSyncExternalStore } from "react";
import {
  createConversation,
  getActiveConversation,
  getConversations,
  setActiveConversation,
  subscribeToConversations,
} from "@/lib/chat/conversationStore";
import type { Conversation } from "@/types/conversation";

const conversationSnapshots = new Map<string, Conversation[]>();
const EMPTY_CONVERSATIONS: Conversation[] = [];

function getConversationSnapshot(projectId: string) {
  const cached = conversationSnapshots.get(projectId);

  if (cached) {
    return cached;
  }

  const conversations = getConversations(projectId);
  conversationSnapshots.set(projectId, conversations);

  return conversations;
}

export function useConversations(projectId: string) {
  const conversations = useSyncExternalStore(
    subscribeToConversations,
    () => getConversationSnapshot(projectId),
    () => EMPTY_CONVERSATIONS,
  );

  const activeConversation = useSyncExternalStore(
    subscribeToConversations,
    getActiveConversation,
    () => null,
  );

  function selectConversation(id: string) {
    conversationSnapshots.clear();
    setActiveConversation(id);
  }

  function createNewConversation(projectId: string) {
    conversationSnapshots.clear();
    return createConversation(projectId);
  }

  return {
    conversations,
    activeConversation: activeConversation as Conversation | null,
    selectConversation,
    createNewConversation,
  };
}
