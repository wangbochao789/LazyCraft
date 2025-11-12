import type { Fetcher } from 'swr'
import { get, post } from './base'
import type {
  BaseResponse,
} from '@/core/data/common'
export const sendForgotPasswordEmail: Fetcher<BaseResponse, { url: string; body: { email: string } }> = ({ url, body }) =>
  post<BaseResponse>(url, { body })

export const changePasswordWithToken: Fetcher<BaseResponse, { url: string; body: { token: string; new_password: string; password_confirm: string } }> = ({ url, body }) =>
  post<BaseResponse>(url, { body })

export const login: Fetcher<BaseResponse & { data: string }, { url: string; body: Record<string, any> }> = ({ url, body }) => {
  return post(url, { body }) as Promise<BaseResponse & { data: string }>
}

export const checkExist: Fetcher<BaseResponse & { data: string }, { url: string; body: Record<string, any> }> = ({ url, body }) => {
  return post(url, { body }) as Promise<BaseResponse & { data: string }>
}

export const commonPost: Fetcher<BaseResponse & { data: string }, { url: string; body: Record<string, any> }> = ({ url, body }) => {
  return post(url, { body }) as Promise<BaseResponse & { data: string }>
}

// 添加用户
export const addUser: Fetcher<BaseResponse & { data: string }, { url: string; body: Record<string, any> }> = ({ url, body }) => {
  return post(url, { body }) as Promise<BaseResponse & { data: string }>
}

// 修改密码
export const updatePassword: Fetcher<BaseResponse & { data: string }, { url: string; body: Record<string, any> }> = ({ url, body }) => {
  return post(url, { body }) as Promise<BaseResponse & { data: string }>
}

// 重置密码
export const resetPassword: Fetcher<BaseResponse & { data: string }, { url: string; body: Record<string, any> }> = ({ url, body }) => {
  return post(url, { body }) as Promise<BaseResponse & { data: string }>
}

export const getUserInfo = () => {
  return get('account/profile')
}

export const logout: Fetcher<BaseResponse, { url: string; params: Record<string, any> }> = ({ url, params }) => {
  return get<BaseResponse>(url, params)
}

export const fetchBaiyunToken: Fetcher<BaseResponse, { url: string; body: any }> = async ({ url, body }) => {
  // const token = localStorage.getItem('console_token') || ''

  // 将 body 参数转换为查询参数
  const queryParams = new URLSearchParams()
  if (body && typeof body === 'object') {
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined && body[key] !== null)
        queryParams.append(key, body[key])
    })
  }

  const response = await fetch(`${url}?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': token ? `Bearer ${token}` : '',
    },
    credentials: 'include',
  })

  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  return response.json()
}
export const fetchBaiyunLogin: Fetcher<BaseResponse, { url: string; body: any }> = async ({ url, body }) => {
  // const token = localStorage.getItem('console_token') || ''

  const response = await fetch(`${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': token ? `Bearer ${token}` : '',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  })

  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  return response.json()
}