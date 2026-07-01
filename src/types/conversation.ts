import type { Message } from "./chat";

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Conversation = {
  id: string;
  projectId: string;
  title?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};
