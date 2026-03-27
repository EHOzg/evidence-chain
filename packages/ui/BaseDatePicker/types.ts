export type PickerMode =
  | 'single'
  | 'range'
  | 'month'
  | 'year'
  | 'week'
  | 'quarter'

export interface ShortcutType {
  label: string
  value: Date | Date[] | (() => Date | Date[])
}

export interface BaseDatePickerProps {
  modelValue?: any
  mode?: PickerMode
  size?: 'mini' | 'small' | 'medium' | 'large'
  separator?: string
  placeholder?: string | string[]
  disabled?: boolean
  error?: boolean
  allowClear?: boolean
  position?: 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br'
  dayStartOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  shortcuts?: ShortcutType[]
  shortcutsPosition?: 'left' | 'bottom' | 'right'
  showConfirmBtn?: boolean
  hideTrigger?: boolean
}
