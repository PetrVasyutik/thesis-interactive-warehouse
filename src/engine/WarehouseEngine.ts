import Konva from 'konva';
import type { Warehouse, Shelf, Zone } from '../models/warehouse';

// Отвечает только за работу с Konva (Stage/Layer/Shapes), без бизнес-логики
export class WarehouseEngine {
  stage: Konva.Stage;
  layer: Konva.Layer;

  _isPanning = false;
  _pointerStart = { x: 0, y: 0 };
  _layerStart = { x: 0, y: 0 };

  // Коллбеки: по зоне — инфо по зоне, по стеллажу — инфо по стеллажу + добавить/убрать паллету
  onZoneSelect: ((zoneId: number) => void) | null = null;
  onShelfSelect: ((shelfId: number) => void) | null = null;
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

    this.setupPanning();
  }

  setupPanning(): void {
    const stage = this.stage;
    const layer = this.layer;
    const container = stage.container();

    stage.on('mousedown', (e) => {
      const target: Konva.Node = e.target;
      const isEmptyArea =
        target === stage || target === layer;
      const isMiddleButton = e.evt.button === 1;
      if (!isEmptyArea && !isMiddleButton) {
        return;
      }
      if (isMiddleButton) {
        e.evt.preventDefault();
      }
      const pos = stage.getPointerPosition();
      if (!pos) {
        return;
      }
      this._isPanning = true;
      this._pointerStart = { x: pos.x, y: pos.y };
      this._layerStart = { x: layer.x(), y: layer.y() };
      container.style.cursor = 'grabbing';
    });

    stage.on('mousemove', (e) => {
      if (this._isPanning) {
        const pos = stage.getPointerPosition();
        if (!pos) {
          return;
        }
        const dx = pos.x - this._pointerStart.x;
        const dy = pos.y - this._pointerStart.y;
        layer.position({
          x: this._layerStart.x + dx,
          y: this._layerStart.y + dy,
        });
        layer.batchDraw();
        return;
      }
      const target: Konva.Node = e.target;
      const isEmptyArea = target === stage || target === layer;
      container.style.cursor = isEmptyArea ? 'grab' : 'default';
    });

    const stopPanning = () => {
      if (this._isPanning) {
        this._isPanning = false;
        container.style.cursor = 'default';
      }
    };

    stage.on('mouseup', stopPanning);
    stage.on('mouseleave', stopPanning);
  }

  // Полная перерисовка склада по модели
  renderWarehouse(warehouse: Warehouse): void {
    // Удаляем все старые фигуры с слоя
    this.layer.destroyChildren();

    // Подписи блоков (колонок) над группами зон
    const blocks = new Map<
      string,
      { minX: number; maxX: number; minY: number }
    >();

    warehouse.zones.forEach((zone) => {
      if (zone.shelves.length === 0) {
        return;
      }
      const minX = Math.min(...zone.shelves.map((s) => s.x));
      const maxX = Math.max(...zone.shelves.map((s) => s.x + s.width));
      const minY = Math.min(...zone.shelves.map((s) => s.y));

      const block = blocks.get(zone.blockName);
      if (!block) {
        blocks.set(zone.blockName, { minX, maxX, minY });
      } else {
        block.minX = Math.min(block.minX, minX);
        block.maxX = Math.max(block.maxX, maxX);
        block.minY = Math.min(block.minY, minY);
      }
    });

    blocks.forEach((bounds, blockName) => {
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const labelY = bounds.minY - 40;

      const blockLabel = new Konva.Text({
        x: centerX,
        y: labelY,
        text: blockName,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#333',
        align: 'center',
      });
      // Центруем текст по X
      blockLabel.offsetX(blockLabel.width() / 2);

      this.layer.add(blockLabel);
    });

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
      y: minY - padding + 2,
      text: zone.name,
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#333',
      listening: true,
    });

    zoneLabel.on('click', () => {
      if (this.onZoneSelect) {
        this.onZoneSelect(zone.id);
      }
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

      // Клик по прямоугольнику — только добавить/убрать паллету (инфо по стеллажу — по клику на подпись)
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

      // Подпись под стеллажом по центру; клик по подписи — показать инфо по стеллажу
      const shelfLabel = new Konva.Text({
        x: shelf.x,
        y: shelf.y + shelf.height + 5,
        width: shelf.width,
        text: shelf.name,
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#333',
        align: 'center',
        listening: true,
      });

      shelfLabel.on('click', () => {
        if (this.onShelfSelect) {
          this.onShelfSelect(shelf.id);
        }
      });

      this.layer.add(rect, shelfLabel);
    });
  }

  destroy(): void {
    this.stage.destroy();
  }
}
