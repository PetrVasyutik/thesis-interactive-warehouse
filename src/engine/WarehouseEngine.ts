import Konva from 'konva';
import type { Warehouse, Shelf, Zone } from '../models/warehouse';

// Отвечает только за работу с Konva (Stage/Layer/Shapes), без бизнес-логики
export class WarehouseEngine {
  stage: Konva.Stage;
  layer: Konva.Layer;

  // Коллбеки для кликов по стеллажам (назначаются снаружи)
  onShelfLeftClick: ((shelfId: number) => void) | null = null;
  onShelfRightClick: ((shelfId: number) => void) | null = null;

  constructor(container: HTMLDivElement) {
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.stage = new Konva.Stage({
      container,
      width,
      height,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Отключаем контекстное меню браузера на канвасе
    this.stage.on('contextmenu', (e) => e.evt.preventDefault());
  }

  // Полная перерисовка склада по модели
  renderWarehouse(warehouse: Warehouse): void {
    // Удаляем все старые фигуры с слоя
    this.layer.destroyChildren();

    // Блок с нераспределёнными паллетами
    const poolRect = new Konva.Rect({
      x: 20,
      y: 20,
      width: 220,
      height: 50,
      fill: '#f5f5f5',
      stroke: 'gray',
      strokeWidth: 1,
    });

    const poolLabel = new Konva.Text({
      x: 30,
      y: 30,
      text: 'Нераспределённые паллеты',
      fontSize: 14,
      fontFamily: 'Arial',
      fill: 'black',
    });

    const poolCount = new Konva.Text({
      x: 120,
      y: 45,
      text: String(warehouse.unassignedPallets),
      fontSize: 20,
      fontFamily: 'Arial',
      fill: 'red',
      align: 'right',
    });

    this.layer.add(poolRect, poolLabel, poolCount);

    warehouse.zones.forEach((zone) => {
      this.renderZone(zone);
    });

    this.layer.draw();
  }

  // Подбор цвета по проценту загрузки стеллажа
  getFillByShelfLoad(shelf: Shelf): string {
    const { currentPallets, maxCapacity } = shelf;
    const ratio = maxCapacity > 0 ? currentPallets / maxCapacity : 0;

    // по проекту:
    // < 50%: зелёный
    // 50–80%: жёлтый
    // 80–95%: оранжевый
    // > 95%: красный
    if (ratio < 0.5) {
      return '#81c784'; // зелёный
    }
    if (ratio < 0.8) {
      return '#ffeb3b'; // жёлтый
    }
    if (ratio < 0.95) {
      return '#ffb74d'; // оранжевый
    }
    return '#e57373'; // красный
  }

  renderZone(zone: Zone): void {
    if (zone.shelves.length === 0) {
      return;
    }

    const padding = 20;
    const minX = Math.min(...zone.shelves.map((s) => s.x));
    const maxX = Math.max(...zone.shelves.map((s) => s.x + s.width));
    const minY = Math.min(...zone.shelves.map((s) => s.y));
    const maxY = Math.max(...zone.shelves.map((s) => s.y + s.height));

    const zoneRect = new Konva.Rect({
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
      fill: zone.color,
      opacity: 0.3,
      cornerRadius: 8,
      listening: false,
    });

    const zoneLabel = new Konva.Text({
      x: minX - padding + 8,
      y: minY - padding + 4,
      text: zone.name,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#333',
    });

    this.layer.add(zoneRect, zoneLabel);

    zone.shelves.forEach((shelf) => {
      const fill = this.getFillByShelfLoad(shelf);

      const rect = new Konva.Rect({
        x: shelf.x,
        y: shelf.y,
        width: shelf.width,
        height: shelf.height,
        fill,
        stroke: 'black',
        strokeWidth: 1,
      });

      // Интерактивность: левый клик — добавить, правый — убрать паллету
      rect.on('click', (e) => {
        if (e.evt.button === 2) {
          e.evt.preventDefault();
          if (this.onShelfRightClick) {
            this.onShelfRightClick(shelf.id);
          }
        } else if (e.evt.button === 0) {
          if (this.onShelfLeftClick) {
            this.onShelfLeftClick(shelf.id);
          }
        }
      });

      this.layer.add(rect);
    });
  }

  destroy(): void {
    this.stage.destroy();
  }
}
