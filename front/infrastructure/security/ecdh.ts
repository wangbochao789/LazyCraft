import { keyExchange } from '@/infrastructure/api/common'

const HKDF_INFO = 'ecdh-aes-key-exchange'
const AES_KEY_LENGTH = 256
const NONCE_LENGTH = 12

// 缓存密钥交换结果和前端密钥对
let cachedKeyExchangeResult: KeyExchangeResult | null = null
let cachedFrontendKeyPair: CryptoKeyPair | null = null

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let i = 0; i < bytes.length; i += chunkSize)
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))

  return btoa(binary)
}

const base64ToArrayBuffer = (b64: string): ArrayBuffer => {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1)
    bytes[i] = binary.charCodeAt(i)

  return bytes.buffer
}

type KeyExchangeAPIResponse = {
  result?: string
  data?: {
    backend_public_key: string
    session_id: string
    expires_in?: number
  }
  backend_public_key?: string
  session_id?: string
  expires_in?: number
  algorithm?: string
  curve?: string
  key_size?: number
}

type KeyExchangeResult = {
  backendPublicKey: string
  sessionId: string
}

const normalizeKeyExchangeResponse = (response: KeyExchangeAPIResponse): KeyExchangeResult => {
  const payload = (response?.data && typeof response.data === 'object') ? response.data : response

  const backendPublicKey = payload?.backend_public_key
  const sessionId = payload?.session_id

  if (!backendPublicKey || !sessionId)
    throw new Error('密钥交换失败：缺少必要的返回数据')

  return {
    backendPublicKey,
    sessionId,
  }
}

const generateFrontendKeyPair = async (): Promise<CryptoKeyPair> => {
  return globalThis.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits'],
  )
}

const exportPublicKey = async (publicKey: CryptoKey): Promise<string> => {
  const spki = await globalThis.crypto.subtle.exportKey('spki', publicKey)
  return arrayBufferToBase64(spki)
}

const importBackendPublicKey = async (backendPublicKey: string): Promise<CryptoKey> => {
  const der = base64ToArrayBuffer(backendPublicKey)
  return globalThis.crypto.subtle.importKey(
    'spki',
    der,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    false,
    [],
  )
}

const deriveAesKey = async (privateKey: CryptoKey, backendPublicKey: CryptoKey): Promise<CryptoKey> => {
  const sharedSecret = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      public: backendPublicKey,
    },
    privateKey,
    AES_KEY_LENGTH,
  )

  const hkdfKey = await globalThis.crypto.subtle.importKey(
    'raw',
    sharedSecret,
    'HKDF',
    false,
    ['deriveKey'],
  )

  return globalThis.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: new TextEncoder().encode(HKDF_INFO),
    },
    hkdfKey,
    {
      name: 'AES-GCM',
      length: AES_KEY_LENGTH,
    },
    false,
    ['encrypt'],
  )
}

const performEncryption = async (aesKey: CryptoKey, payload: Record<string, any>): Promise<string> => {
  const nonce = globalThis.crypto.getRandomValues(new Uint8Array(NONCE_LENGTH))
  const plaintext = new TextEncoder().encode(JSON.stringify(payload))

  const ciphertext = await globalThis.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
    },
    aesKey,
    plaintext,
  )

  const cipherBytes = new Uint8Array(ciphertext)
  const combined = new Uint8Array(nonce.length + cipherBytes.length)
  combined.set(nonce, 0)
  combined.set(cipherBytes, nonce.length)

  return arrayBufferToBase64(combined.buffer)
}

const exchangeKeyWithBackend = async (frontendPublicKey: string, keyPair: CryptoKeyPair): Promise<KeyExchangeResult> => {
  // 调用密钥交换接口
  const response = await keyExchange(frontendPublicKey)
  const result = normalizeKeyExchangeResponse(response)

  // 缓存结果（后端公钥、session_id 和前端密钥对）
  cachedKeyExchangeResult = result
  cachedFrontendKeyPair = keyPair
  return result
}

// 初始化密钥交换（在登录前调用一次）
export const initKeyExchange = async (): Promise<void> => {
  if (!globalThis.crypto?.subtle)
    throw new Error('当前环境不支持 Web Crypto API，无法完成安全传输')

  if (cachedKeyExchangeResult && cachedFrontendKeyPair)
    return

  // 生成前端密钥对
  const keyPair = await generateFrontendKeyPair()
  const frontendPublicKey = await exportPublicKey(keyPair.publicKey)
  await exchangeKeyWithBackend(frontendPublicKey, keyPair)
}

// 清除缓存（用于重新登录等场景）
export const clearKeyExchangeCache = (): void => {
  cachedKeyExchangeResult = null
  cachedFrontendKeyPair = null
}

export type EncryptedRequestPayload = {
  encrypted_data: string
  session_id: string
}

export const encryptPayloadWithECDH = async (payload: Record<string, any>): Promise<EncryptedRequestPayload> => {
  if (!globalThis.crypto?.subtle)
    throw new Error('当前环境不支持 Web Crypto API，无法完成安全传输')

  // 如果没有缓存，先初始化密钥交换
  if (!cachedKeyExchangeResult || !cachedFrontendKeyPair)
    await initKeyExchange()

  // 使用缓存的后端公钥、session_id 和前端密钥对
  const { backendPublicKey, sessionId } = cachedKeyExchangeResult!
  const keyPair = cachedFrontendKeyPair!

  // 使用密钥交换时的前端私钥和后端公钥计算共享密钥
  const backendKey = await importBackendPublicKey(backendPublicKey)
  const aesKey = await deriveAesKey(keyPair.privateKey, backendKey)
  const encryptedData = await performEncryption(aesKey, payload)

  return {
    encrypted_data: encryptedData,
    session_id: sessionId,
  }
}
