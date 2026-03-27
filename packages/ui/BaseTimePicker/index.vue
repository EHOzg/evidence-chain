<template>
  <div
    class="base-time-picker"
    :class="[`size-${size}`, { 'is-disabled': disabled, 'is-error': error }]"
    v-click-outside="() => (visible = false)">
    <div
      class="picker-input"
      :class="{ 'is-active': visible }"
      @click="toggleVisible">
      <svg class="picker-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      <span v-if="modelValue" class="picker-value">{{ modelValue }}</span>
      <span v-else class="picker-placeholder">{{ placeholder }}</span>
      <!-- 清空 -->
      <span
        v-if="allowClear && modelValue && !disabled"
        class="clear-icon"
        @click.stop="handleClear">
        ×
      </span>
    </div>

    <transition name="slide-fade">
      <div v-if="visible" class="time-panel">
        <div class="time-columns">
          <ul ref="hourRef" class="time-column">
            <li
              v-for="h in 24"
              :key="h"
              :class="{ active: getPart(0) === h - 1 }"
              @click="updateTime(0, h - 1)">
              {{ (h - 1).toString().padStart(2, '0') }}
            </li>
          </ul>
          <ul ref="minuteRef" class="time-column">
            <li
              v-for="m in 60"
              :key="m"
              :class="{ active: getPart(1) === m - 1 }"
              @click="updateTime(1, m - 1)">
              {{ (m - 1).toString().padStart(2, '00') }}
            </li>
          </ul>
          <ul v-if="!hideSecond" ref="secondRef" class="time-column">
            <li
              v-for="s in 60"
              :key="s"
              :class="{ active: getPart(2) === s - 1 }"
              @click="updateTime(2, s - 1)">
              {{ (s - 1).toString().padStart(2, '00') }}
            </li>
          </ul>
        </div>
        <div class="panel-footer">
          <span class="btn-now" @click="setNow">此刻</span>
          <button class="confirm-btn" @click="handleConfirm">确定</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, useTemplateRef, nextTick, watch } from 'vue'

defineOptions({ name: 'BaseTimePicker' })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    allowClear?: boolean
    hideSecond?: boolean
    error?: boolean
    size?: 'small' | 'medium' | 'large'
  }>(),
  {
    placeholder: '请选择时间',
    allowClear: true,
    disabled: false,
    hideSecond: false,
    size: 'medium',
  }
)

const emit = defineEmits(['update:modelValue', 'change', 'clear'])

const visible = shallowRef(false)
const hourRef = useTemplateRef<HTMLElement>('hourRef')
const minuteRef = useTemplateRef<HTMLElement>('minuteRef')
const secondRef = useTemplateRef<HTMLElement>('secondRef')

const getPart = (index: number) => {
  const parts = (props.modelValue || '00:00:00').split(':')
  return parseInt(parts[index] || '0', 10)
}

const updateTime = (type: number, val: number) => {
  const parts = (props.modelValue || '00:00:00').split(':')
  parts[type] = val.toString().padStart(2, '0')
  const newVal = parts.join(':')
  emit('update:modelValue', newVal)
  emit('change', newVal)
  scrollActive()
}

const setNow = () => {
  const now = new Date()
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  const s = now.getSeconds().toString().padStart(2, '0')
  const val = props.hideSecond ? `${h}:${m}` : `${h}:${m}:${s}`
  emit('update:modelValue', val)
  emit('change', val)
  nextTick(() => scrollActive())
}

const handleConfirm = () => {
  visible.value = false
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

const toggleVisible = () => {
  if (props.disabled) return
  visible.value = !visible.value
}

const scrollActive = () => {
  nextTick(() => {
    [hourRef, minuteRef, secondRef].forEach((colRef) => {
      const col = colRef.value
      if (!col) return
      const active = col.querySelector('li.active') as HTMLElement
      if (active) {
        col.scrollTo({ top: active.offsetTop - col.clientHeight / 2 + active.clientHeight / 2, behavior: 'smooth' })
      }
    })
  })
}

watch(visible, (val) => {
  if (val) nextTick(() => scrollActive())
})

// clickOutside 指令
const vClickOutside = {
  mounted(el: any, binding: any) {
    el._outsideHandler = (e: Event) => {
      if (!el.contains(e.target)) binding.value()
    }
    document.addEventListener('mousedown', el._outsideHandler)
  },
  unmounted(el: any) {
    document.removeEventListener('mousedown', el._outsideHandler)
  },
}
</script>

<style scoped lang="scss">
.base-time-picker {
  position: relative;
  display: inline-flex;
  width: 160px;

  &.size-small .picker-input {
    height: 28px;
    font-size: 13px;
  }
  &.size-medium .picker-input {
    height: 36px;
    font-size: 14px;
  }
  &.size-large .picker-input {
    height: 44px;
    font-size: 15px;
  }

  &.is-disabled .picker-input {
    background-color: $bg-4;
    border-color: $b-1;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &.is-error .picker-input {
    border-color: $danger;
  }
}

.picker-input {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  height: 36px;
  border: 1px solid $b-2;
  border-radius: $radius-m;
  background-color: $bg-3;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;

  &:hover:not(.is-disabled) {
    border-color: $p;
  }

  &.is-active {
    border-color: $p;
    box-shadow: $p-shadow;
  }

  .picker-icon {
    color: $t-3;
    flex-shrink: 0;
  }

  .picker-placeholder {
    flex: 1;
    color: $t-dis;
    font-size: 14px;
  }

  .picker-value {
    flex: 1;
    color: $t-1;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }

  .clear-icon {
    display: flex;
    align-items: center;
    font-style: normal;
    font-size: 14px;
    line-height: 1;
    color: $t-3;
    transition: color 0.2s;
    &:hover {
      color: $danger;
    }
  }
}

.time-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: $z-popover;
  width: 180px;
  background: $bg-3;
  border: 1px solid $b-1;
  box-shadow: $s-2;
  border-radius: $radius-m;
  overflow: hidden;

  .time-columns {
    display: flex;
    height: 200px;

    .time-column {
      flex: 1;
      overflow-y: auto;
      list-style: none;
      padding: 70px 0; // 上下留白让选项居中
      margin: 0;
      border-right: 1px solid $b-1;
      scrollbar-width: none; // 隐藏滚动条
      &::-webkit-scrollbar { display: none; }
      &:last-child { border-right: none; }

      li {
        padding: 8px 0;
        text-align: center;
        font-size: 13px;
        cursor: pointer;
        color: $t-2;
        transition: all 0.15s;

        &:hover {
          background: $bg-h;
          color: $t-1;
        }

        &.active {
          color: $p;
          font-weight: 600;
          background: color-mix(in srgb, var(--primary) 8%, transparent);
        }
      }
    }
  }

  .panel-footer {
    padding: 8px 12px;
    border-top: 1px solid $b-1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .btn-now {
      font-size: 13px;
      color: $p;
      cursor: pointer;
      &:hover { color: $p-hover; }
    }

    .confirm-btn {
      background: $p;
      color: $p-text;
      border: none;
      padding: 4px 14px;
      border-radius: $radius-s;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;

      &:hover { background: $p-hover; }
    }
  }
}

// 下拉动画
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
