'use client'

import { useEffect } from 'react'
import { loader } from '@monaco-editor/react'

/**
 * Monaco Editor 预加载组件
 * 在应用启动时立即加载所有 Monaco Editor 资源
 */
export default function MonacoPreloader() {
  useEffect(() => {
    if (typeof window === 'undefined')
      return

    // 配置 Monaco 路径
    loader.config({
      'paths': {
        vs: '/monaco-editor',
      },
      'vs/nls': {
        availableLanguages: {
          '*': 'zh-cn',
        },
      },
    })

    // 预加载 Monaco 和所有语言支持
    loader.init().then((monaco) => {
      // eslint-disable-next-line no-console
      console.log('✅ Monaco Editor 全局预加载完成')

      // 预加载常用语言，确保 worker 和语言文件都被加载
      const languages = ['javascript', 'typescript', 'python', 'json', 'html', 'css', 'sql']
      languages.forEach((lang) => {
        try {
          // 触发语言支持加载
          monaco.languages.getLanguages().find(l => l.id === lang)
        }
        catch (error) {
          console.error(`加载语言 ${lang} 失败:`, error)
        }
      })

      // eslint-disable-next-line no-console
      console.log('✅ 所有语言支持已预加载')
    }).catch((error) => {
      console.error('❌ Monaco Editor 预加载失败:', error)
    })
  }, [])

  return null
}
