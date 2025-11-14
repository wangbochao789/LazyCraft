import React from 'react'
import { Drawer, Tag } from 'antd'
import InfoItem from '../../../modelAdjust/components/InfoItem'
import LLM from '@/public/images/modelWarehouse/LLM.png'
import Embedding from '@/public/images/modelWarehouse/Embedding.png'
import Reranker from '@/public/images/modelWarehouse/Reranker.png'
import OCR from '@/public/images/modelWarehouse/OCR.png'
import SD from '@/public/images/modelWarehouse/SD.png'
import TTS from '@/public/images/modelWarehouse/TTS.png'
import STT from '@/public/images/modelWarehouse/STT.png'
import VQA from '@/public/images/modelWarehouse/VQA.png'

const DrawInfo = (props: any) => {
  const { visible, onClose, baseInfo } = props
  const handleCancel = () => {
    onClose()
  }
  const moduleMap = {
    online: '在线模型',
    local: '本地模型',
  }
  const modelFromMap = {
    huggingface: 'huggingface',
    modelscope: 'modelscope',
    localModel: '上传模型',
    existModel: '已有模型导入',
  }
  const Image = () => {
    const { model_kind } = baseInfo
    if (model_kind === 'localLLM')
      return <img src={LLM.src} alt="icon" />
    if (model_kind === 'Embedding')
      return <img src={Embedding.src} alt="icon" />

    if (model_kind === 'Reranker')
      return <img src={Reranker.src} alt="icon" />

    if (model_kind === 'OCR')
      return <img src={OCR.src} alt="icon" />

    if (model_kind === 'SD')
      return <img src={SD.src} alt="icon" />

    if (model_kind === 'TTS')
      return <img src={TTS.src} alt="icon" />

    if (model_kind === 'STT')
      return <img src={STT.src} alt="icon" />

    if (model_kind === 'VQA')
      return <img src={VQA.src} alt="icon" />
  }
  return (
    <Drawer title="模型基础信息" width={520} open={visible} onClose={handleCancel} maskClosable closable>
      {/* <InfoTitle text="基本信息" /> */}
      {baseInfo?.model_name && <InfoItem labelSpan={4} label="模型名称：" content={baseInfo?.model_name} />}
      <InfoItem labelSpan={4} label="模型类型：" content={moduleMap[baseInfo?.model_type]} />
      {baseInfo?.description && <InfoItem labelSpan={4} label="模型简介：" content={baseInfo?.description} />}
      <InfoItem labelSpan={4} label="模型类别：" content={baseInfo?.model_kind_display} />
      {baseInfo?.model_from && <InfoItem labelSpan={4} label="模型来源：" content={modelFromMap[baseInfo?.model_from]} />}
      {baseInfo?.model_key && <InfoItem labelSpan={4} label="模型Key：" content={baseInfo?.model_key} />}
      {baseInfo?.prompt_keys && <InfoItem labelSpan={5} label="特殊Token：" content={baseInfo?.prompt_keys} />}
      {baseInfo?.model_brand && <InfoItem labelSpan={4} label="厂商名字：" content={baseInfo?.model_brand} />}
      {baseInfo?.model_url && <InfoItem labelSpan={4} label="代理服务地址：" content={baseInfo?.model_url} />}
      {baseInfo?.url && <InfoItem labelSpan={4} label="URL：" content={baseInfo?.url} />}
      {baseInfo?.model_list?.length > 0 && <InfoItem labelSpan={4} label="模型清单：" content={baseInfo?.model_list?.map((item: any) => <Tag key={item?.model_key}>{item?.model_key}</Tag>)} />}
      {/* 展示图片 */}
      <InfoItem labelSpan={4} label="模型图片：" content={<Image />} />
    </Drawer>
  )
}

export default DrawInfo
