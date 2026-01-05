'use client'

import type { FC } from 'react'
import React from 'react'
import { Tooltip as AntdTooltip } from 'antd'
import type { TooltipProps as AntdTooltipProps } from 'antd'

export type TooltipProps = {
  /** 工具提示的唯一标识符（保留以兼容旧 API，实际不使用） */
  selector?: string
  /** 提示文本内容 */
  content?: string
  /** 是否禁用 */
  disabled?: boolean
  /** HTML 内容 */
  htmlContent?: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 是否可点击（保留以兼容旧 API） */
  clickable?: boolean
  /** 子元素 */
  children: React.ReactNode
  /** 是否隐藏箭头 */
  noArrow?: boolean
  /** 显示位置 */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'
  /** 提示内容（与 content 相同，优先级更高） */
  title?: React.ReactNode
  /** 直接指定 placement（优先级高于 position） */
  placement?: AntdTooltipProps['placement']
} & Omit<AntdTooltipProps, 'title' | 'placement' | 'arrow'>

// 映射 position 到 antd Tooltip 的 placement
const positionToPlacement: Record<string, AntdTooltipProps['placement']> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  topLeft: 'topLeft',
  topRight: 'topRight',
  bottomLeft: 'bottomLeft',
  bottomRight: 'bottomRight',
  leftTop: 'leftTop',
  leftBottom: 'leftBottom',
  rightTop: 'rightTop',
  rightBottom: 'rightBottom',
}

/**
 * Tooltip 工具提示组件
 *
 * 用于在鼠标悬停时显示提示信息
 * 基于 antd Tooltip 组件封装
 *
 * @example
 * ```tsx
 * <Tooltip content="这是提示信息">
 *   <button>悬停我</button>
 * </Tooltip>
 *
 * <Tooltip
 *   title={<div>自定义内容</div>}
 *   position="bottom"
 * >
 *   <span>悬停查看详情</span>
 * </Tooltip>
 * ```
 */
export const Tooltip: FC<TooltipProps> = ({
  selector,
  content,
  disabled,
  position = 'top',
  placement: placementProp,
  children,
  htmlContent,
  className,
  clickable,
  noArrow,
  title,
  ...props
}) => {
  const tooltipTitle = title || htmlContent || content
  // 优先级：placementProp > position > 'top'
  const placement = placementProp || positionToPlacement[position] || 'top'

  if (disabled || !tooltipTitle)
    return <>{children}</>

  return (
    <AntdTooltip
      title={tooltipTitle}
      placement={placement}
      arrow={!noArrow}
      className={className}
      {...props}
    >
      {children}
    </AntdTooltip>
  )
}

Tooltip.displayName = 'Tooltip'
