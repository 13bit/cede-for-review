export class Balance {
  free?: number;
  locked?: number;
  total?: number;

  constructor(free: number, locked: number, total: number) {
    this.free = free;
    this.locked = locked;
    this.total = total;
  }
}

export class BalanceMap {
  [key: string]: Balance
}
