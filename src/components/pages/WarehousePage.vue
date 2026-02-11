<script setup lang="ts">
import { useWarehouseCanvas } from '../../composables/useWarehouseCanvas';

// Берём containerRef из composable, чтобы он создавал/уничтожал Konva-движок
const { containerRef } = useWarehouseCanvas();
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
    width: 600px;
    height: 60vh;
    padding-right: 4px;
    box-sizing: border-box;
  }
}
</style>
