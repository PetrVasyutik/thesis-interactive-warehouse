<script setup lang="ts">
import { ref } from 'vue';
import { QBtn, QIcon } from 'quasar';
import { useWarehouseCanvas } from '../../composables/useWarehouseCanvas';

// Берём containerRef из composable, чтобы он создавал/уничтожал Konva-движок
const { containerRef, selectedZoneInfo, selectedShelfInfo, blocksSummary, unassignedPallets } =
  useWarehouseCanvas();

const isDocsOpen = ref(false);
</script>

<template>
  <div class="warehouse">
    <h1 class="warehouse__title">Склад</h1>
    <div class="warehouse__wrapper">
      <div class="warehouse__documentation">
        <q-btn
          class="warehouse__docs-toggle"
          flat
          dense
          no-caps
          color="primary"
          @click="isDocsOpen = !isDocsOpen"
        >
          <span>Документация</span>
          <q-icon
            name="keyboard_arrow_right"
            class="warehouse__docs-toggle-icon"
            :class="{ 'warehouse__docs-toggle-icon--open': isDocsOpen }"
          />
        </q-btn>

        <TransitionGroup
          name="warehouse-docs"
          tag="div"
          class="warehouse__documentation-content"
        >
          <div
            v-if="isDocsOpen"
            key="docs-interactions"
            class="warehouse-docs-item"
          >
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
          </div>

          <div
            v-if="isDocsOpen"
            key="docs-pan"
            class="warehouse-docs-item"
          >
            <p><strong>Панорама склада:</strong></p>
            <ul>
              <li>
                <strong>Перетаскивание за пустую область</strong> — зажмите левую кнопку мыши на
                свободном месте карты (не на зоне и не на стеллаже) и тяните: карта склада будет
                двигаться.
              </li>
              <li>
                <strong>Средняя кнопка мыши</strong> (колесо) — можно панорамировать с любой точки:
                зажмите колесо и двигайте мышь.
              </li>
            </ul>
          </div>

          <div
            v-if="isDocsOpen"
            key="docs-colors"
            class="warehouse-docs-item"
          >
            <p><strong>Цветовое кодирование стеллажей (по проценту заполнения):</strong></p>
            <ul>
              <li>
                <span style="color: #81c784; font-weight: 600;">Зелёный</span> — заполненность
                &lt; 50% (свободно).
              </li>
              <li>
                <span style="color: #ffeb3b; font-weight: 600;">Жёлтый</span> — 50–80% (средняя
                загрузка).
              </li>
              <li>
                <span style="color: #ffb74d; font-weight: 600;">Оранжевый</span> — 80–95% (почти
                заполнено).
              </li>
              <li>
                <span style="color: #e57373; font-weight: 600;">Красный</span> — &gt; 95%
                (переполнено).
              </li>
            </ul>
          </div>
        </TransitionGroup>
      </div>
      <div ref="containerRef" class="warehouse__container"></div>
    <div class="warehouse__info">
      <div class="warehouse__unassigned">
        <h2 class="warehouse__info-title">Нераспределённые паллеты</h2>
        <div class="warehouse__unassigned-count">{{ unassignedPallets }}</div>
      </div>
      <div class="warehouse__blocks-summary">
        <h2 class="warehouse__info-title">Блоки</h2>
        <ul class="warehouse__blocks-list">
          <li
            v-for="block in blocksSummary"
            :key="block.blockName"
            class="warehouse__blocks-item"
          >
            <strong>{{ block.blockName }}</strong>:
            {{ block.currentPallets }} / {{ block.maxCapacity }} паллет
            ({{ block.fillPercent }}%)
          </li>
        </ul>
      </div>
      <div v-if="selectedZoneInfo" class="warehouse__zone-info">
        <h2 class="warehouse__info-title">
          {{ selectedZoneInfo.blockName }} — {{ selectedZoneInfo.zoneName }}
        </h2>
        <div>Паллет по зоне: {{ selectedZoneInfo.zoneCurrentPallets }} / {{ selectedZoneInfo.zoneMaxCapacity }}</div>
        <div>Заполненность зоны: {{ selectedZoneInfo.zoneFillPercent }}%</div>
      </div>
      <div v-if="selectedShelfInfo" class="warehouse__shelf-info">
        <h2 class="warehouse__info-title">
          {{ selectedShelfInfo.blockName }} — {{ selectedShelfInfo.zoneName }} — {{ selectedShelfInfo.shelf.name }}
        </h2>
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
    grid-template-columns: 320px 1fr 200px;
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
    box-shadow: 0px 0px 2px #929191;
    text-align: left;
  }

  &__docs-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 10px;
    font-size: 18px;
    margin-bottom: 20px;
    margin-top: 30px;
  }

  &__docs-toggle-icon {
    transition: transform 0.2s ease;
    display: inline-block;
    transform: rotate(90deg);
  }

  &__docs-toggle-icon--open {
    transform: rotate(-90deg);
  }

  &__documentation-content {
    padding: 0 10px 10px;
  }

  &__container {
    box-sizing: border-box;
    min-width: 1240px;
    height: 60vh;
    border: 2px solid green;
    border-radius: 4px;
    margin: 10px;
  }

  &__info {
    box-sizing: border-box;
    padding: 10px;
    box-shadow: 0px 0px 2px #929191;
  }

  &__info-title {
    font-size: 16px;
    font-weight: 600;
    padding: 0;
    margin: 0;
    line-height: 1;
    margin-bottom: 10px;
    margin-top: 20px;
  }

  &__unassigned {
    margin-bottom: 20px;
    padding: 12px;
    background: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 6px;
    text-align: center;
  }

  &__unassigned-count {
    font-size: 24px;
    font-weight: 600;
    color: #c62828;
  }

  &__blocks-summary {
    margin-bottom: 20px;
    text-align: left;
  }

  &__blocks-list {
    padding-left: 18px;
    margin: 8px 0 0;
  }

  &__blocks-item {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .warehouse-docs-enter-active,
  .warehouse-docs-leave-active {
    transition: all 0.2s ease;
  }

  .warehouse-docs-enter-from,
  .warehouse-docs-leave-to {
    opacity: 0;
    transform: translateX(12px);
  }

  .warehouse__documentation-content
    .warehouse-docs-item.warehouse-docs-enter-active:nth-child(1) {
    transition-delay: 30ms;
  }

  .warehouse__documentation-content
    .warehouse-docs-item.warehouse-docs-enter-active:nth-child(2) {
    transition-delay: 150ms;
  }

  .warehouse__documentation-content
    .warehouse-docs-item.warehouse-docs-enter-active:nth-child(3) {
    transition-delay: 240ms;
  }
}
</style>
