<script setup lang="ts">
import { useWarehouseCanvas } from '../../composables/useWarehouseCanvas';

// Берём containerRef из composable, чтобы он создавал/уничтожал Konva-движок
const { containerRef, selectedZoneInfo, selectedShelfInfo } = useWarehouseCanvas();
</script>

<template>
  <div class="warehouse">
    <h1 class="warehouse__title">Склад</h1>
    <div class="warehouse__wrapper">
      <div class="warehouse__documentation">123</div>
      <div ref="containerRef" class="warehouse__container"></div>
    <div class="warehouse__info">
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
    </div>


  </div>
</template>
<style lang="scss" scoped>
.warehouse {

  &__wrapper {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
  }

  &__title {
    font-size: 36px;
    font-style: italic;
    font-weight: 600;
    padding: 0;
    margin: 0;
    line-height: 1;
    margin-bottom: 20px;
  }

  &__documentation {
    box-sizing: border-box;
    padding: 5px;
    box-shadow: 0px 0px 2px #929191;
  }

  &__container {
    box-sizing: border-box;
    min-width: 1240px;
    height: 60vh;
  }

  &__info {
    box-sizing: border-box;
    padding: 5px;
    box-shadow: 0px 0px 2px #929191;
  }
}
</style>
