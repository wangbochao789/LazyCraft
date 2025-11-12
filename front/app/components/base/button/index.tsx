import React from 'react'
import type { CSSProperties } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import Spinner from '../spinner'
import classNames from '@/shared/utils/classnames'

// 按钮样式变体配置
const buttonStyleVariants = cva(
  'button-base disabled:button-disabled',
  {
    variants: {
      variant: {
        'primary': 'button-primary',
        'warning': 'button-warning',
        'secondary': 'button-secondary',
        'secondary-accent': 'button-secondary-accent',
        'ghost': 'button-ghost',
        'ghost-accent': 'button-ghost-accent',
        'tertiary': 'button-tertiary',
      },
      size: {
        small: 'button-small',
        medium: 'button-medium',
        large: 'button-large',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'medium',
    },
  },
)

type ButtonComponentProps = {
  destructive?: boolean
  loading?: boolean
  styleCss?: CSSProperties
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyleVariants>

const Button = React.forwardRef<HTMLButtonElement, ButtonComponentProps>(
  ({ className, variant, size, destructive, loading, styleCss, children, ...props }, ref) => {
    const buttonClassName = classNames(
      buttonStyleVariants({ variant, size, className }),
      destructive && 'button-destructive',
    )

    const renderLoadingSpinner = () => {
      if (!loading) return null
      return (
        <Spinner
          loading={loading}
          className='!text-white !h-3 !w-3 !border-2 !ml-1'
        />
      )
    }

    return (
      <button
        type='button'
        className={buttonClassName}
        ref={ref}
        style={styleCss}
        {...props}
      >
        {children}
        {renderLoadingSpinner()}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button