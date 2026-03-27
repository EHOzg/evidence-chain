<template>
  <teleport :to="popupContainer" :disabled="!renderToBody">
    <transition :name="maskAnimationName">
      <div
        v-if="visible"
        class="base-modal-mask"
        :class="{ 'align-center': alignCenter }"
        :style="maskStyle"
        @click.self="handleMaskClick">
        <transition :name="modalAnimationName">
          <div
            v-if="visible"
            :class="[
              'base-modal-container',
              modalClass,
              { 'is-fullscreen': fullscreen },
            ]"
            :style="[modalStyle, containerStyle]">
            <div
              v-if="!hideTitle"
              class="base-modal-header"
              :class="[`align-${titleAlign}`]">
              <div class="base-modal-title">
                <slot name="title">{{ title }}</slot>
              </div>
              <button v-if="closable" class="close-icon" @click="handleCancel">
                &times;
              </button>
            </div>

            <div
              class="base-modal-body"
              :class="[bodyClass, { 'no-padding': simple }]"
              :style="bodyStyle">
              <slot></slot>
            </div>

            <div v-if="footer" class="base-modal-footer">
              <slot name="footer">
                <button
                  v-if="!hideCancel"
                  class="btn-cancel"
                  v-bind="cancelButtonProps"
                  @click="handleCancel">
                  {{ cancelText || '取消' }}
                </button>
                <button
                  class="btn-confirm"
                  :disabled="okLoading"
                  v-bind="okButtonProps"
                  @click="handleOk">
                  <i v-if="okLoading" class="loading-icon"></i>
                  {{ okText || '确定' }}
                </button>
              </slot>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  visible: boolean
  title?: string
  width?: number | string
  top?: number | string
  mask?: boolean
  titleAlign?: 'start' | 'center'
  alignCenter?: boolean
  unmountOnClose?: boolean
  maskClosable?: boolean
  hideCancel?: boolean
  simple?: boolean
  closable?: boolean
  okText?: string
  cancelText?: string
  okLoading?: boolean
  okButtonProps?: any
  cancelButtonProps?: any
  footer?: boolean
  renderToBody?: boolean
  popupContainer?: string | HTMLElement
  maskStyle?: any
  modalClass?: string | any[]
  modalStyle?: any
  bodyClass?: string | any[]
  bodyStyle?: any
  hideTitle?: boolean
  escToClose?: boolean
  fullscreen?: boolean
  maskAnimationName?: string
  modalAnimationName?: string
  onBeforeOk?: (
    done: (closed: boolean) => void,
  ) => void | boolean | Promise<void | boolean>
  onBeforeCancel?: () => boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mask: true,
  titleAlign: 'start',
  alignCenter: true,
  maskClosable: true,
  closable: true,
  footer: true,
  renderToBody: true,
  popupContainer: 'body',
  escToClose: true,
  maskAnimationName: 'fade-modal',
  modalAnimationName: 'zoom-modal',
})

const emit = defineEmits([
  'update:visible',
  'ok',
  'cancel',
  'open',
  'close',
  'before-open',
  'before-close',
])

// 样式计算
const containerStyle = computed(() => {
  if (props.fullscreen) return {}
  const style: any = {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  }
  if (!props.alignCenter) {
    style.marginTop =
      typeof props.top === 'number' ? `${props.top}px` : props.top
  }
  return style
})

// 处理关闭逻辑
const close = () => emit('update:visible', false)

const handleCancel = () => {
  if (props.onBeforeCancel && props.onBeforeCancel() === false) return
  emit('cancel')
  close()
}

const handleOk = async () => {
  if (props.onBeforeOk) {
    const done = (closed: boolean) => {
      if (closed) close()
    }
    const result = await props.onBeforeOk(done)
    if (result === false) return
    if (result !== undefined) close()
  } else {
    emit('ok')
    close()
  }
}

const handleMaskClick = () => {
  if (props.maskClosable) handleCancel()
}

// ESC 支持
const handleEsc = (e: KeyboardEvent) => {
  if (props.escToClose && e.key === 'Escape' && props.visible) handleCancel()
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      emit('before-open')
      document.body.style.overflow = 'hidden'
      setTimeout(() => emit('open'), 300)
    } else {
      emit('before-close')
      document.body.style.overflow = ''
      setTimeout(() => emit('close'), 300)
    }
  },
)

onMounted(() => window.addEventListener('keydown', handleEsc))
onUnmounted(() => window.removeEventListener('keydown', handleEsc))
</script>

<style lang="scss" scoped>
/* --- 遮罩层 (Mask) --- */
.base-modal-mask {
  position: fixed;
  inset: 0;
  background-color: $bg-m; // 全局遮罩色变量
  backdrop-filter: blur(4px); // 增强毛玻璃质感
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  z-index: $z-modal; // 使用 Modal 专用层级 (1001)
  transition: opacity 0.3s ease;

  &.align-center {
    align-items: center;
  }

  &:not(.align-center) {
    align-items: flex-start;
    padding-top: 10vh; // 非居中时默认距离顶部高度
  }
}

/* --- 弹窗主体 (Container) --- */
.base-modal-container {
  position: relative;
  background-color: $bg-3; // 提升至三级/浮层背景
  border-radius: $radius-l; // 大圆角
  display: flex;
  flex-direction: column;
  box-shadow: $s-3; // 最深层级的投影
  border: 1px solid $b-1; // 弱边框增加轮廓感
  max-width: 95vw;
  max-height: 90vh; // 防止溢出屏幕
  overflow: hidden; // 确保圆角剪裁内容
  transition: all 0.3s $p-grad; // 引用品牌渐变的过渡曲线逻辑

  &.is-fullscreen {
    width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    margin: 0 !important;
    border-radius: 0;
    border: none;
  }
}

/* --- 页眉 (Header) --- */
.base-modal-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid $b-1; // 分割线
  background-color: $bg-3;

  &.align-center {
    justify-content: center;
    .close-icon {
      position: absolute;
      right: 16px;
    }
  }

  &.align-start {
    justify-content: space-between;
  }

  .base-modal-title {
    font-size: 16px;
    font-weight: 600; // 加粗标题
    color: $t-1; // 一级文字色
    font-family: 'Alibaba PuHuiTi 2.0 Bold', sans-serif;
  }
}

/* 关闭按钮 */
.close-icon {
  width: 24px;
  height: 24px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-m;
  border: none;
  background: transparent;
  color: $t-3;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    // background-color: $f-2; // 交互填充色
    color: $danger; // 悬浮变红，符合直觉
  }
}

/* --- 内容区 (Body) --- */
.base-modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  color: $t-2; // 正文使用二级文字色
  background-color: $bg-3;

  &.no-padding {
    padding: 0;
  }
}

/* --- 页脚 (Footer) --- */
.base-modal-footer {
  padding: 12px 24px;
  border-top: 1px solid $b-1;
  background-color: $bg-2; // 页脚微灰，区分内容区
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  /* 这里的按钮样式建议直接复用 BaseButton 的类名逻辑 */
  .btn-cancel {
    background: transparent;
    border: 1px solid $b-2;
    color: $t-2;
    padding: 8px 16px;
    border-radius: $radius-m;
    cursor: pointer;
    &:hover {
      background: $bg-h;
      color: $t-1;
    }
  }

  .btn-confirm {
    background: $p; // 品牌主色
    color: $p-text;
    border: none;
    padding: 8px 20px;
    border-radius: $radius-m;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 6px $p-shadow;
    &:hover {
      background: $p-hover;
    }
    &:active {
      background: $p-active;
    }
  }
}

/* --- 动画 (Animations) --- */

/* 遮罩淡入淡出 */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

/* 内容区缩放进入 */
.zoom-modal-enter-active {
  animation: modal-zoom-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); // 带有微弹回效果
}
.zoom-modal-leave-active {
  transition: all 0.2s ease;
  transform: scale(0.9);
  opacity: 0;
}

@keyframes modal-zoom-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
