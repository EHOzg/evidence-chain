<template>
  <div class="page-container">
    <div class="tips-banner">
      <div class="tip-content">
        <span class="tip-label">提示</span>
        <p class="tip-text">
          请根据下方列表展示信息，根据需要的线索 &
          可调取或查询的内容，准备好相关材料再发起。
        </p>
      </div>
    </div>

    <div class="card-grid">
      <div v-for="(item, index) in list" :key="index" class="service-card">
        <div class="card-header">
          <div class="title-group">
            <div class="icon-wrapper">
              <img
                v-if="!imgErrorMap[index]"
                :src="getIconUrl(item.channelImplTag)"
                class="channel-icon"
                @error="handleImgError(index)" />
              <div v-else class="default-icon">
                {{ item.channelType.charAt(0) }}
              </div>
            </div>
            <BaseTooltip :content="item.channelType">
              <span class="title">{{ item.channelType }}</span>
            </BaseTooltip>
          </div>
          <a href="javascript:;" class="query-btn" @click="handleQuery(item)"
            >发起查询</a
          >
        </div>

        <div class="card-body">
          <div class="tag-container">
            <span
              v-for="(param, pIdx) in item.param.slice(0, 3)"
              :key="pIdx"
              class="tag">
              {{ param.name }}
            </span>

            <BaseTooltip
              v-if="item.param.length > 3"
              :content="getAllTags(item.param.slice(3))">
              <span class="tag more-tag"> +{{ item.param.length - 3 }} </span>
            </BaseTooltip>
          </div>

          <div class="label">可查询内容：</div>
          <div class="value">
            <BaseTooltip :content="item.desc">
              <p class="content-text">{{ item.desc }}</p>
            </BaseTooltip>
          </div>
        </div>
      </div>
    </div>
  </div>

  <template>
    <QueryModal v-model:visible="visible" :data="selectedItem" />
  </template>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import QueryModal from '@/views/global/modal/query/index.vue'
import { getDzList } from '@project/api/verify'
import { LibImages } from '@project/assets'
import { BaseTooltip } from '@project/ui'

interface Param {
  name: string
  type: string
}

interface ServiceItem {
  channelType: string
  channelImplTag: string
  desc: string
  param: Param[]
  [key: string]: any
}

const visible = ref(false)
const selectedItem = ref<ServiceItem | null>(null)

const list = ref<ServiceItem[]>([])
const imgErrorMap = reactive<Record<number, boolean>>({})

const getIconUrl = (tag: string) => {
  return LibImages[tag] || LibImages['info']
}

const handleImgError = (index: number) => {
  imgErrorMap[index] = true
}

const getAllTags = (params: Param[]) => {
  return params.map((p) => p.name).join('、')
}

const fetchData = async () => {
  try {
    const res = await getDzList({})
    if (res.data) {
      list.value = res.data.list
    }
  } catch (error) {
    console.error('获取列表失败:', error)
  }
}

const handleQuery = (item: ServiceItem) => {
  selectedItem.value = item
  visible.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
/* Home 页面样式重构 */
.page-container {
  height: 100%;
  overflow-y: auto;
  padding: 0 4px; // 留出一点边距，配合内层 grid
}

/* ==========================================
   1. Tips Banner (顶部提示栏)
   ========================================== */
.tips-banner {
  padding: 4px 20px;
  margin-bottom: 24px;
  // background-image: url($tips-bg);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  border-radius: $radius-m;
  box-shadow: $s-1;
}

.tip-content {
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 1;
}

.tip-label {
  color: $p; // 品牌主色
  font-size: 14px;
  margin-right: 12px;
  font-weight: bold;
  font-family: 'YouSheBiaoTiHei', sans-serif;
  letter-spacing: 1px;
}

.tip-text {
  margin: 0;
  color: $t-2; // 次要文字色
  font-size: 14px;
}

/* ==========================================
   2. Card Grid (卡片网格)
   ========================================== */
.card-grid {
  display: grid;
  // 最小宽度调至 400px 左右，自适应排布
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  padding-bottom: 24px;
}

.service-card {
  background: $bg-3; // 基础卡片底色
  border-radius: $radius-l; // 大圆角显得更现代
  border: 1px solid $b-1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $s-3; // 使用三级投影增强悬浮感
    border-color: $p-5; // 悬浮时边框变为主色浅色阶

    .card-header {
      background: color-mix(in srgb, $p 15%, transparent); // 头部随之加深
    }
  }
}

/* 卡片头部 */
.card-header {
  padding: 12px 20px;
  background: color-mix(in srgb, $p 8%, transparent); // 极淡的品牌色背景
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $b-1;
  transition: background 0.3s;
}

.title-group {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.icon-wrapper {
  width: 28px;
  height: 28px;
  background: $bg-3;
  border-radius: $radius-m;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: $s-1;
}

.channel-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.default-icon {
  color: $p;
  font-weight: bold;
  font-size: 16px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: $t-1; // 标题颜色
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover {
    color: $p;
  }
}

.query-btn {
  color: $p;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  background: transparent;
  border-radius: $radius-m;
  transition: all 0.2s;

  &:hover {
    background: $p;
    color: $p-text; // 反白显示
  }
}

/* 卡片主体 */
.card-body {
  padding: 16px 20px;
  flex: 1;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  background: color-mix(in srgb, $p 10%, transparent); // 浅底深字
  color: $p;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: $radius-s;
  border: 1px solid color-mix(in srgb, $p 20%, transparent);
}

.more-tag {
  cursor: pointer;
  font-weight: bold;
}

.label {
  color: $t-3; // 辅助提示色
  font-size: 13px;
  margin-bottom: 6px;
  text-align: left;
}

.content-text {
  font-size: 13px;
  line-height: 1.6;
  color: $t-2;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
  text-align: left;

  &:hover {
    color: $t-1;
  }
}
</style>
