'use client'

import React from 'react'
import { Input as AntdInput } from 'antd'
import type { InputProps as AntdInputProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import classNames from '@/shared/utils/classnames'

// 获取 AntdInput.Search 的 props 类型
type AntdSearchProps = React.ComponentProps<typeof AntdInput.Search>

export type InputProps = {
  /** 占位符文本 */
  placeholder?: string
  /** 受控值 */
  value?: string
  /** 非受控默认值 */
  defaultValue?: string
  /** 值变化回调 */
  onChange?: (inputValue: string) => void
  /** 输入框自定义类名 */
  className?: string
  /** 外层容器自定义类名 */
  wrapperClass?: string
  /** 输入框类型 */
  type?: string
  /** 是否显示前缀图标 */
  showPrefix?: boolean
  /** 自定义前缀图标 */
  prefixIcon?: React.ReactNode
  /** 是否禁用 */
  disabled?: boolean
} & Omit<AntdInputProps, 'prefix' | 'onChange' | 'value' | 'defaultValue'>

/**
 * Input 输入框组件
 *
 * 提供基础的文本输入功能，支持前缀图标、搜索模式等
 * 基于 antd Input 组件封装
 *
 * @example
 * ```tsx
 * <Input
 *   placeholder="请输入内容"
 *   value={value}
 *   onChange={(val) => setValue(val)}
 * />
 *
 * <Input
 *   showPrefix
 *   placeholder="搜索..."
 *   onChange={handleSearch}
 * />
 * ```
 */
const InputComponent = ({
  value,
  defaultValue,
  onChange,
  className = '',
  wrapperClass = '',
  placeholder,
  type,
  showPrefix,
  prefixIcon,
  disabled,
  ...props
}: InputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const placeholderText = placeholder || (showPrefix ? '搜索' : 'please input')
  const prefix = showPrefix ? (prefixIcon || <SearchOutlined />) : undefined

  return (
    <div className={classNames('relative inline-flex w-full', wrapperClass)}>
      <AntdInput
        type={type || 'text'}
        placeholder={placeholderText}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        prefix={prefix}
        className={className}
        {...props}
      />
    </div>
  )
}

InputComponent.displayName = 'Input'

// Input.Search 组件
export type SearchProps = {
  /** 占位符文本 */
  placeholder?: string
  /** 受控值 */
  value?: string
  /** 非受控默认值 */
  defaultValue?: string
  /** 值变化回调 */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** 搜索回调 */
  onSearch?: (value: string) => void
  /** 清除回调 */
  onClear?: () => void
  /** 输入框自定义类名 */
  className?: string
  /** 是否允许清除 */
  allowClear?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义样式 */
  style?: React.CSSProperties
} & Omit<AntdSearchProps, 'onChange' | 'onSearch' | 'value' | 'defaultValue'>

const SearchComponent = ({
  value,
  defaultValue,
  onChange,
  onSearch,
  onClear,
  className,
  allowClear,
  disabled,
  placeholder,
  style,
  ...props
}: SearchProps) => {
  return (
    <AntdInput.Search
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      className={className}
      allowClear={allowClear}
      disabled={disabled}
      placeholder={placeholder}
      style={style}
      {...props}
    />
  )
}

SearchComponent.displayName = 'Input.Search'

// 将 Search 组件附加到 InputComponent 上
;(InputComponent as any).Search = SearchComponent

// 使用类型断言导出，确保静态属性被正确识别
export const Input = InputComponent as typeof InputComponent & {
  Search: typeof SearchComponent
}
