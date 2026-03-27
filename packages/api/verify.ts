import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL_DZ

// 获取调证清单列表
export function getDzList(params: any) {
  return axios.post('dz/channel/dzChannelList', params, { baseURL })
}

// 加入调证清单
export function addDz(params: any) {
  return axios.post('dz/list/create', params, { baseURL })
}

// 加入调证清单
export function addDzEcho(params: any) {
  return axios.post('dz/channel/dzChannelInputClueEcho', params, { baseURL })
}

// 加入调证清单
export function addDzSave(params: any) {
  return axios.post('dz/channel/dzChannelInputClueSave', params, { baseURL })
}
// 获取调证清单
export function getDzTraceId(params: any) {
  return axios.post('dz/channel/dzChannelTraceId', params, { baseURL })
}

// 获取调证清单
export function getDzContent(params: any) {
  return axios.post('dz/channel/dzChannelContent', params, { baseURL })
}

// 查询内容保存
export function addDzContentSave(params: any) {
  return axios.post('dz/channel/dzChannelContentSave', params, { baseURL })
}

// 获取表单字段
export function dzFormFieldSet(params: any) {
  return axios.post('dz/channel/dzFormFieldSet', params, { baseURL })
}