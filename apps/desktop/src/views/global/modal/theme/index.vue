<template>
  <BaseModal
    v-model:visible="visible"
    title="中国传统色"
    :width="720"
    :footer="false"
    @open="scrollToActive">
    <div class="theme-toolbar">
      <div class="left-section">
        <div class="current-info" @click="scrollToActive">
          当前色彩：<span :style="{ color: themeStore.primaryColor }">
            {{ currentName }}
            <svg-icon icon-class="theme-location" />
          </span>
        </div>
        <div class="count-tips">
          共收录 {{ chineseColors.colors.length }} 种传统色
        </div>
      </div>
      <div class="right-actions">
        <BaseButton variant="outline" size="small" @click="handleReset">
          <template #prefix> <svg-icon icon-class="reset" /> </template>
          恢复默认
        </BaseButton>
      </div>
    </div>

    <div class="color-grid" ref="gridRef">
      <div
        v-for="color in chineseColors.colors"
        :key="color.hex"
        class="color-card"
        :class="{
          'is-active': isCurrent(color.hex),
        }"
        :ref="
          (el) => {
            if (isCurrent(color.hex)) activeItemRef = el
          }
        "
        @click="handleSelectColor(color.hex, color.name)">
        <div class="color-swatch" :style="{ backgroundColor: color.hex }">
          <div class="swatch-overlay">
            <div class="swatch-text">
              <span class="color-hex">{{ color.hex }}</span>
              <p class="color-desc-mini">{{ color.colorDesc }}</p>
            </div>
          </div>
        </div>

        <div class="color-info">
          <div class="name-row">
            <span class="color-name">{{ color.name }}</span>
            <span v-if="isCurrent(color.hex)" class="active-dot"></span>
          </div>
          <div class="color-rgb">RGB: {{ color.rgb }}</div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useThemeStore } from '@project/store'
import { BaseMessage } from '@project/ui'
import chineseColors from '@project/assets/styles/chinese-traditional-colors.json'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['update:visible'])

const themeStore = useThemeStore()
const activeItemRef = ref<any>(null) // 用于存储当前激活项的 DOM 节点

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

// 提取判断逻辑，保持简洁
const isCurrent = (hex: string) =>
  themeStore.primaryColor.toLowerCase() === hex.toLowerCase()

const currentName = computed(() => {
  const found = chineseColors.colors.find((c) => isCurrent(c.hex))
  return found ? found.name : '自定义颜色'
})

const scrollToActive = () => {
  nextTick(() => {
    if (activeItemRef.value) {
      activeItemRef.value.scrollIntoView({
        behavior: 'smooth', // 平滑滚动
        block: 'center', // 将元素滚动到容器中心，视觉最舒适
      })
    }
  })
}

const handleSelectColor = (hex: string, name: string) => {
  themeStore.applyTheme(hex)
  BaseMessage.success(`已切换至：${name}`)
}

const handleReset = () => {
  themeStore.resetDefaultTheme()
  BaseMessage.success('已恢复系统默认主题')
  // scrollToActive()
}
</script>

<style scoped lang="scss">
.theme-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;

  .left-section {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .current-info {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 600;
      color: $t-1;
      cursor: pointer;

      span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .count-tips {
    font-size: 12px;
    color: $t-3;
  }
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 16px;
  max-height: 520px;
  overflow-y: auto;
  padding: 4px;
  scroll-behavior: smooth;
}

.color-card {
  position: relative;
  background: $bg-3;
  border: 1px solid $b-1;
  border-radius: $radius-m;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $s-2;
    border-color: $p;
  }

  &.is-active {
    border-color: $p;
    border-width: 2px;
    box-shadow: $s-1;
    // 选中时稍微压低一点
    transform: translateY(0);
  }

  .color-swatch {
    height: 70px;
    position: relative;

    .swatch-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5); // 稍深一点，确保文字清晰
      padding: 10px;
      opacity: 0;
      transition: opacity 0.3s;
      text-align: center;
    }

    .swatch-text {
      .color-hex {
        display: block;
        color: $t-w;
        font-size: 12px;
        font-family: monospace;
        margin-bottom: 4px;
      }
      .color-desc-mini {
        color: rgba(255, 255, 255, 0.85);
        font-size: 10px;
        margin: 0;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  &:hover .swatch-overlay {
    opacity: 1;
  }

  .color-info {
    padding: 10px;
    .name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .color-name {
      font-size: 14px;
      font-weight: 600;
      color: $t-1;
    }
    .active-dot {
      width: 6px;
      height: 6px;
      background: $p;
      border-radius: 50%;
    }
    .color-rgb {
      font-size: 10px;
      color: $t-3;
      margin-top: 2px;
    }
  }
}
</style>
