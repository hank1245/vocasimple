// Simple in-memory mock for AsyncStorage used in tests
type Store = Record<string, string | undefined>;

let store: Store = {};

const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    return Object.prototype.hasOwnProperty.call(store, key)
      ? store[key] ?? null
      : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    store[key] = value;
  },
  async removeItem(key: string): Promise<void> {
    delete store[key];
  },
  async clear(): Promise<void> {
    store = {};
  },
  // Helper for tests
  __reset(): void {
    store = {};
  },
};

export default AsyncStorage;
module.exports = AsyncStorage;
