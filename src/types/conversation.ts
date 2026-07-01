import type { Message } from "./chat";

export type Conversation = {
  id: string;
  projectId: string;
  title?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};
