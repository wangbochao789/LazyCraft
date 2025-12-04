'use client'
import React from 'react'
import BrandMark from '@/app/components/base/brand-mark/logo-site'

const SignInHeader = () => {
  return (
    <div
      className='flex items-center justify-between p-6 w-full'
      style={{ position: 'absolute', top: 0 }}
    >
      <div className='flex items-center gap-3'>
        <BrandMark className='w-10 h-10 flex-shrink-0' />
        <div className='flex flex-col'>
          <span className='text-lg font-bold text-[#071127]'>智能辅助培训课件开发环境</span>
          <span className='text-sm font-semibold text-[#071127]'>机务培训模型训练与管理工具v1.0</span>
        </div>
      </div>
    </div>
  )
}

export default SignInHeader
