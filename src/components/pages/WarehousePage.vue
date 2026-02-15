<script setup lang="ts">
import { useWarehouseCanvas } from '../../composables/useWarehouseCanvas';

// Берём containerRef из composable, чтобы он создавал/уничтожал Konva-движок
const { containerRef, selectedZoneInfo, selectedShelfInfo } = useWarehouseCanvas();
</script>

<template>
  <div class="warehouse">
    <h1>Склад</h1>
    <div ref="containerRef" class="warehouse__container"></div>
    <div v-if="selectedZoneInfo" class="warehouse__zone-info">
      <h2>{{ selectedZoneInfo.zoneName }}</h2>
      <div>Паллет по зоне: {{ selectedZoneInfo.zoneCurrentPallets }} / {{ selectedZoneInfo.zoneMaxCapacity }}</div>
      <div>Заполненность зоны: {{ selectedZoneInfo.zoneFillPercent }}%</div>
    </div>
    <div v-if="selectedShelfInfo" class="warehouse__shelf-info">
      <h2>{{ selectedShelfInfo.zoneName }} — {{ selectedShelfInfo.shelf.name }}</h2>
      <div>На стеллаже: {{ selectedShelfInfo.shelf.currentPallets }} / {{ selectedShelfInfo.shelf.maxCapacity }} паллет</div>
      <div>По зоне: {{ selectedShelfInfo.zoneCurrentPallets }} / {{ selectedShelfInfo.zoneMaxCapacity }} паллет</div>
      <div>Заполненность зоны: {{ selectedShelfInfo.zoneFillPercent }}%</div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.warehouse {

  &__container {
    width: 600px;
    height: 50vh;
    padding-right: 4px;
    box-sizing: border-box;
  }
}
</style>
