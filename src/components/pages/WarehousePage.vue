<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Konva from 'konva';

const containerRef = ref<HTMLDivElement | null>(null);
const shelfData = ref({
  id: 1,
  levels: [0, 1, 2],
});
const unassignedPallets = ref(10);

function getFillByPallets(palletCount: number): string {
  if (palletCount === 0) return '#e0e0e0';  // серый — пусто
  if (palletCount === 1) return '#81c784';  // зелёный
  if (palletCount === 2) return '#ffb74d';  // оранжевый
  return '#e57373';  // красный — 3
}

onMounted(() => {
  const container = containerRef.value;
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight || 400;

  const stage = new Konva.Stage({
    container,
    width,
    height,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  // Отключаем контекстное меню браузера на канвасе (правый клик обрабатываем через click + button)
  stage.on('contextmenu', (e) => e.evt.preventDefault());

  const shelfGroup = new Konva.Group({
    x: 200,
    y: 50,
  });

  const shelfWidth = 80;
  const shelfHeight = 120;
  const levelHeight = 40;

  const frameRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: shelfWidth,
    height: shelfHeight,
    stroke: 'green',
    strokeWidth: 2,
    listening: false,
  });

  const topRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: shelfWidth,
    height: levelHeight,
    fill: getFillByPallets(shelfData.value.levels[0] ?? 0),
  });

  const middleRect = new Konva.Rect({
    x: 0,
    y: levelHeight,
    width: shelfWidth,
    height: levelHeight,
    fill: getFillByPallets(shelfData.value.levels[1] ?? 0),
  });

  const bottomRect = new Konva.Rect({
    x: 0,
    y: levelHeight * 2,
    width: shelfWidth,
    height: levelHeight,
    fill: getFillByPallets(shelfData.value.levels[2] ?? 0),
  });

  const topHit = new Konva.Rect({
    x: 0,
    y: 0,
    width: shelfWidth,
    height: levelHeight,
    fill: 'transparent',
    listening: true,
  });

  const middleHit = new Konva.Rect({
    x: 0,
    y: levelHeight,
    width: shelfWidth,
    height: levelHeight,
    fill: 'transparent',
    listening: true,
  });

  const bottomHit = new Konva.Rect({
    x: 0,
    y: levelHeight * 2,
    width: shelfWidth,
    height: levelHeight,
    fill: 'transparent',
    listening: true,
  });

  shelfGroup.add(topRect, middleRect, bottomRect, topHit, middleHit, bottomHit, frameRect);
  layer.add(shelfGroup);

  const unassignedRect = new Konva.Rect({
    x: 20,
    y: 0,
    width: 180,
    height: 40,
    fill: '#f5f5f5',
    stroke: 'gray',
    strokeWidth: 1,
  });

  const unassignedText = new Konva.Text({
    x: 30,
    y: 10,
    text: `Нераспределенные паллеты`,
    fontSize: 12,
    fontFamily: 'Arial',
    fill: 'black',
  });

  const unassignedCount = new Konva.Text({
    x: 100,
    y: 22,
    text: String(unassignedPallets.value),
    fontSize: 16,
    fontFamily: 'Arial',
    fill: 'red',
  });

  layer.add(unassignedRect, unassignedText, unassignedCount);

  function updateShelfDisplay() {
    const lvls = shelfData.value.levels;
    const pool = unassignedPallets.value;
    topRect.fill(getFillByPallets(lvls[0] ?? 0));
    middleRect.fill(getFillByPallets(lvls[1] ?? 0));
    bottomRect.fill(getFillByPallets(lvls[2] ?? 0));
    unassignedCount.text(String(pool));
    layer.draw();
  }

  const MAX_PALLETS_PER_LEVEL = 3;

  function addPalletToLevel(levelIndex: number) {
    const pool = unassignedPallets.value;
    const levels = [...shelfData.value.levels];
    const current = levels[levelIndex] ?? 0;
    if (pool <= 0 || current >= MAX_PALLETS_PER_LEVEL) return;
    levels[levelIndex] = current + 1;
    unassignedPallets.value = pool - 1;
    shelfData.value = { ...shelfData.value, levels };
    updateShelfDisplay();
  }

  function removePalletFromLevel(levelIndex: number) {
    const levels = [...shelfData.value.levels];
    const current = levels[levelIndex] ?? 0;
    if (current <= 0) return;
    levels[levelIndex] = current - 1;
    unassignedPallets.value = unassignedPallets.value + 1;
    shelfData.value = { ...shelfData.value, levels };
    updateShelfDisplay();
  }

  // Один обработчик click: различаем кнопку мыши (contextmenu ненадёжен в Konva)
  // button 0 = левый (добавить), button 2 = правый (снять)
  topHit.on('click', (e) => {
    if (e.evt.button === 2) {
      e.evt.preventDefault();
      removePalletFromLevel(0);
    } else if (e.evt.button === 0) {
      addPalletToLevel(0);
    }
  });
  middleHit.on('click', (e) => {
    if (e.evt.button === 2) {
      e.evt.preventDefault();
      removePalletFromLevel(1);
    } else if (e.evt.button === 0) {
      addPalletToLevel(1);
    }
  });
  bottomHit.on('click', (e) => {
    if (e.evt.button === 2) {
      e.evt.preventDefault();
      removePalletFromLevel(2);
    } else if (e.evt.button === 0) {
      addPalletToLevel(2);
    }
  });

  layer.draw();
});
</script>

<template>
  <div class="warehouse">
    <h1>Склад</h1>
    <div ref="containerRef" class="warehouse__container"></div>
  </div>
</template>
<style lang="scss" scoped>
.warehouse {

  &__container {
    width: 400px;
    height: 60vh;
    padding-right: 4px;
    box-sizing: border-box;
  }
}
</style>
