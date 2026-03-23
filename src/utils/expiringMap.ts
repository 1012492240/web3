export class ExpiringMap<K, V> {
  private map = new Map<K, { value: V; expiresAt: number }>();
  private cleanupInterval: NodeJS.Timeout | undefined;

  constructor(cleanupIntervalMs: number = 1000) {
    if (cleanupIntervalMs > 0) {
      this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
  }
  }

  set(key: K, value: V, ttl: number) {
    const expiresAt = Date.now() + ttl;
    this.map.set(key, { value, expiresAt });
  }

  setIfExists(key: K, value: V): boolean {
    const entry = this.map.get(key);
    if (entry) {
      this.map.set(key, { value, expiresAt: entry.expiresAt });
      return true;
    }
    return false;
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    }
    this.map.delete(key);
    return undefined;
  }

  delete(key: K) {
    this.map.delete(key);
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  keys(): K[] {
    return Array.from(this.map.keys());
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.map.entries()) {
      if (entry.expiresAt <= now) {
        this.map.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}