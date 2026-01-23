import type { Fetcher } from 'swr'
import { get, ssePost } from './base'

export const enableApi = ({ id, ...rest }, { onError, onFinish }) => {
  return ssePost(`apps/${id}/enable_api`, {
    body: {
      ...rest,
      response_mode: 'streaming',
    },
  }, { onError, onFinish })
}

export const exportAppConfig: Fetcher<{ data: string }, { appID: string; include?: boolean }> = ({ appID, include = false }) => {
  return get<{ data: string }>(`apps/${appID}/export?include_secret=${include}`)
}

export const downloadAppJson: Fetcher<any, any> = (id) => {
  return get<any>(`apps/${id}/export?format=json`)
}

// export const enableBackflow: Fetcher<any, any> = (body) => {
//   return post<any>(`apps/${body.app_id}/enable_backflow`, { body })
// }

// export const cancelPublish: Fetcher<any, any> = (body) => {
//   return post<any>(`apps/${body.app_id}/workflows/cancel_publish`, { body })
// }

// export const fetchAppList: Fetcher<AppListResult, { url: string; params?: Record<string, any> }> = ({ url, params }) => {
//   return get<AppListResult>(url, { params })
// }

// export const createApp: Fetcher<AppDetailResponse, any> = (body) => {
//   return post<AppDetailResponse>('apps', { body })
// }
