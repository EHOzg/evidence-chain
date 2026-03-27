<template>
  <div
    class="base-step-item"
    :class="[
      statusClass,
      { 'is-disabled': disabled, 'is-changeable': parentProps.changeable },
    ]"
    @click="handleClick">
    <div class="step-node-container" v-if="parentProps.type !== 'arrow'">
      <div class="step-line" v-if="!parentProps.lineLess && index !== 0"></div>
      <div class="step-node">
        <slot name="icon" :step="index! + 1" :status="currentStatus">
          <div class="node-dot" v-if="parentProps.type === 'dot'"></div>
          <span v-else class="node-number">{{ index! + 1 }}</span>
        </slot>
      </div>
    </div>

    <div class="step-content">
      <div class="step-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="step-description">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, getCurrentInstance } from 'vue'

interface StepProps {
  title?: string
  description?: string
  status?: 'wait' | 'process' | 'finish' | 'error'
  disabled?: boolean
  index?: number // 由父组件在渲染时动态注入或标识
}

const props = defineProps<StepProps>()
const parentProps = inject('StepsProps') as any
const emitChange = inject('EmitStepChange') as (index: number) => void

const itemIndex = computed(() => {
  if (props.index !== undefined) return props.index
  const instance = getCurrentInstance()
  return instance?.vnode.key as number // 依赖 :key="index"
})

const currentStatus = computed(() => {
  const n = itemIndex.value
  const curr = parentProps.current
  if (n < curr) return 'finish'
  if (n === curr) return 'process'
  return 'wait'
})

const statusClass = computed(() => `status-${currentStatus.value}`)

const handleClick = () => {
  if (props.disabled || !parentProps.changeable) return
  emitChange(props.index!)
}

defineOptions({ name: 'BaseStep' })
</script>

<style scoped lang="scss">
.base-step-item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;

  // 1. 文字样式
  .step-title {
    font-size: 14px;
    color: $t-1;
    margin-bottom: 4px;
  }
  .step-description {
    font-size: 12px;
    color: $t-dis;
    line-height: 1.4;
  }

  // 2. 节点与连线的基础布局 (Dot/Default 模式)
  .step-node-container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 8px;

    .step-node {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $bg-3;
      border: 2px solid $b-2;
      z-index: 2;
      .node-number {
        font-size: 14px;
        font-weight: 600;
        color: $t-dis;
      }
    }

    .step-line {
      position: absolute;
      top: 50%;
      left: -50%;
      right: 50%;
      height: 2px;
      background: $b-1;
      transform: translateY(-50%);
      z-index: 1;
    }
  }

  // 3. 隔离层：当父组件不是 type="arrow" 时，应用圆圈/Dot的颜色状态
  &:not(.base-steps.type-arrow *) {
    // 进行中
    &.status-process {
      .step-node {
        border-color: $p;
        background: $p;
        box-shadow: 0 0 0 3px rgba($p, 0.2);
        .node-number {
          color: $p-text;
        }
      }
      .step-title {
        color: $p;
        font-weight: 600;
      }
    }
    // 已完成
    &.status-finish {
      .step-node {
        border-color: $p;
        background: $bg-3;
        .node-number {
          color: $p;
        }
      }
      .step-line {
        background: $p;
      }
    }
    // 错误
    &.status-error {
      .step-node {
        border-color: $danger;
        .node-number {
          color: $danger;
        }
      }
      .step-title {
        color: $danger;
      }
    }
  }

  // 4. 可交互态与点击悬浮
  &.is-changeable:not(.is-disabled) {
    cursor: pointer;
    &:hover:not(.base-steps.type-arrow *) {
      .step-title {
        color: $p;
      }
      .step-node {
        border-color: $p-active;
        transform: scale(1.05);
      }
    }
  }
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>
