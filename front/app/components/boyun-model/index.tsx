'use client'

import { useEffect, useState } from 'react'
import Modal from '@/app/components/base/modal'
import Button from '@/app/components/base/button'
import classNames from '@/shared/utils/classnames'

type UserCredentials = {
  username: string
  password: string
}

/**
 * LoginModal - 用户登录弹层组件
 *
 * 允许用户输入账号密码，并将凭据存储到本地存储中
 */
const LoginModal = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [credentials, setCredentials] = useState<UserCredentials>({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 检查本地存储中是否已有用户凭据
  useEffect(() => {
    const savedCredentials = localStorage.getItem('userCredentials')
    if (savedCredentials) {
      try {
        const parsedCredentials = JSON.parse(savedCredentials)
        if (parsedCredentials.username && parsedCredentials.password)
          setIsOpen(false) // 如果已存在凭据，不显示弹层
      }
      catch (error) {
        // JSON解析错误时，清除错误的存储数据
        localStorage.removeItem('userCredentials')
      }
    }
  }, [])

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials({
      ...credentials,
      [name]: value,
    })
    // 清除错误信息
    if (error)
      setError('')
  }

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 简单的表单验证
    if (!credentials.username || !credentials.password) {
      setError('请输入账号和密码')
      setIsLoading(false)
      return
    }

    // 模拟登录验证过程
    setTimeout(() => {
      try {
        // 保存凭据到本地存储
        localStorage.setItem('userCredentials', JSON.stringify(credentials))
        setIsOpen(false)
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
      catch (error) {
        setError('保存凭据失败，请重试')
      }
      finally {
        setIsLoading(false)
      }
    }, 800) // 模拟请求延迟
  }

  return (
    <Modal
      isShow={isOpen}
      onClose={() => setIsOpen(false)}
      title="登录账号"
      description="请输入博云的账号和密码"
      closable={true} // 允许用户关闭弹窗
      className="w-[420px]"
    >
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="space-y-4">
          {/* 用户名输入框 */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              账号
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              className={classNames(
                'w-full px-3 py-2 border rounded-md focus:outline-none',
                (error && !credentials.username)
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500',
              )}
              placeholder="请输入账号"
            />
          </div>

          {/* 密码输入框 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              密码
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              className={classNames(
                'w-full px-3 py-2 border rounded-md focus:outline-none',
                (error && !credentials.password)
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500',
              )}
              placeholder="请输入密码"
            />
          </div>

          {/* 错误信息显示 */}
          {error && (
            <div className="text-red-500 text-sm mt-1">
              {error}
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default LoginModal
