import { h, render } from 'vue'
import MessageConstructor from './index.vue'

type MessageType = 'success' | 'error' | 'info' | 'warning'

interface MessageOptions {
  type?: MessageType
  content: string
  duration?: number
}

// 1. 定义消息函数的类型接口
interface MessageFunction {
  (options: MessageOptions | string): void
  success: (content: string, duration?: number) => void
  error: (content: string, duration?: number) => void
  info: (content: string, duration?: number) => void
  warning: (content: string, duration?: number) => void
}

const instances: any[] = []
let seed = 1

// 2. 实现基础函数逻辑
const BaseMessage = (options: MessageOptions | string) => {
  const config = typeof options === 'string' ? { content: options } : options
  const id = `message_${seed++}`
  const container = document.createElement('div')

  let verticalOffset = 20
  instances.forEach((v) => {
    // 加上 16px 的间距
    verticalOffset += (v.el?.offsetHeight || 40) + 16
  })

  const vnode = h(MessageConstructor, {
    ...config,
    type: config.type || 'info',
    duration: config.duration || 3000,
    offset: verticalOffset,
    onDestroy: () => {
      render(null, container)
      const idx = instances.findIndex((instance) => instance.id === id)
      if (idx !== -1) {
        instances.splice(idx, 1)
        // 注意：此处如果需要后续消息自动上移，还需额外处理 offset 逻辑
      }
    },
  })

  render(vnode, container)
  const el = container.firstElementChild
  if (el) {
    document.body.appendChild(el)
    instances.push({ id, vnode, el })
  }
}

// 3. 强制类型转换并绑定快捷方法
const message = BaseMessage as MessageFunction

const types: MessageType[] = ['success', 'error', 'info', 'warning']

types.forEach((type) => {
  message[type] = (content: string, duration?: number) =>
    message({ type, content, duration })
})

export default message
