<template>
  <div
    class="base-switch"
    :class="[
      `size-${size}`,
      {
        'is-checked': isChecked,
        'is-disabled': disabled,
        'is-loading': loading,
      },
    ]"
    @click="handleToggle">
    <div class="switch-inner">
      <!-- Loading 旋转指示器 -->
      <span v-if="loading" class="switch-loading-spinner"></span>
      <div v-else class="switch-dot">
        <slot name="icon" :checked="isChecked"></slot>
      </div>
    </div>
    <!-- 文字标签（可选）-->
    <span v-if="checkedText || uncheckedText" class="switch-text">
      {{ isChecked ? checkedText : uncheckedText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'BaseSwitch' })

const props = withDefaults(
  defineProps<{
    modelValue?: any
    disabled?: boolean
    loading?: boolean
    size?: 'small' | 'medium' | 'large'
    checkedValue?: any
    uncheckedValue?: any
    checkedText?: string
    uncheckedText?: string
  }>(),
  {
    disabled: false,
    loading: false,
    size: 'medium',
    checkedValue: true,
    uncheckedValue: false,
  }
)

const emit = defineEmits(['update:modelValue', 'change'])

const isChecked = computed(() => props.modelValue === props.checkedValue)

const handleToggle = () => {
  if (props.disabled || props.loading) return
  const newVal = isChecked.value ? props.uncheckedValue : props.checkedValue
  emit('update:modelValue', newVal)
  emit('change', newVal)
}
</script>

<style scoped lang="scss">
.base-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;

  // --- 内轨道 ---
  .switch-inner {
    position: relative;
    display: flex;
    align-items: center;
    background-color: $f-2;
    border-radius: $radius-full;
    transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  // --- 滑块圆点 ---
  .switch-dot {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: $t-w;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // --- Loading 旋转 ---
  .switch-loading-spinner {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-top-color: #fff;
    animation: spin 0.6s linear infinite;
  }

  // --- 文字标签 ---
  .switch-text {
    font-size: 14px;
    color: $t-2;
    transition: color 0.2s;
  }

  // --- 尺寸配置 ---
  &.size-small {
    .switch-inner {
      width: 34px;
      height: 18px;
    }
    .switch-dot {
      width: 14px;
      height: 14px;
      left: 2px;
    }
    .switch-loading-spinner {
      width: 14px;
      height: 14px;
      left: 2px;
    }
  }

  &.size-medium {
    .switch-inner {
      width: 44px;
      height: 22px;
    }
    .switch-dot {
      width: 18px;
      height: 18px;
      left: 2px;
    }
    .switch-loading-spinner {
      width: 18px;
      height: 18px;
      left: 2px;
    }
  }

  &.size-large {
    .switch-inner {
      width: 56px;
      height: 28px;
    }
    .switch-dot {
      width: 22px;
      height: 22px;
      left: 3px;
    }
    .switch-loading-spinner {
      width: 22px;
      height: 22px;
      left: 3px;
    }
  }

  // --- 选中状态 ---
  &.is-checked {
    .switch-inner {
      background-color: $p;
    }
    .switch-text { color: $p; }

    &.size-small .switch-dot  { left: calc(34px - 14px - 2px); }
    &.size-medium .switch-dot { left: calc(44px - 18px - 2px); }
    &.size-large .switch-dot  { left: calc(56px - 22px - 3px); }

    &.size-small .switch-loading-spinner  { left: calc(34px - 14px - 2px); }
    &.size-medium .switch-loading-spinner { left: calc(44px - 18px - 2px); }
    &.size-large .switch-loading-spinner  { left: calc(56px - 22px - 3px); }
  }

  // --- 禁用状态 ---
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  // --- Loading ---
  &.is-loading {
    cursor: wait;
    opacity: 0.8;
  }

  // --- 悬浮反馈 ---
  &:hover:not(.is-disabled):not(.is-loading) {
    .switch-inner {
      filter: brightness(1.08);
    }
  }

  &:active:not(.is-disabled):not(.is-loading) {
    // 按压时滑块拉伸
    &.size-small .switch-dot  { width: 18px; }
    &.size-medium .switch-dot { width: 22px; }
    &.size-large .switch-dot  { width: 26px; }
  }
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}
</style>
