'use client'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { Result, Spin } from 'antd'
import { useSearchParams } from 'next/navigation'
import styles from './page.module.scss'
import { Service as OpenAPIService } from '@/infrastructure/api/generated/services/Service'

const AuthPageContent = () => {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const [statu, setStatu] = useState<any>('')
  const [loading, setLoading] = useState<any>(true)
  const getAuth = useCallback(() => {
    setLoading(true)
    OpenAPIService.getToolAuth(code ?? undefined, state ?? undefined).then((res) => {
      if (res)
        setStatu(res?.message)
    }).finally(() => {
      setLoading(false)
    })
  }, [state, code])
  useEffect(() => {
    state && getAuth()
  }, [getAuth, state])
  return (
    <Spin spinning={loading}>
      <div className={styles.outerWrap}>
        <div className={styles.costWrap}>
          {!loading && <Result
            status={statu === 'success' ? 'success' : 'error'}
            title={statu === 'success' ? '已授权成功!' : '授权失败!'}
          />}
        </div>
      </div>
    </Spin>

  )
}

const AuthPage = () => {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  )
}

export default AuthPage
