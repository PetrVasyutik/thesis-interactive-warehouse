import { onMounted, onUnmounted, ref } from 'vue';
import { WarehouseEngine } from '../engine/WarehouseEngine';
import { WarehouseController } from '../controllers/WarehouseController';
import type { Shelf, Warehouse } from '../models/warehouse';

// Связующее звено между Vue и Canvas:
// - создаёт/уничтожает Engine и Controller
// - не кладёт контроллер в Pinia, хранит как обычные переменные
export function useWarehouseCanvas() {
  const containerRef = ref<HTMLDivElement | null>(null);
  /** Выбранная зона (при клике на название зоны); zoneId — для обновления данных после изменения паллет */
  const selectedZoneInfo = ref<{
    zoneId: number;
    zoneName: string;
    zoneCurrentPallets: number;
    zoneMaxCapacity: number;
    zoneFillPercent: number;
  } | null>(null);
  /** Выбранный стеллаж (при клике на стеллаж): стеллаж + данные по зоне */
  const selectedShelfInfo = ref<{
    shelf: Shelf;
    zoneName: string;
    zoneCurrentPallets: number;
    zoneMaxCapacity: number;
    zoneFillPercent: number;
  } | null>(null);

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
      const letter = name.replace('Зона ', '');
      const shelves = Array.from({ length: 5 }).map((_, index) => ({
        id: nextShelfId++,
        name: `Стеллаж ${letter}-${index + 1}`,
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

    // Клик по названию зоны — показать инфо по зоне
    engine.onZoneSelect = (zoneId: number) => {
      if (!controller) {
        return;
      }
      selectedShelfInfo.value = null;
      const zone = controller.getZoneById(zoneId);
      if (zone) {
        const zoneCurrentPallets = zone.shelves.reduce((sum, s) => sum + s.currentPallets, 0);
        const zoneMaxCapacity = zone.shelves.reduce((sum, s) => sum + s.maxCapacity, 0);
        const zoneFillPercent =
          zoneMaxCapacity > 0 ? Math.round((zoneCurrentPallets / zoneMaxCapacity) * 100) : 0;
        selectedZoneInfo.value = {
          zoneId: zone.id,
          zoneName: zone.name,
          zoneCurrentPallets,
          zoneMaxCapacity,
          zoneFillPercent,
        };
      } else {
        selectedZoneInfo.value = null;
      }
    };
    // Клик по стеллажу — показать инфо по стеллажу и зоне
    engine.onShelfSelect = (shelfId: number) => {
      if (!controller) {
        return;
      }
      selectedZoneInfo.value = null;
      const result = controller.getShelfAndZone(shelfId);
      if (result) {
        const { shelf, zone } = result;
        const zoneCurrentPallets = zone.shelves.reduce((sum, s) => sum + s.currentPallets, 0);
        const zoneMaxCapacity = zone.shelves.reduce((sum, s) => sum + s.maxCapacity, 0);
        const zoneFillPercent =
          zoneMaxCapacity > 0 ? Math.round((zoneCurrentPallets / zoneMaxCapacity) * 100) : 0;
        selectedShelfInfo.value = {
          shelf,
          zoneName: zone.name,
          zoneCurrentPallets,
          zoneMaxCapacity,
          zoneFillPercent,
        };
      } else {
        selectedShelfInfo.value = null;
      }
    };
    /** После изменения паллет — обновить данные в открытой инфо-панели */
    function refreshSelectedInfo(): void {
      if (!controller) {
        return;
      }
      if (selectedShelfInfo.value) {
        const result = controller.getShelfAndZone(selectedShelfInfo.value.shelf.id);
        if (result) {
          const { shelf, zone } = result;
          const zoneCurrentPallets = zone.shelves.reduce((sum, s) => sum + s.currentPallets, 0);
          const zoneMaxCapacity = zone.shelves.reduce((sum, s) => sum + s.maxCapacity, 0);
          const zoneFillPercent =
            zoneMaxCapacity > 0 ? Math.round((zoneCurrentPallets / zoneMaxCapacity) * 100) : 0;
          selectedShelfInfo.value = {
            shelf,
            zoneName: zone.name,
            zoneCurrentPallets,
            zoneMaxCapacity,
            zoneFillPercent,
          };
        }
      }
      if (selectedZoneInfo.value) {
        const zone = controller.getZoneById(selectedZoneInfo.value.zoneId);
        if (zone) {
          const zoneCurrentPallets = zone.shelves.reduce((sum, s) => sum + s.currentPallets, 0);
          const zoneMaxCapacity = zone.shelves.reduce((sum, s) => sum + s.maxCapacity, 0);
          const zoneFillPercent =
            zoneMaxCapacity > 0 ? Math.round((zoneCurrentPallets / zoneMaxCapacity) * 100) : 0;
          selectedZoneInfo.value = {
            zoneId: zone.id,
            zoneName: zone.name,
            zoneCurrentPallets,
            zoneMaxCapacity,
            zoneFillPercent,
          };
        }
      }
    }

    engine.onShelfLeftClick = (shelfId: number) => {
      if (controller) {
        controller.addPalletToShelf(shelfId);
        refreshSelectedInfo();
      }
    };
    engine.onShelfRightClick = (shelfId: number) => {
      if (controller) {
        controller.removePalletFromShelf(shelfId);
        refreshSelectedInfo();
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
    selectedZoneInfo,
    selectedShelfInfo,
    addPalletToShelf,
    removePalletFromShelf,
  };
}
