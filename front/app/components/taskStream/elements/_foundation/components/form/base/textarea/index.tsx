import React from 'react'

import type { TextAreaProps } from 'antd/lib/input'
import classNames from 'classnames'
import './index.scss'
import { Input } from '@/app/components/ui'

type CustomTextAreaProps = {
  readOnly?: boolean
} & TextAreaProps

const CustomTextarea: React.FC<CustomTextAreaProps> = (props) => {
  const { readOnly, disabled, className, ...restProps } = props

  return (
    <Input.TextArea
      disabled={disabled || readOnly}
      className={classNames('custom-textarea', className, { 'custom-textarea-readonly': !!readOnly })}
      {...restProps}
    />
  )
}

export default CustomTextarea
