<template>
  <div
    class="base-form-item"
    :class="[
      `base-form-item-status-${mergedValidateStatus}`,
      {
        'base-form-item-has-error': mergedValidateStatus === 'error',
        'base-form-item-has-help': !!help,
        'base-form-item-hidden': hidden,
      },
    ]"
    v-show="!hidden">
    <!-- Label Area -->
    <div
      v-if="!hideLabel && (label || $slots.label)"
      class="base-form-item-label-col"
      :class="[
        `base-form-item-label-align-${formCtx?.labelAlign || 'right'}`,
        { 'base-form-item-label-required': isRequired && !hideAsterisk },
      ]"
      :style="labelColStyle">
      <label class="base-form-item-label">
        <slot name="label">{{ label }}</slot>
      </label>
      <span v-if="showColon" class="base-form-item-colon">:</span>
    </div>

    <!-- Wrapper Area -->
    <div class="base-form-item-wrapper-col" :style="wrapperColStyle">
      <div v-if="!noStyle" class="base-form-item-control-wrapper">
        <div
          class="base-form-item-control"
          :class="{ 'is-disabled': isDisabled }">
          <slot></slot>
        </div>
      </div>
      <slot v-else></slot>

      <!-- Error / Help Message -->
      <transition name="base-form-fade">
        <div
          v-if="mergedValidateStatus === 'error'"
          class="base-form-item-message base-form-item-message-error">
          {{ errorMessage }}
        </div>
        <div
          v-else-if="help"
          class="base-form-item-message base-form-item-message-help">
          {{ help }}
        </div>
      </transition>

      <!-- Extra Message -->
      <div v-if="extra" class="base-form-item-extra">
        {{ extra }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, computed, toRaw } from 'vue'

defineOptions({ name: 'BaseFormItem' })

const props = withDefaults(
  defineProps<{
    field?: string
    label?: string
    showColon?: boolean
    noStyle?: boolean
    disabled?: boolean
    help?: string
    extra?: string
    required?: boolean
    rules?: any | any[]
    validateStatus?: 'success' | 'warning' | 'error' | 'validating' | ''
    validateTrigger?: 'change' | 'input' | 'focus' | 'blur' | string[]
    labelColProps?: Record<string, any>
    wrapperColProps?: Record<string, any>
    hideLabel?: boolean
    hideAsterisk?: boolean
    hidden?: boolean
  }>(),
  {
    showColon: false,
    noStyle: false,
    disabled: undefined,
    hideLabel: false,
    hideAsterisk: false,
    hidden: false,
  },
)

const formCtx = inject('BaseFormContext', null) as any

const innerValidateStatus = ref<
  'success' | 'warning' | 'error' | 'validating' | ''
>('')
const errorMessage = ref('')
const initialValue = ref<any>(undefined)

const mergedValidateStatus = computed(() => {
  if (props.validateStatus) return props.validateStatus
  return innerValidateStatus.value
})

const isDisabled = computed(() => {
  if (props.disabled !== undefined) return props.disabled
  return formCtx?.disabled || false
})

const getFieldValue = () => {
  if (!formCtx?.model || !props.field) return undefined
  const paths = props.field.split('.')
  let value = formCtx.model
  for (const key of paths) {
    if (value) value = value[key]
  }
  return value
}

const setFieldValue = (val: any) => {
  if (!formCtx?.model || !props.field) return
  const paths = props.field.split('.')
  const lastKey = paths.pop()!
  let obj = formCtx.model
  for (const key of paths) {
    if (obj[key] === undefined) {
      obj[key] = {}
    }
    obj = obj[key]
  }
  obj[lastKey] = val
}

const mergedRules = computed(() => {
  const formRules = formCtx?.rules?.[props.field || '']
  const itemRules = props.rules
  const rules: any[] = []
  if (formRules) {
    rules.push(...(Array.isArray(formRules) ? formRules : [formRules]))
  }
  if (itemRules) {
    rules.push(...(Array.isArray(itemRules) ? itemRules : [itemRules]))
  }
  return rules
})

const isRequired = computed(() => {
  if (props.required !== undefined) return props.required
  return mergedRules.value.some((r) => r.required)
})

const validateField = async (trigger?: string) => {
  if (!props.field) return null

  const rulesToValidate = mergedRules.value.filter((rule) => {
    if (!trigger || !rule.trigger) return true
    const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger]
    return triggers.includes(trigger)
  })

  if (rulesToValidate.length === 0) return null

  const value = getFieldValue()
  innerValidateStatus.value = 'validating'

  for (const rule of rulesToValidate) {
    if (
      rule.required &&
      (value === undefined || value === null || value === '')
    ) {
      innerValidateStatus.value = 'error'
      errorMessage.value =
        rule.message || `${props.label || props.field} is required`
      return errorMessage.value
    }

    if (rule.match && value) {
      const reg =
        rule.match instanceof RegExp ? rule.match : new RegExp(rule.match)
      if (!reg.test(String(value))) {
        innerValidateStatus.value = 'error'
        errorMessage.value = rule.message || 'Validation failed'
        return errorMessage.value
      }
    }

    if (rule.validator) {
      let errorMsg = ''
      try {
        await rule.validator(value, (msg: string) => {
          if (msg) errorMsg = msg
        })
      } catch (err: any) {
        errorMsg = err.message || 'Validation failed'
      }
      if (errorMsg) {
        innerValidateStatus.value = 'error'
        errorMessage.value = errorMsg
        return errorMsg
      }
    }
  }

  innerValidateStatus.value = 'success'
  errorMessage.value = ''
  return null
}

const clearValidate = () => {
  innerValidateStatus.value = ''
  errorMessage.value = ''
}

const resetField = () => {
  // simple clone to avoid lodash-es import which might cause issues
  try {
    setFieldValue(JSON.parse(JSON.stringify(initialValue.value)))
  } catch (e) {
    setFieldValue(initialValue.value)
  }
  clearValidate()
}

const labelColStyle = computed(() => {
  const colProps = props.labelColProps || formCtx?.labelColProps
  if (!colProps) return {}
  return {
    flex: `0 0 ${colProps.span ? (colProps.span / 24) * 100 + '%' : 'auto'}`,
    width: colProps.span ? (colProps.span / 24) * 100 + '%' : 'auto',
  }
})
const wrapperColStyle = computed(() => {
  const colProps = props.wrapperColProps || formCtx?.wrapperColProps
  if (!colProps) return { flex: '1', minWidth: 0 }
  return {
    flex: `0 0 ${colProps.span ? (colProps.span / 24) * 100 + '%' : 'auto'}`,
    width: colProps.span ? (colProps.span / 24) * 100 + '%' : 'auto',
    minWidth: 0,
  }
})

let fieldInstance: any = null

onMounted(() => {
  if (props.field && formCtx?.model) {
    // simple clone
    try {
      initialValue.value = JSON.parse(JSON.stringify(toRaw(getFieldValue())))
    } catch (e) {
      initialValue.value = toRaw(getFieldValue())
    }
  }
  if (props.field) {
    // 使用 getter 动态跟踪 field 的变化（比如列表项被删除导致 index 改变）
    fieldInstance = {
      get field() {
        return props.field
      },
      validateField,
      clearValidate,
      resetField,
    }
    formCtx?.addField(fieldInstance)
  }
})

onUnmounted(() => {
  if (fieldInstance) {
    formCtx?.removeField(fieldInstance)
  }
})

defineExpose({ validateField, clearValidate, resetField })
</script>

<style lang="scss" scoped>
.base-form-item {
  position: relative;
  display: flex;
  margin-bottom: 20px;
  width: 100%;

  // ── vertical 布局：label 在上，input 在下 ──
  .base-form-layout-vertical & {
    flex-direction: column;
    align-items: stretch;
  }

  .base-form-item-label-col {
    display: flex;
    align-items: center;
    padding-right: 12px;
    line-height: 1.5715;
    white-space: nowrap;

    // vertical 布局时 label 独占一行，左对齐
    .base-form-layout-vertical & {
      padding-right: 0;
      padding-bottom: 6px;
      width: 100% !important;
      justify-content: flex-start !important;
    }

    &.base-form-item-label-align-left {
      justify-content: flex-start;
    }

    &.base-form-item-label-align-right {
      justify-content: flex-end;
    }

    .base-form-item-label {
      color: $t-1;
      font-size: 14px;
    }

    &.base-form-item-label-required::before {
      content: '*';
      color: $danger;
      margin-right: 4px;
      font-family: inherit;
    }

    .base-form-item-colon {
      margin-left: 2px;
    }
  }

  .base-form-item-wrapper-col {
    display: flex;
    flex-direction: column;
    position: relative;
    min-width: 0;

    .base-form-item-control-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      min-height: 32px;
    }

    .base-form-item-control {
      flex: 1;
      width: 100%;
      min-width: 0;

      &.is-disabled {
        opacity: 0.7;
        pointer-events: none;
      }
    }

    .base-form-item-message {
      position: absolute;
      top: 100%;
      left: 0;
      font-size: 12px;
      line-height: 1.5;
      padding-top: 2px;
      z-index: 10;

      &.base-form-item-message-error {
        color: $danger;
      }

      &.base-form-item-message-help {
        color: $t-3;
      }
    }

    .base-form-item-extra {
      font-size: 12px;
      color: $t-3;
      line-height: 1.5;
      padding-top: 2px;
    }
  }

  // Integrate error styles for BaseInput and BaseSelect, if any
  &.base-form-item-has-error {
    :deep(.base-input-wrapper) {
      border-color: $danger !important;
      background-color: rgba(245, 63, 63, 0.04) !important;
    }
    :deep(.base-select-container .select-trigger) {
      border-color: $danger !important;
      background-color: rgba(245, 63, 63, 0.04) !important;
    }
  }
}

// 供Form的不同size调整使用
:deep(.base-form-size-mini) .base-form-item-control-wrapper {
  min-height: 24px;
}
:deep(.base-form-size-small) .base-form-item-control-wrapper {
  min-height: 28px;
}
:deep(.base-form-size-large) .base-form-item-control-wrapper {
  min-height: 36px;
}

.base-form-fade-enter-active,
.base-form-fade-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.34, 0.69, 0.1, 1),
    transform 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
}
.base-form-fade-enter-from,
.base-form-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
