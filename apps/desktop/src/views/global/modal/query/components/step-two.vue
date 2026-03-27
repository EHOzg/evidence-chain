<template>
  <div class="step-two-wrapper">
    <div class="section-row">
      <span class="section-label required">已选渠道</span>
      <div class="selected-channel-info">
        <div class="channel-header">
          <span class="channel-name">{{ serviceInfo?.channelType }}</span>
        </div>
      </div>
    </div>

    <!-- 可调取内容 -->
    <div class="section-row content-section">
      <span class="section-label required">可调取内容</span>
      <div class="content-table-wrapper">
        <BaseTable
          :columns="columns"
          :data="contentGroups"
          row-key="id"
          size="medium"
          :bordered="true"
          :hoverable="true"
          :pagination="false">
          <!-- 自定义表头 -->
          <template #th="{ column }">
            <template v-if="column.dataIndex === '_check'">
              <BaseCheckbox
                :model-value="isAllSelected"
                :indeterminate="isAllIndeterminate"
                @change="toggleAll" />
            </template>
            <template v-else>{{ column.title }}</template>
          </template>

          <!-- 行级分组勾选框 -->
          <template #group-check="{ record }">
            <BaseCheckbox
              :model-value="isGroupSelected(record)"
              :indeterminate="isGroupIndeterminate(record)"
              @change="toggleGroup(record)" />
          </template>

          <!-- 子项详情 CheckboxGroup -->
          <template #group-detail="{ record }">
            <BaseCheckboxGroup
              :model-value="getGroupSelected(record)"
              :options="
                record.children.map((c: ContentItem) => ({
                  label: c.name,
                  value: c.id,
                }))
              "
              direction="horizontal"
              @change="(val: string[]) => onGroupDetailChange(val, record)" />
          </template>
        </BaseTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseTable from '@project/ui/BaseTable/index.vue'
import BaseCheckbox from '@project/ui/BaseCheckbox/index.vue'
import BaseCheckboxGroup from '@project/ui/BaseCheckboxGroup/index.vue'

defineOptions({ name: 'StepTwo' })

interface ContentItem {
  id: string
  name: string
}

interface ContentGroup {
  id: string
  name: string
  children: ContentItem[]
}

interface StepTwoFormData {
  channelName?: string
  selectedIds?: string[]
  remark?: string
}

interface Param {
  name: string
  type: string
  regex: string
  children?: any
}

interface ServiceInfo {
  channelType: string
  channelImplTag: string
  desc: string
  param: Param[]
  [key: string]: any
}

const props = withDefaults(
  defineProps<{
    formData: StepTwoFormData
    contentGroups: ContentGroup[]
    serviceInfo?: ServiceInfo
  }>(),
  {
    formData: () => ({ selectedIds: [] }),
    contentGroups: () => [],
  },
)

// 表格列定义
const columns = [
  {
    dataIndex: '_check',
    title: '',
    width: 48,
    slotName: 'group-check',
    bodyCellStyle: { padding: '12px 14px' },
  },
  {
    dataIndex: 'name',
    title: '内容',
    width: 130,
  },
  {
    dataIndex: '_detail',
    title: '内容详情',
    slotName: 'group-detail',
  },
]

// contentGroups 由父组件通过 props 传入

// 用 Set 管理全局已选 ID
const selectedSet = ref<Set<string>>(new Set(props.formData?.selectedIds || []))

const getGroupSelected = (group: ContentGroup) =>
  group.children.filter((c) => selectedSet.value.has(c.id)).map((c) => c.id)

const isGroupSelected = (group: ContentGroup) =>
  group.children.length > 0 &&
  group.children.every((c) => selectedSet.value.has(c.id))

const isGroupIndeterminate = (group: ContentGroup) => {
  const count = group.children.filter((c) => selectedSet.value.has(c.id)).length
  return count > 0 && count < group.children.length
}

const allItemIds = computed(() =>
  props.contentGroups.flatMap((g) => g.children.map((c) => c.id)),
)

const isAllSelected = computed(
  () =>
    allItemIds.value.length > 0 &&
    allItemIds.value.every((id) => selectedSet.value.has(id)),
)

const isAllIndeterminate = computed(() => {
  const count = allItemIds.value.filter((id) =>
    selectedSet.value.has(id),
  ).length
  return count > 0 && count < allItemIds.value.length
})

const toggleGroup = (group: ContentGroup) => {
  const next = new Set(selectedSet.value)
  if (isGroupSelected(group)) {
    group.children.forEach((c) => next.delete(c.id))
  } else {
    group.children.forEach((c) => next.add(c.id))
  }
  selectedSet.value = next
  syncToFormData()
}

const toggleAll = (checked: boolean) => {
  selectedSet.value = checked ? new Set(allItemIds.value) : new Set()
  syncToFormData()
}

const onGroupDetailChange = (newVal: string[], group: ContentGroup) => {
  const next = new Set(selectedSet.value)
  group.children.forEach((c) => next.delete(c.id))
  newVal.forEach((id) => next.add(id))
  selectedSet.value = next
  syncToFormData()
}

const syncToFormData = () => {
  if (props.formData) {
    props.formData.selectedIds = [...selectedSet.value]
  }
}

const validate = () => selectedSet.value.size > 0

defineExpose({ validate })
</script>

<style scoped lang="scss">
.step-two-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 0;
}

.section-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .section-label {
    font-size: 14px;
    font-weight: 500;
    color: $t-1;
    white-space: nowrap;
    padding-top: 2px;
    min-width: 72px;

    &.required::before {
      content: '* ';
      color: $danger;
    }
  }
}

.selected-channel-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .channel-header {
    display: flex;
    align-items: center;

    .channel-name {
      display: inline-flex;
      align-items: center;
      padding: 3px 12px;
      background: color-mix(in srgb, $p 12%, transparent);
      color: $p;
      border: 1px solid color-mix(in srgb, $p 25%, transparent);
      border-radius: $radius-s;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
    }
  }
}

.content-section {
  align-items: flex-start;
}

.content-table-wrapper {
  flex: 1;
  min-width: 0;
  border-radius: $radius-m;
  overflow: hidden;
}

:deep(.base-table-container) {
  border-radius: $radius-m;
}
</style>
