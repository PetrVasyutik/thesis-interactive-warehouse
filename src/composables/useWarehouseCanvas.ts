import { onMounted, onUnmounted, ref } from 'vue';
import { WarehouseEngine } from '../engine/WarehouseEngine';
import { WarehouseController } from '../controllers/WarehouseController';
import type { Warehouse } from '../models/warehouse';

// Связующее звено между Vue и Canvas:
// - создаёт/уничтожает Engine и Controller
// - не кладёт контроллер в Pinia, хранит как обычные переменные
export function useWarehouseCanvas() {
  const containerRef = ref<HTMLDivElement | null>(null);

  let engine: WarehouseEngine | null = null;
  let controller: WarehouseController | null = null;

  function createInitialWarehouse(): Warehouse {
    // Две зоны, в каждой по 5 стеллажей
    const shelfWidth = 80;
    const shelfHeight = 120;
    const gapX = 20;
    const startX = 80;

    let nextShelfId = 1;

    const makeZone = (id: number, name: string, color: string, baseY: number) => {
      const shelves = Array.from({ length: 5 }).map((_, index) => ({
        id: nextShelfId++,
        name: `${name}-${index + 1}`,
        x: startX + index * (shelfWidth + gapX),
        y: baseY,
        width: shelfWidth,
        height: shelfHeight,
        maxCapacity: 10,
        currentPallets: 0,
      }));

      return {
        id,
        name,
        color,
        shelves,
      };
    };

    return {
      unassignedPallets: 120,
      zones: [
        makeZone(1, 'Зона A', '#e3f2fd', 120),
        makeZone(2, 'Зона B', '#e8f5e9', 280),
      ],
    };
  }

  function mount() {
    const container = containerRef.value;
    if (!container) {
      return;
    }

    engine = new WarehouseEngine(container);
    const initialWarehouse = createInitialWarehouse();
    controller = new WarehouseController(engine, initialWarehouse);

    // Пробрасываем интерактивность вниз в движок
    engine.onShelfLeftClick = (shelfId: number) => {
      if (controller) {
        controller.addPalletToShelf(shelfId);
      }
    };
    engine.onShelfRightClick = (shelfId: number) => {
      if (controller) {
        controller.removePalletFromShelf(shelfId);
      }
    };
  }

  function unmount() {
    if (engine) {
      engine.destroy();
      engine = null;
    }
    controller = null;
  }

  function addPalletToShelf(shelfId: number) {
    if (controller) {
      controller.addPalletToShelf(shelfId);
    }
  }

  function removePalletFromShelf(shelfId: number) {
    if (controller) {
      controller.removePalletFromShelf(shelfId);
    }
  }

  onMounted(mount);
  onUnmounted(unmount);

  return {
    containerRef,
    addPalletToShelf,
    removePalletFromShelf,
  };
}
