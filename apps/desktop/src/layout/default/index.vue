<template>
  <div class="layout_container">
    <aside class="layout_sider">
      <div class="logo">
        <div class="logo_icon">
          <svg-icon icon-class="menu-logo" :width="30" :height="30"></svg-icon>
        </div>

        <span class="logo_text">调证系统</span>
      </div>

      <nav class="menu">
        <template v-for="item in displayRoutes" :key="item.path">
          <div
            v-if="!item.meta?.hidden"
            class="menu_item"
            :class="{ is_active: activePath === item.fullPath }"
            @click="router.push(item.fullPath)">
            <svg-icon
              :icon-class="'menu-' + (item.meta?.icon || 'default')"
              class="menu_icon"
              :width="20"
              :height="20" />
            <span class="menu_label">{{ item.meta?.title || item.name }}</span>
          </div>
        </template>
      </nav>

      <div class="sider_footer" @click="userStore.logout()">
        <div class="user_card">
          <div class="avatar">{{ userStore.user.name }}</div>
          <div class="user_meta">
            <div class="user_name">{{ userStore.user.account }}</div>
            <div class="user_role">{{ userStore.user.role_name }}</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="layout_content">
      <header class="layout_header">
        <div class="header_left">
          <div class="breadcrumb">
            <span class="bc_root" @click="goHome">首页</span>
            <span class="bc_separator" v-if="currentMenuLabel !== '首页'"
              >/</span
            >
            <!-- 首页不显示 -->
            <span class="bc_current" v-if="currentMenuLabel !== '首页'">{{
              currentMenuLabel
            }}</span>
          </div>
        </div>
        <div class="header_right">
          <button class="header_action_btn">
            <svg-icon icon-class="notification" />
          </button>
          <button class="header_action_btn">
            <svg-icon icon-class="settings" />
          </button>
        </div>
      </header>

      <section class="page_container">
        <div class="page_content">
          <router-view />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@project/store'

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()

const displayRoutes = computed(() => {
  const allRoutes = router.options.routes

  const children = allRoutes
    .filter((routeItem) => routeItem.path === '/')
    .flatMap((routeItem) => routeItem.children ?? [])

  return children
    .filter((child) => !child.meta?.hidden)
    .map((child) => {
      const fullPath = child.path.startsWith('/')
        ? child.path
        : `/${child.path}`
      return {
        ...child,
        fullPath,
      }
    })
})

const activePath = computed(() => route.path)

const currentMenuLabel = computed(() => route.meta.title ?? '控制台')

const goHome = () => {
  if (currentMenuLabel.value === '首页') return
  router.push('/home')
}
</script>

<style scoped lang="scss">
/* --- 全局布局容器 --- */
.layout_container {
  display: flex;
  height: 100%;
  width: 100vw;
  background-color: $bg-1; // 页面最底层背景
  overflow: hidden;
}

/* --- 侧边栏 (Sider) --- */
.layout_sider {
  width: $w-sider;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  background: $bg-2; // 二级容器背景
  border-right: 1px solid $b-1;
  z-index: 10;
}

.logo {
  height: $h-header;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  border-bottom: 1px solid $b-1; // 增加视觉对齐线
}

.logo_text {
  font-size: 18px;
  font-weight: 700;
  color: $p; // 使用主色别名
  letter-spacing: 0.5px;
}

/* --- 菜单区域 --- */
.menu {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}

.menu_item {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  margin-bottom: 4px;
  border-radius: $radius-m;
  cursor: pointer;
  color: $t-2; // 次要文字色
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: $bg-h; // 中性悬浮色
    color: $t-1; // 文字加深
  }

  &.is_active {
    background: $p-light; // 品牌浅色背景
    color: $p; // 品牌主色
    font-weight: 600;

    .menu_icon {
      color: $p;
      transform: scale(1.05);
    }
  }
}

.menu_icon {
  margin-right: 12px;
  fill: currentColor;
  color: $t-3; // 默认图标颜色较淡
  transition: all 0.2s;
}

/* --- 侧边栏用户区域 (Sider Footer) --- */
.sider_footer {
  padding: 12px;
  border-top: 1px solid $b-1;
  background: $bg-2;
}

.user_card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: $radius-l;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: $bg-h;
  }
}

.avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: $p-grad; // 这里的头像改用渐变色更有质感
  color: $p-text; // 自动匹配文字色
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px $p-shadow;
  overflow: hidden;
}

.user_name {
  font-size: 13px;
  font-weight: 600;
  color: $t-1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.user_meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user_role {
  font-size: 11px;
  color: $t-3;
}

/* --- 主内容区 (Main Content Layer) --- */
.layout_content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: $bg-1;
}

/* --- 顶部导航栏 (Header) --- */
.layout_header {
  height: $h-header;
  background: $bg-2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid $b-1;
  box-shadow: $s-1; // 给予细微阴影，体现浮层感
  z-index: 9;
}

/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.bc_root {
  color: $t-3;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: $p;
  }
}

.bc_separator {
  margin: 0 10px;
  color: $t-dis; // 禁用/占位文字色
}

.bc_current {
  color: $t-1;
  font-weight: 600;
}

/* 顶部操作按钮 */
.header_action_btn {
  width: 32px;
  height: 32px;
  margin-left: 8px;
  border-radius: $radius-m;
  border: none;
  background: transparent;
  color: $t-2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: $f-2; // 交互填充色
    color: $p; // 悬浮变品牌色
  }

  &:active {
    background: $bg-s;
  }
}

/* --- 核心内页容器 --- */
.page_container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: $bg-1;
}

.page_content {
  background: $bg-3; // 核心内容区使用 Card 色
  border-radius: $radius-l; // 标准大圆角
  min-height: 100%;
  padding: 24px;
  border: 1px solid $b-1; // 弱分割线
  box-shadow: $s-1; // 基础投影
}
</style>
