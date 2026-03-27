<template>
  <div
    v-if="lazy ? activeTab === name : true"
    v-show="activeTab === name"
    class="base-tab-pane">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { inject, type ComputedRef } from 'vue'

defineOptions({
  name: 'BaseTabPane',
})

const props = withDefaults(
  defineProps<{
    label: string
    name: string | number
    disabled?: boolean
    lazy?: boolean
  }>(),
  {
    disabled: false,
    lazy: false,
  },
)

const activeTab = inject<ComputedRef<string | number>>('activeTab')
</script>

<style scoped lang="scss">
.base-tab-pane {
  /* 基础布局 */
  width: 100%;
  min-height: 0; // 防止 flex 布局下的溢出问题

  /* 文字规范 */
  color: $t-1; // 默认使用一级正文色
  font-size: 14px;
  line-height: 1.6; // 稍微加大的行高，提升阅读舒适度

  /* 渲染优化 */
  outline: none;
  background-color: transparent; // 保持透明，由外层容器决定底色

  // 如果内部有图片或大段文字，确保换行逻辑正确
  word-break: break-word;
}

/* ==========================================
   动画支持 (由父组件 BaseTabs 控制)
   ========================================== */
.v-enter-active,
.v-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-enter-from {
  opacity: 0;
  transform: translateY(4px); // 微弱的升起感
}

.v-leave-to {
  opacity: 0;
}
</style>
