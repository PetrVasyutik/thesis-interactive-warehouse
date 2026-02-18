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
  /** Название блока (колонки), к которому относится зона: «Блок 1», «Блок 2», ... */
  blockName: string;
  shelves: Shelf[];
}

export interface Warehouse {
  zones: Zone[];
  unassignedPallets: number;
}
