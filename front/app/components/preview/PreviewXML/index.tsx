'use client'

import React, { useState, useEffect } from 'react'

type XmlPreviewProps = {
  url: string
}

const XmlPreview: React.FC<XmlPreviewProps> = ({ url }) => {
  const [xmlContent, setXmlContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [formattedXml, setFormattedXml] = useState<string>('')

  // 格式化XML内容
  const formatXml = (xml: string): string => {
    try {
      // 简单的XML格式化函数
      const formatted = xml
        .replace(/></g, '>\n<')
        .replace(/^\s+|\s+$/g, '')
        .split('\n')
        .map((line, index) => {
          const trimmed = line.trim()
          if (!trimmed) return ''

          // 计算缩进级别
          const openTags = (line.match(/</g) || []).length
          const closeTags = (line.match(/\//g) || []).length
          const isClosingTag = trimmed.startsWith('</')
          const isSelfClosing = trimmed.endsWith('/>')

          let indentLevel = 0
          if (index > 0) {
            const prevLine = xml.split('\n')[index - 1] || ''
            const prevOpenTags = (prevLine.match(/</g) || []).length
            const prevCloseTags = (prevLine.match(/\//g) || []).length
            indentLevel = Math.max(0, prevOpenTags - prevCloseTags - (prevLine.trim().endsWith('/>') ? 1 : 0))
          }

          if (isClosingTag) {
            indentLevel = Math.max(0, indentLevel - 1)
          }

          return '  '.repeat(indentLevel) + trimmed
        })
        .filter(line => line.trim() !== '')
        .join('\n')

      return formatted
    } catch (error) {
      console.error('Error formatting XML:', error)
      return xml
    }
  }

  useEffect(() => {
    const fetchXml = async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Error fetching XML file: ${response.statusText}`)
        }

        const text = await response.text()
        setXmlContent(text)
        setFormattedXml(formatXml(text))
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading XML file')
        setLoading(false)
      }
    }

    fetchXml()
  }, [url])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading XML file...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="xml-preview-container h-full overflow-auto">
      <div className="bg-gray-50 p-4 border-b">
        <h3 className="text-lg font-medium text-gray-800 mb-2">XML 文件预览</h3>
        <div className="text-sm text-gray-600">
          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
            XML
          </span>
          <span>可读性格式化显示</span>
        </div>
      </div>

      <div className="p-4">
        <pre className="bg-white border rounded-lg p-4 overflow-auto text-sm font-mono leading-relaxed text-gray-800 whitespace-pre-wrap">
          {formattedXml}
        </pre>
      </div>

      <style jsx>{`
        .xml-preview-container pre {
          max-height: calc(100vh - 200px);
          min-height: 400px;
        }
        
        .xml-preview-container pre::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .xml-preview-container pre::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .xml-preview-container pre::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        .xml-preview-container pre::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  )
}

export default XmlPreview
