export type QueueJob = {
  id: string;
  run: () => Promise<void>;
};

class QueueManager {
  private queue: QueueJob[] = [];
  private running = false;

  enqueue(job: QueueJob) {
    this.queue.push(job);
    this.process();
  }

  private async process() {
    if (this.running) return;

    const job = this.queue.shift();

    if (!job) return;

    this.running = true;

    try {
      await job.run();
    } finally {
      this.running = false;
      this.process();
    }
  }
}

export const queueManager = new QueueManager();
