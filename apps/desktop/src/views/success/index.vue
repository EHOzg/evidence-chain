<template>
  <div class="audit-record-page">
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
import { ref } from 'vue'

// 1. 定义列配置
const columns = [
  { title: '调证渠道', slotName: 'channel', width: 180 },
  { title: '账号/号码', dataIndex: 'account', width: 180 },
  { title: '调证内容', dataIndex: 'content', minWidth: 300 }, // 调证内容通常很长，给大一点
  { title: '创建人', dataIndex: 'creator', width: 150 },
  { title: '创建时间', dataIndex: 'creator', width: 150 },
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

// const handleDateChange = (val: any) => {
//   console.log('选择的时间戳数组:', val)
// }
</script>

<style scoped lang="scss">
.audit-record-page {
  padding: 16px;
  background: var(--bg-body);
  min-height: 100vh;
  /* 确保页面本身不会横向撑开 */
  overflow: hidden;
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
