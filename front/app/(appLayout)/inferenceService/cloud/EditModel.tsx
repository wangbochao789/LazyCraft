import React from 'react'
import { Form, Input, Modal, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { editModel } from '@/infrastructure/api/modelWarehouse'
import Toast, { ToastTypeEnum } from '@/app/components/base/flash-notice'

const ModalList = (props: any) => {
  const { visible, onClose, onSuccess, data, kind } = props
  const [form] = Form.useForm()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      await editModel({ url: '/mh/update_apikey', body: { ...values } })
      Toast.notify({ type: ToastTypeEnum.Success, message: '设置成功' })
      onSuccess()
      form.resetFields()
    }
    catch (error) {
      console.error(error)
    }
  }
  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  const modelName = data?.model_type === 'local' ? data?.model_name : data?.model_brand
  const modelTips = modelName === 'sensenova' ? '请按照以下格式输入：ak:sk' : '请输入API Key'
  const isOpenAI = kind?.toLowerCase() === 'openai'

  // OpenAI 的自定义验证规则：URL 和 API Key 至少填写一个
  const validateUrlOrApiKey = (_: any, _value: any) => {
    const apiKey = form.getFieldValue('api_key')
    const proxyUrl = form.getFieldValue('proxy_url')
    if (!apiKey && !proxyUrl)
      return Promise.reject(new Error('URL 和 API Key 至少需要填写一个'))

    return Promise.resolve()
  }

  return (
    <Modal title="设置" destroyOnClose open={visible} onOk={handleOk} onCancel={handleCancel} cancelText='取消' okText='保存'>
      <Form
        form={form}
        layout="horizontal"
        autoComplete="off"
        preserve={false}
        labelCol={{ flex: '100px' }}
        wrapperCol={{ flex: 'auto' }}
        labelWrap={true}
      >
        <Form.Item name="model_brand" label="厂商名字" initialValue={kind}>
          <Input disabled value={kind} />
        </Form.Item>
        {isOpenAI && (
          <Form.Item
            name="proxy_url"
            label={
              <span>
                URL{' '}
                <Tooltip
                  title={
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      OpenAI协议接入方式（示例URL为：http://ip:8000/v1/）：
                      <br />
                      1、接入已有的标准OpenAI协议的推理服务，填写推理服务地址即可
                      <br />
                      2、使用vllm-openai镜像方式搭建OpenAI协议的推理服务
                      <br />
                      <pre style={{ margin: '8px 0', background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '4px', fontSize: '12px' }}>
                        {`docker run \\
  --runtime=nvidia \\
  -e NVIDIA_VISIBLE_DEVICES=6,7 \\
  -v /data/nfs/ams/models/Qwen3-32B:/model \\
  -p 8000:8000 \\
  --shm-size=32g \\
  vllm/vllm-openai:v0.11.0 \\
  --model /model \\
  --dtype auto \\
  --tensor-parallel-size 2 \\
  --served-model-name qwen3-32b \\
  --port 8000`}
                      </pre>
                    </div>
                  }
                  overlayStyle={{ maxWidth: '600px' }}
                >
                  <QuestionCircleOutlined style={{ cursor: 'pointer' }} />
                </Tooltip>
              </span>
            }
            dependencies={['api_key']}
            rules={[
              // { required: true, message: 'URL 和 API Key 至少需要填写一个' },
              { validator: validateUrlOrApiKey },
            ]}
          >
            <Input placeholder="代理服务地址，或其他兼容openai api接口的云服务商地址" />
          </Form.Item>
        )}
        <Form.Item
          name="api_key"
          label="API Key"
          dependencies={isOpenAI ? ['proxy_url'] : []}
          rules={[
            ...(isOpenAI
              ? [{ validator: validateUrlOrApiKey }]
              : [{ required: true, message: modelTips }]),
          ]}
        >
          <Input placeholder={modelTips} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ModalList
