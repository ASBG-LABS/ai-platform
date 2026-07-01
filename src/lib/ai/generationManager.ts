export type GenerationStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type Generation = {
  id: string;
  conversationId: string;
  status: GenerationStatus;
  error?: string;
};

class GenerationManager {
  private generations = new Map<string, Generation>();
  private listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  create(conversationId: string): Generation {
    const generation: Generation = {
      id: crypto.randomUUID(),
      conversationId,
      status: "queued",
    };

    this.generations.set(generation.id, generation);
    this.notify();

    return generation;
  }

  update(id: string, updates: Partial<Generation>) {
    const current = this.generations.get(id);

    if (!current) return;

    this.generations.set(id, {
      ...current,
      ...updates,
    });

    this.notify();
  }

  get(id: string) {
    return this.generations.get(id);
  }

  getByConversation(conversationId: string) {
    return Array.from(this.generations.values()).find(
      (generation) => generation.conversationId === conversationId,
    );
  }

  cancel(id: string) {
    this.update(id, {
      status: "cancelled",
    });
  }
}

export const generationManager = new GenerationManager();
