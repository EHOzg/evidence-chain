<template>
  <div
    class="base-steps"
    :class="[
      `type-${type}`,
      `dir-${direction}`,
      `label-${labelPlacement}`,
      { 'is-small': small },
    ]">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'

interface StepsProps {
  type?: 'default' | 'arrow' | 'dot' | 'navigation'
  direction?: 'horizontal' | 'vertical'
  labelPlacement?: 'horizontal' | 'vertical'
  current: number
  status?: 'wait' | 'process' | 'finish' | 'error'
  lineLess?: boolean
  small?: boolean
  changeable?: boolean
}

const props = withDefaults(defineProps<StepsProps>(), {
  type: 'default',
  direction: 'horizontal',
  labelPlacement: 'horizontal',
  current: 0,
  status: 'process',
})

const emit = defineEmits(['update:current', 'change'])

// 将 Props 响应式注入给所有子组件 BaseStep
provide('StepsProps', props)

// 提供切换方法
provide('EmitStepChange', (index: number) => {
  emit('update:current', index)
  emit('change', index)
})

defineOptions({ name: 'BaseSteps' })
</script>

<style lang="scss" scoped>
.base-steps {
  display: flex;
  width: 100%;

  &.type-arrow {
    height: 44px; // 稍微收窄一点更美观
    // background-color: $bg-4;
    border-radius: $radius-m;
    overflow: hidden;
    align-items: stretch;

    :deep(.base-step-item) {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 0 10px 0 22px;
      // 使用 clip-path 制作箭头
      clip-path: polygon(
        0% 0%,
        calc(100% - 12px) 0%,
        100% 50%,
        calc(100% - 12px) 100%,
        0% 100%,
        12px 50%
      );

      &:first-child {
        padding-left: 10px;
        clip-path: polygon(
          0% 0%,
          calc(100% - 12px) 0%,
          100% 50%,
          calc(100% - 12px) 100%,
          0% 100%
        );
      }
      &:last-child {
        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 12px 50%);
      }

      // --- 核心颜色逻辑 (直接对应你 Store 里的 P 系列变量) ---

      // 1. 进行中 (当前步) -> 深色渐变
      &.status-process {
        background: $p-grad !important;
        .step-title {
          color: $p-text !important;
          font-weight: 600;
        }
      }

      // 2. 已完成 (上一步) -> 浅色底
      &.status-finish {
        background-color: $p-light !important; // 对应 --p-1
        .step-title {
          color: $p !important;
        }
      }

      // 3. 等待中 (未开始) -> 灰色底
      &.status-wait {
        background-color: $bg-2 !important;
        .step-title {
          color: $t-2 !important;
        }
      }

      // 隐藏圆点和描述
      .step-node-container,
      .step-description {
        display: none;
      }
    }
  }
}
</style>
