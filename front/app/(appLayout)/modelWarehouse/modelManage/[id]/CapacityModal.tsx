import React, { useEffect, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, message } from 'antd'
import Toast from '@/app/components/base/toast'

type CapacityModalProps = {
  visible: boolean
  onClose: () => void
  baseInfo?: any
}

const CapacityModal: React.FC<CapacityModalProps> = ({ visible, onClose, baseInfo }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible && baseInfo) {
      // 初始化表单数据，这里可以根据实际需求设置默认值
      form.setFieldsValue({
        modelName: baseInfo.model_name,
        maxCapacity: baseInfo.max_capacity || 1000,
        currentCapacity: baseInfo.current_capacity || 0,
        description: baseInfo.capacity_description || ''
      })
    }
  }, [visible, baseInfo, form])

  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      // 这里可以调用实际的API保存容量管理数据
      // const response = await updateCapacityManagement({ modelId: baseInfo.id, ...values })

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 显示修改成功提示
      Toast.notify({ type: 'success', message: '修改成功' })
      // 关闭弹窗
      onClose()
    }
    catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
    }
    finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="容量管理"
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          保存
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item
          label="模型名称"
          name="modelName"
          rules={[{ required: true, message: '请输入模型名称' }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="最大容量"
          name="maxCapacity"
          rules={[{ required: true, message: '请输入最大容量' }]}
        >
          <InputNumber
            min={1}
            max={10000}
            style={{ width: '100%' }}
            placeholder="请输入最大容量"
          />
        </Form.Item>

        <Form.Item
          label="当前容量"
          name="currentCapacity"
          rules={[{ required: true, message: '请输入当前容量' }]}
        >
          <InputNumber
            min={0}
            max={10000}
            style={{ width: '100%' }}
            placeholder="请输入当前容量"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CapacityModal
