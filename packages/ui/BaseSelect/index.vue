<template>
  <div
    ref="containerRef"
    class="base-select-container"
    v-click-outside="handleClose"
    :class="[
      `size-${size}`,
      {
        'is-empty': !hasValue,
        'is-disabled': disabled,
        'is-error': error,
        'is-opened': popupVisibleInternal,
        'no-border': !bordered,
        'is-multiple': multiple,
      },
    ]">
    <div class="select-trigger" @click="togglePopup">
      <div v-if="$slots.prefix" class="select-prefix">
        <slot name="prefix"></slot>
      </div>

      <div class="select-content">
        <div
          v-if="multiple && Array.isArray(modelValue) && modelValue.length"
          class="tag-wrapper">
          <span
            v-for="(label, index) in selectedLabels"
            :key="index"
            class="select-tag">
            {{ label }}
            <i
              v-if="!disabled"
              class="close-icon"
              @click.stop="handleRemove(index)"
              >×</i
            >
          </span>
        </div>

        <template
          v-if="!(multiple && Array.isArray(modelValue) && modelValue.length)">
          <span
            v-if="!modelValue && !inputValueInternal"
            class="select-placeholder">
            {{ placeholder }}
          </span>
          <span
            v-else-if="!allowSearch || !popupVisibleInternal"
            class="select-value">
            {{ singleSelectedLabel }}
          </span>
        </template>

        <input
          v-if="allowSearch"
          ref="inputRef"
          v-model="inputValueInternal"
          class="select-search-input"
          :readonly="!popupVisibleInternal"
          :style="{ width: inputWidth }"
          @input="handleSearch"
          @click.stop="popupVisibleInternal = true" />
      </div>

      <div class="select-suffix">
        <div
          v-if="allowClear && hasValue && !disabled"
          class="clear-icon"
          @click.stop="handleClear">
          ×
        </div>

        <div class="arrow-icon">
          <slot name="arrow-icon">
            <span class="default-arrow"></span>
          </slot>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <transition name="slide-fade">
        <div
          v-if="popupVisibleInternal"
          class="select-dropdown portal-dropdown"
          :style="dropdownStyle">
          <div v-if="$slots.header" class="dropdown-header">
            <slot name="header"></slot>
          </div>

          <div class="dropdown-list-wrapper">
            <ul class="dropdown-list">
              <li
                v-for="opt in filteredOptions"
                :key="String(opt.value)"
                class="dropdown-item"
                :class="{
                  'is-selected': isSelected(opt.value),
                  'is-disabled': opt.disabled,
                }"
                @click.stop="handleSelect(opt)">
                <slot name="option" :data="opt">
                  {{ opt.label }}
                </slot>
              </li>
              <li v-if="filteredOptions.length === 0" class="dropdown-empty">
                <slot name="empty">无匹配数据</slot>
              </li>
            </ul>
          </div>

          <div v-if="$slots.footer" class="dropdown-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted, useAttrs } from 'vue'
import type { BaseSelectProps, SelectOptionData } from './types'

const attrs = useAttrs()

const props = withDefaults(defineProps<BaseSelectProps>(), {
  modelValue: '',
  multiple: false,
  options: () => [],
  size: 'medium',
  placeholder: '请选择',
  disabled: false,
  error: false,
  allowClear: false,
  allowSearch: false,
  bordered: true,
  valueKey: 'value',
  fieldNames: () => ({
    label: 'label',
    value: 'value',
  }),
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'clear',
  'popup-visible-change',
  'search',
])

const popupVisibleInternal = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const inputValueInternal = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const fieldNames = computed(() => {
  const f = props.fieldNames || (attrs['field-names'] as any) || {}
  return {
    label: f.label || 'label',
    value: f.value || 'value',
  }
})

const dropdownStyle = ref({
  position: 'fixed' as const,
  top: '0px',
  left: '0px',
  width: '0px',
  zIndex: 9999,
})

const updatePlacement = () => {
  if (!containerRef.value || !popupVisibleInternal.value) return
  const rect = containerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 9999,
  }
}

const hasValue = computed(() => {
  if (props.multiple)
    return Array.isArray(props.modelValue) && props.modelValue.length > 0
  return (
    props.modelValue !== undefined &&
    props.modelValue !== null &&
    props.modelValue !== ''
  )
})

const processedOptions = computed<SelectOptionData[]>(() => {
  return props.options.map((opt: any) => {
    if (typeof opt !== 'object' || opt === null) {
      return { label: String(opt), value: opt }
    }
    return {
      label: opt[fieldNames.value.label],
      value: opt[fieldNames.value.value],
      raw: opt,
    }
  })
})

const filteredOptions = computed(() => {
  if (!props.allowSearch || !inputValueInternal.value)
    return processedOptions.value
  const keyword = inputValueInternal.value.toLowerCase()
  return processedOptions.value.filter((opt) =>
    opt.label.toLowerCase().includes(keyword),
  )
})

const singleSelectedLabel = computed(() => {
  const target = processedOptions.value.find(
    (o) => o.value === props.modelValue,
  )
  return target ? target.label : props.modelValue
})

const selectedLabels = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return []
  return props.modelValue.map((val) => {
    const target = processedOptions.value.find((o) => o.value === val)
    return target ? target.label : val
  })
})

const inputWidth = computed(() => {
  if (!props.multiple) return '100%'
  return `${inputValueInternal.value.length * 12 + 20}px`
})

const togglePopup = () => {
  if (props.disabled) return
  popupVisibleInternal.value = !popupVisibleInternal.value
  if (popupVisibleInternal.value && props.allowSearch) {
    nextTick(() => inputRef.value?.focus())
  }
}

const handleClose = () => {
  popupVisibleInternal.value = false
  inputValueInternal.value = ''
  emit('popup-visible-change', false)
}

const handleSelect = (opt: SelectOptionData) => {
  if (opt.disabled) return
  if (props.multiple) {
    const newValue = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : []
    const idx = newValue.indexOf(opt.value)
    if (idx > -1) newValue.splice(idx, 1)
    else newValue.push(opt.value)
    emit('update:modelValue', newValue)
    emit('change', newValue)
    inputValueInternal.value = ''
  } else {
    emit('update:modelValue', opt.value)
    emit('change', opt.value)
    popupVisibleInternal.value = false
  }
}

const handleRemove = (index: number) => {
  if (props.disabled || !Array.isArray(props.modelValue)) return
  const newValue = [...props.modelValue]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const handleClear = () => {
  const val = props.multiple ? [] : ''
  emit('update:modelValue', val)
  emit('change', val)
  emit('clear')
}

const handleSearch = () => emit('search', inputValueInternal.value)

const isSelected = (val: any) => {
  if (props.multiple)
    return Array.isArray(props.modelValue) && props.modelValue.includes(val)
  return props.modelValue === val
}

const vClickOutside = {
  mounted(el: any, binding: any) {
    el._clickOutside = (ev: Event) => {
      if (!el.contains(ev.target)) binding.value()
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el._clickOutside)
  },
}

watch(popupVisibleInternal, (val) => {
  emit('popup-visible-change', val)
  if (val) {
    updatePlacement()
    window.addEventListener('scroll', updatePlacement, true)
    window.addEventListener('resize', updatePlacement)
  } else {
    window.removeEventListener('scroll', updatePlacement, true)
    window.removeEventListener('resize', updatePlacement)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePlacement, true)
  window.removeEventListener('resize', updatePlacement)
})
</script>

<style scoped lang="scss">
// 1. 触发器相关样式
.base-select-container {
  position: relative;
  width: 100%;
  font-size: 14px;
  color: $t-1;

  .select-trigger {
    display: flex;
    align-items: center;
    min-height: 36px;
    padding: 0 12px;
    background-color: $bg-3;
    border: 1px solid $b-2;
    border-radius: $radius-m;
    cursor: pointer;
    transition: all 0.2s;
    &:hover:not(.is-disabled) {
      border-color: $p;
    }
  }

  &.is-opened .select-trigger {
    border-color: $p;
    box-shadow: $p-shadow;
    .default-arrow {
      transform: rotate(180deg);
    }
  }

  &.is-error .select-trigger {
    border-color: $danger;
    &:hover {
      border-color: $danger-h;
    }
  }

  .select-content {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 3px 0;
    align-items: center;
    overflow: hidden;
  }

  .select-search-input {
    border: none;
    outline: none;
    background: transparent;
    padding: 0;
    margin: 0;
    color: $t-1;
    font-size: 14px;
    min-width: 4px;
  }

  .select-placeholder {
    color: $t-dis;
    pointer-events: none;
  }
  .select-value {
    color: $t-1;
    pointer-events: none;
  }

  .tag-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .select-tag {
    display: inline-flex;
    align-items: center;
    padding: 0 6px;
    background: $bg-1;
    border: 1px solid $b-1;
    border-radius: $radius-s;
    font-size: 12px;
    color: $p;
    line-height: 20px;
    .close-icon {
      margin-left: 4px;
      cursor: pointer;
      font-style: normal;
      &:hover {
        color: $danger;
      }
    }
  }

  .select-suffix {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 14px;
    margin-left: 8px;
    .clear-icon,
    .arrow-icon {
      line-height: 1;
      transition:
        opacity 0.2s,
        transform 0.2s;
    }
    .clear-icon {
      position: absolute;
      z-index: 3;
      opacity: 0;
      pointer-events: none;
      color: $t-3;
      &:hover {
        color: $danger;
      }
    }
    .arrow-icon {
      opacity: 1;
      display: flex;
      align-items: center;
    }
  }

  .default-arrow {
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid $t-3;
    transition: transform 0.3s;
  }

  &.size-large .select-trigger {
    min-height: 40px;
  }
  &.size-small .select-trigger {
    min-height: 24px;
    font-size: 12px;
  }
  &.no-border .select-trigger {
    border-color: transparent;
  }

  &.is-disabled {
    opacity: 0.7;
    .select-trigger {
      background: $bg-4;
      cursor: not-allowed;
      border-color: $b-1;
    }
  }

  &:hover:not(.is-disabled):not(.is-empty) {
    .clear-icon {
      opacity: 1;
      pointer-events: auto;
    }
    .arrow-icon {
      opacity: 0;
    }
  }
}

// 2. Teleport 下拉面板样式 (注意：由于是 Teleport，必须要能全局匹配或者在外部定义)
// 这里使用 portal-dropdown 作为唯一标识
</style>

<style lang="scss">
/* 注意：这里是非 scoped，确保 Teleport 到 body 的元素能拿到样式 */
.portal-dropdown {
  position: fixed;
  background: var(--bg-3);
  border: 1px solid var(--b-1);
  border-radius: 4px;
  box-shadow: var(--s-2);
  overflow: hidden;
  font-size: 14px;

  .dropdown-list {
    max-height: 250px;
    overflow-y: auto;
    padding: 4px 0;
    margin: 0;
    list-style: none;

    .dropdown-item {
      padding: 8px 12px;
      cursor: pointer;
      color: var(--t-1);
      transition: background 0.2s;

      &:hover:not(.is-disabled) {
        background: var(--bg-h);
      }
      &.is-selected {
        color: var(--p);
        font-weight: 600;
        background: var(--p-light);
      }
      &.is-disabled {
        color: var(--t-dis);
        cursor: not-allowed;
      }
    }
    .dropdown-empty {
      padding: 16px;
      text-align: center;
      color: var(--t-dis);
    }
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
