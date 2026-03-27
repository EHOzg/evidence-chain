export interface SelectOptionData {
  value: string | number | boolean | Record<string, any>
  label: string
  disabled?: boolean
}

export interface SelectFieldNames {
  label?: string
  value?: string
  children?: string
}

export interface BaseSelectProps {
  modelValue?: any
  multiple?: boolean
  options?: (string | number | SelectOptionData)[]
  size?: 'mini' | 'small' | 'medium' | 'large'
  placeholder?: string
  disabled?: boolean
  error?: boolean
  allowClear?: boolean
  allowSearch?: boolean
  bordered?: boolean
  valueKey?: string
  fieldNames?: SelectFieldNames
}
