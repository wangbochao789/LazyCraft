import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import classNames from '@/shared/utils/classnames'

type ModalComponentProps = {
  className?: string
  wrapperClassName?: string
  isShow: boolean
  onClose?: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  closable?: boolean
  overflowVisible?: boolean
}

export default function Modal({
  className,
  wrapperClassName,
  isShow,
  onClose = () => { },
  title,
  description,
  children,
  closable = false,
  overflowVisible = false,
}: ModalComponentProps) {
  // 处理背景点击事件
  const processBackgroundClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  // 处理关闭按钮点击
  const processCloseButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    onClose()
  }

  // 渲染背景遮罩
  const renderBackgroundOverlay = () => (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />
    </Transition.Child>
  )

  // 渲染模态框内容
  const renderModalContent = () => (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Dialog.Panel className={classNames(
        'modal-panel-container',
        overflowVisible ? 'overflow-visible' : 'overflow-hidden',
        className,
      )}>
        {renderModalHeader()}
        {renderCloseButton()}
        {children}
      </Dialog.Panel>
    </Transition.Child>
  )

  // 渲染模态框头部
  const renderModalHeader = () => (
    <>
      {title && (
        <Dialog.Title
          as="h3"
          className="text-lg font-medium leading-6 text-gray-900"
        >
          {title}
        </Dialog.Title>
      )}
      {description && (
        <Dialog.Description className='text-gray-500 text-xs font-normal mt-2'>
          {description}
        </Dialog.Description>
      )}
    </>
  )

  // 渲染关闭按钮
  const renderCloseButton = () => {
    if (!closable)
      return null

    return (
      <div className='absolute z-10 top-6 right-6 w-5 h-5 rounded-2xl flex items-center justify-center hover:cursor-pointer hover:bg-gray-100'>
        <XMarkIcon
          className='w-4 h-4 text-gray-500'
          onClick={processCloseButtonClick}
        />
      </div>
    )
  }

  return (
    <Transition appear show={isShow} as={Fragment}>
      <Dialog as="div" className={classNames('modal-dialog-container', wrapperClassName)} onClose={onClose}>
        {renderBackgroundOverlay()}

        <div
          className="fixed inset-0 overflow-y-auto"
          onClick={processBackgroundClick}
        >
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {renderModalContent()}
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
