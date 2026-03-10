import type { Shelf, Warehouse, WarehousePersistedState, Zone } from '../models/warehouse';
import { WarehouseEngine } from '../engine/WarehouseEngine';

const STORAGE_KEY = 'warehouse_state';

/** Загрузить сохранённое состояние из localStorage (или null, если нет/невалидно) */
export function loadPersistedState(): WarehousePersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const state: WarehousePersistedState = JSON.parse(raw);
    if (
      typeof state?.unassignedPallets !== 'number' ||
      !state.shelves ||
      typeof state.shelves !== 'object'
    ) {
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

/** Применить сохранённое состояние к объекту склада (мутирует warehouse) */
export function applyPersistedState(
  warehouse: Warehouse,
  state: WarehousePersistedState,
): void {
  warehouse.unassignedPallets = Math.max(0, state.unassignedPallets);
  for (const zone of warehouse.zones) {
    for (const shelf of zone.shelves) {
      const saved = state.shelves[shelf.id];
      if (typeof saved === 'number') {
        shelf.currentPallets = Math.max(
          0,
          Math.min(shelf.maxCapacity, Math.floor(saved)),
        );
      }
    }
  }
}

// Отвечает за бизнес-логику склада и дергает движок для перерисовки
export class WarehouseController {
  warehouse: Warehouse;
  engine: WarehouseEngine;

  constructor(engine: WarehouseEngine, initialWarehouse: Warehouse) {
    this.engine = engine;
    this.warehouse = initialWarehouse;
    this.engine.renderWarehouse(this.warehouse);
  }

  /** Сохранить текущее состояние склада в localStorage */
  persistState(): void {
    const state: WarehousePersistedState = {
      unassignedPallets: this.warehouse.unassignedPallets,
      shelves: {},
    };
    for (const zone of this.warehouse.zones) {
      for (const shelf of zone.shelves) {
        state.shelves[shelf.id] = shelf.currentPallets;
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage может быть недоступен (приватный режим и т.д.)
    }
  }

  getWarehouse(): Warehouse {
    return this.warehouse;
  }

  findShelfById(shelfId: number) {
    for (const zone of this.warehouse.zones) {
      const shelf = zone.shelves.find((s) => s.id === shelfId);
      if (shelf) {
        return shelf;
      }
    }
    return null;
  }

  // Увеличить количество паллет на стеллаже (с проверкой на максимум)
  addPalletToShelf(shelfId: number): void {
    const shelf = this.findShelfById(shelfId);
    if (!shelf) {
      return;
    }
    if (shelf.currentPallets >= shelf.maxCapacity) {
      return;
    }
    if (this.warehouse.unassignedPallets <= 0) {
      return;
    }

    this.warehouse.unassignedPallets -= 1;
    shelf.currentPallets += 1;
    this.engine.renderWarehouse(this.warehouse);
    this.persistState();
  }

  // Уменьшить количество паллет на стеллаже (с проверкой на минимум)
  removePalletFromShelf(shelfId: number): void {
    const shelf = this.findShelfById(shelfId);
    if (!shelf) {
      return;
    }
    if (shelf.currentPallets <= 0) {
      return;
    }

    this.warehouse.unassignedPallets += 1;
    shelf.currentPallets -= 1;
    this.engine.renderWarehouse(this.warehouse);
    this.persistState();
  }

  getShelfAndZone(shelfId: number): { shelf: Shelf; zone: Zone } | null {
    for (const zone of this.warehouse.zones) {
      const shelf = zone.shelves.find((s) => s.id === shelfId);
      if (shelf) {
        return { shelf, zone };
      }
    }
    return null;
  }

  getZoneById(zoneId: number): Zone | null {
    return this.warehouse.zones.find((z) => z.id === zoneId) ?? null;
  }
}
