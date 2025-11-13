import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const buildAbsoluteApiUrl = (origin: string): string => {
  const baseApi = process.env.FRONTEND_CORE_API || '/console/api'

  if (/^https?:\/\//i.test(baseApi))
    return baseApi.endsWith('/') ? baseApi : `${baseApi}/`

  const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin
  const normalizedBase = baseApi.startsWith('/') ? baseApi : `/${baseApi}`
  return `${normalizedOrigin}${normalizedBase.replace(/\/+$/, '/')}`
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin
    const upstreamBase = buildAbsoluteApiUrl(origin)
    const targetUrl = new URL('key_exchange', upstreamBase).toString()

    const requestBody = await req.text()

    const upstreamHeaders = new Headers()
    upstreamHeaders.set('Content-Type', 'application/json')

    const cookie = req.headers.get('cookie')
    if (cookie)
      upstreamHeaders.set('cookie', cookie)

    const upstreamResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: upstreamHeaders,
      body: requestBody,
      cache: 'no-store',
    })

    const responseBody = await upstreamResponse.text()
    const responseHeaders = new Headers()

    const contentType = upstreamResponse.headers.get('content-type')
    if (contentType)
      responseHeaders.set('content-type', contentType)

    const setCookie = upstreamResponse.headers.get('set-cookie')
    if (setCookie)
      responseHeaders.set('set-cookie', setCookie)

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    })
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error || '未知错误')
    return NextResponse.json({ message: `Key exchange proxy error: ${message}` }, { status: 500 })
  }
}
