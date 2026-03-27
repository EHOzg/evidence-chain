<template>
  <label
    class="base-checkbox"
    :class="{
      'is-checked': isChecked,
      'is-disabled': isDisabled,
      'is-indeterminate': indeterminate,
    }">
    <input
      type="checkbox"
      class="base-checkbox-input"
      :checked="isChecked"
      :disabled="isDisabled"
      @change="handleChange" />

    <span class="base-checkbox-inner">
      <slot name="checkbox" :checked="isChecked" :disabled="isDisabled">
        <svg
          v-if="indeterminate"
          class="icon-indeterminate"
          viewBox="0 0 1024 1024">
          <path d="M128 448h768v128H128z" fill="currentColor" />
        </svg>
        <svg v-else class="icon-check" viewBox="0 0 1024 1024">
          <path
            d="M382.2 822.4L123.4 563.6l60.4-60.4 198.4 198.4L840.2 263.6l60.4 60.4z"
            fill="currentColor" />
        </svg>
      </slot>
    </span>

    <span v-if="$slots.default" class="base-checkbox-label">
      <slot></slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

defineOptions({ name: 'BaseCheckbox' })

const props = withDefaults(
  defineProps<{
    modelValue?: boolean | Array<any>
    defaultChecked?: boolean
    value?: string | number | boolean
    disabled?: boolean
    indeterminate?: boolean
  }>(),
  {
    defaultChecked: false,
    disabled: false,
    indeterminate: false,
  },
)

const emit = defineEmits(['update:modelValue', 'change'])

// 注入 Group 上下文
const group = inject<any>('checkboxGroup', null)

// 状态计算
const isChecked = computed(() => {
  if (group) {
    return group.modelValue.includes(props.value)
  }
  return props.modelValue !== undefined
    ? !!props.modelValue
    : props.defaultChecked
})

const isDisabled = computed(() => group?.disabled || props.disabled)

const handleChange = (ev: Event) => {
  if (isDisabled.value) return
  const target = ev.target as HTMLInputElement
  const checked = target.checked

  if (group) {
    group.toggle(props.value, checked, ev)
  } else {
    emit('update:modelValue', checked)
    emit('change', checked, ev)
  }
}
</script>

<style scoped lang="scss">
.base-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: $t-1;
  transition: all 0.2s;

  // 隐藏原生 input
  &-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }

  &-inner {
    position: relative;
    width: 16px;
    height: 16px;
    background: $bg-3;
    border: 1px solid $b-2;
    border-radius: $radius-s;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46);

    svg {
      width: 10px;
      height: 10px;
      transform: scale(0);
      transition: transform 0.2s ease-in-out;
    }
  }

  // 选中状态
  &.is-checked,
  &.is-indeterminate {
    .base-checkbox-inner {
      background: $p;
      border-color: $p;
      color: $t-w;
      svg {
        transform: scale(1);
      }
    }
  }

  // 禁用状态
  &.is-disabled {
    cursor: not-allowed;
    color: $t-dis;
    .base-checkbox-inner {
      background: $bg-4;
      border-color: $b-1;
      color: $t-dis;
    }
  }

  &:hover:not(.is-disabled) {
    .base-checkbox-inner {
      border-color: $p;
    }
  }
}
</style>
