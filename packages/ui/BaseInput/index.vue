<template>
  <div
    class="base-input-wrapper"
    :class="[
      `size-${size}`,
      {
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-error': status === 'error',
        'is-warning': status === 'warning',
      },
    ]">
    <span v-if="$slots.prefix" class="prefix-icon">
      <slot name="prefix"></slot>
    </span>

    <input
      ref="inputRef"
      class="base-input"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      @change="emit('change', ($event.target as HTMLInputElement).value, $event)" />

    <!-- 清空按钮 -->
    <span
      v-if="clearable && hasValue && !disabled && !readonly"
      class="clear-icon"
      @mousedown.prevent="handleClear">
      ×
    </span>

    <!-- 字数统计 -->
    <span v-if="showWordLimit && maxlength" class="word-limit">
      {{ String(modelValue || '').length }}/{{ maxlength }}
    </span>

    <span v-if="$slots.suffix" class="suffix-icon">
      <slot name="suffix"></slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'

defineOptions({ name: 'BaseInput' })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    placeholder?: string
    type?: string
    disabled?: boolean
    readonly?: boolean
    status?: '' | 'error' | 'warning'
    size?: 'small' | 'medium' | 'large'
    clearable?: boolean
    maxlength?: number
    showWordLimit?: boolean
  }>(),
  {
    size: 'medium',
    clearable: false,
    disabled: false,
    readonly: false,
    showWordLimit: false,
  }
)

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change', 'clear'])

const inputRef = useTemplateRef<HTMLInputElement>('inputRef')

const hasValue = computed(() => {
  const v = props.modelValue
  return v !== undefined && v !== null && v !== ''
})

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  // 清空后聚焦回输入框
  inputRef.value?.focus()
}

defineExpose({ focus: () => inputRef.value?.focus(), blur: () => inputRef.value?.blur() })
</script>

<style scoped lang="scss">
.base-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: $bg-4;
  border: 1px solid $b-2;
  border-radius: $radius-m;

  &:hover:not(.is-disabled):not(.is-readonly) {
    border-color: $t-dis;
    background-color: $bg-3;
  }

  &:focus-within:not(.is-disabled) {
    background-color: $bg-3;
    border-color: $p;
  }

  &.is-disabled {
    background-color: $bg-4;
    border-color: $b-1;
    cursor: not-allowed;
    opacity: 0.7;

    .base-input {
      color: $t-dis;
      cursor: not-allowed;
    }
  }

  &.is-readonly {
    background-color: $bg-4;
    cursor: default;
  }

  &.is-error {
    border-color: $danger !important;
    background-color: rgba($danger, 0.02);

    &:focus-within {
      box-shadow: 0 0 0 3px rgba($danger, 0.1);
    }

    .prefix-icon,
    .suffix-icon {
      color: $danger;
    }
  }

  &.is-warning {
    border-color: $warning !important;
  }

  // 尺寸变体
  &.size-small .base-input {
    height: 28px;
    font-size: 13px;
    padding: 0 8px;
  }

  &.size-medium .base-input {
    height: 36px;
    font-size: 14px;
    padding: 0 12px;
  }

  &.size-large .base-input {
    height: 44px;
    font-size: 15px;
    padding: 0 14px;
  }

  // 有清空按钮时右侧收紧
  &:hover .clear-icon {
    opacity: 1;
    pointer-events: auto;
  }
}

.base-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: none;
  background: transparent;
  outline: none;
  color: $t-1;
  font-size: 14px;
  font-family: inherit;
  line-height: 1;
  min-width: 0;

  &::placeholder {
    color: $t-dis;
  }
}

// 清空图标
.clear-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-right: 6px;
  color: $t-3;
  cursor: pointer;
  font-style: normal;
  font-size: 14px;
  line-height: 1;
  opacity: 0; // 默认隐藏，hover 时显示
  pointer-events: none;
  transition: color 0.2s, opacity 0.2s;

  &:hover {
    color: $danger;
  }
}

// 字数统计
.word-limit {
  font-size: 12px;
  color: $t-dis;
  white-space: nowrap;
  margin-right: 8px;
}

// 插槽图标
.prefix-icon,
.suffix-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  color: $t-3;
  transition: color 0.2s;
  flex-shrink: 0;
}

.base-input-wrapper:focus-within {
  .prefix-icon,
  .suffix-icon {
    color: $p;
  }
}
</style>
