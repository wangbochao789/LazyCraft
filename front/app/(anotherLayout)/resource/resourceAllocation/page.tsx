'use client'

import React, { useCallback, useState } from 'react'
import { Button, Card, Drawer, Form, InputNumber, Space, Table, message } from 'antd'
import { DownloadOutlined, SettingOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'

const ResourceAllocation: React.FC = () => {
  // 将指标数据定义为常量，提高代码可维护性
  const ALL_METRICS_DATA = {
    gpu: {
      name: 'GPU 使用量',
      data: [120, 132, 101, 134, 90, 230],
      color: '#3B82F6',
    },
    cpu: {
      name: 'CPU 使用量',
      data: [220, 182, 191, 234, 290, 330],
      color: '#10B981',
    },
    token: {
      name: 'Token 使用量',
      data: [150, 232, 201, 154, 190, 330],
      color: '#8B5CF6',
    },
    gpuMemory: {
      name: '显存占用',
      data: [180, 162, 181, 194, 220, 280],
      color: '#F59E0B',
    },
    memory: {
      name: '内存占用',
      data: [140, 172, 161, 174, 200, 260],
      color: '#EF4444',
    },
  }

  // 首先定义数据
  const initialData = [
    {
      key: '1',
      name: '高玲玲',
      // role: '高级研究员',
      gpuQuota: 4,
      cpuQuota: 32,
      tokenQuota: 1000000,
      timeLimit: 200,
      gpuUsage: 75,
      cpuUsage: 60,
      tokenUsage: 65,
    },
    // {
    //   key: '2',
    //   name: '林雨晴',
    //   role: '数据科学家',
    //   gpuQuota: 2,
    //   cpuQuota: 16,
    //   tokenQuota: 800000,
    //   timeLimit: 160,
    //   gpuUsage: 45,
    //   cpuUsage: 30,
    //   tokenUsage: 40,
    // },
    // {
    //   key: '3',
    //   name: '张云飞',
    //   role: '机器学习工程师',
    //   gpuQuota: 8,
    //   cpuQuota: 64,
    //   tokenQuota: 1200000,
    //   timeLimit: 240,
    //   gpuUsage: 90,
    //   cpuUsage: 85,
    //   tokenUsage: 95,
    // },
  ]

  const [configVisible, setConfigVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['gpu'])
  // 使用initialData初始化tableData
  const [tableData, setTableData] = useState(initialData)
  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) => {
      const isSelected = prev.includes(metric)
      if (isSelected)
        return prev.length === 1 ? prev : prev.filter(m => m !== metric)
      else
        return [...prev, metric]
    })
  }
  // 使用useCallback优化toggleMetric函数
  const toggleMetricCallback = useCallback(toggleMetric, [])
  React.useEffect(() => {
    // 初始化显存使用率图表
    // 初始化趋势图
    const chart = echarts.init(document.getElementById('resourceChart'))
    const allMetricsData = {
      gpu: {
        name: 'GPU 使用量',
        data: [120, 132, 101, 134, 90, 230],
        color: '#3B82F6',
      },
      cpu: {
        name: 'CPU 使用量',
        data: [220, 182, 191, 234, 290, 330],
        color: '#10B981',
      },
      token: {
        name: 'Token 使用量',
        data: [150, 232, 201, 154, 190, 330],
        color: '#8B5CF6',
      },
      gpuMemory: {
        name: '显存占用',
        data: [180, 162, 181, 194, 220, 280],
        color: '#F59E0B',
      },
      memory: {
        name: '内存占用',
        data: [140, 172, 161, 174, 200, 260],
        color: '#EF4444',
      },
    }

    // 只使用选中的指标数据
    const option = {
      animation: false,
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: selectedMetrics.map(key => allMetricsData[key as keyof typeof allMetricsData].name),
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      },
      yAxis: {
        type: 'value',
      },
      series: selectedMetrics.map(key => ({
        name: allMetricsData[key as keyof typeof allMetricsData].name,
        type: 'line',
        data: allMetricsData[key as keyof typeof allMetricsData].data,
        itemStyle: {
          color: allMetricsData[key as keyof typeof allMetricsData].color,
        },
        lineStyle: {
          color: allMetricsData[key as keyof typeof allMetricsData].color,
        },
      })),
    }

    chart.setOption(option)

    // 添加窗口大小变化时的图表重绘
    const handleResize = () => {
      chart.resize()
    }
    window.addEventListener('resize', handleResize)

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [selectedMetrics]) // 确保依赖项中包含selectedMetrics，这样当选择变化时会重新渲染图表
  const columns = [
    {
      title: '成员信息',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <UserOutlined className="text-lg text-gray-600" />
          </div>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-gray-500 text-sm">{record.role}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'GPU 配额',
      dataIndex: 'gpuQuota',
      key: 'gpuQuota',
    },
    {
      title: 'CPU 配额',
      dataIndex: 'cpuQuota',
      key: 'cpuQuota',
    },
    {
      title: 'Token 配额',
      dataIndex: 'tokenQuota',
      key: 'tokenQuota',
    },
    {
      title: '资源使用情况',
      dataIndex: 'usage',
      key: 'usage',
      render: (text: string, record: any) => (
        <div className="space-y-1">
          <div className="text-sm">GPU: {record.gpuUsage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${record.gpuUsage}%` }}></div>
          </div>
          <div className="text-sm">CPU: {record.cpuUsage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${record.cpuUsage}%` }}></div>
          </div>
          <div className="text-sm">Token: {record.tokenUsage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${record.tokenUsage}%` }}></div>
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<SettingOutlined />}
          onClick={() => {
            setSelectedMember(() => record)
            setTimeout(() => {
              setConfigVisible(true)
            }, 100)
          }}
          className="!rounded-button whitespace-nowrap"
        >
          配置
        </Button>
      ),
    },
  ]
  const handleSaveConfig = () => {
    if (selectedMember) {
      // 更新表格数据
      setTableData(prevData =>
        prevData.map(item =>
          item.key === selectedMember.key ? selectedMember : item,
        ),
      )
      message.success('资源配置已更新')
      setConfigVisible(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* 顶部导航 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <TeamOutlined className="text-2xl text-blue-600" />
            <h1 className="text-2xl font-bold">人工智能研发团队</h1>
          </div>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              className="!rounded-button whitespace-nowrap"
              onClick={() => {
                message.success('资源报告已开始下载')
                // 这里可以添加实际的下载逻辑
              }}
            >
              下载资源报告
            </Button>
            <Button type="primary" icon={<SettingOutlined />} className="!rounded-button whitespace-nowrap">
              团队设置
            </Button>
          </Space>
        </div>
        {/* 资源概览区域 */}
        <Card className="shadow-sm mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <div className="text-lg font-medium mb-2">Token 调用次数</div>
              <div className="text-2xl font-bold text-blue-600">2,345,678</div>
              <div className="text-sm text-gray-500 mt-2">较上月 +15%</div>
            </div>
            <div className="col-span-1">
              <div className="text-lg font-medium mb-2">GPU 使用时长</div>
              <div className="text-2xl font-bold text-green-600">1,234 小时</div>
              <div className="text-sm text-gray-500 mt-2">较上月 +8%</div>
            </div>
          </div>
        </Card>
        {/* 成员列表 */}
        <Card className="mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">团队成员</h2>
            <Button type="primary" className="!rounded-button whitespace-nowrap">
              添加成员
            </Button>
          </div>
          <Table columns={columns} dataSource={tableData} pagination={false} />
        </Card>
        {/* 资源使用趋势 */}
        <Card className="shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">资源使用趋势</h2>
            <Space>
              <Button.Group>
                <Button className="!rounded-button whitespace-nowrap">近7天</Button>
                <Button className="!rounded-button whitespace-nowrap">近30天</Button>
                <Button type="primary" className="!rounded-button whitespace-nowrap">近90天</Button>
              </Button.Group>
            </Space>
          </div>
          <div className="mb-4 flex gap-2">
            {Object.keys(ALL_METRICS_DATA).map(key => (
              <Button
                key={key}
                type={selectedMetrics.includes(key) ? 'primary' : 'default'}
                onClick={() => toggleMetricCallback(key)}
                className="!rounded-button whitespace-nowrap"
              >
                {ALL_METRICS_DATA[key as keyof typeof ALL_METRICS_DATA].name}
              </Button>
            ))}
          </div>
          <div id="resourceChart" style={{ height: '400px' }}></div>
        </Card>
        {/* 配置抽屉 */}
        <Drawer
          title="资源配置"
          placement="right"
          onClose={() => {
            setConfigVisible(false)
          }}
          open={configVisible}
          width={400}
        >
          {selectedMember && (
            <Form layout="vertical">
              <div className="mb-6">
                <h3 className="font-medium mb-2">{selectedMember.name}</h3>
                <div className="text-gray-500">{selectedMember.role}</div>
              </div>
              <Form.Item
                label="GPU 配额"
                tooltip="可分配的最大GPU卡数"
              >
                <InputNumber
                  min={0}
                  value={selectedMember.gpuQuota}
                  style={{ width: '100%' }}
                  addonAfter="张"
                  onChange={(value) => {
                    setSelectedMember((prev: any) => ({ ...prev, gpuQuota: value }))
                  }}
                />
              </Form.Item>
              <Form.Item
                label="CPU 配额"
                tooltip="可分配的最大CPU核心数"
              >
                <InputNumber
                  min={0}
                  value={selectedMember.cpuQuota}
                  style={{ width: '100%' }}
                  addonAfter="核"
                  onChange={(value) => {
                    setSelectedMember((prev: any) => ({ ...prev, cpuQuota: value }))
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Token 配额"
                tooltip="每月最大Token调用次数"
              >
                <InputNumber
                  min={0}
                  value={selectedMember.tokenQuota}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  onChange={(value) => {
                    setSelectedMember((prev: any) => ({ ...prev, tokenQuota: value }))
                  }}
                />
              </Form.Item>
              <Form.Item
                label="时间限制"
                tooltip="每月最大资源使用时长"
              >
                <InputNumber
                  min={0}
                  value={selectedMember.timeLimit}
                  style={{ width: '100%' }}
                  addonAfter="小时/月"
                  onChange={(value) => {
                    setSelectedMember((prev: any) => ({ ...prev, timeLimit: value }))
                  }}
                />
              </Form.Item>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setConfigVisible(false)} className="!rounded-button whitespace-nowrap">
                  取消
                </Button>
                <Button
                  type="primary"
                  className="!rounded-button whitespace-nowrap"
                  onClick={handleSaveConfig}
                >
                  保存
                </Button>
              </div>
            </Form>
          )}
        </Drawer>
      </div>
    </div>
  )
}
export default ResourceAllocation
