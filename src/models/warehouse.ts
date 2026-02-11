export interface Shelf {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  maxCapacity: number;
  currentPallets: number;
}

export interface Zone {
  id: number;
  name: string;
  color: string;
  shelves: Shelf[];
}

export interface Warehouse {
  zones: Zone[];
  unassignedPallets: number;
}
