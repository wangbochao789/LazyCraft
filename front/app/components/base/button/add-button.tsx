'use client'
import type { FC } from 'react'
import React from 'react'
import { RiAddLine } from '@remixicon/react'
import cn from '@/shared/utils/classnames'

type AddButtonComponentProps = {
  className?: string
  onClick: () => void
}

const AddButton: FC<AddButtonComponentProps> = ({
  className,
  onClick,
}) => {
  // 构建按钮的基础样式类名
  const buttonBaseStyles = 'p-1 rounded-md cursor-pointer hover:bg-gray-200 select-none'

  // 构建图标的样式类名
  const iconStyles = 'w-4 h-4 text-gray-500'

  // 处理点击事件
  const handleClick = () => {
    onClick()
  }

  return (
    <div
      className={cn(className, buttonBaseStyles)}
      onClick={handleClick}
    >
      <RiAddLine className={iconStyles} />
    </div>
  )
}

export default React.memo(AddButton)
