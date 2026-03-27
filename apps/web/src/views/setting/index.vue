<template>
  <div class="setting-container">
    <div class="setting-card">
      <h3>界面设置</h3>

      <div class="setting-item">
        <div class="label-group">
          <span class="title">深色模式</span>
          <span class="desc">调整系统整体显示风格</span>
        </div>
        <BaseSwitch
          :model-value="themeStore.mode === 'dark'"
          @change="toggleDarkMode" />
      </div>

      <div class="setting-item">
        <div class="label-group">
          <span class="title">系统主题色</span>
          <span class="desc">当前：{{ currentThemeName }}</span>
        </div>
        <BaseButton @click="themeVisible = true">
          <template #prefix>
            <svg-icon icon-class="setting-skin" />
          </template>
          切换传统色
        </BaseButton>
      </div>
    </div>

    <ThemeModal v-model:visible="themeVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeStore } from '@project/store'
import ThemeModal from '@/views/global/modal/theme/index.vue'
import chineseColors from '@project/assets/styles/chinese-traditional-colors.json'

const themeStore = useThemeStore()
const themeVisible = ref(false)

const currentThemeName = computed(() => {
  const found = chineseColors.colors.find(
    (c) => c.hex.toLowerCase() === themeStore.primaryColor.toLowerCase(),
  )
  return found ? found.name : '自定义'
})

const toggleDarkMode = () => {
  const newMode = themeStore.mode === 'light' ? 'dark' : 'light'
  themeStore.applyTheme(themeStore.primaryColor, newMode)
}
</script>

<style scoped lang="scss">
/* 沿用你之前的布局，但使用系统变量增强对比度 */
.setting-container {
  padding: 40px;
  background: $bg-1;
  height: 100%;
}
.setting-card {
  background: $bg-3;
  padding: 32px;
  border-radius: $radius-l;
  border: 1px solid $b-1;
  box-shadow: $s-1;
  max-width: 640px;
  margin: 0 auto;

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 0;
    border-bottom: 1px solid $b-1;

    .label-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .title {
        font-weight: 600;
        color: $t-1;
      }
      .desc {
        font-size: 12px;
        color: $t-3;
      }
    }
  }
}
</style>
