// Global mock for lru-cache
jest.mock('lru-cache', () => {
  class LRUCache {
    constructor(options) {
      this.max = options?.max || 500;
      this.cache = new Map();
    }

    get(key) {
      return this.cache.get(key);
    }

    set(key, value) {
      if (this.cache.size >= this.max) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(key, value);
    }

    has(key) {
      return this.cache.has(key);
    }

    delete(key) {
      return this.cache.delete(key);
    }

    clear() {
      this.cache.clear();
    }
  }

  return LRUCache;
});
