<script setup lang="ts">
import { useWarehouseCanvas } from '../../composables/useWarehouseCanvas';

// Берём containerRef из composable, чтобы он создавал/уничтожал Konva-движок
const { containerRef, selectedZoneInfo, selectedShelfInfo } = useWarehouseCanvas();
</script>

<template>
  <div class="warehouse">
    <h1 class="warehouse__title">Склад</h1>
    <div class="warehouse__wrapper">
      <div class="warehouse__documentation">
        <h2 class="warehouse__info-title">Документация</h2>
        <p><strong>Взаимодействие с зоной и стеллажами:</strong></p>
        <ul>
          <li>
            <strong>Клик по названию зоны</strong> (например, «Зона A», «Зона B») — справа
            отображается информация по <strong>зоне целиком</strong>: общее количество паллет
            в зоне, максимальная вместимость и процент заполненности.
          </li>
          <li>
            <strong>Клик по названию стеллажа</strong> под прямоугольником (например,
            «Стеллаж A-1») — справа показывается информация по <strong>конкретному стеллажу</strong>
            (паллета на стеллаже) и одновременно по его зоне (суммарные паллеты и процент).
          </li>
          <li>
            <strong>Левый клик по прямоугольнику стеллажа</strong> — добавить паллету
            на стеллаж (если есть нераспределённые паллеты и стеллаж ещё не достиг
            максимальной вместимости).
          </li>
          <li>
            <strong>Правый клик по прямоугольнику стеллажа</strong> — снять паллету
            со стеллажа и вернуть её в пул нераспределённых паллет (пока на стеллаже есть паллеты).
          </li>
        </ul>

        <p><strong>Цветовое кодирование стеллажей (по проценту заполнения):</strong></p>
        <ul>
          <li><span style="color: #81c784; font-weight: 600;">Зелёный</span> — заполненность &lt; 50% (свободно).</li>
          <li><span style="color: #ffeb3b; font-weight: 600;">Жёлтый</span> — 50–80% (средняя загрузка).</li>
          <li><span style="color: #ffb74d; font-weight: 600;">Оранжевый</span> — 80–95% (почти заполнено).</li>
          <li><span style="color: #e57373; font-weight: 600;">Красный</span> — &gt; 95% (переполнено).</li>
        </ul>
      </div>
      <div ref="containerRef" class="warehouse__container"></div>
    <div class="warehouse__info">
      <div v-if="selectedZoneInfo" class="warehouse__zone-info">
        <h2 class="warehouse__info-title">{{ selectedZoneInfo.zoneName }}</h2>
        <div>Паллет по зоне: {{ selectedZoneInfo.zoneCurrentPallets }} / {{ selectedZoneInfo.zoneMaxCapacity }}</div>
        <div>Заполненность зоны: {{ selectedZoneInfo.zoneFillPercent }}%</div>
      </div>
      <div v-if="selectedShelfInfo" class="warehouse__shelf-info">
        <h2 class="warehouse__info-title">{{ selectedShelfInfo.zoneName }} — {{ selectedShelfInfo.shelf.name }}</h2>
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
    grid-template-columns: 300px 1fr 200px;
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
    padding: 10px;
    box-shadow: 0px 0px 2px #929191;
    text-align: left;
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

  &__info-title {
    font-size: 24px;
    font-weight: 500;
    padding: 0;
    margin: 0;
    line-height: 1;
    margin-bottom: 10px;
    margin-top: 50px;
  }
}
</style>
