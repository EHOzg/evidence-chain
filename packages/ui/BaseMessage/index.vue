<template>
  <Transition name="message-fade" @after-leave="$emit('destroy')">
    <div
      v-show="visible"
      class="my-message"
      :class="type"
      :style="{ top: offset + 'px' }">
      <div class="message-icon">
        <svg
          v-if="type === 'success'"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="currentColor"
          stroke-width="2.5"
          fill="none"
          class="animate-icon">
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
        <svg
          v-else-if="type === 'error'"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="currentColor"
          stroke-width="2.5"
          fill="none"
          class="animate-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <svg
          v-else-if="type === 'warning'"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="currentColor"
          stroke-width="2.5"
          fill="none"
          class="animate-icon">
          <path
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <svg
          v-else-if="type === 'info'"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="currentColor"
          stroke-width="2.5"
          fill="none"
          class="animate-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <span class="message-content">{{ content }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineOptions({
  name: 'BaseMessage',
})

const props = defineProps<{
  type: 'success' | 'error' | 'info' | 'warning'
  content: string
  duration: number
  offset: number
}>()

defineEmits(['destroy'])

const visible = ref(false)

onMounted(() => {
  visible.value = true
  setTimeout(() => {
    visible.value = false
  }, props.duration)
})
</script>

<style scoped lang="scss">
.my-message {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: end;
  gap: 8px; // 留出图标与文字的完美间距

  /* 核心修复：坚决不透明！使用物理弹层背景与清晰明暗层级 */
  background-color: $bg-3;
  border: 1px solid $b-1;

  padding: 10px 20px 10px 16px;
  border-radius: $radius-m;
  z-index: $z-winbar;

  /* 高级悬浮投影，呈现卡片漂浮态 */
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.04);

  transition:
    top 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28),
    opacity 0.3s,
    transform 0.3s;

  .message-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    // 移除了 margin-top 的强行偏移，完全交由 Flex 的物理对齐

    // 图标进场略微缩放点亮
    .animate-icon {
      animation: messageIconPop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)
        forwards;
    }
  }

  /* 剥离纯色，使用雅致主文本黑，高级且易读 */
  .message-content {
    font-size: 14px;
    font-weight: 400;
    color: $t-1;
    // 收紧行高，使得文本物理包裹框与中英文字体视觉中心更加贴合
    line-height: 1.1;
  }

  // 各状态颜色的精准注入 (给图标赋予灵魂)
  &.success .message-icon {
    color: $success;
  }
  &.error .message-icon {
    color: $danger;
  }
  &.warning .message-icon {
    color: $warning;
  }
  &.info .message-icon {
    color: $info;
  }
}

@keyframes messageIconPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// 物理进出退行动画
.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
