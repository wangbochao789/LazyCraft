'use client'
import React, { useEffect, useState } from 'react'
import { fetchBaiyunLogin, fetchBaiyunToken } from '@/infrastructure/api/common'
import BoyunModel from '@/app/components/boyun-model'

// 定义凭据类型
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
  // 从环境变量获取iframe基础URL，如果没有则使用默认值
  const iframeBaseUrl = process.env.NEXT_PUBLIC_IFRAME_BASE_URL || 'http://scaihpc.cadi.net:30001'
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
      const handleLogin = async () => {
        try {
          const loginRes = await fetchBaiyunLogin({
            url: '/paas-web/upmstreeapi/login',
            body: {
              userName: userCredentials.username,
              password: Buffer.from(userCredentials.password).toString('base64'),
              clientId: 'be2030fc2aa0416d8c9dcaa5081fb1ad',
              typeConfigId: 0,
              multfactor: 'Y',
            },
          })

          const tokenRes = await fetchBaiyunToken({
            url: '/paas-web/upmstreeapi/accessToken',
            body: {
              code: loginRes.data.code,
            },
          })
          const encryptedToken = encodeURIComponent(tokenRes.data.token)
          const encryptedRefreshToken = encodeURIComponent(tokenRes.data.refreshToken)
          setToken(encryptedToken)
          setRefreshToken(encryptedRefreshToken)
          // 部署的时候需要将admin换成user
          setRedirectUrl(encodeURIComponent('/bcc/#/image/management/list/myImage?noHeader=1&noLeftMenu=1&noTopbar=1'))
        }
        catch (error) {
          console.error('Login or token fetch failed:', error)
        }
      }

      handleLogin()
    }
  }, [userCredentials])

  useEffect(() => {
    console.log(`瑞成你好: ${iframeBaseUrl}/#/?userToken=${token}&refreshToken=${refreshToken}&redirectUrl=${redirectUrl}&noLeftMenu=1`)
  }, [iframeBaseUrl, token, refreshToken, redirectUrl])

  return (
    <>
      {
        (userCredentials && token && refreshToken && redirectUrl)
          ? (
            <div style={{ width: '100%', height: '100%' }}>
              {
                token && refreshToken && (
                  <iframe
                    src={`${iframeBaseUrl}/#/?userToken=${token}&refreshToken=${refreshToken}&redirectUrl=${redirectUrl}&noLeftMenu=1`}
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
