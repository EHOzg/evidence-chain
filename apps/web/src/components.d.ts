import '@vue/runtime-core'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    BaseButton: (typeof import('@project/ui'))['BaseButton']
    BaseTabs: (typeof import('@project/ui'))['BaseTabs']
    BaseTabPane: (typeof import('@project/ui'))['BaseTabPane']
    BaseTooltip: (typeof import('@project/ui'))['BaseTooltip']
    BaseModal: (typeof import('@project/ui'))['BaseModal']
    SvgIcon: (typeof import('@project/ui'))['SvgIcon']
    BaseStep: (typeof import('@project/ui'))['BaseStep']
    BaseSteps: (typeof import('@project/ui'))['BaseSteps']
    BaseInput: (typeof import('@project/ui'))['BaseInput']
    BaseSelect: (typeof import('@project/ui'))['BaseSelect']
    BaseSwitch: (typeof import('@project/ui'))['BaseSwitch']
    BaseTable: (typeof import('@project/ui'))['BaseTable']
    BaseDatePicker: (typeof import('@project/ui'))['BaseDatePicker']
    BaseTimePicker: (typeof import('@project/ui'))['BaseTimePicker']
  }
}
