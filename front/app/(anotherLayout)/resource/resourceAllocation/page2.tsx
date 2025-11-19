'use client'
import React, { useEffect, useState } from 'react'
import { fetchBaiyunLogin, fetchBaiyunToken } from '@/service/common'
import BoyunModel from '@/app/components/boyun-model'

type UserCredentials = {
  username: string
  password: string
}
export default function Page() {
  const [token, setToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  // 将用户凭据作为状态，避免每次渲染重新创建
  const [userCredentials, setUserCredentials] = useState<UserCredentials | null>(null)

  // 在组件挂载时只读取一次本地存储
  useEffect(() => {
    const storedCredentials = localStorage.getItem('userCredentials')
    if (storedCredentials) {
      try {
        const parsedCredentials = JSON.parse(storedCredentials) as UserCredentials
        setUserCredentials(parsedCredentials)
      }
      catch (error) {
        console.error('Failed to parse stored credentials:', error)
        // 清除无效的存储数据
        localStorage.removeItem('userCredentials')
      }
    }
  }, []) // 空依赖数组，确保只在组件挂载时执行一次

  useEffect(() => {
    if (userCredentials) {
      fetchBaiyunLogin({
        userName: userCredentials.username,
        password: Buffer.from(userCredentials.password).toString('base64'),
        clientId: 'be2030fc2aa0416d8c9dcaa5081fb1ad',
        typeConfigId: 0,
        multfactor: 'Y',
      }).then((res) => {
        res.json().then((res) => {
          fetchBaiyunToken({
            code: res.data.code,
          }).then((res) => {
            res.json().then((res) => {
              const encryptedToken = encodeURIComponent(res.data.token)
              const encryptedRefreshToken = encodeURIComponent(res.data.refreshToken)
              setToken(encryptedToken)
              setRefreshToken(encryptedRefreshToken)
              setRedirectUrl(encodeURIComponent('/bcc/#/overview/task/admin?noHeader=1&noLeftMenu=1&noTopbar=1'))
            })
          })
        })
      })
    }
  }, [userCredentials])

  return (
    <>
      {
        userCredentials
          ? (
            <div style={{ width: '100%', height: '100%' }}>
              {
                token && refreshToken && (
                  <iframe
                    src={`http://scaihpc.cadi.net:30001/bcc/#/?userToken=${token}&refreshToken=${refreshToken}&redirectUrl=${redirectUrl}&noLeftMenu=1`}
                    width="100%"
                    height="100%"
                  ></iframe>
                )
              }
            </div>
          )
          : (
            <BoyunModel />
          )
      }
    </>
  )
}
