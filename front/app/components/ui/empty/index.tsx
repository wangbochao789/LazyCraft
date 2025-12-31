'use client'

import React from 'react'
import { Empty as AntdEmpty } from 'antd'
import type { EmptyProps as AntdEmptyProps } from 'antd'

export type EmptyProps = {
  /** 空状态描述 */
  description?: React.ReactNode
  /** 自定义图标 */
  image?: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 操作按钮 */
  action?: React.ReactNode
} & Omit<AntdEmptyProps, 'description' | 'image'>

/**
 * Empty 空状态组件
 *
 * 用于显示空数据状态
 * 基于 antd Empty 组件封装
 *
 * @example
 * ```tsx
 * <Empty description="暂无数据" />
 *
 * <Empty
 *   description="暂无内容"
 *   image={<CustomIcon />}
 *   action={<Button>创建</Button>}
 * />
 * ```
 */
const EmptyComponent = ({
  description = '暂无数据',
  image,
  className,
  action,
  ...props
}: EmptyProps) => {
  return (
    <AntdEmpty
      description={description}
      image={image}
      className={className}
      {...props}
    >
      {action}
    </AntdEmpty>
  )
}

EmptyComponent.displayName = 'Empty'

// 暴露 antd Empty 的静态属性
Object.assign(EmptyComponent, {
  PRESENTED_IMAGE_SIMPLE: AntdEmpty.PRESENTED_IMAGE_SIMPLE,
  PRESENTED_IMAGE_DEFAULT: AntdEmpty.PRESENTED_IMAGE_DEFAULT,
})

// 使用类型断言导出，确保静态属性被正确识别
export const Empty = EmptyComponent as React.FC<EmptyProps> & {
  displayName: string
  PRESENTED_IMAGE_SIMPLE: typeof AntdEmpty.PRESENTED_IMAGE_SIMPLE
  PRESENTED_IMAGE_DEFAULT: typeof AntdEmpty.PRESENTED_IMAGE_DEFAULT
}
