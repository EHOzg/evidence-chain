import { createRouter, createWebHashHistory } from 'vue-router'
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window'
import { sharedRoutesConfig, transformSharedRoutes } from '@project/router'

const componentMap: Record<string, () => Promise<any>> = {
  MAIN_LAYOUT: () => import('@/layout/default/index.vue'),
  LOGIN_LAYOUT: () => import('@/layout/login/index.vue'),
  HOME_PAGE: () => import('@/views/home/index.vue'),
  LOGIN_PAGE: () => import('@/views/login/index.vue'),
  DETAILS_PAGE: () => import('@/views/details/index.vue'),
  DRAFT_PAGE: () => import('@/views/draft/index.vue'),
  REVIEWING_PAGE: () => import('@/views/reviewing/index.vue'),
  REJECTED_PAGE: () => import('@/views/rejected/index.vue'),
  FETCHING_PAGE: () => import('@/views/fetching/index.vue'),
  SUCCESS_PAGE: () => import('@/views/success/index.vue'),
  FAILED_PAGE: () => import('@/views/failed/index.vue'),
  SETTING_PAGE: () => import('@/views/setting/index.vue'),
  NOT_FOUND_PAGE: () => import('@/views/404/index.vue'),
}

const routes = transformSharedRoutes(sharedRoutesConfig, componentMap)

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach(async (to) => {
  const { windowSize, resizable } = to.meta as any

  if (windowSize) {
    try {
      const appWindow = getCurrentWindow()
      await appWindow.setResizable(resizable ?? false)
      await appWindow.setSize(
        new LogicalSize(windowSize.width, windowSize.height),
      )
      if (to.path === '/login') {
        await appWindow.center()
      }
    } catch (error) {
      console.error('Tauri Window Resize Error:', error)
    }
  }
})

export default router
