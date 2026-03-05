<script setup lang="ts">
import { ref } from 'vue';
import { QBtn, QIcon, QInput } from 'quasar';
import { useWarehouseCanvas } from '../../composables/useWarehouseCanvas';
import { useWarehouseChat } from '@/composables/useWarehouseChat';

// Берём containerRef из composable, чтобы он создавал/уничтожал Konva-движок
const { containerRef, selectedZoneInfo, selectedShelfInfo, blocksSummary, unassignedPallets } =
  useWarehouseCanvas();

const { messages, newMessage, isConnected, sendMessage } = useWarehouseChat();

const isDocsOpen = ref(false);
</script>

<template>
  <div class="warehouse">
    <h1 class="warehouse__title">{{ $t('warehouse.title') }}</h1>
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
          <span>{{ $t('warehouse.docs') }}</span>
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
            <p><strong>{{ $t('warehouse.docsInteractionsTitle') }}</strong></p>
            <ul>
              <li>
                {{ $t('warehouse.docsZoneClick') }}
              </li>
              <li>
                {{ $t('warehouse.docsShelfClick') }}
              </li>
              <li>
                {{ $t('warehouse.docsShelfLeft') }}
              </li>
              <li>
                {{ $t('warehouse.docsShelfRight') }}
              </li>
            </ul>
          </div>

          <div
            v-if="isDocsOpen"
            key="docs-pan"
            class="warehouse-docs-item"
          >
            <p><strong>{{ $t('warehouse.docsPanTitle') }}</strong></p>
            <ul>
              <li>
                {{ $t('warehouse.docsPanEmpty') }}
              </li>
              <li>
                {{ $t('warehouse.docsPanMiddle') }}
              </li>
            </ul>
          </div>

          <div
            v-if="isDocsOpen"
            key="docs-colors"
            class="warehouse-docs-item"
          >
            <p><strong>{{ $t('warehouse.docsColorsTitle') }}</strong></p>
            <ul>
              <li>
                <span style="color: #81c784; font-weight: 600;">{{ $t('warehouse.docsColorGreen').split(' — ')[0] }}</span>
                — {{ $t('warehouse.docsColorGreen').split(' — ')[1] }}
              </li>
              <li>
                <span style="color: #ffeb3b; font-weight: 600;">{{ $t('warehouse.docsColorYellow').split(' — ')[0] }}</span>
                — {{ $t('warehouse.docsColorYellow').split(' — ')[1] }}
              </li>
              <li>
                <span style="color: #ffb74d; font-weight: 600;">{{ $t('warehouse.docsColorOrange').split(' — ')[0] }}</span>
                — {{ $t('warehouse.docsColorOrange').split(' — ')[1] }}
              </li>
              <li>
                <span style="color: #e57373; font-weight: 600;">{{ $t('warehouse.docsColorRed').split(' — ')[0] }}</span>
                — {{ $t('warehouse.docsColorRed').split(' — ')[1] }}
              </li>
            </ul>
          </div>
        </TransitionGroup>
      </div>
      <div ref="containerRef" class="warehouse__container"></div>
    <div class="warehouse__info">
      <div class="warehouse__unassigned">
        <h2 class="warehouse__info-title">{{ $t('warehouse.unassignedTitle') }}</h2>
        <div class="warehouse__unassigned-count">{{ unassignedPallets }}</div>
      </div>
      <div class="warehouse__blocks-summary">
        <h2 class="warehouse__info-title">{{ $t('warehouse.blocksTitle') }}</h2>
        <ul class="warehouse__blocks-list">
          <li
            v-for="block in blocksSummary"
            :key="block.blockName"
            class="warehouse__blocks-item"
          >
            <strong>{{ $t('warehouse.blockLabel', { index: block.blockIndex }) }}</strong>:
            {{ block.currentPallets }} / {{ block.maxCapacity }}
            {{ $t('warehouse.blocksItemPalletWord') }}
            ({{ block.fillPercent }}%)
          </li>
        </ul>
      </div>
      <div v-if="selectedZoneInfo" class="warehouse__zone-info">
        <h2 class="warehouse__info-title">
          {{ $t('warehouse.blockLabel', { index: selectedZoneInfo.blockIndex }) }}
          —
          {{ $t('warehouse.zoneLabel', { index: selectedZoneInfo.zoneId }) }}
        </h2>
        <div>
          {{ $t('warehouse.zonePalletsLabel') }}:
          {{ selectedZoneInfo.zoneCurrentPallets }} /
          {{ selectedZoneInfo.zoneMaxCapacity }}
        </div>
        <div>
          {{ $t('warehouse.zoneFillLabel') }}: {{ selectedZoneInfo.zoneFillPercent }}%
        </div>
      </div>
      <div v-if="selectedShelfInfo" class="warehouse__shelf-info">
        <h2 class="warehouse__info-title">
          {{ $t('warehouse.blockLabel', { index: selectedShelfInfo.blockIndex }) }}
          —
          {{ $t('warehouse.zoneLabel', { index: selectedShelfInfo.zoneId }) }}
          —
          {{ $t('warehouse.shelfLabel', { zone: selectedShelfInfo.zoneId, index: selectedShelfInfo.shelfIndex }) }}
        </h2>
        <div>
          {{ $t('warehouse.shelfOnShelfLabel') }}:
          {{ selectedShelfInfo.shelf.currentPallets }} /
          {{ selectedShelfInfo.shelf.maxCapacity }}
          {{ $t('warehouse.blocksItemPalletWord') }}
        </div>
        <div>
          {{ $t('warehouse.shelfZoneLabel') }}:
          {{ selectedShelfInfo.zoneCurrentPallets }} /
          {{ selectedShelfInfo.zoneMaxCapacity }}
          {{ $t('warehouse.blocksItemPalletWord') }}
        </div>
        <div>
          {{ $t('warehouse.zoneFillLabel') }}: {{ selectedShelfInfo.zoneFillPercent }}%
        </div>
      </div>
    </div>
    </div>
    <div class="warehouse__chat">
        <div class="warehouse__chat-header">
          <h2 class="warehouse__info-title">{{ $t('warehouse.chatTitle') }}</h2>
          <span
            class="warehouse__chat-status"
            :class="{ 'warehouse__chat-status--online': isConnected }"
          >
            {{ isConnected ? 'online' : 'offline' }}
          </span>
        </div>
        <div class="warehouse__chat-messages">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="warehouse__chat-message"
          >
            <div class="warehouse__chat-message-header">
              <span class="warehouse__chat-author">{{ msg.author }}</span>
              <span v-if="msg.role" class="warehouse__chat-role"> — {{ msg.role }}</span>
            </div>
            <div class="warehouse__chat-text">
              {{ msg.text }}
            </div>
          </div>
          <div v-if="messages.length === 0" class="warehouse__chat-empty">
            {{ $t('warehouse.chatEmpty') }}
          </div>
        </div>
        <div class="warehouse__chat-input">
          <q-input
            v-model="newMessage"
            class="warehouse__chat-field"
            dense
            standout
            :placeholder="$t('warehouse.chatPlaceholder')"
            @keyup.enter="sendMessage"
          />
          <q-btn
            color="primary"
            :label="$t('warehouse.chatSend')"
            :disable="!newMessage.trim()"
            class="warehouse__chat-send"
            @click="sendMessage"
          />
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

  &__chat {
    margin-top: 24px;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 600px;
    position: fixed;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
  }

  &__chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__chat-status {
    font-size: 12px;
    color: #999;
  }

  &__chat-status--online {
    color: #2e7d32;
  }

  &__chat-messages {
    max-height: 180px;
    overflow-y: auto;
    padding-right: 4px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__chat-message {
    font-size: 13px;
    line-height: 1.3;
    padding: 4px 6px;
    border-radius: 4px;
    background-color: #fafafa;
  }

  &__chat-message-header {
    font-weight: 600;
    margin-bottom: 2px;
  }

  &__chat-role {
    font-weight: 400;
    color: #666;
  }

  &__chat-text {
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__chat-empty {
    font-size: 12px;
    color: #999;
    font-style: italic;
  }

  &__chat-input {
    display: flex;
    width: 100%;
    align-items: stretch;
    gap: 8px;
    margin-top: 8px;
  }

  &__chat-field {
    flex: 1;
  }

  &__chat-send {
    white-space: nowrap;
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
