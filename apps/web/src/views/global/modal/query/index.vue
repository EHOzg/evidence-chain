<template>
  <BaseModal
    v-model:visible="visible"
    title="发起查询"
    :width="900"
    :simple="true"
    :ok-text="isLastStep ? '提交申请' : '下一步'"
    :ok-loading="submitLoading"
    :on-before-ok="handleNextStep"
    @cancel="currentStep = 0">
    <BaseSteps v-model:current="currentStep" type="arrow" :changeable="true">
      <BaseStep
        v-for="(item, index) in steps"
        :key="index"
        :index="index"
        :title="item.title"
        :description="item.desc" />
    </BaseSteps>

    <div class="step-content-wrapper">
      <div v-if="currentStep === 0" class="confirm-info">
        <p class="tips">请确认以下查询信息：</p>
        <div class="info-card">
          <div class="info-item">
            <label>查询内容：</label>
            <span>{{ data?.desc }}</span>
          </div>
          <div class="info-item">
            <label>包含维度：</label>
            <span v-for="p in data?.param" :key="p.name" class="tag"
              >#{{ p.name }}</span
            >
          </div>
        </div>
      </div>

      <div v-if="currentStep === 1" class="form-container">
        <p>请选择查询维度并输入参数...</p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { BaseMessage } from '@project/ui'
import { addDzEcho } from '@project/api/verify'

interface ServiceData {
  channelType: string
  desc: string
  param: Array<{ name: string; type: string }>
}

const props = defineProps<{
  data?: ServiceData | null
}>()

const visible = defineModel<boolean>('visible', {
  default: false,
})
const currentStep = ref(0)
const submitLoading = ref(false)

const steps = [
  { title: '录入线索', desc: '确认调证基础信息' },
  { title: '选择内容', desc: '选择需要查询的维度' },
  { title: '填写表单', desc: '完善查询参数详情' },
]

const isLastStep = computed(() => currentStep.value === steps.length - 1)

const handleNextStep = async (done: (closed: boolean) => void) => {
  if (!isLastStep.value) {
    currentStep.value++
    return false
  } else {
    submitLoading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      BaseMessage.success('申请提交成功')
      done(true)
    } catch (e) {
      return false
    } finally {
      submitLoading.value = false
      currentStep.value = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.step-content-wrapper {
  padding: 24px;
}

.info-card {
  background: #f7f8fa;
  padding: 16px;
  border-radius: 4px;
  .info-item {
    margin-bottom: 8px;
    label {
      font-weight: bold;
      color: #4e5969;
    }
    .tag {
      color: #0052d9;
      margin-right: 8px;
    }
  }
}

.tips {
  color: #86909c;
  margin-bottom: 12px;
}
</style>
