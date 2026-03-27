<template>
  <div class="audit-record-page">
    <div class="search-card">
      <div class="search-item">
        <label>日期</label>
        <BaseDatePicker
          v-model="searchForm.dateRange"
          mode="range"
          :shortcuts="[
            {
              label: '最近一周',
              value: () => {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                return [start, end]
              },
            },
            {
              label: '最近一月',
              value: () => {
                const end = new Date()
                const start = new Date()
                start.setMonth(start.getMonth() - 1)
                return [start, end]
              },
            },
          ]"
          shortcuts-position="left"
          show-confirm-btn
          style="width: 270px"
          @change="handleDateChange" />
      </div>
      <div class="search-item">
        <div class="search-item">
          <label>状态</label>
          <BaseSelect
            v-model="searchForm.status"
            :options="statusOptions"
            placeholder="请选择状态"
            style="width: 160px"
            allow-clear />
        </div>
      </div>

      <div class="search-btns">
        <BaseButton size="small" @click="handleSearch">查询</BaseButton>
        <BaseButton size="small" variant="secondary" @click="handleReset"
          >重置</BaseButton
        >
      </div>
    </div>

    <div class="table-card">
      <BaseTable
        :columns="columns"
        :data="recordList"
        :loading="loading"
        :bordered="{ wrapper: false, cell: false }"
        :pagination="paginationConfig"
        row-key="id">
        <template #channel="{ record }">
          <div class="channel-cell">
            <span class="icon-placeholder">🔹</span>
            {{ record.channelName }}
          </div>
        </template>

        <template #taskProgress="{ record }">
          <div class="progress-wrapper">
            <div class="progress-bar">
              <div
                class="progress-inner"
                :style="{ width: record.progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ record.progress }}%</span>
          </div>
        </template>

        <template #auditStatus="{ record }">
          <span :class="['status-tag', record.statusType]">
            {{ record.statusText }}
          </span>
        </template>

        <template #actions="{ record }">
          <div class="table-actions">
            <BaseButton variant="text" size="small"> 详情 </BaseButton>
            <BaseButton
              v-if="record.canDelete"
              variant="text"
              type="danger"
              size="small">
              删除
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const searchForm = reactive({
  dateRange: [],
  status: '',
})

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '审核中', value: 'warning' },
  { label: '已通过', value: 'success' },
  { label: '已驳回', value: 'danger' },
]

// 1. 定义列配置
const columns = [
  { title: '创建时间', dataIndex: 'createTime', width: 200 }, // 加宽
  { title: '调证渠道', slotName: 'channel', width: 180 },
  { title: '账号/号码', dataIndex: 'account', width: 180 },
  { title: '调证内容', dataIndex: 'content', minWidth: 300 }, // 调证内容通常很长，给大一点
  { title: '任务进度', slotName: 'taskProgress', width: 200 },
  { title: '审批进度', slotName: 'auditStatus', width: 150 },
  { title: '创建人', dataIndex: 'creator', width: 150 },
  { title: '操作', slotName: 'actions', width: 100, fixed: 'right' },
]

// 2. 模拟数据 (对照 image_f06607.png)
const recordList = ref([
  {
    id: '1',
    createTime: '2026-03-19 14:00:00',
    channelName: '支付宝 (中国)',
    account: '138****8888',
    content: '注册信息、账单明细、登录日志',
    progress: 80,
    statusText: '审核中',
    statusType: 'warning',
    creator: 'zhaogeng',
    canDelete: false,
  },
  {
    id: '2',
    createTime: '2026-03-18 09:30:00',
    channelName: '网约车',
    account: '139****9999',
    content: '订单详情',
    progress: 100,
    statusText: '已通过',
    statusType: 'success',
    creator: 'zhaogeng',
    canDelete: true,
  },
])

const loading = ref(false)
const paginationConfig = {
  total: 100,
  pageSize: 10,
  current: 1,
}

const handleSearch = () => {
  console.log('执行查询，参数：', searchForm)
  // 这里可以调用 API 获取 recordList
}

const handleReset = () => {
  searchForm.dateRange = []
  searchForm.status = ''
}

const handleDateChange = (val: any) => {
  console.log('选择的时间戳数组:', val)
}
</script>

<style scoped lang="scss">
.audit-record-page {
  padding: 16px;
  background: var(--bg-body);
  min-height: 100vh;
  /* 确保页面本身不会横向撑开 */
  overflow: hidden;
}

.search-card {
  background: var(--bg-card);
  padding: 20px;
  border-radius: $radius-m;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
  align-items: center;

  .search-item {
    display: flex;
    align-items: center;
    gap: 12px;

    label {
      white-space: nowrap; // 保证标签不换行
      font-weight: 500; // 稍微加粗，更有“后台系统”的稳重感
      min-width: 40px; // 固定标签宽度，让后面的组件左对齐
    }
  }

  .search-btns {
    margin-left: auto;
    display: flex;
    gap: 8px;
  }
}

.table-card {
  background: var(--bg-card);
  border-radius: $radius-m;
  border: 1px solid var(--border-color);

  // 如果这里写了 overflow: hidden，且内部没有正确撑开，滚动条会被剪裁掉
  width: 100%;
  overflow: visible; // 改为 visible 看看
}

/* 表格内部自定义样式 */
.channel-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  .icon-placeholder {
    font-size: 16px;
  }
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  .progress-bar {
    flex: 1;
    height: 6px;
    background: var(--bg-1);
    border-radius: 3px;
    overflow: hidden;
    .progress-inner {
      height: 100%;
      background: var(--primary-6);
      transition: width 0.3s;
    }
  }
  .progress-text {
    font-size: 12px;
    color: var(--text-tips);
    min-width: 35px;
  }
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  &.warning {
    background: rgba($warning, 0.1);
    color: var(--warning);
  }
  &.success {
    background: rgba($success, 0.1);
    color: var(--success);
  }
}

.table-actions {
  display: flex;
  gap: 12px;
  .text-btn {
    background: none;
    border: none;
    color: var(--primary-6);
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
    &.danger {
      color: var(--danger);
    }
  }
}
</style>
