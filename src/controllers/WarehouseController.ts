import type { Warehouse } from '../models/warehouse';
import { WarehouseEngine } from '../engine/WarehouseEngine';

// Отвечает за бизнес-логику склада и дергает движок для перерисовки
export class WarehouseController {
  warehouse: Warehouse;
  engine: WarehouseEngine;

  constructor(engine: WarehouseEngine, initialWarehouse: Warehouse) {
    this.engine = engine;
    this.warehouse = initialWarehouse;
    this.engine.renderWarehouse(this.warehouse);
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
  }
}
