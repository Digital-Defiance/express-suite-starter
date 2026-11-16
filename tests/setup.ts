// Global mock for lru-cache
jest.mock('lru-cache', () => {
  class LRUCache<K, V> {
    private readonly max: number;
    private readonly cache = new Map<K, V>();
    constructor(options?: { max?: number }) {
      this.max = options?.max || 500;
    }
    get(key: K): V | undefined {
      return this.cache.get(key);
    }
    set(key: K, value: V): void {
      if (this.cache.size >= this.max) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(key, value);
    }
    has(key: K): boolean {
      return this.cache.has(key);
    }
    delete(key: K): boolean {
      return this.cache.delete(key);
    }
    clear(): void {
      this.cache.clear();
    }
  }
  return LRUCache;
});
