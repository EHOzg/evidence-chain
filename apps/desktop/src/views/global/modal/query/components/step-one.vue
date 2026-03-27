<template>
  <div class="step-one-wrapper">
    <div class="btn-actions">
      <BaseButton variant="outline" icon="upload" @click="importVisible = true">
        批量导入
      </BaseButton>
      <BaseButton variant="outline" icon="delete" @click="handleClearAll">
        全部清空
      </BaseButton>
      <BaseButton variant="outline" icon="plus" @click="addLinesVisible = true">
        批量添加
      </BaseButton>
    </div>

    <BaseForm ref="formRef" :model="formData">
      <div class="info-card-container" ref="listContainer">
        <div
          v-for="(item, index) in formData"
          :key="item.id"
          :ref="(el) => (itemRefs[index] = el)"
          class="form-line-wrapper">
          <div class="form-line">
            <div class="form-item select-box">
              <BaseFormItem
                :field="`${index}.type`"
                :rules="[{ required: true, message: '请选择类型' }]">
                <BaseSelect
                  v-model="item.type"
                  :options="serviceInfo.param"
                  :field-names="{ value: 'type', label: 'name' }"
                  placeholder="请选择"
                  allow-clear
                  @change="onTypeChange(index)" />
              </BaseFormItem>
            </div>

            <div class="line-divider"></div>

            <div class="form-item input-box">
              <BaseFormItem
                :field="`${index}.value`"
                :rules="getRules(item.type)">
                <BaseInput
                  :ref="(el: any) => (inputRefs[index] = el)"
                  v-model="item.value"
                  :placeholder="getPlaceholder(item.type)"
                  clearable
                  @blur="handleBlur(index)" />
              </BaseFormItem>
            </div>

            <div class="action-links">
              <BaseButton
                variant="text"
                size="small"
                @click="handleCopy(index)">
                复制
              </BaseButton>
              <div class="btn-split" v-if="formData.length > 1"></div>
              <BaseButton
                v-if="formData.length > 1"
                variant="text"
                size="small"
                type="danger"
                @click="handleDelete(index)">
                删除
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </BaseForm>

    <AddLines v-model:visible="addLinesVisible" @confirm="execAddLines" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import AddLines from '../../add-lines/index.vue'

// 类型定义
interface Param {
  name: string
  type: string
  regex: string
  policeholder?: string // 兼容后端拼写
  children?: any
}

interface ServiceItem {
  channelType: string
  param: Param[]
  [key: string]: any
}

const props = defineProps<{
  formData: Array<{ id: string; type: string; value: string }>
  serviceInfo: ServiceItem
}>()

const itemRefs = ref<any[]>([])
const inputRefs = ref<any[]>([])
const formRef = ref<any>(null)
const importVisible = ref(false)
const addLinesVisible = ref(false)
// const listContainer = ref<HTMLElement | null>(null)

const getRules = (type: string) => {
  const config = props.serviceInfo.param.find((p) => p.type === type)
  const rules: any[] = [{ required: true, message: '内容不能为空' }]
  if (config?.children[0]?.regex) {
    rules.push({
      match: config?.children[0]?.regex,
      message: `${config.name}格式不正确`,
    })
  }
  return rules
}

const getPlaceholder = (type: string) => {
  const config = props.serviceInfo.param.find((p) => p.type === type)
  return config?.policeholder || '请输入内容'
}

const handleBlur = (index: number) => {
  // 输入框失去焦点时进行当前行的字段校验
  formRef.value?.validateField(`${index}.value`)
}

const onTypeChange = (index: number) => {
  // 切换类型时清空该行的校验结果，等待用户失焦后再重新校验
  formRef.value?.clearValidate([`${index}.type`, `${index}.value`])
}

const generateId = () => Math.random().toString(36).slice(2, 9)

const execAddLines = async (num: number) => {
  const startIndex = props.formData.length

  const newItems = Array.from({ length: num }, () => ({
    id: generateId(),
    type: '',
    value: '',
  }))
  props.formData.push(...newItems)
  await nextTick()
  if (itemRefs.value[startIndex]) {
    itemRefs.value[startIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
    setTimeout(() => {
      inputRefs.value[startIndex]?.focus()
    }, 300)
  }
}

const handleCopy = async (index: number) => {
  const source = props.formData[index]
  if (source) {
    const newItem = { ...source, id: generateId() }
    props.formData.splice(index + 1, 0, newItem)

    await nextTick()
    inputRefs.value[index + 1]?.focus()
  }
}

const handleDelete = (index: number) => {
  if (props.formData.length <= 1) {
    props.formData[0]!.value = ''
    props.formData[0]!.type = ''
    // 必须要清除当前这一行的校验状态，否则刚填错被校验出的红字会残留
    formRef.value?.clearValidate()
    return
  }
  props.formData.splice(index, 1)
  // 清理对应的 ref 索引，防止内存泄漏或索引错乱
  itemRefs.value.splice(index, 1)
  inputRefs.value.splice(index, 1)
}

const handleClearAll = () => {
  props.formData.splice(0, props.formData.length, {
    id: generateId(),
    type: '',
    value: '',
  })
  itemRefs.value = []
  inputRefs.value = []

  // 清洗重置列表后，清除潜在的异步校验红框
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const validate = async () => {
  if (!formRef.value) return true
  const errors = await formRef.value.validate()
  return !errors
}

// 暴露校验接口
defineExpose({ validate })
</script>

<style scoped lang="scss">
.step-one-wrapper {
  padding: 0 4px;
}

.btn-actions {
  display: flex;
  gap: 12px;
  padding: 16px 0;
}

.info-card-container {
  display: flex;
  flex-direction: column;
  background-color: $bg-3;
  border-radius: $radius-m;
  border: 1px solid $b-1;
  max-height: 400px; // 稍微调小一点，预留错误提示空间
  overflow-y: auto;

  .form-line-wrapper {
    position: relative;
    border-bottom: 1px solid $b-1;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: $bg-h;
    }
    &:last-child {
      border-bottom: none;
    }

    // 关键：当内部有错误时，为绝对定位的错误信息留出空间，撑开行高，避免遮挡下一行
    &:has(.base-form-item-has-error) {
      padding-bottom: 26px;
      z-index: 10;
    }
  }

  .form-line {
    display: flex;
    align-items: center;
    width: 100%;
    height: 54px;
    padding: 0 16px;
  }

  .select-box {
    width: 130px;
  }

  .line-divider {
    width: 1px;
    height: 14px;
    background-color: $b-1;
    margin: 0 12px;
  }

  .input-box {
    flex: 1;
    min-width: 0;
  }

  .action-links {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-left: 12px;
    white-space: nowrap;

    .btn-split {
      width: 1px;
      height: 12px;
      background-color: $b-1;
      margin: 0 4px;
    }
  }
}

/* 样式穿透：精准控制 BaseFormItem 在这种列表布局中的样式 */
:deep(.base-form-item) {
  width: 100%;
  margin-bottom: 0 !important; // 复写 default margin

  // 各自绑定独立校验器后，可以回归自然原生定位，无需外挂偏移
  .base-form-item-message {
    position: absolute !important;
    top: 100% !important;
    left: 4px !important;
    font-size: 11px !important;
    margin-top: 4px !important; // 稍微向下移动，留出边框距离
    padding: 0 !important;
    line-height: 1 !important;
    background: transparent !important;
  }

  // 错误时 Input 的样式已经在 BaseFormItem 里通过 is-error 类控制了
}
</style>
