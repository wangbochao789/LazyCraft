import React from 'react'

import { GithubOutlined } from '@ant-design/icons'
import { Button } from '@/app/components/ui'

const GITHUB_LOGIN_URL = '/console/api/oauth/login/github'

const GitHubLoginButton: React.FC = () => (
  <Button
    onClick={() => window.location.replace(GITHUB_LOGIN_URL)}
    style={{ height: 35 }}
    className='mt-[15px]'
    block
  >
    <GithubOutlined />使用 GitHub 登录
  </Button>
)

export default GitHubLoginButton
