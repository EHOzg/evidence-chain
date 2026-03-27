import axios from 'axios'

export function login(data: any) {
  return axios.post<any>('/auth/login', data)
}

export function logout() {
  return axios.post<any>('/auth/logout')
}
