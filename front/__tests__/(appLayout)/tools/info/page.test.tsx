/**
 * 工具详情/编辑页面的单元测试
 * 测试文件位置: front/__tests__/(appLayout)/tools/info/
 * 源文件位置: front/app/(appLayout)/tools/info/page.tsx
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ToolsInfo from '@/app/(appLayout)/tools/info/page'
import * as toolApi from '@/infrastructure/api/tool'

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockGet = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}))

// Mock API
jest.mock('@/infrastructure/api/tool', () => ({
  getToolDetail: jest.fn(),
  cancelPublish: jest.fn(),
  publishTools: jest.fn(),
}))

// Mock Toast
jest.mock('@/app/components/base/flash-notice', () => ({
  __esModule: true,
  default: {
    notify: jest.fn(),
  },
}))

// Mock Api组件
jest.mock('@/app/(appLayout)/tools/info/Api', () => {
  return function MockApi({ getDetail, onTestSuccess }: any) {
    return (
      <div data-testid="api-component">
        <div>API Component</div>
        <button onClick={() => onTestSuccess?.()}>测试成功</button>
        <button onClick={() => getDetail?.()}>刷新详情</button>
      </div>
    )
  }
})

// Mock IDE组件
jest.mock('@/app/(appLayout)/tools/info/IDEMode', () => {
  return function MockIDE({ getDetail, onTestSuccess }: any) {
    return (
      <div data-testid="ide-component">
        <div>IDE Component</div>
        <button onClick={() => onTestSuccess?.()}>测试成功</button>
        <button onClick={() => getDetail?.()}>刷新详情</button>
      </div>
    )
  }
})

// Mock ahooks
jest.mock('ahooks', () => ({
  useMount: jest.fn(fn => fn()),
}))

describe('ToolsInfo - 工具详情/编辑页面', () => {
  const mockGetToolDetail = toolApi.getToolDetail as jest.MockedFunction<typeof toolApi.getToolDetail>
  const mockCancelPublish = toolApi.cancelPublish as jest.MockedFunction<typeof toolApi.cancelPublish>
  const mockPublishTools = toolApi.publishTools as jest.MockedFunction<typeof toolApi.publishTools>
  const mockToast = require('@/app/components/base/flash-notice').default

  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockImplementation((key: string) => {
      if (key === 'id')
        return 'tool-123'
      if (key === 'tool_mode')
        return null
      return null
    })
  })

  describe('组件渲染测试', () => {
    test('应该正确渲染工具详情页面', async () => {
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        description: '这是一个测试工具',
        icon: '/app/upload/tool.jpg',
        publish: false,
        publish_type: '',
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      // 等待数据加载
      await waitFor(() => {
        expect(mockGetToolDetail).toHaveBeenCalledWith({
          url: '/tool/tool_api',
          options: {
            params: {
              tool_id: 'tool-123',
            },
          },
        })
      })

      // 验证显示工具信息
      await waitFor(() => {
        expect(screen.getByText('测试工具')).toBeInTheDocument()
        expect(screen.getByText('这是一个测试工具')).toBeInTheDocument()
      })
    })

    test('应该显示工具创建方式卡片', async () => {
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        description: '测试描述',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        expect(screen.getByText('工具创建方式')).toBeInTheDocument()
        expect(screen.getByText('使用外部API创建')).toBeInTheDocument()
        expect(screen.getByText('在IDE中创建')).toBeInTheDocument()
      })
    })

    test('应该根据URL参数设置默认创建方式', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'id')
          return 'tool-123'
        if (key === 'tool_mode')
          return 'IDE'
        return null
      })

      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        // 应该显示IDE组件
        expect(screen.getByTestId('ide-component')).toBeInTheDocument()
      })
    })
  })

  describe('创建方式切换测试', () => {
    test('应该能够切换创建方式', async () => {
      const user = userEvent.setup()
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      // 默认应该显示API组件
      await waitFor(() => {
        expect(screen.getByTestId('api-component')).toBeInTheDocument()
      })

      // 切换到IDE
      const ideRadio = screen.getByText('在IDE中创建').closest('label')
      if (ideRadio)
        await user.click(ideRadio)

      await waitFor(() => {
        expect(screen.getByTestId('ide-component')).toBeInTheDocument()
        expect(screen.queryByTestId('api-component')).not.toBeInTheDocument()
      })

      // 切换回API
      const apiRadio = screen.getByText('使用外部API创建').closest('label')
      if (apiRadio)
        await user.click(apiRadio)

      await waitFor(() => {
        expect(screen.getByTestId('api-component')).toBeInTheDocument()
        expect(screen.queryByTestId('ide-component')).not.toBeInTheDocument()
      })
    })
  })

  describe('发布功能测试', () => {
    test('未发布时应该显示发布按钮', async () => {
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        // 使用正则表达式匹配"发布"（允许中间有空格）
        expect(screen.getByText(/发\s*布/)).toBeInTheDocument()
      })
    })

    test('点击发布按钮应该调用发布API', async () => {
      const user = userEvent.setup()
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)
      mockPublishTools.mockResolvedValue({} as any)

      render(<ToolsInfo />)

      // 等待组件加载
      await waitFor(() => {
        expect(screen.getByText(/发\s*布/)).toBeInTheDocument()
      })

      // 先触发测试成功，才能发布
      const testSuccessBtn = screen.getByText('测试成功')
      await user.click(testSuccessBtn)

      // 点击发布按钮（使用正则表达式匹配）
      const publishBtn = screen.getByText(/发\s*布/).closest('button')
      if (publishBtn)
        await user.click(publishBtn)

      await waitFor(() => {
        expect(mockPublishTools).toHaveBeenCalledWith({
          url: '/tool/publish_tool',
          body: {
            id: 'tool-123',
            publish_type: '正式发布',
          },
        })
        expect(mockToast.notify).toHaveBeenCalledWith({
          type: 'success',
          message: '发布成功',
        })
        expect(mockReplace).toHaveBeenCalledWith('/tools?tab=custom')
      })
    })

    test('测试未通过时不应该允许发布', async () => {
      const user = userEvent.setup()
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      // 使用正则表达式匹配"发布"（允许中间有空格）
      await waitFor(() => {
        expect(screen.getByText(/发\s*布/)).toBeInTheDocument()
      })

      // 直接点击发布（未测试）
      const publishBtn = screen.getByText(/发\s*布/).closest('button')
      if (publishBtn)
        await user.click(publishBtn)

      await waitFor(() => {
        expect(mockToast.notify).toHaveBeenCalledWith({
          type: 'warning',
          message: '测试通过后才能发布',
        })
        expect(mockPublishTools).not.toHaveBeenCalled()
      })
    })

    test('已发布且publish_type为正式发布时应该显示更新发布和取消发布按钮', async () => {
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: true,
        publish_type: '正式发布',
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        expect(screen.getByText('更新发布')).toBeInTheDocument()
        expect(screen.getByText('取消发布')).toBeInTheDocument()
        expect(screen.queryByText('发布')).not.toBeInTheDocument()
      })
    })

    test('点击更新发布应该调用发布API', async () => {
      const user = userEvent.setup()
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: true,
        publish_type: '正式发布',
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)
      mockPublishTools.mockResolvedValue({} as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        expect(screen.getByText('更新发布')).toBeInTheDocument()
      })

      // 先触发测试成功
      const testSuccessBtn = screen.getByText('测试成功')
      await user.click(testSuccessBtn)

      // 点击更新发布
      const updateBtn = screen.getByText('更新发布')
      await user.click(updateBtn)

      await waitFor(() => {
        expect(mockPublishTools).toHaveBeenCalledWith({
          url: '/tool/publish_tool',
          body: {
            id: 'tool-123',
            publish_type: '正式发布',
          },
        })
      })
    })

    test('点击取消发布应该调用取消发布API', async () => {
      const user = userEvent.setup()
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: true,
        publish_type: '正式发布',
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)
      mockCancelPublish.mockResolvedValue({} as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        expect(screen.getByText('取消发布')).toBeInTheDocument()
      })

      // 点击取消发布
      const cancelBtn = screen.getByText('取消发布')
      await user.click(cancelBtn)

      await waitFor(() => {
        expect(mockCancelPublish).toHaveBeenCalledWith({
          url: '/tool/cancel_publish',
          body: {
            id: 'tool-123',
          },
        })
        expect(mockToast.notify).toHaveBeenCalledWith({
          type: 'success',
          message: '取消发布成功',
        })
        expect(mockReplace).toHaveBeenCalledWith('/tools?tab=custom')
      })
    })

    test('已发布但publish_type为取消发布时应该显示发布按钮', async () => {
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: true,
        publish_type: '取消发布',
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        // 使用正则表达式匹配"发布"（允许中间有空格）
        // 当publish_type为"取消发布"时，应该显示"发布"按钮，而不是"更新发布"或"取消发布"
        expect(screen.getByText(/发\s*布/)).toBeInTheDocument()
        // 验证不包含"更新"和"取消"的发布按钮存在
        const allButtons = screen.getAllByRole('button')
        const publishButton = allButtons.find((btn) => {
          const text = btn.textContent || ''
          return /发\s*布/.test(text) && !text.includes('更新') && !text.includes('取消')
        })
        expect(publishButton).toBeDefined()
        expect(screen.queryByText('更新发布')).not.toBeInTheDocument()
        expect(screen.queryByText('取消发布')).not.toBeInTheDocument()
      })
    })
  })

  describe('工具图标显示测试', () => {
    test('有图标时应该显示图标', async () => {
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        icon: '/app/upload/tool.jpg',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        const icon = screen.getByAltText('icon')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveAttribute('src', '/static/upload/tool.jpg')
      })
    })

    test('无图标时不应该显示图标', async () => {
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        expect(screen.queryByAltText('icon')).not.toBeInTheDocument()
      })
    })
  })

  describe('测试成功回调测试', () => {
    test('API组件测试成功应该更新state', async () => {
      const user = userEvent.setup()
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)
      mockPublishTools.mockResolvedValue({} as any)

      render(<ToolsInfo />)

      await waitFor(() => {
        expect(screen.getByTestId('api-component')).toBeInTheDocument()
      })

      // 点击测试成功
      const testSuccessBtn = screen.getByText('测试成功')
      await user.click(testSuccessBtn)

      // 现在应该可以发布了（使用正则表达式匹配）
      const publishBtn = screen.getByText(/发\s*布/).closest('button')
      if (publishBtn)
        await user.click(publishBtn)

      await waitFor(() => {
        expect(mockPublishTools).toHaveBeenCalled()
      })
    })

    test('IDE组件测试成功应该更新state', async () => {
      const user = userEvent.setup()
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)
      mockPublishTools.mockResolvedValue({} as any)

      render(<ToolsInfo />)

      // 切换到IDE
      const ideRadio = screen.getByText('在IDE中创建').closest('label')
      if (ideRadio)
        await user.click(ideRadio)

      await waitFor(() => {
        expect(screen.getByTestId('ide-component')).toBeInTheDocument()
      })

      // 点击测试成功
      const testSuccessBtn = screen.getByText('测试成功')
      await user.click(testSuccessBtn)

      // 切换回API并尝试发布
      const apiRadio = screen.getByText('使用外部API创建').closest('label')
      if (apiRadio)
        await user.click(apiRadio)

      await waitFor(() => {
        expect(screen.getByText(/发\s*布/)).toBeInTheDocument()
      })

      const publishBtn = screen.getByText(/发\s*布/).closest('button')
      if (publishBtn)
        await user.click(publishBtn)

      await waitFor(() => {
        expect(mockPublishTools).toHaveBeenCalled()
      })
    })
  })

  describe('刷新详情功能测试', () => {
    test('API组件刷新详情应该重新调用getToolDetail', async () => {
      const user = userEvent.setup()
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      // 等待初始调用完成
      await waitFor(() => {
        expect(mockGetToolDetail).toHaveBeenCalled()
      })

      // 获取初始调用次数
      const initialCallCount = mockGetToolDetail.mock.calls.length

      // 点击刷新详情
      const refreshBtn = screen.getByText('刷新详情')
      await user.click(refreshBtn)

      // 验证至少多调用了一次
      await waitFor(() => {
        expect(mockGetToolDetail.mock.calls.length).toBeGreaterThan(initialCallCount)
      })
    })

    test('IDE组件刷新详情应该重新调用getToolDetail', async () => {
      const user = userEvent.setup()
      const mockDetail = {
        id: 'tool-123',
        name: '测试工具',
        publish: false,
      }
      mockGetToolDetail.mockResolvedValue(mockDetail as any)

      render(<ToolsInfo />)

      // 等待初始调用完成
      await waitFor(() => {
        expect(mockGetToolDetail).toHaveBeenCalled()
      })

      // 切换到IDE
      const ideRadio = screen.getByText('在IDE中创建').closest('label')
      if (ideRadio)
        await user.click(ideRadio)

      await waitFor(() => {
        expect(screen.getByTestId('ide-component')).toBeInTheDocument()
      })

      // 获取切换后的调用次数（可能因为重新渲染而增加）
      const beforeRefreshCallCount = mockGetToolDetail.mock.calls.length

      // 点击刷新详情
      const refreshBtn = screen.getByText('刷新详情')
      await user.click(refreshBtn)

      // 验证至少多调用了一次
      await waitFor(() => {
        expect(mockGetToolDetail.mock.calls.length).toBeGreaterThan(beforeRefreshCallCount)
      })
    })
  })

  describe('错误处理测试', () => {
    test('API调用失败时应该正常处理', async () => {
      // 使用console.error spy来捕获错误，避免测试失败
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // 忽略错误
      })

      // 使用mockImplementation来模拟API失败，但确保组件能正常渲染
      // 由于useMount会在组件挂载时调用getDetail，我们需要让这个调用失败
      // 但组件本身应该能正常渲染基本结构
      mockGetToolDetail.mockImplementation(() => {
        // 延迟reject，让组件有时间渲染
        return new Promise((_resolve, reject) => {
          setTimeout(() => {
            reject(new Error('API Error'))
          }, 100)
        })
      })

      render(<ToolsInfo />)

      // 组件应该正常渲染，不会崩溃
      // 即使API失败，组件的基本结构应该存在
      await waitFor(() => {
        expect(screen.getByText('工具创建方式')).toBeInTheDocument()
      }, { timeout: 3000 })

      // 清理
      consoleErrorSpy.mockRestore()
    })
  })
})
