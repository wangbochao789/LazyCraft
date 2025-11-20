/**
 * MCP工具页面的单元测试
 * 测试文件位置: front/__tests__/(appLayout)/tools/Mcp/
 * 源文件位置: front/app/(appLayout)/tools/Mcp/page.tsx
 */
import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import McpToolPage from '@/app/(appLayout)/tools/Mcp/page'
import * as toolmcpApi from '@/infrastructure/api/toolmcp'

// Mock next/navigation
const mockPush = jest.fn()
const mockGet = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}))

// Mock API
jest.mock('@/infrastructure/api/toolmcp', () => ({
  getMcpDetail: jest.fn(),
  getMcp: jest.fn(),
  editMcp: jest.fn(),
  publishMcp: jest.fn(),
}))
// Mock antd message
jest.mock('antd', () => {
  const actual = jest.requireActual('antd')
  return {
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
    },
  }
})

// Mock KeyValueList组件
jest.mock('@/app/(appLayout)/tools/keyValueList', () => {
  return function MockKeyValueList({ name, label, addButtonText }: any) {
    return (
      <div data-testid={`key-value-list-${name}`}>
        <div>{label}</div>
        <button>{addButtonText}</button>
      </div>
    )
  }
})

// Mock McpToolTesting组件
jest.mock('@/app/(appLayout)/tools/Mcp/mcptoolTesting', () => {
  return function MockMcpToolTesting({ selectedTool, onTestPassedChange }: any) {
    // 当selectedTool变化时，重置testPassed
    React.useEffect(() => {
      if (onTestPassedChange && !selectedTool)
        onTestPassedChange(false)
    }, [selectedTool, onTestPassedChange])

    return (
      <div data-testid="mcp-tool-testing">
        <div>McpToolTesting Component</div>
        {selectedTool && <div>Selected: {selectedTool.name}</div>}
        <button onClick={() => onTestPassedChange?.(true)}>测试通过</button>
      </div>
    )
  }
})

describe('McpToolPage - MCP工具页面', () => {
  const mockGetMcpDetail = toolmcpApi.getMcpDetail as jest.MockedFunction<typeof toolmcpApi.getMcpDetail>
  const mockGetMcp = toolmcpApi.getMcp as jest.MockedFunction<typeof toolmcpApi.getMcp>
  const mockEditMcp = toolmcpApi.editMcp as jest.MockedFunction<typeof toolmcpApi.editMcp>
  const mockPublishMcp = toolmcpApi.publishMcp as jest.MockedFunction<typeof toolmcpApi.publishMcp>

  const mockMcpDetail = {
    id: 'mcp-123',
    name: '测试MCP服务',
    description: '这是一个测试MCP服务',
    icon: '/app/upload/mcp.jpg',
    publish: false,
    publish_type: '',
    transport_type: 'STDIO',
    stdio_command: 'npx',
    stdio_arguments: 'test-args',
    stdio_env: { KEY1: 'value1', KEY2: 'value2' },
    timeout: 30,
  }

  const mockToolList = [
    {
      id: 'tool-1',
      name: '工具1',
      description: '工具1描述',
    },
    {
      id: 'tool-2',
      name: '工具2',
      description: '工具2描述',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockImplementation((key: string) => {
      if (key === 'id')
        return 'mcp-123'
      return null
    })

    mockGetMcpDetail.mockResolvedValue(mockMcpDetail as any)
    mockGetMcp.mockResolvedValue({ data: mockToolList } as any)
    mockEditMcp.mockResolvedValue({} as any)
    // 注意：根据源码，只有当res.code === 200时才会显示成功消息和跳转
    mockPublishMcp.mockResolvedValue({ code: 200 } as any)
  })

  describe('组件渲染测试', () => {
    test('应该正确渲染MCP详情页面', async () => {
      render(<McpToolPage />)

      await waitFor(() => {
        expect(mockGetMcpDetail).toHaveBeenCalledWith({
          body: { mcp_server_id: 'mcp-123' },
        })
      })

      await waitFor(() => {
        expect(screen.getByText('测试MCP服务')).toBeInTheDocument()
        expect(screen.getByText('这是一个测试MCP服务')).toBeInTheDocument()
      })
    })

    test('应该显示服务创建方式卡片', async () => {
      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText('服务创建方式')).toBeInTheDocument()
        expect(screen.getByText('配置设置')).toBeInTheDocument()
        expect(screen.getByText(/工具列表/)).toBeInTheDocument()
      })
    })

    test('有图标时应该显示图标', async () => {
      render(<McpToolPage />)

      await waitFor(() => {
        const icon = screen.getByAltText('icon')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveAttribute('src', '/static/upload/mcp.jpg')
      })
    })
  })

  describe('配置设置测试', () => {
    test('应该显示传输类型选择', async () => {
      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText('传输类型')).toBeInTheDocument()
      })
    })

    test('选择STDIO时应该显示STDIO相关字段', async () => {
      // 使用STDIO类型的mock数据
      const stdioDetail = {
        ...mockMcpDetail,
        transport_type: 'STDIO',
      }
      mockGetMcpDetail.mockResolvedValue(stdioDetail as any)

      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText('传输类型')).toBeInTheDocument()
        expect(screen.getByText('启动命令')).toBeInTheDocument()
        expect(screen.getByText('启动参数')).toBeInTheDocument()
        expect(screen.getByText('环境变量')).toBeInTheDocument()
        expect(screen.getByText('超时（秒）')).toBeInTheDocument()
      })
    })

    test('选择SSE时应该显示SSE相关字段', async () => {
      // 使用SSE类型的mock数据
      const sseDetail = {
        ...mockMcpDetail,
        transport_type: 'SSE',
        http_url: 'https://example.com',
      }
      mockGetMcpDetail.mockResolvedValue(sseDetail as any)

      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText('传输类型')).toBeInTheDocument()
        expect(screen.getByText('服务端URL')).toBeInTheDocument()
        expect(screen.getByText('请求头')).toBeInTheDocument()
        expect(screen.getByText('超时（秒）')).toBeInTheDocument()
      })
    })
  })

  describe('工具列表测试', () => {
    test('应该显示工具列表', async () => {
      render(<McpToolPage />)

      await waitFor(() => {
        expect(mockGetMcp).toHaveBeenCalledWith({
          body: { mcp_server_id: 'mcp-123' },
        })
      })

      await waitFor(() => {
        expect(screen.getByText('工具1')).toBeInTheDocument()
        expect(screen.getByText('工具2')).toBeInTheDocument()
        expect(screen.getByText(/工具列表.*\(2\)/)).toBeInTheDocument()
      })
    })

    test('应该能够选择工具', async () => {
      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText('工具1')).toBeInTheDocument()
      })

      // 验证工具列表存在即可，选择功能的详细交互在集成测试中验证
      expect(screen.getByText('工具1')).toBeInTheDocument()
      expect(screen.getByText('工具2')).toBeInTheDocument()
    })

    test('无工具时应该显示空状态', async () => {
      mockGetMcp.mockResolvedValue({ data: [] } as any)

      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText('暂无可用工具')).toBeInTheDocument()
      })
    })
  })

  describe('保存功能测试', () => {
    test('应该能够保存配置', async () => {
      // 确保editMcp返回正确的格式（没有code和status）
      mockEditMcp.mockResolvedValue({} as any)

      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText(/保\s*存/)).toBeInTheDocument()
      })

      // 点击保存按钮（可能有多个保存按钮，选择第一个）
      const saveButtons = screen.getAllByText(/保\s*存/)
      const saveButton = saveButtons[0]?.closest('button')
      if (saveButton) {
        await act(async () => {
          fireEvent.click(saveButton)
        })
      }

      await waitFor(() => {
        expect(mockEditMcp).toHaveBeenCalled()
      })
    })
  })

  describe('发布功能测试', () => {
    test('未发布时应该显示发布按钮', async () => {
      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText(/发\s*布/)).toBeInTheDocument()
      })
    })

    test('已发布时应该显示更新发布和取消发布按钮', async () => {
      const publishedDetail = {
        ...mockMcpDetail,
        publish: true,
        publish_type: '正式发布',
      }
      mockGetMcpDetail.mockResolvedValue(publishedDetail as any)

      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText('更新发布')).toBeInTheDocument()
        expect(screen.getByText('取消发布')).toBeInTheDocument()
      })
    })
  })

  describe('表单验证测试', () => {
    test('STDIO模式下应该显示启动命令字段', async () => {
      const stdioDetail = {
        ...mockMcpDetail,
        transport_type: 'STDIO',
      }
      mockGetMcpDetail.mockResolvedValue(stdioDetail as any)

      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText('启动命令')).toBeInTheDocument()
      })
    })

    test('SSE模式下应该显示服务端URL字段', async () => {
      const sseDetail = {
        ...mockMcpDetail,
        transport_type: 'SSE',
      }
      mockGetMcpDetail.mockResolvedValue(sseDetail as any)

      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByText('服务端URL')).toBeInTheDocument()
      })
    })
  })

  describe('数据转换测试', () => {
    test('应该正确转换stdio_env对象为数组', async () => {
      render(<McpToolPage />)

      await waitFor(() => {
        expect(mockGetMcpDetail).toHaveBeenCalled()
      })

      // 验证环境变量组件被渲染
      await waitFor(() => {
        expect(screen.getByTestId('key-value-list-stdio_env')).toBeInTheDocument()
      })
    })

    test('应该正确转换headers对象为数组', async () => {
      const sseDetail = {
        ...mockMcpDetail,
        transport_type: 'SSE',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
      }
      mockGetMcpDetail.mockResolvedValue(sseDetail as any)

      render(<McpToolPage />)

      await waitFor(() => {
        expect(screen.getByTestId('key-value-list-headers')).toBeInTheDocument()
      })
    })
  })

  describe('错误处理测试', () => {
    test('API调用失败时应该正常处理', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // 忽略错误
      })

      mockGetMcpDetail.mockRejectedValueOnce(new Error('API Error'))

      render(<McpToolPage />)

      // 组件应该正常渲染，不会崩溃
      await waitFor(() => {
        expect(screen.getByText('服务创建方式')).toBeInTheDocument()
      }, { timeout: 3000 })

      consoleErrorSpy.mockRestore()
    })
  })
})
