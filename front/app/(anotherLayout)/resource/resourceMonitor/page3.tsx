'use client'
// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useState } from 'react'
import { Button, DatePicker, Select, Table, Tooltip } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import type { ColumnsType } from 'antd/es/table'
const { RangePicker } = DatePicker
type DataItem = {
  taskName: string
  taskType: string
  computeType: string
  gpuConsumption: number
  gpuMemoryUsage: string
  scheduleCount: number
}
const App: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<string>('模型推理任务')
  React.useEffect(() => {
    const barChart = echarts.init(document.getElementById('resourceChart'))
    const pieChart = echarts.init(document.getElementById('gpuChart'))
    const barOption = {
      animation: false,
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['GPU使用时长', 'GPU显存占用', 'CPU内存使用率', '响应时间'],
        bottom: 0,
      },
      xAxis: {
        type: 'category',
        data: ['模型推理1', '模型推理2', '模型训练1', '模型训练2', '模型训练3'],
      },
      yAxis: [
        { type: 'value', name: '时长/占用率', min: 0, max: 100 },
        { type: 'value', name: '响应时间(min)', min: 0, max: 60 },
      ],
      series: [
        {
          name: 'GPU使用时长',
          type: 'bar',
          data: [45, 82, 36, 64, 28],
        },
        {
          name: 'GPU显存占用',
          type: 'bar',
          data: [65, 78, 42, 56, 38],
        },
        {
          name: 'CPU内存使用率',
          type: 'bar',
          data: [35, 62, 48, 72, 44],
        },
        {
          name: '响应时间',
          type: 'line',
          yAxisIndex: 1,
          data: [12, 25, 8, 18, 15],
        },
      ],
    }
    const pieOption = {
      animation: false,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
          },
          data: [
            { value: 35, name: '模型推理1' },
            { value: 25, name: '模型推理2' },
            { value: 20, name: '模型训练1' },
            { value: 12, name: '模型训练2' },
            { value: 8, name: '模型训练3' },
          ],
        },
      ],
    }
    barChart.setOption(barOption)
    pieChart.setOption(pieOption)
    return () => {
      barChart.dispose()
      pieChart.dispose()
    }
  }, [])
  const columns: ColumnsType<DataItem> = [
    { title: '任务名称', dataIndex: 'taskName', key: 'taskName' },
    { title: '任务类型', dataIndex: 'taskType', key: 'taskType' },
    { title: '算力类型', dataIndex: 'computeType', key: 'computeType' },
    { title: 'GPU消耗(小时)', dataIndex: 'gpuConsumption', key: 'gpuConsumption' },
    { title: 'GPU显存使用占比', dataIndex: 'gpuMemoryUsage', key: 'gpuMemoryUsage' },
    { title: '调度次数', dataIndex: 'scheduleCount', key: 'scheduleCount' },
  ]
  const data: DataItem[] = [
    {
      taskName: '模型推理1',
      taskType: '推理',
      computeType: 'GPU',
      gpuConsumption: 24.5,
      gpuMemoryUsage: '78%',
      scheduleCount: 150,
    },
    {
      taskName: '模型推理2',
      taskType: '推理',
      computeType: 'GPU',
      gpuConsumption: 36.8,
      gpuMemoryUsage: '92%',
      scheduleCount: 280,
    },
    {
      taskName: '模型训练1',
      taskType: '训练',
      computeType: 'GPU',
      gpuConsumption: 42.3,
      gpuMemoryUsage: '85%',
      scheduleCount: 320,
    },
    {
      taskName: '模型训练2',
      taskType: '训练',
      computeType: 'GPU',
      gpuConsumption: 38.6,
      gpuMemoryUsage: '88%',
      scheduleCount: 260,
    },
    {
      taskName: '模型训练3',
      taskType: '训练',
      computeType: 'GPU',
      gpuConsumption: 29.4,
      gpuMemoryUsage: '76%',
      scheduleCount: 180,
    },
  ]
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1440px] mx-auto">
        {/* 顶部筛选区 */}
        <div className="flex items-center justify-between mb-6 hidden">
          <Select
            defaultValue="模型推理任务"
            className="w-48"
            onChange={setSelectedTask}
            options={[
              { value: '模型推理任务', label: '模型推理任务' },
              { value: '模型训练任务', label: '模型训练任务' },
            ]}
          />
          <RangePicker className="mx-4" />
          <Button type="primary" icon={<i className="fas fa-download mr-2" />}>
导出报表
          </Button>
        </div>
        {/* 数据概览卡片 */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 mb-2">CPU内存使用率</div>
            <div className="text-2xl font-bold">68.4%</div>
            <div className="text-green-500 text-sm">↑ 5.2%</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 mb-2">GPU显存使用率</div>
            <div className="text-2xl font-bold">88.4%</div>
            <div className="text-red-500 text-sm">↑ 9.1%</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 mb-2">处理器温度</div>
            <div className="text-2xl font-bold">49.7℃</div>
            <div className="text-yellow-500 text-sm">↑ 2.3℃</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 mb-2">调度次数</div>
            <div className="text-2xl font-bold">1,280</div>
            <div className="text-green-500 text-sm">↑ 320</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 mb-2">响应时间</div>
            <div className="text-2xl font-bold">15.8min</div>
            <div className="text-red-500 text-sm">↑ 2.3min</div>
          </div>
        </div>
        {/* 图表区域 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">各任务资源消耗统计</h3>
            </div>
            <div id="resourceChart" style={{ height: '400px' }} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">GPU资源占比TOP5模型任务</h3>
            </div>
            <div id="gpuChart" style={{ height: '400px' }} />
          </div>
        </div>
        {/* 表格区域 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">详细数据</h3>
            <Tooltip title="刷新数据">
              <Button
                icon={<ReloadOutlined />}
                type="text"
                className="!rounded-button"
              />
            </Tooltip>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
          />
        </div>
      </div>
    </div>
  )
}
export default App
