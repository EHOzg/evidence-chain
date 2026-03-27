import { createRouter, createWebHashHistory } from 'vue-router'
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
  if (to.path === '/login') {
  }
})

export default router
