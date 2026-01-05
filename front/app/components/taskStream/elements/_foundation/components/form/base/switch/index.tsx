import React from 'react'
import { Switch as UiSwitch } from '@/app/components/ui'
import type { SwitchProps } from '@/app/components/ui/switch'
import './index.scss'

type CustomSwitchProps = {
  readOnly?: boolean
} & SwitchProps

const CustomSwitch: React.FC<CustomSwitchProps> = (props) => {
  const { readOnly, checked, value, ...restProps } = props
  // 兼容 checked 属性，转换为 value
  const switchValue = value !== undefined ? value : checked
  
  return (
    <UiSwitch
      value={switchValue}
      readOnly={readOnly}
      {...restProps}
    />
  )
}

export default CustomSwitch
