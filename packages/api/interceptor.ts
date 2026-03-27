import axios from 'axios'
import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosAdapter,
} from 'axios'
import { fetch } from '@tauri-apps/plugin-http'
import { unref, isRef, isReactive, toRaw } from 'vue'
import { getToken, clearToken } from '../utils/common'
import { BaseMessage } from '../ui/index'

declare global {
  interface Window {
    __TAURI_INTERNALS__?: any
  }
}

export interface HttpResponse {
  status: number
  message: string
  code: number
  data: any
}

const tauriAdapter: AxiosAdapter = async (
  config: InternalAxiosRequestConfig,
) => {
  // 注意：config.url 在 axios 中可能只是后缀，需要手动拼上 baseURL
  const fullUrl =
    config.baseURL && !config.url?.startsWith('http')
      ? `${config.baseURL.replace(/\/$/, '')}/${config.url?.replace(/^\//, '')}`
      : config.url || ''

  const response = await fetch(fullUrl, {
    method: config.method?.toUpperCase() || 'POST',
    headers: config.headers as any,
    body: config.data
      ? typeof config.data === 'string'
        ? config.data
        : JSON.stringify(config.data)
      : undefined,
  })

  // 3. 解决 Headers 类型不兼容：将 Web Headers 转换为普通对象
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key] = value
  })

  // 返回符合 AxiosResponse 接口的数据
  return {
    data: await response.json(),
    status: response.status,
    statusText: response.statusText,
    headers: headers, // 这里的 headers 现在是对象类型了
    config: config,
    request: response,
  }
}

function toRefReactive(data: any) {
  Object.keys(data).forEach((key) => {
    if (isRef(data[key])) data[key] = unref(data[key])
    if (isReactive(data[key])) data[key] = toRaw(data[key])
  })
}

/**
 * @param router
 */
export function setupInterceptors(router: any) {
  if (import.meta.env.PROD) {
    axios.defaults.adapter = tauriAdapter
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
  }

  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { params, data } = config
      if (params) toRefReactive(params)
      if (data) toRefReactive(data)

      const token = getToken()
      config.headers = config.headers || {}
      if (token) {
        config.headers.Authorization = token
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  axios.interceptors.response.use(
    (response: AxiosResponse<HttpResponse>): any => {
      const res = response.data
      const { code, message } = res

      if (code === 200) return Promise.resolve(res)

      if (code === 1000) {
        const isKickOutMsg =
          message?.includes('登录') || message?.includes('失效')

        if (isKickOutMsg) {
          clearToken()
          BaseMessage.error(message || '登录失效，请重新登录')
          router.replace('/login')
          return Promise.reject(new Error('AUTH_KICK_OUT'))
        }

        BaseMessage.error(message || '操作失败')
        return Promise.reject(new Error(message || 'BUSINESS_ERROR'))
      }

      // 处理其他 code...
      BaseMessage.error(message || 'Error')
      return Promise.reject(new Error(message || 'Error'))
    },
    (error) => {
      BaseMessage.error(error.message || '网络请求失败')
      return Promise.reject(error)
    },
  )
}

// function handleFileDownload(response: AxiosResponse) {
//   if (typeof document === 'undefined') return

//   const contentDisposition = response.headers['content-disposition']
//   const contentType = response.headers['content-type']
//   const fileName =
//     contentDisposition
//       ?.split(';')[1]
//       ?.split('filename=')[1]
//       ?.replace(/"/g, '') || 'file'

//   const url = URL.createObjectURL(
//     new Blob([response.data], { type: contentType }),
//   )
//   const a = document.createElement('a')
//   a.href = url
//   a.download = fileName
//   a.click()
//   URL.revokeObjectURL(url)
// }
