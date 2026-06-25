import { randomUUID } from 'crypto';

export interface AtlasEvent<T = any> {
  eventId: string;
  eventType: string;
  timestamp: Date;
  organizationId: string;
  plugin: string;
  payload: T;
}

export type AtlasEventHandler<T = any> = (event: AtlasEvent<T>) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<string, Set<AtlasEventHandler>>();

  public subscribe<T = any>(eventType: string, handler: AtlasEventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as AtlasEventHandler);
  }

  public unsubscribe<T = any>(eventType: string, handler: AtlasEventHandler<T>): void {
    const set = this.handlers.get(eventType);
    if (set) {
      set.delete(handler as AtlasEventHandler);
      if (set.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  public async publish<T = any>(event: Omit<AtlasEvent<T>, 'eventId' | 'timestamp'> & { eventId?: string; timestamp?: Date }): Promise<void> {
    const fullEvent: AtlasEvent<T> = {
      eventId: event.eventId ?? randomUUID(),
      timestamp: event.timestamp ?? new Date(),
      eventType: event.eventType,
      organizationId: event.organizationId,
      plugin: event.plugin,
      payload: event.payload,
    };

    const set = this.handlers.get(fullEvent.eventType);
    if (set) {
      const promises = Array.from(set).map(async (handler) => {
        try {
          await handler(fullEvent);
        } catch (err) {
          console.error(`Error in event handler for ${fullEvent.eventType}:`, err);
        }
      });
      await Promise.all(promises);
    }
  }

  public clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new EventBus();
