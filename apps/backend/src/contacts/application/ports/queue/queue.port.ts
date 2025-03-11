export default interface QueuePort {
  publishMessage(message: Record<string, unknown>): Promise<void>;
}
