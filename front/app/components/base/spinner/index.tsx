import type { FC } from 'react'
import React from 'react'

type SpinnerComponentProps = {
  loading?: boolean
  className?: string
  children?: React.ReactNode | string
}

const Spinner: FC<SpinnerComponentProps> = ({ loading = false, children, className }) => {
  const isVisible = loading
  const baseSpinnerClasses = 'inline-block text-gray-200 h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]'
  const loadingStateClasses = isVisible ? 'motion-reduce:animate-[spin_1.5s_linear_infinite]' : 'hidden'
  const finalClassName = `${baseSpinnerClasses} ${loadingStateClasses} ${className ?? ''}`

  const accessibilityText = 'Loading...'
  const screenReaderClasses = '!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'

  return (
    <div
      className={finalClassName}
      role="status"
    >
      <span className={screenReaderClasses}>
        {accessibilityText}
      </span>
      {children}
    </div>
  )
}

export default Spinner
