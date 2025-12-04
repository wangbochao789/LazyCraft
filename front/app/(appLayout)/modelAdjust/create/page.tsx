'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Breadcrumb, Button, Col, Divider, Form, Input, InputNumber, Modal, Radio, Row, Select, TreeSelect } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { InfoCircleOutlined } from '@ant-design/icons'
import InfoTitle from '../components/InfoTitle'
import DatasetTreeSelect from '../components/datasetTreeSelect'
import styles from './index.module.scss'
import { EMode, EType } from './config'
import { createModel, deleteParam, getBaseModelList, getModelListFromFinetune } from '@/infrastructure/api/modelAdjust'
import Toast from '@/app/components/base/toast'
import { useApplicationContext } from '@/shared/hooks/app-context'

type ModelItem = {
  model: string
  source: string
  available: boolean
  model_kind?: string
}

const { Option } = Select
const datasetmap = {
  Alpaca_fine_tuning: 'DATASET_FORMAT_ALPACA',
  Sharegpt_fine_tuning: 'DATASET_FORMAT_SHARE_GPT',
  Openai_fine_tuning: 'DATASET_FORMAT_OPENAI',
}

const CreateModelAdjust = () => {
  const router = useRouter()
  const { userSpecified: userProfile } = useApplicationContext()
  const [baseForm] = Form.useForm()
  const [configForm] = Form.useForm()
  const [modalForm] = Form.useForm()
  const [computeForm] = Form.useForm()

  // 状态管理
  const [configType, setConfigType] = useState(1)
  const [mType, _setMType] = useState('')
  const [selectKey, setSelectKey] = useState(null)
  const [modelList, setModelList] = useState<ModelItem[]>([])
  const [temValue, setTempValue] = useState({})
  const [datasetList, setDatasetList] = useState([])
  const [defineList, setDefineList] = useState([])
  const [visible, setVisible] = useState(false)
  const [trainingType, setTrainingType] = useState('SFT')
  const [finetuningType, setFinetuningType] = useState('LoRA')
  const [taskType, setTaskType] = useState('model_finetuning')
  const [computeMode, setComputeMode] = useState('single')
  const [model_type, setModelType] = useState('')

  const isMine = userProfile?.tenant?.status === 'private'

  // 资源消耗预估
  const [resourceEstimates, setResourceEstimates] = useState({
    totalGPUs: 1,
    estimatedMemory: 8,
    estimatedStorage: 100,
  })

  // 计算资源消耗
  const calculateResourceEstimates = useCallback((params) => {
    const { num_epochs, batch_size, gpu_count_per_machine, machine_count, compute_mode } = params
    const machineCount = compute_mode === 'multi' ? (machine_count || 1) : 1
    const gpuPerMachine = gpu_count_per_machine || 1
    const totalGPUs = machineCount * gpuPerMachine
    const estimatedMemory = (batch_size || 4) * 2
    const estimatedStorage = (num_epochs || 10) * 50
    return {
      totalGPUs,
      estimatedMemory,
      estimatedStorage,
    }
  }, [])

  // API调用函数
  const getModelList = async () => {
    const modelList = await getModelListFromFinetune({ url: '/finetune/ft/models' })
    if (modelList?.data)
      setModelList(modelList.data as unknown as ModelItem[])
  }

  const getDataset = useCallback(async () => {
    const res: any = await getBaseModelList({ url: `/finetune/datasets?qtype=${isMine ? 'mine' : 'already'}`, options: {} })
    if (res)
      setDatasetList(res)
  }, [isMine])

  const getDefineList = async () => {
    const res: any = await getBaseModelList({ url: '/finetune_param', options: {} })
    if (res)
      setDefineList(res)
  }

  useEffect(() => {
    getModelList()
    getDataset()
    getDefineList()
  }, [getDataset])

  // 表单值变化处理
  const onValuesChange = (changeValue) => {
    if (changeValue.finetuning_type)
      setFinetuningType(changeValue.finetuning_type)
    if (changeValue.training_type)
      setTrainingType(changeValue.training_type)
    if (changeValue.task_type)
      setTaskType(changeValue.task_type)
    if (changeValue.compute_mode)
      setComputeMode(changeValue.compute_mode)

    // 当选择基础模型时，检查是否为Embedding模型
    if (changeValue.base_model) {
      const selectedModel = modelList.find(model => `${model.model}:${model.source.split('/').pop()}` === changeValue.base_model)
      if (selectedModel && selectedModel.model_kind === 'Embedding') {
        setModelType('Embedding')

        // 自动设置训练模式和微调类型
        setTrainingType('SFT')
        setFinetuningType('Embed')

        // 更新基础表单的训练模式和微调类型
        baseForm.setFieldsValue({
          training_type: 'SFT',
          finetuning_type: 'Embed',
        })

        // 为Embedding模型设置默认超参数
        configForm.setFieldsValue({
          num_epochs: undefined, // 需要用户输入
          learning_rate: undefined, // 需要用户输入
          batch_size: 2,
          train_group_size: 8,
          query_max_len: 512,
          passage_max_len: 512,
          framework: 'PyTorch',
          development_environment: 'Jupyter Notebook',
        })
      }
      else {
        setModelType('')

        // 重置训练模式和微调类型为默认值
        setTrainingType('SFT')
        setFinetuningType('LoRA')

        // 更新基础表单的训练模式和微调类型
        baseForm.setFieldsValue({
          training_type: 'SFT',
          finetuning_type: 'LoRA',
        })

        // 重置为默认值
        configForm.setFieldsValue({
          batch_size: 32,
          cutoff_len: 1024,
          framework: 'PyTorch',
          development_environment: 'VS Code',
        })
      }
    }

    // 计算资源消耗
    const configValues = configForm.getFieldsValue()
    const computeValues = computeForm.getFieldsValue()
    const allValues = { ...configValues, ...computeValues, ...changeValue }
    const estimates = calculateResourceEstimates(allValues)
    setResourceEstimates(estimates)
  }

  // 任务提交处理函数
  const handleTaskSubmission = (data, values, _computeValues) => {
    if (data.task_type === 'model_finetuning') {
      // 模型微调逻辑
      const { base_model, val_size, training_type, finetuning_type } = data
      if (mType !== 'local')
        delete values?.num_gpus
      values.val_size = val_size / 100
      values.training_type = training_type
      // delete data.val_size
      // delete data.training_type
      // delete data.framework
      // delete data.development_environment
      // delete data.compute_mode
      // delete data.gpu_count_per_machine
      // delete data.machine_count
      delete values?.framework
      delete values?.development_environment
      delete values?.compute_mode
      delete values?.gpu_count_per_machine
      delete values?.machine_count

      const selectedModel = modelList.find(model => `${model.model}:${model.source.split('/').pop()}` === base_model)
      const base_model_key = selectedModel ? `${selectedModel.model}:${selectedModel.source.split('/').pop()}` : base_model
      const datasetListChild: any = datasetList.map((item: any) => item.child).flat()
      const datasets_type: any = []
      data.datasets.forEach((item: any) => {
        const datasetChild = datasetListChild.find(child => child.val_key === item)
        if (datasetChild)
          datasets_type.push(datasetmap[datasetChild.type] || 'ATASET_FORMAT_UNSPECIFIED')
      })

      const para = {
        base: {
          name: data.name,
          base_model: 0,
          target_model_name: data.target_model_name,
          datasets: data.datasets,
          finetuning_type,
          datasets_type,
          base_model_key,
          created_from: 1,
          created_from_info: '模型微调',
          task_type: 'model_finetuning',
          task_priority: data.task_priority,
          model_kind: model_type,
        },
        finetune_config: {
          ...values,
        },
        other_config: {
          framework: data.framework || 'PyTorch',
          dev_env: data.development_environment || 'VS Code',
          select_mode: data.compute_mode || 'single',
          num: data.compute_mode === 'multi' ? (data.machine_count || 1) : 1,
          gpu_num: data.gpu_count_per_machine || 1,
        },
      }

      createModel({ url: '/finetune', body: { ...para } }).then(() => {
        Toast.notify({
          type: 'success', message: '微调任务创建成功',
        })
        router.push('/modelAdjust')
      })
    }
    else if (data.task_type === 'model_quantization') {
      // 模型量化逻辑 - 使用统一的微调接口
      const { base_model, quantization_method, target_precision } = data
      const selectedModel = modelList.find(model => `${model.model}:${model.source.split('/').pop()}` === base_model)
      const base_model_key = selectedModel ? `${selectedModel.model}:${selectedModel.source.split('/').pop()}` : base_model

      const para = {
        base: {
          name: data.name,
          base_model: 0,
          target_model_name: data.target_model_name,
          datasets: data.datasets || [],
          finetuning_type: 'quantization', // 量化类型
          datasets_type: data.datasets_type || [],
          base_model_key,
          created_from: 1,
          created_from_info: '模型量化',
          task_type: 'model_quantization',
          task_priority: data.task_priority,
          model_kind: model_type,
        },
        finetune_config: {
          // 量化不需要微调配置，但保持结构一致
        },
        other_config: {
          framework: data.framework || 'PyTorch',
          dev_env: data.development_environment || 'VS Code',
          select_mode: data.compute_mode || 'single',
          num: data.compute_mode === 'multi' ? (data.machine_count || 1) : 1,
          gpu_num: data.gpu_count_per_machine || 1,
          quantitative_method: quantization_method,
          target_accuracy: target_precision,
        },
      }

      createModel({ url: '/finetune', body: { ...para } }).then(() => {
        Toast.notify({
          type: 'success', message: '量化任务创建成功',
        })
        router.push('/modelAdjust')
      }).catch((error) => {
        Toast.notify({
          type: 'error', message: '量化任务创建失败',
        })
        console.error('量化任务创建失败:', error)
      })
    }
  }

  // 表单提交处理
  const handleOk = () => {
    baseForm.validateFields().then((data) => {
      // 根据任务类型决定是否需要验证配置表单
      if (data.task_type === 'model_finetuning') {
        configForm.validateFields().then((values) => {
          computeForm.validateFields().then((_computeValues) => {
            handleTaskSubmission(data, values, _computeValues)
          })
        })
      }
      else if (data.task_type === 'model_quantization') {
        // 量化任务不需要验证微调配置
        computeForm.validateFields().then((_computeValues) => {
          handleTaskSubmission(data, null, _computeValues)
        })
      }
    })
  }

  // 其他处理函数
  const onRadioChange = (e: any) => {
    setSelectKey(null)
    setConfigType(e.target.value)
    configForm.resetFields()
  }

  const onSelectChange = (value, item) => {
    setSelectKey(value)
    const { option } = item
    configForm.setFieldsValue({
      batch_size: option?.batch_size,
      cutoff_len: option?.cutoff_len,
      learning_rate: option?.learning_rate,
      lora_r: option?.lora_r,
      lr_scheduler_type: option?.lr_scheduler_type,
      num_epochs: option?.num_epochs,
      lora_alpha: option?.lora_alpha,
      num_gpus: option?.num_gpus,
    })
  }

  const saveConfig = () => {
    modalForm.validateFields().then((values: any) => {
      const training_type = baseForm.getFieldValue('training_type')
      const val_size = baseForm?.getFieldValue('val_size') / 100 || 0.1
      const para = {
        ...values,
        finetune_config: { ...temValue, training_type, val_size },
      }
      createModel({ url: '/finetune_param', body: { ...para } }).then((res) => {
        if (res) {
          Toast.notify({
            type: 'success', message: '保存成功',
          })
          modalForm.resetFields()
          getDefineList()
          setVisible(false)
          setTempValue({})
        }
      })
    })
  }

  const openConfigModal = () => {
    configForm.validateFields().then((values) => {
      setVisible(true)
      setTempValue(values)
    })
  }

  const handleDelete = async (id: any, e) => {
    e.stopPropagation()
    const res = await deleteParam({ url: `/finetune_param/${id}`, options: {} })
    if (res) {
      Toast.notify({
        type: 'success', message: '删除成功',
      })
      getDefineList()
    }
  }

  const onBlur = (e: any) => {
    baseForm.setFieldValue('target_model_name', e?.target?.value)
  }

  return (
    <div className={styles.adjustCreate}>
      <div className={styles.adjustCreateContent}>
        <div className={styles.adjustCreateHeader}>
          <Breadcrumb
            items={[
              {
                title: <Link href='/modelAdjust'>{taskType === 'model_finetuning' ? '模型微调' : '模型量化'}</Link>,
              },
              {
                title: taskType === 'model_finetuning' ? '创建微调' : '创建量化',
              },
            ]}
          />
        </div>

        {/* 基础信息表单 */}
        <Form
          form={baseForm}
          layout="vertical"
          autoComplete="off"
          onValuesChange={onValuesChange}
        >
          <InfoTitle text="基础信息" />
          <Divider style={{ margin: '8px 0 ' }} />
          <Row gutter={48}>
            <Col xl={8} lg={24}>
              <Form.Item
                name="name"
                label="任务名称"
                validateTrigger='onBlur'
                rules={[{ required: true, message: '请输入任务名称' }, {
                  pattern: /^(?!.*[\u4E00-\u9FA5]).*$/,
                  message: '仅允许英文字母、数字及符号',
                }, { whitespace: true, message: '输入不能为空或仅包含空格' }]}
              >
                <Input onBlur={onBlur} maxLength={30} placeholder='请输入30字以内的英文字母、数字或符号' />
              </Form.Item>
            </Col>
            <Col xl={8} lg={24}>
              <Form.Item
                name="task_type"
                label="任务类型"
                initialValue="model_finetuning"
                rules={[{ required: true, message: '请选择任务类型' }]}
              >
                <Select
                  placeholder='请选择任务类型'
                  options={[
                    { value: 'model_finetuning', label: '任务微调-指令微调' },
                    { value: 'model_quantization', label: '模型量化' },
                    { value: 'model_distillation', label: '模型蒸馏' },
                    { value: 'model_compression', label: '模型压缩' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xl={8} lg={24}>
              <Form.Item
                name="base_model"
                label="选择模型"
                rules={[{ required: true, message: '请选择模型' }]}
              >
                <TreeSelect
                  style={{ width: '100%' }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder='请选择模型'
                  onChange={(value) => {
                    // 设置model_kind
                    const selectedModel = modelList.find(item => `${item.model}:${item.source.split('/').pop()}` === value)
                    const model_kind = selectedModel?.model_kind
                    setModelType(model_kind || '')

                    // 如果是Embedding模型，自动设置训练模式和微调类型
                    if (model_kind === 'Embedding') {
                      setTrainingType('SFT')
                      setFinetuningType('Embed')

                      // 更新基础表单的训练模式和微调类型
                      baseForm.setFieldsValue({
                        training_type: 'SFT',
                        finetuning_type: 'Embed',
                      })

                      // 为Embedding模型设置默认超参数
                      configForm.setFieldsValue({
                        num_epochs: undefined, // 需要用户输入
                        learning_rate: undefined, // 需要用户输入
                        batch_size: 2,
                        train_group_size: 8,
                        query_max_len: 512,
                        passage_max_len: 512,
                        framework: 'PyTorch',
                        development_environment: 'Jupyter Notebook',
                      })
                    }
                    else {
                      // 重置训练模式和微调类型为默认值
                      setTrainingType('SFT')
                      setFinetuningType('LoRA')

                      // 更新基础表单的训练模式和微调类型
                      baseForm.setFieldsValue({
                        training_type: 'SFT',
                        finetuning_type: 'LoRA',
                      })

                      // 重置为默认值
                      configForm.setFieldsValue({
                        batch_size: 32,
                        cutoff_len: 1024,
                        framework: 'PyTorch',
                        development_environment: 'VS Code',
                      })
                    }
                  }}
                >
                  {modelList.map((item: any) => (
                    <TreeSelect.TreeNode
                      key={item.model}
                      title={item.model}
                      value={`${item.model}:${item.source.split('/').pop()}`}
                      selectable={item.available}
                      disabled={!item.available}
                    />
                  ))}
                </TreeSelect>
              </Form.Item>
            </Col>
            <Col xl={8} lg={24}>
              <Form.Item
                name="target_model_name"
                label={taskType === 'model_finetuning' ? '微调模型名称' : '量化模型名称'}
                rules={[{ required: true, message: taskType === 'model_finetuning' ? '请输入微调模型名称' : '请输入量化模型名称' }, { whitespace: true, message: '输入不能为空或仅包含空格' }]}
              >
                <Input style={{ width: '100%' }} maxLength={60} placeholder='请输入60字以内的任意字符' />
              </Form.Item>
            </Col>
            <Col xl={8} lg={24}>
              <Form.Item
                name="task_priority"
                label="任务优先级"
                initialValue="medium"
                rules={[{ required: true, message: '请选择任务优先级' }]}
              >
                <Select
                  placeholder='请选择任务优先级'
                  options={[
                    { value: 'low', label: '低优先级' },
                    { value: 'medium', label: '中优先级' },
                    { value: 'high', label: '高优先级' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xl={8} lg={24}>
              <DatasetTreeSelect treeData={datasetList} task_type={taskType} />
            </Col>

            {/* 模型微调特有字段 */}
            {taskType === 'model_finetuning' && (
              <>
                <Col xl={8} lg={24}>
                  <Form.Item
                    name="val_size"
                    label="验证集占比(%)"
                    validateTrigger='onBlur'
                    rules={[
                      { required: true },
                      {
                        validator: (_, value) => {
                          if (!value && value !== 0)
                            return Promise.resolve()
                          const numValue = Number(value)
                          if (numValue <= 0)
                            return Promise.reject(new Error('验证集占比必须大于0'))
                          if (numValue >= 100)
                            return Promise.reject(new Error('验证集占比必须小于100'))
                          return Promise.resolve()
                        },
                      },
                    ]}
                  >
                    <InputNumber precision={0} style={{ width: '100%' }} max={100} min={0} placeholder='请输入1~100之间的整数' />
                  </Form.Item>
                </Col>
                <Col xl={8} lg={24}>
                  <Form.Item
                    name="training_type"
                    initialValue={'SFT'}
                    extra={EMode[trainingType]}
                    label="训练模式"
                    rules={[{ required: true, message: '请选择训练模式' }]}
                  >
                    <Select
                      placeholder='请选择训练模式'
                      options={[
                        { value: 'PT', label: 'PT', disabled: model_type === 'Embedding' },
                        { value: 'SFT', label: 'SFT' },
                        { value: 'RM', label: 'RM', disabled: model_type === 'Embedding' },
                        { value: 'PPO', label: 'PPO', disabled: model_type === 'Embedding' },
                        { value: 'DPO', label: 'DPO', disabled: model_type === 'Embedding' },
                        { value: 'RLHF', label: 'RLHF', disabled: model_type === 'Embedding' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xl={8} lg={24}>
                  <Form.Item
                    name="finetuning_type"
                    initialValue={'LoRA'}
                    label="微调类型"
                    extra={EType[finetuningType]}
                    rules={[{ required: true, message: '请选择微调类型' }]}
                  >
                    <Select
                      placeholder='请选择微调类型'
                      options={[
                        { value: 'LoRA', label: 'LoRA', disabled: model_type === 'Embedding' },
                        { value: 'QLoRA', label: 'QLoRA', disabled: model_type === 'Embedding' },
                        { value: 'Full', label: 'Full', disabled: model_type === 'Embedding' },
                        { value: 'P-Tuning', label: 'P-Tuning', disabled: model_type === 'Embedding' },
                        { value: 'Embed', label: 'Embed', disabled: model_type !== 'Embedding' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </>
            )}

            {/* 模型量化特有字段 */}
            {taskType === 'model_quantization' && (
              <>
                <Col xl={8} lg={24}>
                  <Form.Item
                    name="quantization_method"
                    label="量化方法"
                    rules={[{ required: true, message: '请选择量化方法' }]}
                    extra="包括: AWQ (默认)、GPTQ"
                  >
                    <Select
                      placeholder='请选择量化方法'
                      options={[
                        { value: 'AWQ', label: 'AWQ' },
                        { value: 'GPTQ', label: 'GPTQ' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xl={8} lg={24}>
                  <Form.Item
                    name="target_precision"
                    label="目标精度"
                    rules={[{ required: true, message: '请选择目标精度' }]}
                    extra="包括: FP16 (默认)、BF16、INT8、INT4"
                  >
                    <Select
                      placeholder='请选择目标精度'
                      options={[
                        { value: 'FP16', label: 'FP16' },
                        { value: 'BF16', label: 'BF16' },
                        { value: 'INT8', label: 'INT8' },
                        { value: 'INT4', label: 'INT4' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xl={8} lg={24}>
                  <div> </div>
                </Col>
              </>
            )}
          </Row>
        </Form>

        {/* 超参数配置表单 */}
        <Form
          form={configForm}
          layout="vertical"
          autoComplete="off"
        >
          <InfoTitle text="超参数配置" />
          <Divider style={{ margin: '8px 0 ' }} />
          <Row gutter={48}>
            <Col xl={8} lg={24}>
              <Form.Item
                name="framework"
                label="框架选择"
                initialValue="PyTorch"
                rules={[{ required: true, message: '请选择框架' }]}
              >
                <Select
                  placeholder='请选择框架'
                  options={[
                    { value: 'PyTorch', label: 'PyTorch' },
                    { value: 'TensorFlow', label: 'TensorFlow' },
                    { value: 'PaddlePaddle', label: '飞浆' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xl={8} lg={24}>
              <Form.Item
                name="development_environment"
                label="开发环境"
                initialValue="VS Code"
                rules={[{ required: true, message: '请选择开发环境' }]}
              >
                <Select
                  placeholder='请选择开发环境'
                  options={[
                    { value: 'VS Code', label: 'VS Code' },
                    { value: 'PyCharm', label: 'PyCharm' },
                    { value: 'Jupyter Notebook', label: 'Jupyter Notebook' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xl={8} lg={24}>
              <div>

              </div>
            </Col>
          </Row>

          {/* 偏好设置选项单独一行 */}
          {taskType === 'model_finetuning' && (
            <Row gutter={48}>
              <Col xl={24} lg={24}>
                <div className='mb-[12px]'>
                  <Radio.Group onChange={onRadioChange} value={configType}>
                    <Radio value={1}>选择偏好设置</Radio>
                    <Radio value={2}>自定义</Radio>
                  </Radio.Group>
                </div>
                {configType === 1 && (
                  <div style={{ marginBottom: 12 }}>
                    <Select
                      onChange={onSelectChange}
                      style={{ width: 460 }}
                      placeholder="请选择"
                      value={selectKey}
                      optionLabelProp="label"
                    >
                      {defineList.map((item: any) => (
                        <Option option={item?.finetune_config} value={item?.id} key={item?.id} label={item?.name}>
                          {item?.name} {!item?.is_default
                            && <Button onClick={e => handleDelete(item?.id, e)} type='link' danger>删除</Button>
                          }
                        </Option>
                      ))}
                    </Select>
                  </div>
                )}
              </Col>
            </Row>
          )}

          {/* 超参数配置内容 - 仅微调任务显示 */}
          {taskType === 'model_finetuning' && (
            <Row gutter={48}>
              <Col xl={16} lg={24}>
                <Row gutter={48} style={{ margin: 0, background: '#FAFAFB' }}>
                  <Col xl={24} lg={24} style={{ textAlign: 'right', marginTop: 12, marginBottom: 20 }}>
                    <Button onClick={openConfigModal} type='primary' ghost>保存为偏好设置</Button>
                  </Col>

                  {/* Embedding模型的超参数配置 */}
                  {model_type === 'Embedding'
                    ? (
                      <>
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="num_epochs"
                            label="训练轮数"
                            rules={[{ required: true, message: '请输入训练轮数' }]}
                          >
                            <InputNumber precision={0} style={{ width: '100%' }} max={2147483647} min={1} placeholder='请输入1-2147483647的整数' />
                          </Form.Item>
                        </Col>
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="learning_rate"
                            label="学习率"
                            rules={[
                              { required: true, message: '请输入学习率' },
                              {
                                validator: (_, value) => {
                                  if (!value && value !== 0)
                                    return Promise.resolve()
                                  const numValue = Number(value)
                                  if (numValue <= 0)
                                    return Promise.reject(new Error('学习率必须大于0'))
                                  if (numValue >= 1)
                                    return Promise.reject(new Error('学习率必须小于1'))
                                  return Promise.resolve()
                                },
                              },
                            ]}
                          >
                            <InputNumber style={{ width: '100%' }} max={1} min={0} placeholder='请输入0~1的值' stringMode={true} controls={false} />
                          </Form.Item>
                        </Col>
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="batch_size"
                            label="训练批次"
                            rules={[{ required: true, message: '请选择批次大小' }]}
                          >
                            <Select
                              placeholder='请选择批次大小'
                              options={[
                                { value: 2, label: 2 },
                                { value: 4, label: 4 },
                                { value: 8, label: 8 },
                                { value: 16, label: 16 },
                                { value: 32, label: 32 },
                                { value: 64, label: 64 },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="train_group_size"
                            label="训练组大小"
                            rules={[{ required: true, message: '请选择训练组大小' }]}
                          >
                            <Select
                              placeholder='请选择训练组大小'
                              options={[
                                { value: 8, label: 8 },
                                { value: 16, label: 16 },
                                { value: 32, label: 32 },
                                { value: 64, label: 64 },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="query_max_len"
                            label="最大序列长度"
                            rules={[{ required: true, message: '请输入最大序列长度' }]}
                          >
                            <InputNumber precision={0} style={{ width: '100%' }} max={2147483647} min={1} placeholder='请输入最大序列长度' />
                          </Form.Item>
                        </Col>
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="passage_max_len"
                            label="文段最大长度"
                            rules={[{ required: true, message: '请输入文段最大长度' }]}
                          >
                            <InputNumber precision={0} style={{ width: '100%' }} max={2147483647} min={1} placeholder='请输入文段最大长度' />
                          </Form.Item>
                        </Col>
                      </>
                    )
                    : (
                      <>
                        {/* 普通模型的超参数配置 */}
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="num_epochs"
                            label="epoch（训练次数）"
                            rules={[{ required: true, message: '请输入重复次数' }]}
                          >
                            <InputNumber precision={0} style={{ width: '100%' }} max={2147483647} min={1} placeholder='请输入1~2147483647的整数' />
                          </Form.Item>
                        </Col>
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="learning_rate"
                            label="学习率"
                            rules={[
                              { required: true },
                              {
                                validator: (_, value) => {
                                  if (!value && value !== 0)
                                    return Promise.resolve()
                                  const numValue = Number(value)
                                  if (numValue <= 0)
                                    return Promise.reject(new Error('学习率必须大于0'))
                                  if (numValue >= 1)
                                    return Promise.reject(new Error('学习率必须小于1'))
                                  return Promise.resolve()
                                },
                              },
                            ]}
                          >
                            <InputNumber style={{ width: '100%' }} max={1} min={0} placeholder='请输入0~1的值' stringMode={true} controls={false} />
                          </Form.Item>
                        </Col>
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="lr_scheduler_type"
                            label="学习率调整策略"
                            initialValue={'cosine'}
                            validateTrigger='onBlur'
                            rules={[{ required: true, message: '请选择学习率调整策略' }]}
                          >
                            <Select
                              placeholder='请选择学习率调整策略'
                              options={[
                                { value: 'cosine', label: 'cosine' },
                                { value: 'linear', label: 'linear' },
                                { value: 'cosine_with_restarts', label: 'cosine_with_restarts' },
                                { value: 'polynomial', label: 'polynomial' },
                                { value: 'constant', label: 'constant' },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                        {mType === 'local' && (
                          <Col xl={12} lg={24}>
                            <Form.Item
                              name="num_gpus"
                              label="GPU数量"
                              rules={[{ required: true, message: '请输入GPU数量' }]}
                            >
                              <InputNumber precision={0} style={{ width: '100%' }} max={2147483647} min={1} placeholder='请输入1~2147483647的整数' />
                            </Form.Item>
                          </Col>
                        )}
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="batch_size"
                            label="batch-size（训练批次）"
                            initialValue={32}
                            rules={[{ required: true, message: '请选择批次大小' }]}
                          >
                            <Select
                              placeholder='请选择批次大小'
                              options={[
                                { value: 2, label: 2 },
                                { value: 4, label: 4 },
                                { value: 8, label: 8 },
                                { value: 16, label: 16 },
                                { value: 32, label: 32 },
                                { value: 64, label: 64 },
                                { value: 128, label: 128 },
                                { value: 256, label: 256 },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                        <Col xl={12} lg={24}>
                          <Form.Item
                            name="cutoff_len"
                            label="序列最大长度"
                            initialValue={1024}
                            rules={[{ required: true, message: '请输入序列最大长度' }]}
                          >
                            <InputNumber precision={0} style={{ width: '100%' }} max={2147483647} min={32} placeholder='请输入32~2147483647的整数' />
                          </Form.Item>
                        </Col>
                        {finetuningType !== 'Full' && (
                          <>
                            <Col xl={12} lg={24}>
                              <Form.Item
                                name="lora_r"
                                label="LoRA秩值"
                                initialValue={8}
                                rules={[{ required: true, message: '请选择LoRA秩值' }]}
                              >
                                <Select
                                  placeholder='请选择LoRA秩值'
                                  options={[
                                    { value: 2, label: 2 },
                                    { value: 4, label: 4 },
                                    { value: 8, label: 8 },
                                    { value: 16, label: 16 },
                                    { value: 32, label: 32 },
                                    { value: 64, label: 64 },
                                  ]}
                                />
                              </Form.Item>
                            </Col>
                            <Col xl={12} lg={24}>
                              <Form.Item
                                name="lora_alpha"
                                label="LoRA阿尔法"
                                initialValue={32}
                                rules={[{ required: true, message: '请选择LoRA阿尔法' }]}
                              >
                                <Select
                                  placeholder='请选择LoRA阿尔法'
                                  options={[
                                    { value: 8, label: 8 },
                                    { value: 16, label: 16 },
                                    { value: 32, label: 32 },
                                    { value: 64, label: 64 },
                                  ]}
                                />
                              </Form.Item>
                            </Col>
                          </>
                        )}
                      </>
                    )}
                </Row>
              </Col>
            </Row>
          )}
        </Form>

        {/* 算力资源配置表单 */}
        <Form
          form={computeForm}
          layout="vertical"
          autoComplete="off"
          onValuesChange={onValuesChange}
        >
          <InfoTitle text="算力资源配置" />
          <Divider style={{ margin: '8px 0 ' }} />
          <Row gutter={48}>
            <Col xl={8} lg={24}>
              <Form.Item
                name="compute_mode"
                label="选择模式"
                initialValue="single"
                rules={[{ required: true, message: '请选择模式' }]}
              >
                <Radio.Group>
                  <Radio value="single">单机</Radio>
                  <Radio value="multi">多机</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            {computeMode === 'multi' && (
              <Col xl={8} lg={24}>
                <Form.Item
                  name="machine_count"
                  label="机器数量"
                  rules={[{ required: true, message: '请输入机器数量' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    max={20}
                    placeholder="请输入机器数量（1-20）"
                  />
                </Form.Item>
              </Col>
            )}
            {computeMode === 'single' && (
              <Col xl={8} lg={24}>
              </Col>
            )}
            <Col xl={8} lg={24}>
              <Form.Item
                name="gpu_count_per_machine"
                label="每台机器GPU数量"
                rules={[{ required: true, message: '请输入每台机器GPU数量' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={8}
                  placeholder='请输入GPU数量'
                />
              </Form.Item>
            </Col>
            <Col xl={24} lg={24}>
              <div className="col-span-2 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <InfoCircleOutlined className="text-blue-500 mt-1 mr-2" />
                  <div>
                    <div className="text-gray-700 font-medium mb-2">资源消耗预估</div>
                    <div className="text-gray-600 text-sm">
                      总 GPU 数量：{resourceEstimates.totalGPUs}<br />
                      预估内存占用：{resourceEstimates.estimatedMemory}GB<br />
                      预估存储占用：{resourceEstimates.estimatedStorage}GB
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Form>

        {/* 偏好设置模态框 */}
        <Modal title="偏好设置" open={visible} onCancel={() => setVisible(false)} onOk={saveConfig} okText="确定" cancelText="取消" >
          <Form
            form={modalForm}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="name"
              label="偏好名称"
              validateTrigger='onBlur'
              rules={[{ required: true, message: '请输入偏好名称' }, { whitespace: true, message: '输入不能为空或仅包含空格' }]}
            >
              <Input placeholder='请输入偏好名称' />
            </Form.Item>
          </Form>
        </Modal>
      </div>

      <div style={{ textAlign: 'right' }}>
        <Divider style={{ marginBottom: 10 }} />
        <Button onClick={handleOk} type='primary' style={{ marginRight: 20 }}>
          {taskType === 'model_finetuning' ? '发布微调任务' : '发布量化任务'}
        </Button>
        <Divider style={{ marginTop: 10 }} />
      </div>
    </div>
  )
}

export default CreateModelAdjust
