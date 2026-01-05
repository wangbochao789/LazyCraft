'use client'

import React from 'react'
import { Input as AntdInput } from 'antd'
import type { InputProps as AntdInputProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import classNames from '@/shared/utils/classnames'

// 获取 AntdInput.Search 的 props 类型
type AntdSearchProps = React.ComponentProps<typeof AntdInput.Search>
// 获取 AntdInput.Password 的 props 类型
type AntdPasswordProps = React.ComponentProps<typeof AntdInput.Password>
// 获取 AntdInput.TextArea 的 props 类型
type AntdTextAreaProps = React.ComponentProps<typeof AntdInput.TextArea>

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
  /** 前缀元素（直接传入，优先级高于 showPrefix 和 prefixIcon） */
  prefix?: React.ReactNode
  /** 是否禁用 */
  disabled?: boolean
  /** 最大长度 */
  maxLength?: number
  /** 自定义样式 */
  style?: React.CSSProperties
} & Omit<AntdInputProps, 'onChange' | 'value' | 'defaultValue'>

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
  prefix: prefixProp,
  disabled,
  maxLength,
  style,
  ...props
}: InputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const placeholderText = placeholder || (showPrefix ? '搜索' : 'please input')
  // 优先级：prefixProp > showPrefix + prefixIcon > undefined
  const prefix = prefixProp || (showPrefix ? (prefixIcon || <SearchOutlined />) : undefined)

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
        maxLength={maxLength}
        style={style}
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

// Input.Password 组件
export type PasswordProps = {
  /** 占位符文本 */
  placeholder?: string
  /** 受控值 */
  value?: string
  /** 非受控默认值 */
  defaultValue?: string
  /** 值变化回调 */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** 输入框自定义类名 */
  className?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 最大长度 */
  maxLength?: number
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 前缀图标 */
  prefix?: React.ReactNode
  /** 自定义图标渲染 */
  iconRender?: (visible: boolean) => React.ReactNode
} & Omit<AntdPasswordProps, 'onChange' | 'value' | 'defaultValue'>

const PasswordComponent = ({
  value,
  defaultValue,
  onChange,
  className,
  disabled,
  placeholder,
  maxLength,
  style,
  prefix,
  iconRender,
  ...props
}: PasswordProps) => {
  return (
    <AntdInput.Password
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      className={className}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={maxLength}
      style={style}
      prefix={prefix}
      iconRender={iconRender}
      {...props}
    />
  )
}

PasswordComponent.displayName = 'Input.Password'

// Input.TextArea 组件
export type TextAreaProps = {
  /** 占位符文本 */
  placeholder?: string
  /** 受控值 */
  value?: string
  /** 非受控默认值 */
  defaultValue?: string
  /** 值变化回调 */
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  /** 输入框自定义类名 */
  className?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 最大长度 */
  maxLength?: number
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 行数 */
  rows?: number
  /** 是否显示字符计数 */
  showCount?: boolean
} & Omit<AntdTextAreaProps, 'onChange' | 'value' | 'defaultValue'>

const TextAreaComponent = ({
  value,
  defaultValue,
  onChange,
  className,
  disabled,
  placeholder,
  maxLength,
  style,
  rows,
  showCount,
  ...props
}: TextAreaProps) => {
  return (
    <AntdInput.TextArea
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      className={className}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={maxLength}
      style={style}
      rows={rows}
      showCount={showCount}
      {...props}
    />
  )
}

TextAreaComponent.displayName = 'Input.TextArea'

// 将 Search、Password 和 TextArea 组件附加到 InputComponent 上
;(InputComponent as any).Search = SearchComponent
;(InputComponent as any).Password = PasswordComponent
;(InputComponent as any).TextArea = TextAreaComponent

// 使用类型断言导出，确保静态属性被正确识别
export const Input = InputComponent as typeof InputComponent & {
  Search: typeof SearchComponent
  Password: typeof PasswordComponent
  TextArea: typeof TextAreaComponent
}
