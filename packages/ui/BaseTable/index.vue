<template>
  <div
    class="base-table-container"
    :class="[props.size, { 'is-bordered': getBorder('wrapper') }]">
    <div v-if="props.loading" class="table-loading-mask">
      <div class="loading-spin"></div>
      <p>数据加载中...</p>
    </div>

    <div class="table-scroll-wrapper" :style="scrollStyle">
      <table
        :style="{ tableLayout: props.tableLayoutFixed ? 'fixed' : 'auto' }">
        <thead
          v-if="props.showHeader"
          :class="{ 'is-sticky': props.stickyHeader }">
          <tr>
            <th v-if="props.rowSelection" class="col-selection">
              <input
                v-if="
                  props.rowSelection.type === 'checkbox' &&
                  props.rowSelection.showCheckedAll
                "
                type="checkbox"
                :checked="isAllSelected"
                @change="handleSelectAll" />
            </th>

            <th v-if="props.expandable" class="col-expand-header"></th>

            <th
              v-for="(col, idx) in props.columns"
              :key="col.dataIndex || idx"
              :class="[
                col.headerCellClass,
                { 'is-fixed-left': col.fixed === 'left' },
              ]"
              :style="getColStyle(col, 'header')">
              <slot name="th" :column="col">{{ col.title }}</slot>
            </th>
          </tr>
        </thead>

        <tbody>
          <template
            v-for="(record, rowIndex) in props.data"
            :key="record[props.rowKey] || rowIndex">
            <tr
              :class="getRowClass(record, rowIndex)"
              @click="handleRowClick(record, $event)">
              <td v-if="props.rowSelection" class="col-selection">
                <input
                  :type="props.rowSelection.type || 'checkbox'"
                  :checked="isSelected(record)"
                  @click.stop
                  @change="handleSelectRow(record)" />
              </td>

              <td v-if="props.expandable" class="col-expand-btn">
                <span
                  class="expand-icon"
                  :class="{ active: isExpanded(record) }"
                  @click.stop="toggleExpand(record)"
                  >▶</span
                >
              </td>

              <td
                v-for="col in props.columns"
                :key="col.dataIndex"
                :class="[col.bodyCellClass, { 'is-ellipsis': col.ellipsis }]"
                :style="getColStyle(col, 'body', record)">
                <slot
                  v-if="col.slotName"
                  :name="col.slotName"
                  :record="record"
                  :column="col"
                  :rowIndex="rowIndex"></slot>
                <template v-else>{{ record[col.dataIndex] }}</template>
              </td>
            </tr>

            <tr
              v-if="props.expandable && isExpanded(record)"
              class="expand-content-row">
              <td :colspan="totalColspan">
                <div class="expand-inner">
                  <slot name="expand-row" :record="record"></slot>
                </div>
              </td>
            </tr>
          </template>
        </tbody>

        <tfoot v-if="props.summary">
          <tr class="summary-row">
            <td :colspan="props.rowSelection ? 1 : 0"></td>
            <td v-for="(col, idx) in props.columns" :key="idx">
              <slot name="summary-cell" :column="col" :rowIndex="idx">
                {{ idx === 0 ? props.summaryText : '' }}
              </slot>
            </td>
          </tr>
        </tfoot>
      </table>

      <div v-if="!props.data.length" class="table-empty">
        <slot name="empty">暂无数据</slot>
      </div>
    </div>

    <div
      v-if="props.pagination"
      class="table-pagination-wrapper"
      :class="`pos-${props.pagePosition}`">
      <div class="pagination-left">
        <slot name="pagination-left">
          <span class="total-text"
            >共 {{ paginationConfig.total || props.data.length }} 条</span
          >
        </slot>
      </div>

      <div class="pagination-main">
        <button
          :disabled="paginationConfig.current <= 1"
          @click="handlePageChange(paginationConfig.current - 1)">
          上一页
        </button>

        <span class="page-indicator"
          >{{ paginationConfig.current }} /
          {{
            Math.ceil(paginationConfig.total / paginationConfig.pageSize)
          }}</span
        >

        <button
          :disabled="
            paginationConfig.current >=
            Math.ceil(paginationConfig.total / paginationConfig.pageSize)
          "
          @click="handlePageChange(paginationConfig.current + 1)">
          下一页
        </button>
      </div>

      <div class="pagination-right">
        <slot name="pagination-right"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'

// 严格对应你提供的 API Props
const props = withDefaults(
  defineProps<{
    columns: any[]
    data: any[]
    bordered?: boolean | any
    hoverable?: boolean
    stripe?: boolean
    size?: 'mini' | 'small' | 'medium' | 'large'
    tableLayoutFixed?: boolean
    loading?: boolean | object
    rowSelection?: any
    expandable?: any
    scroll?: {
      x?: number | string
      y?: number | string
      maxHeight?: number | string
    }
    pagination?: boolean | any
    pagePosition?: string
    rowKey?: string
    showHeader?: boolean
    stickyHeader?: boolean | number
    rowClass?: any
    summary?: boolean
    summaryText?: string
  }>(),
  {
    columns: () => [],
    data: () => [],
    bordered: true,
    hoverable: true,
    stripe: false,
    size: 'large',
    tableLayoutFixed: false,
    loading: false,
    rowKey: 'key',
    showHeader: true,
    pagePosition: 'br',
    summaryText: 'Summary',
  },
)

const emit = defineEmits([
  'row-click',
  'selection-change',
  'expand',
  'page-change',
  'change',
])

// --- 内部状态 ---
const selectedKeys = ref<any[]>([])
const expandedKeys = ref<any[]>([])

// --- 计算逻辑 ---
const scrollStyle = computed(() => {
  const style: CSSProperties = {}
  if (props.scroll?.y || props.scroll?.maxHeight) {
    style.maxHeight = props.scroll.maxHeight || props.scroll.y
    style.overflowY = 'auto'
  }
  if (props.scroll?.x) style.overflowX = 'auto'
  return style
})

const totalColspan = computed(() => {
  let count = props.columns.length
  if (props.rowSelection) count++
  if (props.expandable) count++
  return count
})

// --- 样式处理 ---
const getBorder = (type: string) => {
  if (typeof props.bordered === 'boolean') return props.bordered
  return props.bordered?.[type]
}

const getColStyle = (col: any, type: 'header' | 'body', _record?: any) => {
  const style: CSSProperties = {
    textAlign: col.align || 'left',
    width: col.width ? `${col.width}px` : 'auto',
    minWidth: col.minWidth
      ? `${col.minWidth}px`
      : col.width
        ? `${col.width}px`
        : '120px',
    whiteSpace: col.ellipsis ? 'nowrap' : 'normal',
    wordBreak: 'break-all',
  }

  // 左侧固定
  if (col.fixed === 'left') {
    style.position = 'sticky'
    style.left = 0
    style.zIndex = type === 'header' ? 30 : 20
    style.background = 'var(--table-bg)'
  }

  // 右侧固定 (新增)
  if (col.fixed === 'right') {
    style.position = 'sticky'
    style.right = 0
    style.zIndex = type === 'header' ? 30 : 20
    style.background = 'var(--table-bg)'
    // 添加一个左侧阴影，增加视觉上的“浮动感”
    style.boxShadow = '-4px 0 8px rgba(0, 0, 0, 0.05)'
  }

  return type === 'header'
    ? { ...style, ...col.headerCellStyle }
    : { ...style, ...col.bodyCellStyle }
}

const getRowClass = (record: any, rowIndex: number) => {
  return [
    props.rowClass
      ? typeof props.rowClass === 'function'
        ? props.rowClass(record, rowIndex)
        : props.rowClass
      : '',
    { 'is-stripe': props.stripe && rowIndex % 2 !== 0 },
    { 'is-hoverable': props.hoverable },
  ]
}

// --- 交互逻辑 ---
const isSelected = (record: any) =>
  selectedKeys.value.includes(record[props.rowKey])
const isAllSelected = computed(
  () =>
    props.data.length > 0 && selectedKeys.value.length === props.data.length,
)

const handleSelectRow = (record: any) => {
  const key = record[props.rowKey]
  const idx = selectedKeys.value.indexOf(key)
  if (idx > -1) selectedKeys.value.splice(idx, 1)
  else selectedKeys.value.push(key)
  emit('selection-change', [...selectedKeys.value])
}

const handleSelectAll = (e: any) => {
  const checked = e.target.checked
  selectedKeys.value = checked ? props.data.map((r) => r[props.rowKey]) : []
  emit('selection-change', [...selectedKeys.value])
}

const toggleExpand = (record: any) => {
  const key = record[props.rowKey]
  const idx = expandedKeys.value.indexOf(key)
  if (idx > -1) expandedKeys.value.splice(idx, 1)
  else expandedKeys.value.push(key)
  emit('expand', key, record)
}
const isExpanded = (record: any) =>
  expandedKeys.value.includes(record[props.rowKey])

const handleRowClick = (record: any, ev: Event) => {
  emit('row-click', record, ev)
}
const paginationConfig = computed(() => {
  const defaultPagi = {
    current: 1,
    pageSize: 10,
    total: props.data.length,
    showTotal: true,
  }
  return typeof props.pagination === 'object'
    ? { ...defaultPagi, ...props.pagination }
    : defaultPagi
})

const handlePageChange = (page: number) => {
  emit('page-change', page)
  emit('change', props.data, { type: 'pagination', page }, props.data)
}
</script>

<style scoped lang="scss">
.base-table-container {
  // 变量映射
  --table-border: #{$b-1};
  --table-bg: #{$bg-3};
  --table-th-bg: #{$bg-2};
  --table-hover: #{$bg-h};

  position: relative;
  background: var(--table-bg);
  width: 100%;
  color: $t-1;

  &.is-bordered {
    border: 1px solid var(--table-border);
    th,
    td {
      border-right: 1px solid var(--table-border);
    }
  }

  // 尺寸
  &.large {
    th,
    td {
      padding: 16px;
    }
  }

  &.medium {
    th,
    td {
      padding: 12px;
    }
  }

  &.small {
    th,
    td {
      padding: 8px;
      font-size: 13px;
    }
  }

  .table-scroll-wrapper {
    position: relative;
    overflow-x: auto;
    width: 100%;
    border-bottom: 1px solid var(--table-border);
    display: block;
  }

  table {
    min-width: 100%;
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: separate;
  }

  thead {
    &.is-sticky th {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--table-th-bg);
      box-shadow: 0 1px 0 var(--table-border);
    }
    th {
      background: var(--table-th-bg);
      font-weight: 600;
      color: $t-2;
      border-bottom: 1px solid var(--table-border);
    }
  }

  tbody tr {
    transition: background 0.2s;
    border-bottom: 1px solid var(--table-border);

    &.is-hoverable:hover {
      background: var(--table-hover);
    }
    &.is-stripe {
      background: $bg-1;
    }

    td {
      border-bottom: 1px solid var(--table-border);
    }
  }

  .expand-icon {
    display: inline-block;
    cursor: pointer;
    font-size: 10px;
    transition: transform 0.2s;
    &.active {
      transform: rotate(90deg);
    }
  }

  .is-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .table-loading-mask {
    position: absolute;
    inset: 0;
    z-index: 50;
    background: rgba($bg-3, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
  }

  .table-pagination {
    padding: 16px;
    display: flex;
    align-items: center;
    border-top: 1px solid var(--table-border);
    &.pos-br {
      justify-content: flex-end;
    }
    &.pos-bl {
      justify-content: flex-start;
    }
  }

  .table-pagination-wrapper {
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: var(--table-th-bg);
    border-top: none;

    .total-text {
      color: $t-dis;
      font-size: 13px;
      margin-right: 12px;
    }

    button {
      padding: 4px 12px;
      margin: 0 4px;
      border: 1px solid var(--table-border);
      background: var(--table-bg);
      color: $t-1;
      border-radius: $radius-s;
      cursor: pointer;
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      &:hover:not(:disabled) {
        border-color: $p;
        color: $p;
      }
    }

    .page-indicator {
      margin: 0 12px;
      font-size: 14px;
      color: $t-2;
    }
  }
}
</style>
