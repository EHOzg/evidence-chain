<template>
  <button
    class="base-button"
    :class="[
      variantClass,
      sizeClass,
      typeClass,
      { 'is-loading': loading },
      { 'is-disabled': disabled || loading },
      { 'is-block': block },
      { 'is-only-icon': isOnlyIcon },
    ]"
    :disabled="disabled || loading"
    @click="handleClick">
    <span v-if="loading" class="loading-spinner"></span>

    <span v-if="$slots.prefix && !loading" class="button-icon is-prefix">
      <slot name="prefix">
        <slot name="icon"></slot>
      </slot>
    </span>

    <span v-if="$slots.default" class="button-content">
      <slot></slot>
    </span>

    <span v-if="$slots.suffix" class="button-icon is-suffix">
      <slot name="suffix">
        <slot name="icon"></slot>
      </slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

defineOptions({ name: 'BaseButton' })

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'text'
    type?: 'default' | 'success' | 'warning' | 'danger' | 'info'
    size?: 'small' | 'medium' | 'large'
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'default',
    size: 'medium',
    loading: false,
    disabled: false,
    block: false,
  },
)

const emit = defineEmits(['click'])
const slots = useSlots()

const isOnlyIcon = computed(() => {
  return !slots.default && (slots.prefix || slots.suffix)
})

// 1. 修复：补全缺失的类名计算属性
const variantClass = computed(() => `variant-${props.variant}`)
const sizeClass = computed(() => `size-${props.size}`)
const typeClass = computed(() => `type-${props.type}`)

const handleClick = (e: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', e)
  }
}
</script>

<style scoped lang="scss">
// 抽取状态处理函数
@mixin apply-type($color, $hover, $bg-alpha: 0.1) {
  &.variant-primary {
    background: $color;
    color: $p-text;
    box-shadow: 0 2px 6px rgba($color, 0.2);
    border: 1px solid transparent;

    &:hover:not(.is-disabled) {
      background: $hover;
      box-shadow: 0 4px 10px rgba($color, 0.3);
      transform: translateY(-1px);
    }
    &:active:not(.is-disabled) {
      background: $color;
      transform: translateY(0);
    }
  }

  &.variant-secondary {
    background: $f-1;
    color: $color;
    border: 1px solid $b-2;
    &:hover:not(.is-disabled) {
      background: rgba($color, 0.05);
      border-color: $color;
    }
  }

  &.variant-outline {
    background: transparent;
    border: 1px solid $color;
    color: $color;
    &:hover:not(.is-disabled) {
      background: rgba($color, $bg-alpha);
      border-color: $hover;
      color: $hover;
    }
  }

  &.variant-text {
    background: transparent;
    border: 1px solid transparent;
    color: $color;
    &:hover:not(.is-disabled) {
      background: rgba($color, $bg-alpha);
      color: $hover;
    }
  }
}

.base-button {
  // 基础布局属性
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  user-select: none;
  white-space: nowrap;
  border-radius: $radius-m;

  &.is-block {
    display: flex;
    width: 100%;
  }

  // 尺寸规范
  &.size-small {
    height: 28px;
    padding: 0 10px;
    font-size: 13px;
  }
  &.size-medium {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
  }
  &.size-large {
    height: 44px;
    padding: 0 24px;
    font-size: 16px;
  }

  .button-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-size: 1.1em; // 图标比文字略大一点，视觉更平衡

    &.is-prefix {
      margin-right: 8px;
    }
    &.is-suffix {
      margin-left: 8px;
    }
  }

  // 纯图标模式下的特殊处理：间距归零
  &.is-only-icon {
    padding: 0;
    aspect-ratio: 1 / 1; // 变成正方形
    .button-icon {
      margin: 0;
    }
  }

  // 针对不同尺寸微调图标间距
  &.size-small {
    height: 28px;
    padding: 0 8px;
    .button-icon {
      font-size: 12px;
      &.is-prefix {
        margin-right: 4px;
      }
      &.is-suffix {
        margin-left: 4px;
      }
    }
  }

  // 默认状态 (品牌色)
  &.type-default {
    @include apply-type($p, $p-hover, 0.05);
  }

  // 语义状态
  &.type-success {
    @include apply-type($success, $success-h, 0.08);
  }
  &.type-warning {
    @include apply-type($warning, $warning-h, 0.08);
  }
  &.type-danger {
    @include apply-type($danger, $danger-h, 0.08);
  }
  &.type-info {
    @include apply-type($info, $info-h, 0.08);
  }

  // 禁用态处理
  &.is-disabled {
    background: $bg-4 !important;
    border-color: $b-1 !important;
    color: $t-dis !important;
    box-shadow: none !important;
    cursor: not-allowed !important;
    transform: none !important;
  }

  // Loading 动画
  .loading-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
