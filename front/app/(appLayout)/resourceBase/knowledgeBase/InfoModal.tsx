import React, { useEffect } from 'react'
import { Form, Input, Modal } from 'antd'
import Toast, { ToastTypeEnum } from '@/app/components/base/flash-notice'
import { Service as OpenAPIService } from '@/infrastructure/api/generated/services/Service'
import { noOnlySpacesRule } from '@/shared/utils'
import TagSelect from '@/app/components/tagSelect'
import { bindTags } from '@/infrastructure/api/tagManage'

const CreateModal = (props: any) => {
  const { visible, onClose, onSuccess, data, gettaglist } = props
  const [form] = Form.useForm()

  const handleOk = async () => {
    gettaglist()
    form.validateFields().then((values) => {
      if (data) {
        OpenAPIService.postKbUpdate({ ...data, ...values, id: String(data.id) } as any).then((res: any) => {
          const nextId = res?.data?.id || res?.id || data.id
          Toast.notify({ type: ToastTypeEnum.Success, message: '更新成功' })
          bindTags({ url: 'tags/bindings/update', body: { type: 'knowledgebase', tag_names: values?.tags, target_id: nextId } }).then(() => {
            onSuccess(nextId, 'edit')
          })
        })
      }
      else {
        OpenAPIService.postKbCreate(values as any).then((res: any) => {
          const nextId = res?.data?.id || res?.id
          bindTags({ url: 'tags/bindings/update', body: { type: 'knowledgebase', tag_names: values?.tags, target_id: nextId } }).then(() => {
            onSuccess(nextId, 'create')
            onSuccess(nextId)
          })
        })
      }
    }).catch((err) => {
      console.error(err)
    })
  }

  const handleCancel = () => {
    gettaglist()
    onClose()
  }

  useEffect(() => {
    if (!visible)
      form.resetFields()
    else
      data && form.setFieldsValue(data)
  }, [visible, data, form])

  return (
    <Modal title={data ? '编辑知识库' : '新建知识库'} open={visible} onOk={handleOk} onCancel={handleCancel} cancelText='取消' okText={data ? '更新' : '下一步'}>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="知识库名称"
          rules={[{ required: true, message: '请输入知识库名称' }, { ...noOnlySpacesRule }]}
        >
          <Input maxLength={50} placeholder="请输入知识库名称" />
        </Form.Item>
        <TagSelect fieldName='tags' type='knowledgebase' label={'知识库标签'} onRefresh={gettaglist} />
        <Form.Item
          name="description"
          label="知识库简介"
          rules={[{ required: true, message: '请输入知识库简介' }, { ...noOnlySpacesRule }]}
        >
          <Input.TextArea rows={5} placeholder="请输入知识库简介" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateModal
