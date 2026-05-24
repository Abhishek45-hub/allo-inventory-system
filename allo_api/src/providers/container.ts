export class Container {
  private readonly map = new Map<string, unknown>();

  register<T>(key: string, value: T): void {
    this.map.set(key, value);
  }

  resolve<T>(key: string): T {
    const value = this.map.get(key);
    if (!value) {
      throw new Error(`Dependency not found: ${key}`);
    }
    return value as T;
  }
}
