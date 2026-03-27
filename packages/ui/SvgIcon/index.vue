<template>
  <svg :class="svgClass" aria-hidden="true" :style="iconStyle">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'SvgIcon',
})

const props = defineProps({
  iconClass: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number],
    default: '1em',
  },
  height: {
    type: [String, Number],
    default: '1em',
  },
})

const iconName = computed(() => `#icon-${props.iconClass}`)

const svgClass = computed(() => {
  const classes = ['svg-icon']
  if (props.className) classes.push(props.className)
  return classes.join(' ')
})

const iconStyle = computed(() => {
  const w = String(props.width)
  const h = String(props.height)

  const width = /^\d+(\.\d+)?$/.test(w) ? `${w}px` : w
  const height = /^\d+(\.\d+)?$/.test(h) ? `${h}px` : h

  return {
    width,
    height,
    verticalAlign: '-0.15em',
    fill: 'currentColor',
    overflow: 'hidden',
  }
})
</script>

<style scoped>
.svg-icon {
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
