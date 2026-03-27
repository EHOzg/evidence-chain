<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'

const appWindow = getCurrentWindow()
const isMaximized = ref(false)

onMounted(async () => {
  isMaximized.value = await appWindow.isMaximized()
  appWindow.onResized(async () => {
    isMaximized.value = await appWindow.isMaximized()
  })
})

const minimize = () => appWindow.minimize()
const toggleMaximize = () => appWindow.toggleMaximize()
const close = () => appWindow.close()
</script>

<template>
  <div class="window-bar" data-tauri-drag-region @dblclick="toggleMaximize">
    <!-- <div class="window-title" data-tauri-drag-region>
      <span class="title-text">系统登录</span>
    </div> -->

    <div class="window-controls">
      <div class="control-btn" @click="minimize">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect fill="currentColor" width="10" height="1" x="1" y="6" />
        </svg>
      </div>

      <div class="control-btn" @click="toggleMaximize">
        <svg v-if="!isMaximized" width="12" height="12" viewBox="0 0 12 12">
          <rect
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            width="9"
            height="9"
            x="1.5"
            y="1.5" />
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 12 12">
          <path
            fill="none"
            stroke="currentColor"
            d="M3.5,3.5v5h5v-5H3.5z M1.5,1.5v7h1v-1h5v1h1v-7H1.5z" />
        </svg>
      </div>

      <div class="control-btn close-btn" @click="close">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            fill="currentColor"
            d="M11,1.57L10.43,1,6,5.43,1.57,1,1,1.57,5.43,6,1,10.43,1.57,11,6,6.57,10.43,11,11,10.43,6.57,6Z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 窗口栏容器 */
.window-bar {
  height: $h-winbar;
  background: $bg-2; // 使用容器层背景色
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-winbar; // 最高层级
  user-select: none;
  border-bottom: 1px solid $b-1; // 细微分割线
}

/* 窗口控制按钮组 */
.window-controls {
  display: flex;
  height: 100%;
}

/* 单个控制按钮 */
.control-btn {
  width: 44px; // Windows 标准宽度
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $t-2; // 默认次要文字色
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  svg {
    transition: transform 0.1s;
  }

  &:hover {
    background: $bg-h; // 默认悬浮色
    color: $t-1; // 悬浮变深
  }

  &:active {
    background: $bg-s; // 点击反馈
    svg {
      transform: scale(0.9);
    }
  }

  /* 特殊处理关闭按钮 */
  &.close-btn {
    &:hover {
      background: $danger; // 工业标准：关闭按钮悬浮变红
      color: $t-w; // 文字变白
    }
    &:active {
      background: $danger-h; // 点击时颜色加深
    }
  }
}

// --- 下方为你提供的业务组件样式重构 ---

.title {
  color: $t-1;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 24px;
}

.card {
  padding: 24px;
  background: $bg-3; // 顶层卡片背景
  border-radius: $radius-l; // 大圆角
  border: 1px solid $b-1; // 基础边框
  box-shadow: $s-1; // 基础投影
  margin-bottom: 24px;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: $s-2; // 悬浮时提升投影深度
  }
}

.count-btn {
  margin-left: 12px;
  padding: 8px 16px;
  border-radius: $radius-m;
  border: 1px solid $b-2; // 强对照边框
  background: $f-1; // 使用填充色
  color: $t-1;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: $bg-h; // 悬浮反馈
    border-color: $p; // 边框变品牌色
    color: $p; // 文字变品牌色
  }

  &:active {
    background: $bg-s;
    transform: translateY(1px);
  }
}

.desc {
  margin-top: 16px;
  color: $t-2;
  font-size: 14px;

  code {
    background: $p-light; // 使用品牌浅色背景
    color: $p; // 使用品牌主色
    padding: 2px 6px;
    border-radius: $radius-s;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9em;
  }
}

.footer-links {
  color: $t-3; // 辅助文字色
  font-size: 14px;

  a {
    color: $link; // 链接色
    text-decoration: none;
    font-weight: 500;
    padding-bottom: 2px;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;

    &:hover {
      color: $p-hover;
      border-bottom-color: $p-hover; // 优雅的下划线交互
    }
  }
}

.read-the-docs {
  margin-top: 12px;
  color: $t-dis; // 禁用/不重要文字色
  font-size: 13px;
}
</style>
