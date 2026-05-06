// Caching utilities for branch management

export class BranchManagementCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? (Date.now() - cached.timestamp) < this.cacheTimeout : false;
  }

  get<T>(key: string): T | null {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.data as T;
    }
    return null;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instance
export const branchCache = new BranchManagementCache();
