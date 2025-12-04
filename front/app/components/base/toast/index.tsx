'use client'
import type { ReactNode } from 'react'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid'
import { createContext, useContext } from 'use-context-selector'
import classNames from '@/shared/utils/classnames'

type ToastComponentProps = {
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  message: string
  children?: ReactNode
  onClose?: () => void
  className?: string
}

type ToastContextType = {
  notify: (props: ToastComponentProps) => void
}

export const ToastContext = createContext<ToastContextType>({} as ToastContextType)
export const useToastContext = () => useContext(ToastContext)
const Toast = ({
  type = 'info',
  message,
  children,
  className,
}: ToastComponentProps) => {
  // sometimes message is react node array. Not handle it.
  if (typeof message !== 'string')
    return null

  return <div className={classNames(
    className,
    'fixed rounded-md p-4 my-4 mx-8 z-[9999]',
    'top-0 left-1/2 transform -translate-x-1/2',
    type === 'success' ? 'bg-green-50' : '',
    type === 'error' ? 'bg-red-50' : '',
    type === 'warning' ? 'bg-yellow-50' : '',
    type === 'info' ? 'bg-blue-50' : '',
  )}>
    <div className="flex">
      <div className="flex-shrink-0">
        {type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-400" aria-hidden="true" />}
        {type === 'error' && <XCircleIcon className="w-5 h-5 text-red-400" aria-hidden="true" />}
        {type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" aria-hidden="true" />}
        {type === 'info' && <InformationCircleIcon className="w-5 h-5 text-blue-400" aria-hidden="true" />}
      </div>
      <div className="ml-3">
        <h3 className={
          classNames(
            'text-sm font-medium',
            type === 'success' ? 'text-green-800' : '',
            type === 'error' ? 'text-red-800' : '',
            type === 'warning' ? 'text-yellow-800' : '',
            type === 'info' ? 'text-blue-800' : '',
          )
        }>{message}</h3>
        {children && <div className={
          classNames(
            'mt-2 text-sm',
            type === 'success' ? 'text-green-700' : '',
            type === 'error' ? 'text-red-700' : '',
            type === 'warning' ? 'text-yellow-700' : '',
            type === 'info' ? 'text-blue-700' : '',
          )
        }>
          {children}
        </div>
        }
      </div>
    </div>
  </div>
}

export const ToastProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const initialToastState: ToastComponentProps = {
    type: 'info',
    message: 'Toast message',
    duration: 6000,
  }
  const [toastConfig, setToastConfig] = React.useState<ToastComponentProps>(initialToastState)
  const currentDuration = (toastConfig.type === 'success' || toastConfig.type === 'info') ? 3000 : 6000
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        setIsVisible(false)
      }, toastConfig.duration || currentDuration)
    }
  }, [currentDuration, isVisible, toastConfig.duration])

  const processNotification = (props: ToastComponentProps) => {
    setIsVisible(true)
    setToastConfig(props)
  }

  return (
    <ToastContext.Provider value={{
      notify: processNotification,
    }}>
      {isVisible && <Toast {...toastConfig} />}
      {children}
    </ToastContext.Provider>
  )
}

Toast.notify = ({
  type,
  message,
  duration,
  className,
}: Pick<ToastComponentProps, 'type' | 'message' | 'duration' | 'className'>) => {
  const defaultDuring = (type === 'success' || type === 'info') ? 3000 : 6000
  if (typeof window === 'object') {
    const holder = document.createElement('div')
    const root = createRoot(holder)

    root.render(<Toast type={type} message={message} duration={duration} className={className} />)
    document.body.appendChild(holder)
    setTimeout(() => {
      if (holder)
        holder.remove()
    }, duration || defaultDuring)
  }
}

export default Toast
