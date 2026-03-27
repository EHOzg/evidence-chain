<template>
  <form
    class="base-form"
    :class="[
      `base-form-layout-${layout}`,
      `base-form-size-${size}`
    ]"
    @submit.prevent="onSubmit"
  >
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
import { provide, reactive } from 'vue'

defineOptions({ name: 'BaseForm' })

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    layout?: 'horizontal' | 'vertical' | 'inline'
    size?: 'mini' | 'small' | 'medium' | 'large'
    labelColProps?: Record<string, any>
    wrapperColProps?: Record<string, any>
    labelAlign?: 'left' | 'right'
    disabled?: boolean
    rules?: Record<string, any>
    autoLabelWidth?: boolean
  }>(),
  {
    layout: 'horizontal',
    size: 'medium',
    labelAlign: 'right',
    disabled: false,
    autoLabelWidth: false,
  }
)

const emit = defineEmits<{
  (e: 'submit', data: { values: Record<string, any>; errors: Record<string, any> | undefined; event: Event }): void
  (e: 'submitSuccess', values: Record<string, any>): void
  (e: 'submitFailed', data: { values: Record<string, any>; errors: Record<string, any> }): void
}>()

const fields = new Set<any>()
const addField = (field: any) => fields.add(field)
const removeField = (field: any) => fields.delete(field)

const validate = async () => {
  const errors: Record<string, any> = {}
  let hasError = false
  for (const field of fields) {
    const error = await field.validateField()
    if (error) {
      errors[field.field] = error
      hasError = true
    }
  }
  return hasError ? errors : undefined
}

const validateField = async (fieldIds: string | string[]) => {
  const errors: Record<string, any> = {}
  let hasError = false
  const ids = Array.isArray(fieldIds) ? fieldIds : [fieldIds]
  
  for (const field of fields) {
    if (ids.includes(field.field)) {
      const error = await field.validateField()
      if (error) {
        errors[field.field] = error
        hasError = true
      }
    }
  }
  return hasError ? errors : undefined
}

const clearValidate = (fieldIds?: string | string[]) => {
  if (!fieldIds) {
    fields.forEach((f) => f.clearValidate())
  } else {
    const ids = Array.isArray(fieldIds) ? fieldIds : [fieldIds]
    fields.forEach((f) => {
      if (ids.includes(f.field)) {
        f.clearValidate()
      }
    })
  }
}

const resetFields = (fieldIds?: string | string[]) => {
  if (!fieldIds) {
    fields.forEach((f) => f.resetField())
  } else {
    const ids = Array.isArray(fieldIds) ? fieldIds : [fieldIds]
    fields.forEach((f) => {
      if (ids.includes(f.field)) {
        f.resetField()
      }
    })
  }
}

const onSubmit = async (e: Event) => {
  const errors = await validate()
  const values = props.model
  
  emit('submit', { values, errors, event: e })
  
  if (!errors) {
    emit('submitSuccess', values)
  } else {
    emit('submitFailed', { values, errors })
  }
}

provide(
  'BaseFormContext',
  reactive({
    model: props.model,
    layout: props.layout,
    size: props.size,
    labelColProps: props.labelColProps,
    wrapperColProps: props.wrapperColProps,
    labelAlign: props.labelAlign,
    disabled: props.disabled,
    rules: props.rules,
    autoLabelWidth: props.autoLabelWidth,
    addField,
    removeField,
  })
)

defineExpose({ validate, validateField, clearValidate, resetFields })
</script>

<style lang="scss">
.base-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.base-form-layout-horizontal {
  .base-form-item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
}

.base-form-layout-vertical {
  .base-form-item {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
}

.base-form-layout-inline {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  
  .base-form-item {
    display: inline-flex;
    margin-right: 16px;
  }
}
</style>
