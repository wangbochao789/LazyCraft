import React, { useCallback, useEffect, useState } from 'react'
import { Form, Input, Modal, Select } from 'antd'
import { Service as OpenAPIService } from '@/infrastructure/api/generated/services/Service'
import Toast, { ToastTypeEnum } from '@/app/components/base/flash-notice'
import { noOnlySpacesRule } from '@/shared/utils'

const AddModal = (props: any) => {
  const { visible, onClose, onSuccess, id, datasetInfo } = props
  const [form] = Form.useForm()
  const [tags, setTags] = useState([])

  const handleOk = async () => {
    form.validateFields().then((values) => {
      OpenAPIService.postDataVersionCreateByTag(values as any).then(() => {
        Toast.notify({ type: ToastTypeEnum.Success, message: '创建成功' })
        onSuccess()
      }).catch((err) => {
        console.error(err)
      })
    })
  }

  const getTagList = useCallback(async () => {
    const res: any = await OpenAPIService.getDataTagList(String(id))
    setTags(res.data.map(item => ({ value: item.id, label: `${item.name} ${item.version}` })))
    return res
  }, [id])

  useEffect(() => {
    if (visible) {
      getTagList()
      if (datasetInfo) {
        form.setFieldsValue({
          name: `${datasetInfo.name}-${datasetInfo.branches_num}`,
        })
      }
    }
    else {
      form.resetFields()
    }
  }, [visible, form, datasetInfo, getTagList])

  const handleCancel = () => {
    onClose()
  }

  return (
    <Modal title='添加Branches' open={visible} onOk={handleOk} onCancel={handleCancel} cancelText='取消' okText='下一步'>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="数据集名称"
          rules={[{ required: true, message: '请输入数据集名称' }, { ...noOnlySpacesRule }]}
        >
          <Input maxLength={50} placeholder="请输入数据集名称" />
        </Form.Item>
        <Form.Item
          name="data_set_version_id"
          label="tags"
          rules={[{ required: true, message: '请选择tags' }]}
        >
          <Select
            placeholder='请选择tags'
            options={tags}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddModal
