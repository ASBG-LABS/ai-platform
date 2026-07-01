"use client";

import { useProject } from "@/hooks/useProject";
import { useConversations } from "@/hooks/useConversation";

export function WorkspaceSidebar() {
  const { project } = useProject();

  const {
    conversations,
    activeConversation,
    selectConversation,
    createNewConversation,
  } = useConversations(project?.id ?? "asbg-labs");

  function handleCreateConversation() {
    createNewConversation(project?.id ?? "asbg-labs");
  }

  return (
    <aside>
      <h2>{project?.name ?? "ASBG Labs"}</h2>

      <section>
        <h3>Conversations</h3>
        <button type="button" onClick={handleCreateConversation}>
          + New Chat
        </button>

        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => selectConversation(conversation.id)}
          >
            {conversation.title ?? "New conversation"}
            {activeConversation?.id === conversation.id ? " ●" : ""}
          </button>
        ))}
      </section>
    </aside>
  );
}
