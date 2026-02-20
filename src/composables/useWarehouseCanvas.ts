import { onMounted, onUnmounted, ref } from 'vue';
import { WarehouseEngine } from '../engine/WarehouseEngine';
import {
  applyPersistedState,
  loadPersistedState,
  WarehouseController,
} from '../controllers/WarehouseController';
import type { Shelf, Warehouse } from '../models/warehouse';

// Связующее звено между Vue и Canvas:
// - создаёт/уничтожает Engine и Controller
// - не кладёт контроллер в Pinia, хранит как обычные переменные
export function useWarehouseCanvas() {
  const containerRef = ref<HTMLDivElement | null>(null);
  /** Выбранная зона (при клике на название зоны); zoneId — для обновления данных после изменения паллет */
  const selectedZoneInfo = ref<{
    zoneId: number;
    blockName: string;
    zoneName: string;
    zoneCurrentPallets: number;
    zoneMaxCapacity: number;
    zoneFillPercent: number;
  } | null>(null);
  /** Выбранный стеллаж (при клике на стеллаж): стеллаж + данные по зоне */
  const selectedShelfInfo = ref<{
    shelf: Shelf;
    blockName: string;
    zoneName: string;
    zoneCurrentPallets: number;
    zoneMaxCapacity: number;
    zoneFillPercent: number;
  } | null>(null);

  let engine: WarehouseEngine | null = null;
  let controller: WarehouseController | null = null;

  const blocksSummary = ref<
    {
      blockName: string;
      currentPallets: number;
      maxCapacity: number;
      fillPercent: number;
    }[]
  >([]);
  const unassignedPallets = ref(0);

  function createInitialWarehouse(): Warehouse {
    // Несколько зон в виде 3 колонок по 5 зон.
    // Нижние зоны выходят за пределы текущего видимого окна, чтобы было что панорамировать.
    const shelfWidth = 80;
    const gapX = 20;
    const startColumnX = 80;
    const columnGap = 160; // горизонтальный отступ между блоками зон
    const rowsPerColumn = 5;
    const firstRowY = 120;
    const rowStepY = 160; // расстояние между зонами по вертикали

    let nextShelfId = 1;

    const makeZone = (
      id: number,
      name: string,
      color: string,
      blockName: string,
      baseX: number,
      baseY: number,
    ) => {
      const letter = name.replace('Зона ', '');
      const shelves = Array.from({ length: 5 }).map((_, index) => ({
        id: nextShelfId++,
        name: `Стеллаж ${letter}-${index + 1}`,
        x: baseX + index * (shelfWidth + gapX),
        y: baseY,
        width: shelfWidth,
        height: 120,
        maxCapacity: 10,
        currentPallets: 0,
      }));

      return {
        id,
        name,
        color,
        blockName,
        shelves,
      };
    };

    const zones: Warehouse['zones'] = [];
    const colors = ['#e3f2fd', '#e8f5e9', '#fff3e0', '#e0f7fa'];
    let zoneId = 1;

    for (let col = 0; col < 3; col += 1) {
      const baseX = startColumnX + col * ((shelfWidth + gapX) * 5 + columnGap);
      const blockName = `Блок ${col + 1}`;
      for (let row = 0; row < rowsPerColumn; row += 1) {
        const baseY = firstRowY + row * rowStepY;
        const zoneName = `Зона ${String.fromCharCode(65 + zoneId - 1)}`; // A, B, C...
        const color =
          colors[(zoneId - 1) % colors.length] ?? colors[0] ?? '#e3f2fd';
        zones.push(makeZone(zoneId, zoneName, color, blockName, baseX, baseY));
        zoneId += 1;
      }
    }

    return {
      unassignedPallets: 500,
      zones,
    };
  }

  function mount() {
    const container = containerRef.value;
    if (!container) {
      return;
    }

    engine = new WarehouseEngine(container);
    const initialWarehouse = createInitialWarehouse();
    const savedState = loadPersistedState();
    if (savedState) {
      applyPersistedState(initialWarehouse, savedState);
    }
    controller = new WarehouseController(engine, initialWarehouse);

    function refreshBlocksSummary(): void {
      if (!controller) {
        return;
      }
      const warehouse = controller.getWarehouse();
      const totals = new Map<
        string,
        { current: number; max: number }
      >();

      warehouse.zones.forEach((zone) => {
        zone.shelves.forEach((shelf) => {
          const key = zone.blockName;
          const prev = totals.get(key) ?? { current: 0, max: 0 };
          prev.current += shelf.currentPallets;
          prev.max += shelf.maxCapacity;
          totals.set(key, prev);
        });
      });

      blocksSummary.value = Array.from(totals.entries()).map(([blockName, { current, max }]) => ({
        blockName,
        currentPallets: current,
        maxCapacity: max,
        fillPercent: max > 0 ? Math.round((current / max) * 100) : 0,
      }));
      unassignedPallets.value = warehouse.unassignedPallets;
    }

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
          blockName: zone.blockName,
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
          blockName: zone.blockName,
          zoneName: zone.name,
          zoneCurrentPallets,
          zoneMaxCapacity,
          zoneFillPercent,
        };
      } else {
        selectedShelfInfo.value = null;
      }
    };
    /** После изменения паллет — обновить данные в открытой инфо-панели и сводку по блокам */
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
            blockName: zone.blockName,
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
            blockName: zone.blockName,
            zoneName: zone.name,
            zoneCurrentPallets,
            zoneMaxCapacity,
            zoneFillPercent,
          };
        }
      }

      refreshBlocksSummary();
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

    // Инициализируем сводку по блокам при первом монтировании
    refreshBlocksSummary();
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
    blocksSummary,
    unassignedPallets,
    addPalletToShelf,
    removePalletFromShelf,
  };
}
