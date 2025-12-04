import React from 'react'
import { Divider, Drawer, Tag } from 'antd'
import InfoTitle from '../components/InfoTitle'
import InfoItem from '../components/InfoItem'

const AddModal = (props: any) => {
  const { visible, onClose, baseInfo } = props

  const handleCancel = () => {
    onClose()
  }

  // 根据来源确定弹窗标题
  const getDrawerTitle = () => {
    if (baseInfo?.created_from_info === '模型量化')
      return '量化任务信息'
    return '微调任务信息'
  }

  // 状态标签配置
  const statusConfig = {
    InQueue: { text: '排队中', color: 'warning' },
    Pending: { text: '排队中', color: 'warning' },
    InProgress: { text: '运行中', color: 'processing' },
    Completed: { text: '已完成', color: 'success' },
    Failed: { text: '失败', color: 'error' },
    Cancel: { text: '已取消', color: 'default' },
  }

  // 任务优先级配置
  const priorityConfig = {
    low: { text: '低优先级', color: 'default' },
    medium: { text: '中优先级', color: 'blue' },
    high: { text: '高优先级', color: 'orange' },
  }

  // 模型类型配置
  const modelKindConfig = {
    localLLM: { text: '本地大语言模型', color: 'blue' },
    Embedding: { text: '嵌入模型', color: 'green' },
  }

  // 其他配置字段中文映射
  const otherConfigKeyMap = {
    framework: '框架',
    dev_env: '开发环境',
    select_mode: '选择模式',
    num: '数量',
    gpu_num: 'GPU数量',
    quantitative_method: '量化方法',
    target_accuracy: '目标精度',
    batch_size: '批次大小',
    learning_rate: '学习率',
    num_epochs: '训练轮数',
    lora_r: 'LoRA秩值',
    lora_alpha: 'LoRA阿尔法',
    cutoff_len: '序列最大长度',
    val_size: '验证集占比',
    training_type: '训练模式',
    lr_scheduler_type: '学习率调整策略',
    num_gpus: 'GPU卡数',
  }

  return (
    <Drawer title={getDrawerTitle()} width={600} open={visible} onClose={handleCancel} maskClosable closable>
      <InfoTitle text="基本信息" />
      <InfoItem labelSpan={4} label="任务ID：" content={baseInfo?.id} />
      <InfoItem labelSpan={4} label="模型名称：" content={baseInfo?.name} />
      <InfoItem labelSpan={4} label="描述：" content={baseInfo?.description || '无'} />
      <InfoItem labelSpan={4} label="基础模型：" content={baseInfo?.base_model_name} />
      <InfoItem labelSpan={4} label="目标模型：" content={baseInfo?.target_model_name || '未生成'} />
      <InfoItem labelSpan={5} label="训练数据集：" content={
        baseInfo?.dataset_list?.length > 0
          ? baseInfo?.dataset_list?.map((item, index) => {
            return (
              <span key={item.id}>{item?.name} &gt; {item?.version} {index + 1 < baseInfo?.dataset_list.length && '、'}</span>
            )
          })
          : '无'
      } />
      <InfoItem labelSpan={4} label="微调类型：" content={baseInfo?.finetuning_type} />
      <InfoItem labelSpan={4} label="任务类型：" content={baseInfo?.task_type} />
      <InfoItem labelSpan={4} label="任务优先级：" content={
        <Tag color={priorityConfig[baseInfo?.task_priority]?.color}>
          {priorityConfig[baseInfo?.task_priority]?.text}
        </Tag>
      } />
      <InfoItem labelSpan={4} label="模型类型：" content={
        <Tag color={modelKindConfig[baseInfo?.model_kind]?.color}>
          {modelKindConfig[baseInfo?.model_kind]?.text}
        </Tag>
      } />
      <InfoItem labelSpan={4} label="训练状态：" content={
        <Tag color={statusConfig[baseInfo?.status]?.color}>
          {statusConfig[baseInfo?.status]?.text}
        </Tag>
      } />
      <InfoItem labelSpan={4} label="训练时长：" content={`${baseInfo?.train_runtime || 0}秒`} />
      <InfoItem labelSpan={4} label="创建人：" content={baseInfo?.created_by_account?.name || '未知'} />
      <InfoItem labelSpan={4} label="创建时间：" content={baseInfo?.created_at} />
      <InfoItem labelSpan={4} label="更新时间：" content={baseInfo?.updated_at} />
      <InfoItem labelSpan={4} label="训练结束时间：" content={baseInfo?.train_end_time || '未完成'} />
      <InfoItem labelSpan={4} label="来源：" content={baseInfo?.created_from_info} />

      {baseInfo?.created_from_info !== '模型量化' && (
        <>
          <Divider style={{ width: 'calc(100% + 30px)' }} />
          <InfoTitle text="超参配置" />
          <InfoItem labelSpan={4} label="训练次数：" content={baseInfo?.finetune_config?.num_epochs || '未设置'} />
          <InfoItem labelSpan={4} label="学习率：" content={baseInfo?.finetune_config?.learning_rate || '未设置'} />
          <InfoItem labelSpan={6} label="学习率调整策略：" content={baseInfo?.finetune_config?.lr_scheduler_type || '未设置'} />
          {baseInfo?.finetune_config?.num_gpus && <InfoItem labelSpan={4} label="GPU卡数：" content={baseInfo?.finetune_config?.num_gpus} />}
          <InfoItem labelSpan={4} label="批次大小：" content={baseInfo?.finetune_config?.batch_size || '未设置'} />
          <InfoItem labelSpan={5} label="序列最大长度：" content={baseInfo?.finetune_config?.cutoff_len || '未设置'} />
          <InfoItem labelSpan={4} label="验证集占比：" content={baseInfo?.finetune_config?.val_size || '未设置'} />
          <InfoItem labelSpan={4} label="训练模式：" content={baseInfo?.finetune_config?.training_type || '未设置'} />

          {baseInfo?.finetuning_type === 'LoRA' && (
            <>
              <InfoItem labelSpan={4} label="LoRA秩值：" content={baseInfo?.finetune_config?.lora_r || '未设置'} />
              <InfoItem labelSpan={5} label="LoRA阿尔法：" content={baseInfo?.finetune_config?.lora_alpha || '未设置'} />
            </>
          )}
        </>
      )}

      <Divider style={{ width: 'calc(100% + 30px)' }} />
      <InfoTitle text="其他配置" />
      {Object.keys(baseInfo?.other_config || {}).length > 0
        ? Object.entries(baseInfo?.other_config).map(([key, value]) => (
          <InfoItem
            key={key}
            labelSpan={4}
            label={`${otherConfigKeyMap[key] || key}：`}
            content={typeof value === 'object' ? JSON.stringify(value) : String(value)}
          />
        ))
        : (
          <InfoItem labelSpan={4} label="其他配置：" content="无" />
        )}
    </Drawer>
  )
}

export default AddModal
