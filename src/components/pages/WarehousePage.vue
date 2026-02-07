<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Konva from 'konva';

const containerRef = ref<HTMLDivElement | null>(null);
const shelfData = ref({
  id: 1,
  levels: [0, 1, 2],
});

function getFillByPallets(palletCount: number): string {
  if (palletCount === 0) return '#e0e0e0';  // серый — пусто
  if (palletCount === 1) return '#81c784';  // зелёный
  if (palletCount === 2) return '#ffb74d';  // оранжевый
  return '#e57373';  // красный — 3 и больше
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

  const rect = new Konva.Rect({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    fill: 'green',
  });

  layer.add(rect);
  layer.draw();

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
  });

  const topRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: shelfWidth,
    height: levelHeight,
    fill: getFillByPallets(shelfData.value.levels[0]),
  });

  const middleRect = new Konva.Rect({
    x: 0,
    y: levelHeight,
    width: shelfWidth,
    height: levelHeight,
    fill: getFillByPallets(shelfData.value.levels[1]),
  });

  const bottomRect = new Konva.Rect({
    x: 0,
    y: levelHeight * 2,
    width: shelfWidth,
    height: levelHeight,
    fill: getFillByPallets(shelfData.value.levels[2]),
  });

  shelfGroup.add(topRect, middleRect, bottomRect, frameRect);
  layer.add(shelfGroup);
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
