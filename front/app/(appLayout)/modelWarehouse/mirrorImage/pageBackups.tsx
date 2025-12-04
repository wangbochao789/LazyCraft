'use client'

import React, { useState } from 'react'
import type { ColumnsType } from 'antd/es/table'
import { Badge, Button, Input, Modal, Select, Space, Switch, Table, Tag, message } from 'antd'
import { CopyOutlined, DeleteOutlined, ExclamationCircleOutlined, ScanOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
import styles from './index.module.scss'
type ImageData = {
  key: string
  name: string
  version: string
  status: string
  environment: string[]
  size: string
  createTime: string
  lastScan: string
  isolation: {
    enabled: boolean
    os: string
    dependencies: string[]
  }
}
const MirrorImage: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isPackageModalVisible, setIsPackageModalVisible] = useState(false)
  const [packageForm, setPackageForm] = useState({
    selectedImage: '',
    newName: '',
    newVersion: '',
    enableIsolation: true,
    isolationOS: 'Ubuntu 20.04',
  })
  const data: ImageData[] = [
    {
      key: '1',
      name: 'tensorflow-gpu',
      version: '2.8.0',
      status: 'normal',
      environment: ['CUDA 11.2', 'Python 3.8'],
      size: '2.1 GB',
      createTime: '2024-01-15 14:30',
      lastScan: '2024-01-20',
      isolation: {
        enabled: true,
        os: 'Ubuntu 20.04',
        dependencies: ['CUDA Toolkit 11.2', 'cuDNN 8.1', 'Python 3.8'],
      },
    },
    {
      key: '2',
      name: 'pytorch-base',
      version: '1.12.0',
      status: 'scanning',
      environment: ['CUDA 11.3', 'Python 3.9'],
      size: '1.8 GB',
      createTime: '2024-01-14 09:15',
      lastScan: '2024-01-19',
      isolation: {
        enabled: true,
        os: 'Debian 10',
        dependencies: ['CUDA Toolkit 11.3', 'cuDNN 8.2', 'Python 3.9'],
      },
    },
    {
      key: '3',
      name: 'scikit-learn',
      version: '1.0.2',
      status: 'warning',
      environment: ['Python 3.8'],
      size: '890 MB',
      createTime: '2024-01-13 16:45',
      lastScan: '2024-01-18',
      isolation: {
        enabled: false,
        os: 'Ubuntu 20.04',
        dependencies: ['Python 3.8', 'NumPy 1.21'],
      },
    },
    {
      key: '4',
      name: 'opencv-cuda',
      version: '4.5.5',
      status: 'normal',
      environment: ['CUDA 11.2', 'Python 3.7'],
      size: '1.2 GB',
      createTime: '2024-01-12 11:20',
      lastScan: '2024-01-17',
      isolation: {
        enabled: true,
        os: 'Ubuntu 18.04',
        dependencies: ['CUDA Toolkit 11.2', 'Python 3.7'],
      },
    },
    {
      key: '5',
      name: 'keras-gpu',
      version: '2.7.0',
      status: 'normal',
      environment: ['CUDA 11.2', 'Python 3.8'],
      size: '1.5 GB',
      createTime: '2024-01-11 13:40',
      lastScan: '2024-01-16',
      isolation: {
        enabled: true,
        os: 'Ubuntu 20.04',
        dependencies: ['CUDA Toolkit 11.2', 'Python 3.8'],
      },
    },
  ]

  const handleScan = (key: string) => {
    message.loading('正在扫描镜像...', 2.5)
      .then(() => message.success('扫描完成'))
  }
  const handleDelete = (key: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个镜像吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        message.success('删除成功')
      },
    })
  }

  const columns: ColumnsType<ImageData> = [
    {
      title: '镜像名称',
      dataIndex: 'name',
      key: 'name',
      render: text => <span className="text-blue-600 font-medium">{text}</span>,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: text => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          normal: { color: 'success', text: '成功' },
          warning: { color: 'success', text: '成功' },
          scanning: { color: 'success', text: '成功' },
        }
        const statusInfo = statusMap[status as keyof typeof statusMap]
        return <Badge status={statusInfo.color as any} text={statusInfo.text} />
      },
    },
    {
      title: '运行环境',
      dataIndex: 'environment',
      key: 'environment',
      render: (tags: string[], record: ImageData) => (
        <div>
          <div className="mb-1">
            {tags.map(tag => (
              <Tag color="cyan" key={tag} className="mr-1">
                {tag}
              </Tag>
            ))}
          </div>
          <div className="text-xs">
            <Tag color={record.isolation.enabled ? 'green' : 'default'}>
              {record.isolation.enabled ? '已启用隔离' : '未启用隔离'}
            </Tag>
            <Tag color="blue">{record.isolation.os}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: '隔离依赖',
      key: 'isolationDeps',
      render: (_, record: ImageData) => (
        <div className="text-sm">
          {record.isolation.dependencies.map((dep, index) => (
            <div key={index} className="text-gray-600">
              {dep}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '最近扫描',
      dataIndex: 'lastScan',
      key: 'lastScan',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<ScanOutlined />}
            className="text-blue-600 hover:text-blue-700 !rounded-button whitespace-nowrap"
            onClick={() => handleScan(record.key)}
          >
            扫描
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="!rounded-button whitespace-nowrap"
            onClick={() => handleDelete(record.key)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的镜像')
      return
    }
    Modal.confirm({
      className: styles.customModal,
      title: '批量删除确认',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个镜像吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        message.success('批量删除成功')
        setSelectedRowKeys([])
      },
    })
  }
  const handleUpload = () => {
    setIsModalVisible(true)
  }
  return (
    <div className="min-h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="min-w-[1440px] mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">容器镜像管理</h1>
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="搜索镜像名称、版本或环境"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  className="w-64 !rounded-button"
                />
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleUpload}
                  className="!rounded-button whitespace-nowrap"
                >
                  上传镜像
                </Button>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => setIsPackageModalVisible(true)}
                  className="!rounded-button whitespace-nowrap"
                >
                  封装镜像
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                  disabled={selectedRowKeys.length === 0}
                  className="!rounded-button whitespace-nowrap"
                >
                  批量删除
                </Button>
              </div>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            className="custom-table"
            pagination={{
              total: data.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: total => `共 ${total} 条`,
            }}
          />
        </div>
        <Modal
          title="上传镜像"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)} className="!rounded-button">
              取消
            </Button>,
            <Button key="upload" type="primary" className="!rounded-button">
              确认上传
            </Button>,
          ]}
        >
          <div className="p-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <UploadOutlined className="text-4xl text-gray-400 mb-3" />
              <p className="text-gray-600">点击或拖拽文件到此区域上传</p>
              <p className="text-gray-400 text-sm mt-2">支持 .tar、.gz 格式，单个文件最大 5GB</p>
            </div>
          </div>
        </Modal>
        <Modal
          title="封装镜像"
          open={isPackageModalVisible}
          onCancel={() => setIsPackageModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsPackageModalVisible(false)} className="!rounded-button">
              取消
            </Button>,
            <Button
              key="package"
              type="primary"
              onClick={() => {
                message.success('镜像封装任务已提交')
                setIsPackageModalVisible(false)
              }}
              className="!rounded-button"
            >
              开始封装
            </Button>,
          ]}
        >
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span>启用隔离环境</span>
                <Switch
                  checked={packageForm.enableIsolation}
                  onChange={checked => setPackageForm({ ...packageForm, enableIsolation: checked })}
                />
              </div>
            </div>
            <div>
              <div className="mb-2">选择隔离系统</div>
              <Select
                className="w-full !rounded-button"
                value={packageForm.isolationOS}
                onChange={value => setPackageForm({ ...packageForm, isolationOS: value })}
                disabled={!packageForm.enableIsolation}
              >
                <Select.Option value="Ubuntu 20.04">Ubuntu 20.04 LTS</Select.Option>
                <Select.Option value="Ubuntu 18.04">Ubuntu 18.04 LTS</Select.Option>
                <Select.Option value="Debian 10">Debian 10</Select.Option>
                <Select.Option value="CentOS 8">CentOS 8</Select.Option>
              </Select>
            </div>
            <div>
              <div className="mb-2">选择要封装的镜像</div>
              <Select
                className="w-full !rounded-button"
                value={packageForm.selectedImage}
                onChange={value => setPackageForm({ ...packageForm, selectedImage: value })}
                placeholder="请选择要封装的镜像"
              >
                {data.map(item => (
                  <Select.Option key={item.key} value={item.name}>
                    {item.name} ({item.version})
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <div className="mb-2">新镜像名称</div>
              <Input
                placeholder="请输入新镜像名称"
                value={packageForm.newName}
                onChange={e => setPackageForm({ ...packageForm, newName: e.target.value })}
                className="!rounded-button"
              />
            </div>
            <div>
              <div className="mb-2">新镜像版本</div>
              <Input
                placeholder="请输入新镜像版本"
                value={packageForm.newVersion}
                onChange={e => setPackageForm({ ...packageForm, newVersion: e.target.value })}
                className="!rounded-button"
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
export default MirrorImage
