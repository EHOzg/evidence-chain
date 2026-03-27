import { ref, computed } from 'vue'
import type { BaseDatePickerProps } from './types'

export function usePicker(props: BaseDatePickerProps) {
  // 面板视图日期（左面板）
  const leftViewDate = ref(new Date())

  // 右面板视图日期（始终是左面板 +1 个月）
  const rightViewDate = computed(() => {
    const d = new Date(leftViewDate.value)
    d.setMonth(d.getMonth() + 1)
    return d
  })

  // 生成 42 天矩阵算法
  const getDays = (viewDate: Date) => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)

    let offset = firstDay.getDay() - (props.dayStartOfWeek ?? 1)
    if (offset < 0) offset += 7

    const startDate = new Date(year, month, 1 - offset)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      return {
        date: d,
        timestamp: d.getTime(),
        isCurrentMonth: d.getMonth() === month,
      }
    })
  }

  const moveView = (type: 'month' | 'year', step: number) => {
    const d = new Date(leftViewDate.value)
    if (type === 'month') d.setMonth(d.getMonth() + step)
    else d.setFullYear(d.getFullYear() + step)
    leftViewDate.value = d
  }

  return { leftViewDate, rightViewDate, getDays, moveView }
}
