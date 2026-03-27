export const sharedRoutesConfig = [
  {
    path: '/',
    componentKey: 'LOGIN_LAYOUT',
    redirect: '/login',
    children: [
      {
        path: '/login',
        name: 'login',
        componentKey: 'LOGIN_PAGE',
        meta: {
          title: '登录',
          icon: 'login',
          hidden: true,
          windowSize: { width: 720, height: 420 },
          resizable: false,
        },
      },
    ],
  },
  {
    path: '/',
    name: 'Root',
    componentKey: 'MAIN_LAYOUT',
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        componentKey: 'HOME_PAGE',
        meta: {
          title: '首页',
          icon: 'home',
          hidden: false,
          // windowSize: { width: 1200, height: 800 },
          resizable: true,
        },
      },
      {
        path: 'details',
        name: 'details',
        componentKey: 'DETAILS_PAGE',
        meta: { title: '调证记录', icon: 'history', hidden: false },
      },
      {
        path: 'draft',
        name: 'draft',
        componentKey: 'DRAFT_PAGE',
        meta: { title: '草稿', icon: 'draft', hidden: false },
      },
      {
        path: 'reviewing',
        name: 'reviewing',
        componentKey: 'REVIEWING_PAGE',
        meta: { title: '审核中', icon: 'reviewing', hidden: false },
      },
      {
        path: 'rejected',
        name: 'rejected',
        componentKey: 'REJECTED_PAGE',
        meta: { title: '审核失败', icon: 'rejected', hidden: false },
      },
      {
        path: 'fetching',
        name: 'fetching',
        componentKey: 'FETCHING_PAGE',
        meta: { title: '正在调证', icon: 'history', hidden: false },
      },
      {
        path: 'success',
        name: 'success',
        componentKey: 'SUCCESS_PAGE',
        meta: { title: '调证成功', icon: 'success', hidden: false },
      },
      {
        path: 'failed',
        name: 'failed',
        componentKey: 'FAILED_PAGE',
        meta: { title: '调证失败', icon: 'failed', hidden: false },
      },
      {
        path: 'setting',
        name: 'setting',
        componentKey: 'SETTING_PAGE',
        meta: { title: '基础配置', icon: 'setting', hidden: false },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    componentKey: 'NOT_FOUND_PAGE',
  },
]
