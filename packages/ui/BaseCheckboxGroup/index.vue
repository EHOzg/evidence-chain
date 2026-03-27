<template>
  <div
    class="base-checkbox-group"
    :class="[`is-${direction}`, { 'is-disabled': disabled }]">
    <slot>
      <BaseCheckbox
        v-for="opt in normalizedOptions"
        :key="String(opt.value)"
        :value="opt.value"
        :disabled="opt.disabled || disabled"
        :indeterminate="opt.indeterminate">
        <slot name="label" :data="opt">{{ opt.label }}</slot>
      </BaseCheckbox>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, reactive, toRefs } from 'vue'
import BaseCheckbox from '../BaseCheckbox/index.vue'

defineOptions({ name: 'BaseCheckboxGroup' })

interface CheckboxOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
  indeterminate?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: (string | number | boolean)[]
    defaultValue?: (string | number | boolean)[]
    max?: number
    options?: Array<string | number | CheckboxOption>
    direction?: 'horizontal' | 'vertical'
    disabled?: boolean
  }>(),
  {
    defaultValue: () => [],
    direction: 'horizontal',
    disabled: false,
  },
)

const emit = defineEmits(['update:modelValue', 'change'])

// 标准化 options
const normalizedOptions = computed(() => {
  return (props.options || []).map((opt) => {
    if (typeof opt === 'object') return opt
    return { label: String(opt), value: opt }
  })
})

// 内部状态维护（兼容受控与非受控）
const innerValue = reactive({
  current:
    props.modelValue !== undefined ? props.modelValue : props.defaultValue,
})

// 提供给子组件 Checkbox 的上下文
const groupContext = reactive({
  modelValue: computed(() => props.modelValue ?? innerValue.current),
  disabled: toRefs(props).disabled,
  max: toRefs(props).max,
  toggle: (val: any, checked: boolean, ev: Event) => {
    let newValue = [...groupContext.modelValue]
    if (checked) {
      if (props.max && newValue.length >= props.max) return
      newValue.push(val)
    } else {
      newValue = newValue.filter((item) => item !== val)
    }

    innerValue.current = newValue
    emit('update:modelValue', newValue)
    emit('change', newValue, ev)
  },
})

provide('checkboxGroup', groupContext)
</script>

<style scoped lang="scss">
.base-checkbox-group {
  display: flex;
  gap: 16px;
  &.is-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }
  &.is-vertical {
    flex-direction: column;
  }
}
</style>
