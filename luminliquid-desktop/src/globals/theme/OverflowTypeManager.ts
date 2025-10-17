// globals/overflow/OverflowManager.ts
type OverflowType = 'auto' | 'hidden' | 'scroll' | 'visible';

class OverflowManager {
  private overflow: OverflowType = 'auto';
  private listeners: ((overflow: OverflowType) => void)[] = [];

  getOverflow(): OverflowType {
    return this.overflow;
  }

  setOverflow(overflow: OverflowType): void {
    this.overflow = overflow;
    this.notifyListeners();
  }

  subscribe(listener: (overflow: OverflowType) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.overflow));
  }
}

export const overflowManager = new OverflowManager();