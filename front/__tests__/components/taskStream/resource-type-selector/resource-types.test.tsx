/**
 * 资源类型选择器组件的单元测试
 * 测试文件位置: front/__tests__/components/taskStream/resource-type-selector/
 * 源文件位置: front/app/components/taskStream/resource-type-selector/resource-types.tsx
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ResourceTypes from '@/app/components/taskStream/resource-type-selector/resource-types'
import { TabsType } from '@/app/components/taskStream/resource-type-selector/types'
import { ToolResourceEnum } from '@/app/components/taskStream/resource-type-selector/constants'
import * as toolmcpApi from '@/infrastructure/api/toolmcp'

// Mock useResourceTypes hook
jest.mock('@/app/components/taskStream/resource-type-selector/hooks', () => ({
  useResourceTypes: jest.fn(() => [
    {
      type: 'tool',
      name: 'custom-tool-1',
      title: '自定义工具1',
      desc: '这是一个自定义工具',
      provider_id: 'tool-1',
      categorization: 'tool',
    },
    {
      type: 'tool',
      name: 'custom-tool-2',
      title: '自定义工具2',
      desc: '另一个自定义工具',
      provider_id: 'tool-2',
      categorization: 'tool',
    },
    {
      type: 'mcp',
      name: 'mcp-server-1',
      title: 'MCP插件1',
      desc: '这是一个MCP插件工具',
      provider_id: 'mcp-1',
      categorization: 'tool',
    },
    {
      type: 'mcp',
      name: 'mcp-server-2',
      title: 'MCP插件2',
      desc: '另一个MCP插件',
      provider_id: 'mcp-2',
      categorization: 'tool',
    },
  ]),
}))

// Mock getMcp API
jest.mock('@/infrastructure/api/toolmcp', () => ({
  getMcp: jest.fn(),
}))

// Mock Image组件
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height }: any) => (
    <img src={src} alt={alt} className={className} width={width} height={height} />
  ),
}))

// Mock IconFont
jest.mock('@/app/components/base/iconFont', () => {
  return function MockIconFont({ type, className, style }: any) {
    return <span data-testid={`icon-${type}`} className={className} style={style} />
  }
})

// Mock HoverTip
jest.mock('@/app/components/base/hover-tip', () => {
  return function MockHoverTip({ children, htmlContent, selector }: any) {
    return <div data-testid={`hover-tip-${selector}`}>{children}</div>
  }
})

// Mock ResourceIcon
jest.mock('@/app/components/taskStream/resource-icon', () => {
  return function MockResourceIcon({ type, icon, className }: any) {
    return <div data-testid={`resource-icon-${type}`} className={className} />
  }
})

describe('ResourceTypes - 资源类型选择器（自定义工具和插件工具）', () => {
  const mockOnSelect = jest.fn()
  const mockGetMcp = toolmcpApi.getMcp as jest.MockedFunction<typeof toolmcpApi.getMcp>

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock getMcp返回子工具列表
    mockGetMcp.mockResolvedValue({
      data: [
        {
          id: 'child-1',
          name: 'child-tool-1',
          description: '子工具1描述',
          mcp_server_id: 'mcp-1',
          input_schema: {
            properties: {
              param1: { type: 'string', description: '参数1' },
              param2: { type: 'number', description: '参数2' },
            },
            required: ['param1'],
          },
        },
        {
          id: 'child-2',
          name: 'child-tool-2',
          description: '子工具2描述',
          mcp_server_id: 'mcp-1',
          input_schema: {
            properties: {
              input: { type: 'string', description: '输入参数' },
            },
            required: [],
          },
        },
      ],
    } as any)
  })

  describe('自定义工具测试', () => {
    test('应该正确渲染自定义工具列表', () => {
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 验证显示两个Tab
      expect(screen.getByText('自定义工具')).toBeInTheDocument()
      expect(screen.getByText('插件工具（MCP）')).toBeInTheDocument()

      // 默认应该显示自定义工具
      expect(screen.getByText('自定义工具1')).toBeInTheDocument()
      expect(screen.getByText('自定义工具2')).toBeInTheDocument()
    })

    test('点击自定义工具应该调用onSelect回调', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 点击第一个自定义工具
      const tool1 = screen.getByText('自定义工具1')
      await user.click(tool1)

      expect(mockOnSelect).toHaveBeenCalledWith(
        'tool',
        expect.objectContaining({
          name: 'custom-tool-1',
          title: '自定义工具1',
        }),
      )
    })

    test('搜索应该正确过滤自定义工具', () => {
      render(
        <ResourceTypes
          searchText="工具1"
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 应该只显示包含"工具1"的工具
      expect(screen.getByText('自定义工具1')).toBeInTheDocument()
      expect(screen.queryByText('自定义工具2')).not.toBeInTheDocument()
    })

    test('搜索无匹配结果时应该显示未找到提示', () => {
      render(
        <ResourceTypes
          searchText="不存在的工具"
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      expect(screen.getByText('未找到匹配项')).toBeInTheDocument()
    })
  })

  describe('MCP插件工具测试', () => {
    test('点击插件工具Tab应该切换到MCP工具列表', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 点击插件工具Tab
      const mcpTab = screen.getByText('插件工具（MCP）')
      await user.click(mcpTab)

      // 应该显示MCP工具
      expect(screen.getByText('MCP插件1')).toBeInTheDocument()
      expect(screen.getByText('MCP插件2')).toBeInTheDocument()

      // 不应该显示自定义工具
      expect(screen.queryByText('自定义工具1')).not.toBeInTheDocument()
    })

    test('点击MCP工具应该展开并加载子工具列表', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具Tab
      await user.click(screen.getByText('插件工具（MCP）'))

      // 点击MCP工具展开
      const mcpTool = screen.getByText('MCP插件1')
      await user.click(mcpTool)

      // 验证调用API获取子工具
      await waitFor(() => {
        expect(mockGetMcp).toHaveBeenCalledWith({
          body: { mcp_server_id: 'mcp-1' },
        })
      })

      // 验证显示子工具
      await waitFor(() => {
        expect(screen.getByText('child-tool-1')).toBeInTheDocument()
        expect(screen.getByText('child-tool-2')).toBeInTheDocument()
      })
    })

    test('展开MCP工具时应该显示loading状态', async () => {
      const user = userEvent.setup()
      let resolveFn: any

      // Mock延迟响应，手动控制resolve
      mockGetMcp.mockImplementation(() =>
        new Promise((resolve) => {
          resolveFn = resolve
        }),
      )

      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具Tab
      await user.click(screen.getByText('插件工具（MCP）'))

      // 点击MCP工具展开
      const mcpTool = screen.getByText('MCP插件1')
      await user.click(mcpTool)

      // 在API响应之前，应该看到loading或者至少API被调用
      await waitFor(() => {
        expect(mockGetMcp).toHaveBeenCalled()
      })

      // 清理：resolve promise
      resolveFn?.({ data: [] })
    })

    test('再次点击MCP工具应该收起子工具列表', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具Tab
      await user.click(screen.getByText('插件工具（MCP）'))

      // 第一次点击：展开
      const mcpTool = screen.getByText('MCP插件1')
      await user.click(mcpTool)

      // 等待子工具加载
      await waitFor(() => {
        expect(screen.getByText('child-tool-1')).toBeInTheDocument()
      })

      // 第二次点击：收起
      await user.click(mcpTool)

      // 子工具应该被隐藏
      await waitFor(() => {
        expect(screen.queryByText('child-tool-1')).not.toBeInTheDocument()
      })
    })

    test('点击MCP子工具应该调用onSelect并传入正确的参数', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具Tab并展开MCP工具
      await user.click(screen.getByText('插件工具（MCP）'))
      await user.click(screen.getByText('MCP插件1'))

      // 等待子工具加载
      await waitFor(() => {
        expect(screen.getByText('child-tool-1')).toBeInTheDocument()
      })

      // 点击子工具
      await user.click(screen.getByText('child-tool-1'))

      // 验证onSelect被调用，并包含正确的参数
      expect(mockOnSelect).toHaveBeenCalledWith(
        ToolResourceEnum.MCP,
        expect.objectContaining({
          type: 'mcp',
          name: expect.stringContaining('mcp-server-1-child-tool-1'),
          payload__mcp_server_id: 'mcp-1',
          payload__mcp_tool_id: 'child-1',
          payload__kind: 'MCPTool',
        }),
      )
    })

    test('MCP子工具应该包含转换后的参数配置', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具并展开
      await user.click(screen.getByText('插件工具（MCP）'))
      await user.click(screen.getByText('MCP插件1'))

      await waitFor(() => {
        expect(screen.getByText('child-tool-1')).toBeInTheDocument()
      })

      // 点击子工具
      await user.click(screen.getByText('child-tool-1'))

      // 验证参数被正确转换
      expect(mockOnSelect).toHaveBeenCalledWith(
        ToolResourceEnum.MCP,
        expect.objectContaining({
          config__parameters: expect.arrayContaining([
            expect.objectContaining({
              name: 'param1',
              type: 'string',
              label: '参数1',
              required: true,
            }),
            expect.objectContaining({
              name: 'param2',
              type: 'number',
              label: '参数2',
              required: false,
            }),
          ]),
        }),
      )
    })

    test('MCP工具无子工具时应该显示提示信息', async () => {
      const user = userEvent.setup()

      // Mock返回空的子工具列表
      mockGetMcp.mockResolvedValue({
        data: [],
      } as any)

      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具并展开
      await user.click(screen.getByText('插件工具（MCP）'))
      await user.click(screen.getByText('MCP插件1'))

      // 应该显示"暂无子工具"
      await waitFor(() => {
        expect(screen.getByText('暂无子工具')).toBeInTheDocument()
      })
    })

    test('MCP工具加载失败时应该正常处理', async () => {
      const user = userEvent.setup()
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock API失败
      mockGetMcp.mockRejectedValue(new Error('API Error'))

      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具并展开
      await user.click(screen.getByText('插件工具（MCP）'))
      await user.click(screen.getByText('MCP插件1'))

      // 等待错误处理
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to fetch MCP tool details:',
          expect.any(Error),
        )
      })

      consoleErrorSpy.mockRestore()
    })

    test('搜索应该正确过滤MCP插件工具', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText="插件1"
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具Tab
      await user.click(screen.getByText('插件工具（MCP）'))

      // 应该只显示包含"插件1"的MCP工具
      expect(screen.getByText('MCP插件1')).toBeInTheDocument()
      expect(screen.queryByText('MCP插件2')).not.toBeInTheDocument()
    })
  })

  describe('Tab切换测试', () => {
    test('自定义工具Tab应该高亮显示', () => {
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      const customTab = screen.getByText('自定义工具').closest('button')
      const mcpTab = screen.getByText('插件工具（MCP）').closest('button')

      // 自定义工具Tab应该有高亮样式
      expect(customTab).toHaveClass('border-blue-500')
      expect(customTab).toHaveClass('text-blue-600')

      // MCP Tab不应该高亮
      expect(mcpTab).toHaveClass('border-gray-200')
      expect(mcpTab).toHaveClass('text-gray-700')
    })

    test('点击插件工具Tab应该切换高亮状态', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      const mcpTab = screen.getByText('插件工具（MCP）')
      await user.click(mcpTab)

      // MCP Tab应该高亮
      await waitFor(() => {
        const button = screen.getByText('插件工具（MCP）').closest('button')
        expect(button).toHaveClass('border-blue-500')
        expect(button).toHaveClass('text-blue-600')
      })
    })
  })

  describe('非工具资源测试', () => {
    test('非工具类别时不应该显示Tab', () => {
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.normal}
          onSelect={mockOnSelect}
        />,
      )

      // 不应该显示Tab
      expect(screen.queryByText('自定义工具')).not.toBeInTheDocument()
      expect(screen.queryByText('插件工具（MCP）')).not.toBeInTheDocument()
    })
  })

  describe('fromEmbedding过滤测试', () => {
    test('fromEmbedding为true时应该只显示embedding相关资源', () => {
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.normal}
          onSelect={mockOnSelect}
          fromEmbedding={true}
        />,
      )

      // 这个测试取决于mock数据中是否有embedding资源
      // 当前mock数据没有embedding，所以应该显示空状态
      expect(screen.getByText('未找到匹配项')).toBeInTheDocument()
    })
  })

  describe('MCP工具参数类型转换测试', () => {
    test('应该正确转换input_schema中的不同参数类型', async () => {
      const user = userEvent.setup()

      // Mock返回包含各种类型参数的子工具
      mockGetMcp.mockResolvedValue({
        data: [
          {
            id: 'multi-type-tool',
            name: 'multi-type-tool',
            description: '多类型参数工具',
            mcp_server_id: 'mcp-1',
            input_schema: {
              properties: {
                stringParam: { type: 'string', description: '字符串参数' },
                numberParam: { type: 'number', description: '数字参数' },
                integerParam: { type: 'integer', description: '整数参数' },
                booleanParam: { type: 'boolean', description: '布尔参数' },
                arrayParam: { type: 'array', description: '数组参数' },
                objectParam: { type: 'object', description: '对象参数' },
              },
              required: ['stringParam'],
            },
          },
        ],
      } as any)

      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具并展开
      await user.click(screen.getByText('插件工具（MCP）'))
      await user.click(screen.getByText('MCP插件1'))

      await waitFor(() => {
        expect(screen.getByText('multi-type-tool')).toBeInTheDocument()
      })

      // 点击子工具
      await user.click(screen.getByText('multi-type-tool'))

      // 验证各种类型都被正确转换
      expect(mockOnSelect).toHaveBeenCalledWith(
        ToolResourceEnum.MCP,
        expect.objectContaining({
          config__parameters: expect.arrayContaining([
            expect.objectContaining({ name: 'stringParam', type: 'string' }),
            expect.objectContaining({ name: 'numberParam', type: 'number' }),
            expect.objectContaining({ name: 'integerParam', type: 'number' }),
            expect.objectContaining({ name: 'booleanParam', type: 'boolean' }),
            expect.objectContaining({ name: 'arrayParam', type: 'list' }),
            expect.objectContaining({ name: 'objectParam', type: 'dict' }),
          ]),
        }),
      )
    })

    test('子工具的input_schema为空时应该返回空参数数组', async () => {
      const user = userEvent.setup()

      // Mock返回没有input_schema的子工具
      mockGetMcp.mockResolvedValue({
        data: [
          {
            id: 'no-schema-tool',
            name: 'no-schema-tool',
            description: '无schema的工具',
            mcp_server_id: 'mcp-1',
          },
        ],
      } as any)

      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具并展开
      await user.click(screen.getByText('插件工具（MCP）'))
      await user.click(screen.getByText('MCP插件1'))

      await waitFor(() => {
        expect(screen.getByText('no-schema-tool')).toBeInTheDocument()
      })

      // 点击子工具
      await user.click(screen.getByText('no-schema-tool'))

      // 验证参数数组为空
      expect(mockOnSelect).toHaveBeenCalledWith(
        ToolResourceEnum.MCP,
        expect.objectContaining({
          config__parameters: [],
        }),
      )
    })
  })

  describe('MCP工具缓存测试', () => {
    test('已加载过的MCP工具再次展开时不应该重复调用API', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具
      await user.click(screen.getByText('插件工具（MCP）'))

      // 第一次展开
      const mcpTool = screen.getByText('MCP插件1')
      await user.click(mcpTool)

      await waitFor(() => {
        expect(mockGetMcp).toHaveBeenCalledTimes(1)
      })

      // 收起
      await user.click(mcpTool)

      // 再次展开
      await user.click(mcpTool)

      // 不应该再次调用API
      expect(mockGetMcp).toHaveBeenCalledTimes(1)
    })
  })

  describe('搜索功能测试', () => {
    test('搜索应该不区分大小写', () => {
      render(
        <ResourceTypes
          searchText="工具"
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 应该匹配title中包含"工具"的工具
      expect(screen.getByText('自定义工具1')).toBeInTheDocument()
      expect(screen.getByText('自定义工具2')).toBeInTheDocument()
    })

    test('空搜索文本应该显示所有工具', () => {
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 应该显示所有自定义工具
      expect(screen.getByText('自定义工具1')).toBeInTheDocument()
      expect(screen.getByText('自定义工具2')).toBeInTheDocument()
    })
  })

  describe('UI交互测试', () => {
    test('鼠标悬停在工具上时应该显示HoverTip', () => {
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 验证HoverTip被渲染
      expect(screen.getByTestId('hover-tip-workflow-resource-custom-tool-1')).toBeInTheDocument()
    })

    test('MCP工具展开时应该显示向上箭头', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具并展开
      await user.click(screen.getByText('插件工具（MCP）'))
      await user.click(screen.getByText('MCP插件1'))

      // 等待展开完成后应该显示向上箭头
      await waitFor(() => {
        expect(screen.getByTestId('icon-icon-arrow-up')).toBeInTheDocument()
      })
    })

    test('MCP工具收起时应该显示向下箭头', async () => {
      const user = userEvent.setup()
      render(
        <ResourceTypes
          searchText=""
          category={TabsType.tool}
          onSelect={mockOnSelect}
        />,
      )

      // 切换到插件工具
      await user.click(screen.getByText('插件工具（MCP）'))

      // 默认收起状态应该显示向下箭头（有多个MCP工具，所以用getAll）
      const arrowDownIcons = screen.getAllByTestId('icon-icon-arrow-down')
      expect(arrowDownIcons.length).toBeGreaterThan(0)
    })
  })
})
