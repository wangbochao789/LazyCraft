import React from 'react'
import { Button } from '@/app/components/ui'

type AgreementButtonProps = {
  isRead: boolean
  onClick: () => void
}

const commonStyles = {
  agreementLink: { padding: 0 },
  agreementContainer: { marginBottom: 16, textAlign: 'center' as const },
}

const AgreementButton: React.FC<AgreementButtonProps> = ({ isRead, onClick }) => (
  <div style={commonStyles.agreementContainer}>
    <Button variant='tertiary' onClick={onClick} style={commonStyles.agreementLink}>
      {isRead ? '✓ 已阅读并同意用户协议' : '📋 阅读用户协议（登录前必读）'}
    </Button>
  </div>
)

export default AgreementButton
