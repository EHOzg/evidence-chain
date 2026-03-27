<template>
  <BaseModal
    v-model:visible="visible"
    title="发起查询"
    :width="900"
    :simple="true"
    @cancel="handleClose">
    <div class="step-content-wrapper">
      <BaseSteps v-model:current="currentStep" type="arrow">
        <BaseStep
          v-for="(item, index) in steps"
          :key="index"
          :title="item.title" />
      </BaseSteps>

      <div class="step-content">
        <div v-show="currentStep === 0" class="step-panel">
          <StepOne
            ref="stepOneRef"
            :form-data="masterFormData.stepOneList"
            :service-info="props.data" />
        </div>

        <div v-show="currentStep === 1" class="step-panel">
          <StepTwo
            ref="stepTwoRef"
            :form-data="masterFormData.stepTwo"
            :content-groups="stepTwoContentGroups"
            :service-info="props.data" />
        </div>

        <div v-show="currentStep === 2" class="step-panel">
          <StepThree ref="stepThreeRef" :form-data="masterFormData.stepThree" :field-config="masterFormData.stepThree.fieldConfig" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer-custom">
        <div class="left-btns">
          <BaseButton
            v-if="currentStep > 0"
            variant="secondary"
            @click="currentStep--">
            上一步
          </BaseButton>
        </div>

        <div class="right-btns">
          <BaseButton variant="secondary" @click="handleClose">取消</BaseButton>
          <BaseButton :loading="submitLoading" @click="handleNext">
            {{ currentStep === steps.length - 1 ? '提交申请' : '下一步' }}
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import StepOne from './components/step-one.vue'
import StepTwo from './components/step-two.vue'
import StepThree from './components/step-three.vue'
import { BaseMessage } from '@project/ui'
import {
  addDzSave,
  getDzContent,
  addDzContentSave,
  dzFormFieldSet,
} from '@project/api/verify'

interface Param {
  name: string
  type: string
  regex: string
  children?: any
}

interface ServiceItem {
  channelType: string
  channelImplTag: string
  desc: string
  param: Param[]
  [key: string]: any
}

const props = defineProps({
  data: {
    type: Object as () => ServiceItem,
    default: () => ({}),
  },
})

const stepOneRef = ref<any>(null)
const stepTwoRef = ref<any>(null)
const stepThreeRef = ref<any>(null)
const visible = defineModel<boolean>('visible')
const currentStep = ref(0)
const submitLoading = ref(false)
const stepTwoContentGroups = ref<any[]>([])

const masterFormData = reactive({
  stepOneList: [{ id: Date.now().toString(), type: '', value: '' }],
  stepTwo: {
    selectedIds: [],
    remark: '',
  },
  stepThree: {
    extInfo: {},
    fieldConfig: [] as any[],
  },
})

const steps = [
  { title: '录入线索' },
  { title: '选择内容' },
  { title: '填写表单' },
]

// 监听数据回显逻辑
watch(
  () => props.data,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      loadDetail(newVal)
    }
  },
  { immediate: true, deep: true },
)

const handleStepOneFinish = async () => {
  const res = await addDzSave({
    policeCaseId: 'test26030503',
    list: masterFormData.stepOneList.map((item) => {
      return {
        channelImpl: props.data.channelImpl,
        child: [
          {
            type: 'input',
            key: 'clueName',
            value: item.value,
          },
        ],
        value: item.type,
      }
    }),
  })
  return res.data.list.map((item: any) => item.childId)
}

const getStepTwoData = async (policeCaseClueId: string[] | string) => {
  const { channelImpl } = props.data
  const res = await getDzContent({
    channelImpl,
    policeCaseClueId,
  })

  stepTwoContentGroups.value = res.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    children: item.api.map((child: any) => ({
      id: child.id,
      name: child.name,
    })),
  }))

  return res.data
}

const handleStepTwoFinish = async (
  policeCaseClueId: string[] | string,
  channelContent: any,
) => {
  const res = await addDzContentSave({
    policeCaseId: 'qF9hvZwBORLD5FLfQs0I',
    channelGroup: props.data.channelGroup,
    channelImpl: props.data.channelImpl,
    policeCaseClueId,
    list: channelContent,
    selectIdList: masterFormData.stepTwo.selectedIds,
  })

  return res.data.ids.join(',')
}

const getStepThreeData = async (dzListIds: string) => {
  const res = await dzFormFieldSet({
    dzListIds,
  })
  return res.data as any[]
}

// 缓存步骤间传递的中间数据
const cachedChildIdList = ref<string[]>([])
const cachedChannelContent = ref<any[]>([])

const handleNext = async () => {
  submitLoading.value = true
  try {
    // ── Step 0：录入线索 → 下一步 ──────────────────────────────
    if (currentStep.value === 0) {
      const isStepOneValid = await stepOneRef.value?.validate()
      if (!isStepOneValid) {
        BaseMessage.error('线索格式校验未通过，请检查输入')
        return
      }

      // 提交线索，获取 childIdList
      const childIdList = await handleStepOneFinish()
      cachedChildIdList.value = childIdList

      // 预加载第二步的可选内容
      const channelContent = await getStepTwoData(childIdList)
      cachedChannelContent.value = channelContent

      currentStep.value++
      return
    }

    // ── Step 1：选择内容 → 下一步 ──────────────────────────────
    if (currentStep.value === 1) {
      const isStepTwoValid = await stepTwoRef.value?.validate()
      if (!isStepTwoValid) {
        BaseMessage.error('请勾选可调取内容')
        return
      }

      // 保存选中内容，获取 dzListIds 并加载第三步表单字段
      const dzListIds = await handleStepTwoFinish(
        cachedChildIdList.value,
        cachedChannelContent.value,
      )
      const fieldConfig = await getStepThreeData(dzListIds)
      masterFormData.stepThree.fieldConfig = fieldConfig

      currentStep.value++
      return
    }

    // ── Step 2：填写表单 → 提交申请 ────────────────────────────
    if (currentStep.value === 2) {
      const isStepThreeValid = await stepThreeRef.value?.validate()
      if (!isStepThreeValid) {
        BaseMessage.error('表单校验未通过，请检查必填项')
        return
      }

      // TODO: 调用最终提交接口
      BaseMessage.success('申请提交成功')
      handleClose()
    }
  } finally {
    submitLoading.value = false
  }
}

const loadDetail = (data: any) => {
  // 回显详情时，建议根据业务字段进行合并
  if (data.stepOneList) {
    masterFormData.stepOneList = JSON.parse(JSON.stringify(data.stepOneList))
  }
  // 其他步骤的回显...
}

const handleClose = () => {
  visible.value = false
  // 延迟重置，避免弹窗关闭动画过程中看到内容突变
  setTimeout(() => {
    currentStep.value = 0
  }, 300)
}
</script>
<style lang="scss" scoped>
.step-content-wrapper {
  padding: 24px;
}

.query-modal {
  padding: 16px;
}

.modal-footer-custom {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;

  .right-btns {
    display: flex;
    gap: 12px;
    margin-left: auto;
  }
}

.step-content {
  // margin-top: 32px;
  min-height: 300px;
}
</style>
