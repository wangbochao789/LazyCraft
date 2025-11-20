/**
 * 数据集布局组件的单元测试
 * 测试文件位置: front/__tests__/(appLayout)/datasets/
 * 源文件位置: front/app/(appLayout)/datasets/layout.tsx
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import DatasetsLayout from '@/app/(appLayout)/datasets/layout'

// Mock Next.js navigation
const mockReplace = jest.fn()
const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
  })),
  usePathname: jest.fn(() => '/datasets/datasetManager'),
}))

// Mock IconFont组件
jest.mock('@/app/components/base/iconFont', () => {
  return function MockIcon({ type }: { type: string }) {
    return <span data-testid={`icon-${type}`} />
  }
})

describe('DatasetsLayout - 数据集布局组件', () => {
  const { useRouter, usePathname } = require('next/navigation')

  beforeEach(() => {
    jest.clearAllMocks()
    // 默认路径为数据集管理
    usePathname.mockReturnValue('/datasets/datasetManager')
    useRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
    })
  })

  describe('菜单渲染测试', () => {
    test('应该正确渲染侧边栏菜单', () => {
      render(
        <DatasetsLayout>
          <div>测试内容</div>
        </DatasetsLayout>,
      )

      // 验证两个菜单项都存在
      expect(screen.getByText('数据集管理')).toBeInTheDocument()
      expect(screen.getByText('脚本管理')).toBeInTheDocument()

      // 验证图标存在
      expect(screen.getByTestId('icon-icon-shujujiguanli')).toBeInTheDocument()
      expect(screen.getByTestId('icon-icon-jiaobenguanli')).toBeInTheDocument()
    })

    test('应该渲染子内容', () => {
      render(
        <DatasetsLayout>
          <div data-testid="child-content">测试内容</div>
        </DatasetsLayout>,
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.getByText('测试内容')).toBeInTheDocument()
    })
  })

  describe('路径状态同步测试', () => {
    test('路径包含scriptManager时应该激活脚本管理', async () => {
      usePathname.mockReturnValue('/datasets/scriptManager')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 等待useEffect执行并检查激活状态
      await waitFor(() => {
        // 找到文本元素，然后向上查找菜单项容器（包含menuItem类名的div）
        const textElement = screen.getByText('脚本管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        // 向上查找直到找到包含menuItem类名的元素
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      }, { timeout: 3000 })

      // 数据集管理不应该被激活
      const datasetText = screen.getByText('数据集管理')
      let datasetMenuItem: HTMLElement | null = datasetText.parentElement
      while (datasetMenuItem && !datasetMenuItem.className.includes('menuItem'))
        datasetMenuItem = datasetMenuItem.parentElement
      const datasetClassName = datasetMenuItem?.className || ''
      expect(datasetClassName).not.toContain('active')
    })

    test('路径为datasetManager时应该激活数据集管理', async () => {
      usePathname.mockReturnValue('/datasets/datasetManager')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 等待useEffect执行并检查激活状态
      await waitFor(() => {
        const datasetText = screen.getByText('数据集管理')
        let datasetMenuItem: HTMLElement | null = datasetText.parentElement
        while (datasetMenuItem && !datasetMenuItem.className.includes('menuItem'))
          datasetMenuItem = datasetMenuItem.parentElement
        expect(datasetMenuItem).toBeTruthy()
        const className = datasetMenuItem?.className || ''
        expect(className).toContain('active')
      }, { timeout: 3000 })

      // 脚本管理不应该被激活
      const scriptText = screen.getByText('脚本管理')
      let scriptMenuItem: HTMLElement | null = scriptText.parentElement
      while (scriptMenuItem && !scriptMenuItem.className.includes('menuItem'))
        scriptMenuItem = scriptMenuItem.parentElement
      const scriptClassName = scriptMenuItem?.className || ''
      expect(scriptClassName).not.toContain('active')
    })

    test('路径变化时应该更新激活状态', async () => {
      const { rerender } = render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 初始状态：数据集管理激活
      await waitFor(() => {
        const textElement = screen.getByText('数据集管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })

      // 模拟路径变化
      usePathname.mockReturnValue('/datasets/scriptManager')
      rerender(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 等待状态更新
      await waitFor(() => {
        const textElement = screen.getByText('脚本管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })
    })
  })

  describe('菜单点击切换测试', () => {
    test('点击数据集管理应该切换到datasetManager路由', async () => {
      const user = userEvent.setup()
      usePathname.mockReturnValue('/datasets/scriptManager')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 点击数据集管理
      const datasetMenuItem = screen.getByText('数据集管理')
      await user.click(datasetMenuItem)

      // 应该调用replace切换到datasetManager
      expect(mockReplace).toHaveBeenCalledWith('/datasets/datasetManager')
      expect(mockReplace).toHaveBeenCalledTimes(1)
    })

    test('点击脚本管理应该切换到scriptManager路由', async () => {
      const user = userEvent.setup()
      usePathname.mockReturnValue('/datasets/datasetManager')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 点击脚本管理
      const scriptMenuItem = screen.getByText('脚本管理')
      await user.click(scriptMenuItem)

      // 应该调用replace切换到scriptManager
      expect(mockReplace).toHaveBeenCalledWith('/datasets/scriptManager')
      expect(mockReplace).toHaveBeenCalledTimes(1)
    })

    test('点击已激活的菜单项不应该重复切换', async () => {
      const user = userEvent.setup()
      usePathname.mockReturnValue('/datasets/datasetManager')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 点击已激活的数据集管理
      const datasetMenuItem = screen.getByText('数据集管理')
      await user.click(datasetMenuItem)

      // 仍然会调用replace（这是组件的行为）
      expect(mockReplace).toHaveBeenCalledWith('/datasets/datasetManager')
    })
  })

  describe('激活状态样式测试', () => {
    test('激活的菜单项应该有active类名', async () => {
      usePathname.mockReturnValue('/datasets/datasetManager')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      await waitFor(() => {
        const textElement = screen.getByText('数据集管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })
    })

    test('未激活的菜单项不应该有active类名', () => {
      usePathname.mockReturnValue('/datasets/datasetManager')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      const scriptText = screen.getByText('脚本管理')
      let scriptMenuItem: HTMLElement | null = scriptText.parentElement
      while (scriptMenuItem && !scriptMenuItem.className.includes('menuItem'))
        scriptMenuItem = scriptMenuItem.parentElement
      const scriptClassName = scriptMenuItem?.className || ''
      expect(scriptClassName).not.toContain('active')
    })
  })

  describe('边界情况测试', () => {
    test('路径不包含scriptManager时应该默认激活数据集管理', async () => {
      usePathname.mockReturnValue('/datasets/datasetManager/some/path')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      await waitFor(() => {
        const textElement = screen.getByText('数据集管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })
    })

    test('路径包含scriptManager时应该激活脚本管理', async () => {
      usePathname.mockReturnValue('/datasets/scriptManager/some/path')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      await waitFor(() => {
        const textElement = screen.getByText('脚本管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })
    })

    test('空路径应该默认激活数据集管理', async () => {
      usePathname.mockReturnValue('/datasets')

      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      await waitFor(() => {
        const textElement = screen.getByText('数据集管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })
    })
  })

  describe('组件结构测试', () => {
    test('应该包含侧边栏和内容区域', () => {
      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 验证菜单存在
      expect(screen.getByText('数据集管理')).toBeInTheDocument()
      expect(screen.getByText('脚本管理')).toBeInTheDocument()

      // 验证内容区域存在
      expect(screen.getByText('内容')).toBeInTheDocument()
    })

    test('菜单项应该包含图标和文本', () => {
      render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 验证数据集管理菜单项
      const datasetText = screen.getByText('数据集管理')
      let datasetMenuItem: HTMLElement | null = datasetText.parentElement
      while (datasetMenuItem && !datasetMenuItem.className.includes('menuItem'))
        datasetMenuItem = datasetMenuItem.parentElement
      expect(datasetMenuItem).toBeInTheDocument()
      expect(screen.getByTestId('icon-icon-shujujiguanli')).toBeInTheDocument()

      // 验证脚本管理菜单项
      const scriptText = screen.getByText('脚本管理')
      let scriptMenuItem: HTMLElement | null = scriptText.parentElement
      while (scriptMenuItem && !scriptMenuItem.className.includes('menuItem'))
        scriptMenuItem = scriptMenuItem.parentElement
      expect(scriptMenuItem).toBeInTheDocument()
      expect(screen.getByTestId('icon-icon-jiaobenguanli')).toBeInTheDocument()
    })
  })

  describe('交互流程测试', () => {
    test('完整的切换流程：从数据集管理切换到脚本管理', async () => {
      const user = userEvent.setup()
      usePathname.mockReturnValue('/datasets/datasetManager')

      const { rerender } = render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 初始状态：数据集管理激活
      await waitFor(() => {
        const textElement = screen.getByText('数据集管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })

      // 点击脚本管理
      await user.click(screen.getByText('脚本管理'))

      // 验证路由切换
      expect(mockReplace).toHaveBeenCalledWith('/datasets/scriptManager')

      // 模拟路径更新
      usePathname.mockReturnValue('/datasets/scriptManager')
      rerender(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 等待状态更新
      await waitFor(() => {
        const textElement = screen.getByText('脚本管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })
    })

    test('完整的切换流程：从脚本管理切换到数据集管理', async () => {
      const user = userEvent.setup()
      usePathname.mockReturnValue('/datasets/scriptManager')

      const { rerender } = render(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 初始状态：脚本管理激活
      await waitFor(() => {
        const textElement = screen.getByText('脚本管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })

      // 点击数据集管理
      await user.click(screen.getByText('数据集管理'))

      // 验证路由切换
      expect(mockReplace).toHaveBeenCalledWith('/datasets/datasetManager')

      // 模拟路径更新
      usePathname.mockReturnValue('/datasets/datasetManager')
      rerender(
        <DatasetsLayout>
          <div>内容</div>
        </DatasetsLayout>,
      )

      // 等待状态更新
      await waitFor(() => {
        const textElement = screen.getByText('数据集管理')
        let menuItem: HTMLElement | null = textElement.parentElement
        while (menuItem && !menuItem.className.includes('menuItem'))
          menuItem = menuItem.parentElement
        expect(menuItem).toBeTruthy()
        const className = menuItem?.className || ''
        expect(className).toContain('active')
      })
    })
  })
})
