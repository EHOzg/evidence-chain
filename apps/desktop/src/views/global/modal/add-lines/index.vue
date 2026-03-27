<template>
  <BaseModal
    v-model:visible="visible"
    title="批量添加行数"
    :width="400"
    :simple="true"
    @cancel="handleCancel"
    @ok="handleConfirm">
    <div class="add-lines-content">
      <div class="label">添加行数</div>
      <BaseInput
        ref="inputRef"
        v-model="count"
        type="number"
        placeholder="请输入数字"
        :min="1"
        :max="100"
        autofocus
        @keyup.enter="handleConfirm" />
      <div class="tips">单次最多可批量添加 100 行</div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const visible = defineModel<boolean>('visible', { default: false })
const emits = defineEmits(['confirm'])
const count = ref<number>(1)

const handleCancel = () => {
  visible.value = false
  count.value = 1
}

const handleConfirm = () => {
  let num = Math.floor(Number(count.value))
  if (isNaN(num) || num <= 0) num = 1
  if (num > 100) num = 100

  emits('confirm', num)
  visible.value = false
  count.value = 1
}

const inputRef = ref<HTMLInputElement | null>(null)

watch(visible, async (val) => {
  if (val) {
    await nextTick()
    setTimeout(() => {
      inputRef.value?.focus?.()
    }, 50)
  }
})
</script>

<style scoped lang="scss">
.add-lines-content {
  padding: 12px 24px 24px;
  .label {
    margin-bottom: 8px;
    font-size: 14px;
    color: $t-2;
  }
  .tips {
    margin-top: 8px;
    font-size: 12px;
    color: $t-dis;
  }
}
</style>
