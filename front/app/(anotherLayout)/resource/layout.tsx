'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import styles from './index.module.scss'
import Icon from '@/app/components/base/iconFont'

const ResourceLayout = ({ children }) => {
  const [type, setType] = useState('monitor')
  const router = useRouter()

  useEffect(() => {
    const pathName = window.location.pathname
    if (pathName.includes('resourceAllocation'))
      setType('allocation')
    else if (pathName.includes('resourceMonitor'))
      setType('monitor')
  }, [])
  const handleJump = (type) => {
    setType(type)
    if (type === 'monitor')
      router.replace('/resource/resourceMonitor')
    else
      router.replace('/resource/resourceAllocation')
  }

  return <div className='page'>
    <div className={styles.container}>
      <div className={styles.slide}>
        <div className={styles.title}>
          资源
        </div>
        <div className={styles.menu}>
          <div className={`${styles.menuItem} ${type === 'monitor' && styles.active}`} onClick={() => handleJump('monitor')}>
            <div className={styles.icon}>
              <Icon type="icon-lichengtongji" />
            </div>
            <div className={styles.txt}>
              资源监控
            </div>
          </div>
          <div className={`${styles.menuItem} ${type === 'allocation' && styles.active}`} onClick={() => handleJump('allocation')}>
            <div className={styles.icon}>
              <Icon type="icon-shezhi1" />
            </div>
            <div className={styles.txt}>
              资源配置
            </div>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  </div>
}

export default ResourceLayout
