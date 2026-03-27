import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi } from '../api/user'
import { md5 } from 'js-md5'

interface UserInfo {
  id?: string | number
  name?: string
  avatar?: string
  [key: string]: any
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {} as UserInfo,
    token: sessionStorage.getItem('token') || '',
    rememberMe: false,
    autoLogin: false,
    savedPassword: '',
    lastAccount: '',
    accountList: [] as string[],
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    /**
     * 核心：一站式登录方法
     */
    async login(loginForm: { account: string; password: string }) {
      // 1. 处理密码加密逻辑
      // 如果输入的是占位符 '******'，说明使用的是持久化存储的 md5 密码
      const isStoredPass = loginForm.password === '******'
      const finalPassword = isStoredPass
        ? this.savedPassword
        : md5(md5(loginForm.password)) // 双重 MD5 加密

      try {
        // 2. 调用 API
        const res = await loginApi({
          account: loginForm.account,
          password: finalPassword,
        })

        // 3. 存储基础信息
        this.token = res.data.token
        this.user = res.data.user
        sessionStorage.setItem('token', res.data.token)

        // 4. 执行登录成功后的账号持久化逻辑
        this.onLoginSuccess(loginForm.account, finalPassword)

        return res.data // 返回给组件，以便处理后续跳转
      } catch (error) {
        // 登录失败处理
        this.autoLogin = false
        throw error // 抛出错误让组件处理 UI 提示
      }
    },

    setToken(token: string) {
      this.token = token
      sessionStorage.setItem('token', token)
    },

    setUserInfo(user: UserInfo) {
      this.user = user
    },

    /**
     * 更新持久化偏好 (记住我、账号列表等)
     */
    onLoginSuccess(account: string, pass: string) {
      this.lastAccount = account

      // 更新账号历史列表（去重并保留最近5个）
      const list = new Set([account, ...this.accountList])
      this.accountList = Array.from(list).slice(0, 5)

      // 处理密码保存逻辑
      if (this.rememberMe) {
        this.savedPassword = pass
      } else {
        this.savedPassword = ''
      }
    },

    removeHistoryAccount(account: string) {
      this.accountList = this.accountList.filter((a) => a !== account)
    },

    /**
     * 登出逻辑
     */
    async logout(options?: {
      onBeforeRedirect?: () => Promise<void> | void
      messageFn?: (msg: string) => void
      routerPush?: (path: string) => void
    }) {
      try {
        if (this.token) {
          await logoutApi().catch(() => null)
        }
      } finally {
        this.token = ''
        this.user = {}
        this.autoLogin = false

        sessionStorage.clear()
        localStorage.clear()

        if (options?.messageFn) {
          options.messageFn('退出成功')
        }
        if (options?.onBeforeRedirect) {
          await options.onBeforeRedirect()
        }

        if (options?.routerPush) {
          options.routerPush('/login')
        } else {
          window.location.replace('#/login')
        }
      }
    },
  },

  persist: {
    key: 'project-user-storage',
    storage: localStorage,
    // paths: [
    //   'rememberMe',
    //   'autoLogin',
    //   'savedPassword',
    //   'lastAccount',
    //   'accountList',
    // ],
  },
})
