<template>
  <div
    class="base-date-picker"
    :class="[size, { 'is-disabled': disabled, 'is-error': error }]"
    v-click-outside="handleClose">
    <div
      v-if="!hideTrigger"
      class="picker-trigger"
      :class="{ 'is-active': visible }"
      @click="toggleVisible">
      <div class="input-area">
        <template v-if="mode === 'range'">
          <input
            readonly
            :placeholder="uiPlaceholder[0]"
            :value="displayValues[0]" />
          <span class="sep">{{ separator }}</span>
          <input
            readonly
            :placeholder="uiPlaceholder[1]"
            :value="displayValues[1]" />
        </template>
        <template v-else>
          <input
            readonly
            :placeholder="uiPlaceholder[0]"
            :value="displayValues[0]" />
        </template>
      </div>

      <div class="suffix">
        <!-- 悬浮有值时显示 clear，始终显示日历图标作为后缀 (两者互斥叠放，CSS 控制交替显示) -->
        <span
          v-if="allowClear && hasValue"
          class="clear-icon"
          @click.stop="onClear">
          ×
        </span>
        <span class="calendar-icon">
          <slot name="suffix-icon">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              stroke="currentColor"
              stroke-width="2"
              fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </slot>
        </span>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="visible || hideTrigger"
        class="picker-dropdown"
        :class="[`pos-${position}`]">
        <div class="dropdown-container">
          <div
            v-if="shortcuts.length && shortcutsPosition !== 'bottom'"
            class="shortcuts-side">
            <div
              v-for="(s, i) in shortcuts"
              :key="i"
              class="s-item"
              @click="applyShortcut(s)">
              {{ s.label }}
            </div>
          </div>

          <div class="main-wrap">
            <div class="panels-container">
              <PickerPanel
                :title="`${leftViewDate.getFullYear()}年 ${leftViewDate.getMonth() + 1}月`"
                :days="getDays(leftViewDate)"
                :weekList="weekList"
                :getCellClass="(item) => getDayStatus(item.date, 'left')"
                @select="onDateClick"
                @hover="(d) => (hoverDate = d)">
                <template #header-left>
                  <button @click="moveView('year', -1)">«</button>
                  <button @click="moveView('month', -1)">‹</button>
                </template>
                <template #header-right v-if="mode !== 'range'">
                  <button @click="moveView('month', 1)">›</button>
                  <button @click="moveView('year', 1)">»</button>
                </template>
              </PickerPanel>

              <PickerPanel
                v-if="mode === 'range'"
                :title="`${rightViewDate.getFullYear()}年 ${rightViewDate.getMonth() + 1}月`"
                :days="getDays(rightViewDate)"
                :weekList="weekList"
                :getCellClass="(item) => getDayStatus(item.date, 'right')"
                @select="onDateClick"
                @hover="(d) => (hoverDate = d)">
                <template #header-right>
                  <button @click="moveView('month', 1)">›</button>
                  <button @click="moveView('year', 1)">»</button>
                </template>
              </PickerPanel>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue'
// import type { PropType } from 'vue'
import type { BaseDatePickerProps, ShortcutType } from './types'
import { usePicker } from './index'
import PickerPanel from './PickerPanel.vue'

const props = withDefaults(defineProps<BaseDatePickerProps>(), {
  mode: 'single',
  size: 'medium',
  separator: '~',
  allowClear: true,
  position: 'bl',
  dayStartOfWeek: 1,
  shortcuts: () => [],
  shortcutsPosition: 'bottom',
  placeholder: '请选择日期',
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'select',
  'clear',
  'ok',
])

const visible = shallowRef(false)
const hoverDate = ref<Date | null>(null)
const tempRange = ref<Date[]>([])
const { leftViewDate, rightViewDate, getDays, moveView } = usePicker(props)

const applyShortcut = (s: ShortcutType) => {
  const val = typeof s.value === 'function' ? s.value() : s.value
  if (props.mode === 'range' && Array.isArray(val)) {
    commitValue(val)
  } else if (props.mode !== 'range' && !Array.isArray(val)) {
    commitValue(val)
  }
}

const weekList = computed(() => {
  const base = ['日', '一', '二', '三', '四', '五', '六']
  return [
    ...base.slice(props.dayStartOfWeek),
    ...base.slice(0, props.dayStartOfWeek),
  ]
})

// 日期点击逻辑
const onDateClick = (date: Date) => {
  if (props.mode === 'single') {
    commitValue(date)
  } else {
    if (tempRange.value.length !== 1) {
      tempRange.value = [date]
      emit('select', [date])
    } else {
      const range = [tempRange.value[0], date].sort(
        (a, b) => a!.getTime() - b!.getTime(),
      )
      commitValue(range)
    }
  }
}

const commitValue = (val: any) => {
  const formatted = Array.isArray(val)
    ? val.map((d) => d.getTime())
    : val.getTime()
  emit('update:modelValue', formatted)
  emit('change', formatted)
  if (!props.showConfirmBtn) visible.value = false
  tempRange.value = []
}

const getDayStatus = (date: Date, panelSide: string) => {
  const t = date.getTime()

  // --- 1. 确定选中状态 (Selected) ---
  const isSelected = Array.isArray(props.modelValue)
    ? props.modelValue.some(
        (v) => new Date(v).toDateString() === date.toDateString(),
      )
    : props.modelValue &&
      new Date(props.modelValue).toDateString() === date.toDateString()

  // --- 2. 确定区间状态 (In Range) ---
  let rangeStart: number | null = null
  let rangeEnd: number | null = null

  if (tempRange.value.length === 1) {
    // 情况 A: 正在选择，已点第一个点，正在滑过第二个点
    rangeStart = tempRange.value[0]!.getTime()
    rangeEnd = hoverDate.value?.getTime() || null
  } else if (Array.isArray(props.modelValue) && props.modelValue.length === 2) {
    // 情况 B: 选择已完成，此时中间日期也应有颜色
    rangeStart = new Date(props.modelValue[0]).getTime()
    rangeEnd = new Date(props.modelValue[1]).getTime()
  }

  // 确保 start 永远小于 end
  if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
    ;[rangeStart, rangeEnd] = [rangeEnd, rangeStart]
  }

  const isInRange = rangeStart && rangeEnd && t > rangeStart && t < rangeEnd

  return {
    'is-selected': isSelected,
    'is-in-range': isInRange,
    'is-today': date.toDateString() === new Date().toDateString(),
    'is-outside':
      panelSide === 'left'
        ? date.getMonth() !== leftViewDate.value.getMonth()
        : date.getMonth() !== rightViewDate.value.getMonth(),
  }
}

const displayValues = computed(() => {
  const format = (d: any) => {
    if (!d) return ''
    const date = new Date(d)
    if (isNaN(date.getTime())) return ''
    const Y = date.getFullYear()
    const M = (date.getMonth() + 1).toString().padStart(2, '0')
    const D = date.getDate().toString().padStart(2, '0')
    return `${Y}-${M}-${D}`
  }

  if (props.mode === 'range') {
    const val = Array.isArray(props.modelValue) ? props.modelValue : []
    return [format(val[0]), format(val[1])]
  }
  return [format(props.modelValue)]
})

const hasValue = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0
  }
  return !!props.modelValue
})

const uiPlaceholder = computed<string[]>(() => {
  const p = props.placeholder
  if (Array.isArray(p)) {
    return [p[0] || '开始日期', p[1] || '结束日期']
  }
  if (props.mode === 'range') {
    return [p || '开始日期', p || '结束日期']
  }
  return [p || '请选择日期']
})

const handleClose = () => {
  visible.value = false
  tempRange.value = []
  hoverDate.value = null
}

const toggleVisible = () => {
  if (props.disabled) return
  visible.value = !visible.value
  if (!visible.value) {
    tempRange.value = []
    hoverDate.value = null
  }
}

const onClear = () => {
  emit('update:modelValue', props.mode === 'range' ? [] : null)
  emit('clear')
}

const vClickOutside = {
  mounted(el: any, binding: any) {
    el._h = (e: any) => !el.contains(e.target) && binding.value()
    document.addEventListener('mousedown', el._h)
  },
  unmounted(el: any) {
    document.removeEventListener('mousedown', el._h)
  },
}

watch(visible, (newVal) => {
  if (newVal) {
    if (props.mode === 'range' && Array.isArray(props.modelValue)) {
      tempRange.value = props.modelValue.map((v) => new Date(v))
      if (tempRange.value.length > 0) {
        leftViewDate.value = new Date(tempRange.value[0] as Date)
      }
    }
  } else {
    tempRange.value = []
    hoverDate.value = null
  }
})
</script>

<style scoped lang="scss">
.base-date-picker {
  position: relative;
  width: 100%;
  color: $t-1;
  font-size: 14px;

  // 1. 触发器区域
  .picker-trigger {
    height: 32px;
    border: 1px solid $b-2;
    border-radius: $radius-m;
    background-color: $bg-3; // 使用容器层背景
    display: flex;
    align-items: center;
    padding: 0 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0, 0, 1, 1);

    &:hover:not(.is-disabled) {
      border-color: $p;
      background-color: $bg-1;
    }

    &.is-active {
      border-color: $p;
      box-shadow: $p-shadow;
    }

    .input-area {
      flex: 1;
      display: flex;
      align-items: center;

      input {
        width: 100%;
        border: none;
        outline: none;
        text-align: center;
        font-size: 14px;
        color: $t-1;
        background: transparent;

        &::placeholder {
          color: $t-dis;
          font-size: 13px;
        }
      }

      .sep {
        padding: 0 8px;
        color: $t-3;
      }
    }

    .suffix {
      display: flex;
      align-items: center;
      position: relative;
      color: $t-3;
      margin-left: 8px;
      width: 16px; // 固定宽度，防止 clear 和 calendar 交替时布局抖动

      // 日历图标：默认显示
      .calendar-icon {
        position: absolute;
        right: 0;
        display: flex;
        align-items: center;
        opacity: 1;
        transition: opacity 0.2s;
      }

      // clear 图标：默认隐藏，悬浮父级 trigger 时显示
      .clear-icon {
        position: absolute;
        right: 0;
        display: flex;
        align-items: center;
        font-style: normal;
        font-size: 14px;
        line-height: 1;
        opacity: 0;
        pointer-events: none;
        cursor: pointer;
        transition:
          opacity 0.2s,
          color 0.2s;
        z-index: 1;
        &:hover {
          color: $danger;
        }
      }
    }
  }

  // 悬浮 trigger 时：显示 clear，隐藏 calendar
  &:hover:not(.is-disabled) .picker-trigger .suffix {
    .clear-icon {
      opacity: 1;
      pointer-events: auto;
    }
    .calendar-icon {
      opacity: 0;
    }
  }

  // 2. 下拉面板
  .picker-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: $z-popover; // 使用层级变量
    background-color: $bg-3;
    box-shadow: $s-2; // 使用二级投影
    border: 1px solid $b-1;
    border-radius: $radius-m;
    overflow: hidden;

    .dropdown-container {
      display: flex;
    }

    .main-wrap {
      display: flex;
      flex-direction: column;
    }

    .panels-container {
      display: flex;
      padding: 12px;
      gap: 16px;
      background-color: $bg-3;
    }
  }

  // 3. 快捷键
  .shortcuts-side {
    width: 110px;
    border-right: 1px solid $b-1;
    background-color: $bg-2; // 侧边栏稍深
    padding: 8px 0;

    .s-item {
      padding: 9px 16px;
      cursor: pointer;
      font-size: 13px;
      color: $t-2;
      transition: all 0.2s;

      &:hover {
        background-color: $bg-h;
        color: $p;
      }
    }
  }

  // 4. 底部
  .panel-footer {
    padding: 10px 16px;
    border-top: 1px solid $b-1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: $bg-3;

    .shortcuts-bottom {
      display: flex;
      gap: 12px;

      span {
        color: $p;
        font-size: 13px;
        cursor: pointer;
        &:hover {
          color: $p-hover;
        }
      }
    }

    .btn-confirm {
      background-color: $p;
      color: $t-w;
      border: none;
      padding: 4px 15px;
      border-radius: $radius-s;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background-color: $p-hover;
      }
      &:active {
        background-color: $p-active;
      }
    }
  }

  // 状态态
  &.is-disabled {
    .picker-trigger {
      background-color: $bg-4;
      border-color: $b-1;
      cursor: not-allowed;
      input {
        color: $t-dis;
      }
    }
  }

  &.is-error {
    .picker-trigger {
      border-color: $danger;
      &:hover {
        border-color: $danger-h;
      }
    }
  }
}

// 5. 穿透润色子组件
:deep(.picker-panel-content) {
  width: 270px;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 4px;

    .header-title {
      font-weight: 600;
      color: $t-1;
    }

    button {
      border: none;
      background: none;
      cursor: pointer;
      color: $t-3;
      padding: 4px;
      border-radius: $radius-s;
      transition: all 0.2s;

      &:hover {
        color: $p;
        background-color: $bg-h;
      }
    }
  }

  .week-bar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 12px;
    color: $t-3;
    margin-bottom: 8px;
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;

    .day-cell {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: $radius-s;
      font-size: 13px;
      color: $t-1;
      position: relative;
      z-index: 1;

      &:hover:not(.is-disabled):not(.is-selected) {
        background-color: $bg-h;
      }

      &.is-outside {
        color: $t-dis;
      }

      &.is-today {
        color: $p;
        font-weight: bold;
        &::after {
          content: '';
          position: absolute;
          bottom: 4px;
          width: 4px;
          height: 4px;
          background: $p;
          border-radius: 50%;
        }
      }

      &.is-in-range {
        background-color: $p-light; // 区间底色
        border-radius: 0;
        color: $p;
      }

      &.is-selected {
        background-color: $p !important;
        color: $t-w !important;
        border-radius: $radius-s;
      }

      &.is-disabled {
        background-color: $bg-4;
        color: $t-dis;
        cursor: not-allowed;
      }
    }
  }
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
