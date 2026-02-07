<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Konva from 'konva';

const containerRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const container = containerRef.value;
  if (!container) return;

  const width = container.offsetWidth;
  const height = container.offsetHeight || 400;

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
  layer.draw()
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
    width: 100%;
    height: 60vh;
  }
}
</style>
