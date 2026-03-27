<template>
  <div
    class="base-tabs"
    :class="[sizeClass, { 'is-border-card': type === 'border-card' }]">
    <div class="tabs-header-wrapper">
      <div class="tabs-nav" role="tablist">
        <div
          v-for="pane in panes"
          :key="pane.props.name"
          class="tabs-tab"
          :class="{
            'is-active': modelValue === pane.props.name,
            'is-disabled': pane.props.disabled,
          }"
          role="tab"
          @click="handleTabClick(pane.props.name, pane.props.disabled)">
          <component :is="pane.slots.label" v-if="pane.slots.label" />
          <template v-else>{{ pane.props.label }}</template>
        </div>
        <div
          v-if="type === 'default'"
          class="tabs-active-bar"
          :style="barStyle"></div>
      </div>
    </div>
    <div class="tabs-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  provide,
  ref,
  useSlots,
  onMounted,
  watch,
  getCurrentInstance,
  nextTick,
} from 'vue'

interface TabsProps {
  modelValue: string | number
  type?: 'default' | 'border-card'
  size?: 'small' | 'medium' | 'large'
}

defineOptions({
  name: 'BaseTabs',
})

const props = withDefaults(defineProps<TabsProps>(), {
  type: 'default',
  size: 'medium',
})

const emit = defineEmits(['update:modelValue', 'tab-click'])

provide(
  'activeTab',
  computed(() => props.modelValue),
)

const slots = useSlots()
const instance = getCurrentInstance()
const barStyle = ref({ width: '0px', transform: 'translateX(0px)' })

const panes = computed(() => {
  const children = slots.default?.() || []
  const result: any[] = []
  const filterPanes = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node.type === Symbol.for('v-fgt')) {
        filterPanes(node.children as any[])
      } else if (node.type && typeof node.type === 'object' && node.props) {
        result.push({ props: node.props, slots: node.children })
      }
    })
  }
  filterPanes(children)
  return result
})

const sizeClass = computed(() => `size-${props.size}`)

const updateBarrier = () => {
  nextTick(() => {
    const el = instance?.vnode.el as HTMLElement
    if (!el) return
    const activeTab = el.querySelector('.tabs-tab.is-active') as HTMLElement
    if (activeTab) {
      barStyle.value = {
        width: `${activeTab.offsetWidth}px`,
        transform: `translateX(${activeTab.offsetLeft}px)`,
      }
    } else {
      barStyle.value = { width: '0px', transform: 'translateX(0px)' }
    }
  })
}

const handleTabClick = (name: string | number, disabled: boolean) => {
  if (disabled) return
  emit('update:modelValue', name)
  emit('tab-click', name)
}

watch([() => props.modelValue, () => panes.value], () => updateBarrier(), {
  flush: 'post',
  deep: true,
})
onMounted(() => setTimeout(updateBarrier, 0))
</script>

<style scoped lang="scss">
.base-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ==========================================
   1. 头部容器 (Header)
   ========================================== */
.tabs-header-wrapper {
  position: relative;
  border-bottom: 2px solid $b-1; // 使用弱分割线
  margin-bottom: 16px;
  width: 100%;
}

.tabs-nav {
  display: flex;
  position: relative;
  white-space: nowrap;
  // 隐藏容器可能出现的溢出
  overflow: visible;
}

/* ==========================================
   2. 标签项 (Tab Item)
   ========================================== */
.tabs-tab {
  position: relative;
  flex-shrink: 0;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: 500;
  color: $t-2; // 次要文字色
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(.is-disabled):not(.is-active) {
    color: $p-hover;
    background-color: $bg-h; // 悬浮背景反馈
  }

  &.is-active {
    color: $p; // 品牌主色
    font-weight: 600; // 激活时加粗
  }

  &.is-disabled {
    color: $t-dis;
    cursor: not-allowed;
  }
}

/* 激活滑动条 (Active Bar) */
.tabs-active-bar {
  position: absolute;
  bottom: -2px; // 压在 border-bottom 上
  left: 0;
  height: 2px;
  background-color: $p; // 品牌色
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); // 带有一点回弹质感
  z-index: 1;
  border-radius: $radius-full;
}

/* ==========================================
   3. 卡片风格 (Border-Card)
   ========================================== */
.is-border-card {
  border: 1px solid $b-1;
  border-radius: $radius-m;
  background-color: $bg-3;
  overflow: hidden;

  .tabs-header-wrapper {
    background-color: $bg-2; // 页眉使用二级背景区分
    border-bottom: 1px solid $b-1;
    margin-bottom: 0;
  }

  .tabs-tab {
    border-right: 1px solid transparent;
    border-left: 1px solid transparent;
    transition: background-color 0.2s;

    &.is-active {
      background-color: $bg-3; // 激活时变回主体背景色
      border-right: 1px solid $b-1;
      border-left: 1px solid $b-1;
      color: $p;

      // 第一个和最后一个的边框处理由 CSS 选择器精修
      &:first-child {
        border-left: none;
      }
    }

    &:hover:not(.is-active):not(.is-disabled) {
      background-color: $bg-4;
    }
  }

  .tabs-content {
    padding: 16px;
  }
}

/* ==========================================
   4. 尺寸适配 (Sizes)
   ========================================== */
.size-small {
  .tabs-tab {
    height: 32px;
    line-height: 32px;
    font-size: 13px;
    padding: 0 12px;
  }
}

.size-large {
  .tabs-tab {
    height: 48px;
    line-height: 48px;
    font-size: 16px;
    padding: 0 24px;
  }
}

.tabs-content {
  position: relative;
  width: 100%;
}
</style>
