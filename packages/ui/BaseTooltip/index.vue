<template>
  <div
    class="tooltip-trigger"
    ref="triggerRef"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleMouseEnter"
    @blur="handleMouseLeave">
    <slot></slot>

    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div
          v-if="visible && content"
          class="base-tooltip-popper"
          :style="popperStyle"
          ref="popperRef"
          @mouseenter="clearTimer"
          @mouseleave="handleMouseLeave">
          <div class="tooltip-content" :class="`pos-${position}`">
            <slot name="content">{{ content }}</slot>
          </div>
          <div class="tooltip-arrow" :class="`arrow-${position}`"></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, useTemplateRef, nextTick, onBeforeUnmount } from 'vue'

defineOptions({ name: 'BaseTooltip' })

const props = withDefaults(
  defineProps<{
    content?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
    showDelay?: number
    hideDelay?: number
    disabled?: boolean
  }>(),
  {
    position: 'top',
    showDelay: 150,
    hideDelay: 200,
    disabled: false,
  }
)

const visible = shallowRef(false)
const triggerRef = useTemplateRef<HTMLElement>('triggerRef')
const popperRef = useTemplateRef<HTMLElement>('popperRef')
let timer: ReturnType<typeof setTimeout> | null = null

const popperStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })

const updatePosition = async () => {
  await nextTick()
  if (!triggerRef.value || !popperRef.value) return

  const t = triggerRef.value.getBoundingClientRect()
  const p = popperRef.value.getBoundingClientRect()
  const GAP = 8

  let top = 0
  let left = 0

  switch (props.position) {
    case 'top':
      top = t.top - p.height - GAP + window.scrollY
      left = t.left + t.width / 2 - p.width / 2 + window.scrollX
      break
    case 'bottom':
      top = t.bottom + GAP + window.scrollY
      left = t.left + t.width / 2 - p.width / 2 + window.scrollX
      break
    case 'left':
      top = t.top + t.height / 2 - p.height / 2 + window.scrollY
      left = t.left - p.width - GAP + window.scrollX
      break
    case 'right':
      top = t.top + t.height / 2 - p.height / 2 + window.scrollY
      left = t.right + GAP + window.scrollX
      break
  }

  popperStyle.value = { top: `${top}px`, left: `${left}px` }
}

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

const handleMouseEnter = () => {
  if (props.disabled) return
  clearTimer()
  timer = setTimeout(() => {
    visible.value = true
    updatePosition()
  }, props.showDelay)
}

const handleMouseLeave = () => {
  clearTimer()
  timer = setTimeout(() => {
    visible.value = false
  }, props.hideDelay)
}

onBeforeUnmount(() => {
  clearTimer()
  visible.value = false
})
</script>

<style scoped lang="scss">
.tooltip-trigger {
  display: inline-block;
}

.base-tooltip-popper {
  position: absolute;
  z-index: $z-popover;
  pointer-events: auto;
  will-change: transform, opacity;
}

.tooltip-content {
  background-color: rgba(23, 26, 33, 0.92);
  backdrop-filter: blur(4px);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: $radius-m;
  font-size: 12px;
  line-height: 1.5;
  max-width: 260px;
  word-wrap: break-word;
  white-space: pre-wrap;
  box-shadow: $s-2;
  user-select: text;
}

// 箭头 (根据方向旋转)
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  $color: rgba(23, 26, 33, 0.92);

  &.arrow-top {
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 7px solid $color;
  }

  &.arrow-bottom {
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 7px solid $color;
  }

  &.arrow-left {
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-left: 7px solid $color;
  }

  &.arrow-right {
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 7px solid $color;
  }
}

.tooltip-fade-enter-active {
  transition: opacity 0.18s ease-out, transform 0.18s ease-out;
}
.tooltip-fade-leave-active {
  transition: opacity 0.12s ease-in, transform 0.12s ease-in;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
