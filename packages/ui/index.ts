import type { App, Component } from 'vue'

import SvgIcon from './SvgIcon/index.vue'
import BaseButton from './BaseButton/index.vue'
import BaseTabs from './BaseTabs/index.vue'
import BaseTabPane from './BaseTabPane/index.vue'
import BaseMessage from './BaseMessage/index'
import BaseTooltip from './BaseTooltip/index.vue'
import BaseModal from './BaseModal/index.vue'
import BaseStep from './BaseStep/index.vue'
import BaseSteps from './BaseSteps/index.vue'
import BaseInput from './BaseInput/index.vue'
import BaseSelect from './BaseSelect/index.vue'
import BaseSwitch from './BaseSwitch/index.vue'
import BaseTable from './BaseTable/index.vue'
import BaseDatePicker from './BaseDatePicker/index.vue'
import BaseTimePicker from './BaseTimePicker/index.vue'
import BaseCheckbox from './BaseCheckbox/index.vue'
import BaseCheckboxGroup from './BaseCheckboxGroup/index.vue'
import BaseFormItem from './BaseFormItem/index.vue'
import BaseForm from './BaseForm/index.vue'
import BaseUpload from './BaseUpload/index.vue'

export {
  SvgIcon,
  BaseButton,
  BaseTabs,
  BaseTabPane,
  BaseMessage,
  BaseTooltip,
  BaseModal,
  BaseStep,
  BaseSteps,
  BaseInput,
  BaseSelect,
  BaseSwitch,
  BaseTable,
  BaseDatePicker,
  BaseTimePicker,
  BaseCheckbox,
  BaseCheckboxGroup,
  BaseFormItem,
  BaseForm,
  BaseUpload
}

const components: Record<string, Component> = {
  SvgIcon,
  BaseButton,
  BaseTabs,
  BaseTabPane,
  BaseTooltip,
  BaseModal,
  BaseStep,
  BaseSteps,
  BaseInput,
  BaseSelect,
  BaseSwitch,
  BaseTable,
  BaseDatePicker,
  BaseTimePicker,
  BaseCheckbox,
  BaseCheckboxGroup,
  BaseFormItem,
  BaseForm,
  BaseUpload

}

export default {
  install(app: App) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
    })

    app.config.globalProperties.$message = BaseMessage
  },
}
