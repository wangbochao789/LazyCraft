# Copyright (c) 2025 SenseTime. All Rights Reserved.
# Author: LazyLLM Team,  https://github.com/LazyAGI/LazyLLM
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
ECDH 密钥交换工具模块

使用椭圆曲线 Diffie-Hellman (ECDH) 进行密钥交换，无需预先约定密钥。
- 前后端各自生成临时密钥对
- 交换公钥（公钥可以公开传输）
- 双方计算出相同的共享密钥
- 使用共享密钥（AES）加密数据

使用场景：
- 登录/注册时的密码传输加密
- 敏感信息传输加密
- 适合开源项目（无需密钥管理）
"""

import os
import json
import base64
import uuid
import logging
from typing import Optional, Tuple, Dict, Any

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend

from utils.util_redis import redis_client

logger = logging.getLogger(__name__)

# ECDH 曲线：P-256 (secp256r1)
# 广泛支持，安全性足够（128位安全级别），性能好
ECDH_CURVE = ec.SECP256R1()

# AES-GCM 的 nonce 长度（12字节）
AESGCM_NONCE_SIZE = 12

# 会话密钥过期时间（秒）
SESSION_KEY_EXPIRY = 300  # 5分钟

# Redis 键前缀
REDIS_SESSION_KEY_PREFIX = "ecdh_session:"


class ECDHKeyExchange:
    """ECDH 密钥交换工具类"""
    
    @staticmethod
    def generate_keypair() -> Tuple[bytes, bytes]:
        """
        生成 ECDH 密钥对
        
        Returns:
            (private_key_bytes, public_key_bytes)
            - private_key_bytes: 私钥（DER 格式）
            - public_key_bytes: 公钥（DER 格式）
        """
        # 生成私钥
        private_key = ec.generate_private_key(ECDH_CURVE, default_backend())
        
        # 获取公钥
        public_key = private_key.public_key()
        
        # 序列化为 DER 格式
        private_key_bytes = private_key.private_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_key_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return private_key_bytes, public_key_bytes
    
    @staticmethod
    def compute_shared_secret(
        private_key_bytes: bytes,
        peer_public_key_bytes: bytes
    ) -> bytes:
        """
        计算共享密钥
        
        Args:
            private_key_bytes: 自己的私钥（DER 格式）
            peer_public_key_bytes: 对方的公钥（DER 格式）
        
        Returns:
            共享密钥（原始密钥材料）
        """
        # 加载私钥
        private_key = serialization.load_der_private_key(
            private_key_bytes,
            password=None,
            backend=default_backend()
        )
        
        # 加载对方公钥
        peer_public_key = serialization.load_der_public_key(
            peer_public_key_bytes,
            backend=default_backend()
        )
        
        # 计算共享密钥
        shared_secret = private_key.exchange(ec.ECDH(), peer_public_key)
        
        return shared_secret
    
    @staticmethod
    def derive_aes_key(shared_secret: bytes) -> bytes:
        """
        使用 HKDF 派生 AES-256 密钥
        
        Args:
            shared_secret: ECDH 计算出的共享密钥
        
        Returns:
            AES-256 密钥（32字节）
        """
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,  # AES-256 需要 32 字节
            salt=None,
            info=b'ecdh-aes-key-exchange',  # 应用标识
            backend=default_backend()
        )
        return hkdf.derive(shared_secret)


class ECDHSessionManager:
    """ECDH 会话管理器（管理临时会话密钥）"""
    
    @staticmethod
    def create_session(
        frontend_public_key_b64: str
    ) -> Tuple[str, str, bytes]:
        """
        创建 ECDH 会话
        
        后端生成密钥对，计算共享密钥，存储会话信息。
        
        Args:
            frontend_public_key_b64: 前端公钥（Base64 编码）
        
        Returns:
            (session_id, backend_public_key_b64, aes_key)
            - session_id: 会话 ID
            - backend_public_key_b64: 后端公钥（Base64 编码）
            - aes_key: 派生出的 AES 密钥
        """
        # 解码前端公钥
        frontend_public_key_bytes = base64.b64decode(frontend_public_key_b64)
        
        # 生成后端密钥对
        backend_private_key_bytes, backend_public_key_bytes = ECDHKeyExchange.generate_keypair()
        
        # 计算共享密钥
        shared_secret = ECDHKeyExchange.compute_shared_secret(
            backend_private_key_bytes,
            frontend_public_key_bytes
        )
        
        # 派生 AES 密钥
        aes_key = ECDHKeyExchange.derive_aes_key(shared_secret)
        
        # 生成会话 ID
        session_id = str(uuid.uuid4())
        
        # 存储会话密钥到 Redis（带过期时间）
        redis_key = f"{REDIS_SESSION_KEY_PREFIX}{session_id}"
        # 将 AES 密钥编码为 Base64 存储
        aes_key_b64 = base64.b64encode(aes_key).decode('utf-8')
        redis_client.setex(redis_key, SESSION_KEY_EXPIRY, aes_key_b64)
        
        logger.debug(f"创建 ECDH 会话: session_id={session_id}, 过期时间={SESSION_KEY_EXPIRY}秒")
        
        # 返回后端公钥（Base64 编码）
        backend_public_key_b64 = base64.b64encode(backend_public_key_bytes).decode('utf-8')
        
        return session_id, backend_public_key_b64, aes_key
    
    @staticmethod
    def get_session_key(session_id: str) -> Optional[bytes]:
        """
        获取会话密钥（获取后立即删除，一次性使用）
        
        Args:
            session_id: 会话 ID
        
        Returns:
            AES 密钥，如果不存在或已过期返回 None
        """
        redis_key = f"{REDIS_SESSION_KEY_PREFIX}{session_id}"
        
        # 获取会话密钥（原子操作：获取并删除）
        aes_key_b64 = redis_client.get(redis_key)
        
        if aes_key_b64:
            if isinstance(aes_key_b64, bytes):
                aes_key_b64 = aes_key_b64.decode('utf-8')
            
            # 立即删除（一次性使用）
            redis_client.delete(redis_key)
            
            # 解码 AES 密钥
            aes_key = base64.b64decode(aes_key_b64)
            
            logger.debug(f"使用并删除 ECDH 会话密钥: session_id={session_id}")
            return aes_key
        
        logger.warning(f"ECDH 会话不存在或已过期: session_id={session_id}")
        return None


class AESEncryption:
    """AES-GCM 加密工具（使用会话密钥）"""
    
    @staticmethod
    def encrypt(plaintext: str, aes_key: bytes) -> str:
        """
        使用 AES-GCM 加密数据
        
        Args:
            plaintext: 明文数据
            aes_key: AES 密钥（32字节）
        
        Returns:
            Base64 编码的加密数据（格式：nonce + ciphertext + tag）
        """
        if not plaintext:
            raise ValueError("明文不能为空")
        
        if len(aes_key) != 32:
            raise ValueError(f"AES 密钥长度必须为 32 字节，当前为 {len(aes_key)} 字节")
        
        # 生成随机 nonce（12字节）
        nonce = os.urandom(AESGCM_NONCE_SIZE)
        
        # 加密数据
        plaintext_bytes = plaintext.encode('utf-8')
        aesgcm = AESGCM(aes_key)
        ciphertext = aesgcm.encrypt(nonce, plaintext_bytes, None)
        
        # 组合 nonce + ciphertext（ciphertext 已包含 tag）
        encrypted_data = nonce + ciphertext
        
        # Base64 编码
        return base64.b64encode(encrypted_data).decode('utf-8')
    
    @staticmethod
    def decrypt(encrypted_data_b64: str, aes_key: bytes) -> str:
        """
        使用 AES-GCM 解密数据
        
        Args:
            encrypted_data_b64: Base64 编码的加密数据
            aes_key: AES 密钥（32字节）
        
        Returns:
            解密后的明文字符串
        
        Raises:
            ValueError: 当解密失败时抛出
        """
        if not encrypted_data_b64:
            raise ValueError("加密数据不能为空")
        
        if len(aes_key) != 32:
            raise ValueError(f"AES 密钥长度必须为 32 字节，当前为 {len(aes_key)} 字节")
        
        try:
            # Base64 解码
            encrypted_data = base64.b64decode(encrypted_data_b64)
            
            # 提取 nonce 和 ciphertext
            if len(encrypted_data) < AESGCM_NONCE_SIZE:
                raise ValueError("加密数据格式错误：长度不足")
            
            nonce = encrypted_data[:AESGCM_NONCE_SIZE]
            ciphertext = encrypted_data[AESGCM_NONCE_SIZE:]
            
            # 解密
            aesgcm = AESGCM(aes_key)
            plaintext_bytes = aesgcm.decrypt(nonce, ciphertext, None)
            
            return plaintext_bytes.decode('utf-8')
        
        except Exception as e:
            logger.error(f"AES 解密失败: {e}", exc_info=True)
            raise ValueError(f"解密失败：数据格式错误或密钥不匹配")


def decrypt_ecdh_encrypted_data(
    encrypted_data_b64: str,
    session_id: str
) -> Dict[str, Any]:
    """
    解密 ECDH 加密的数据（便捷函数）
    
    Args:
        encrypted_data_b64: Base64 编码的加密数据
        session_id: 会话 ID
    
    Returns:
        解密后的字典数据
    
    Raises:
        ValueError: 当会话不存在或解密失败时抛出
    """
    # 获取会话密钥（获取后立即删除）
    aes_key = ECDHSessionManager.get_session_key(session_id)
    if not aes_key:
        raise ValueError("会话已过期或不存在，请重新进行密钥交换")
    
    # 解密数据
    try:
        decrypted_json = AESEncryption.decrypt(encrypted_data_b64, aes_key)
    except ValueError as e:
        raise ValueError(f"数据解密失败: {e}")
    
    # 解析 JSON
    try:
        return json.loads(decrypted_json)
    except json.JSONDecodeError as e:
        logger.error(f"解密后的数据不是有效的 JSON: {decrypted_json[:100]}...")
        raise ValueError(f"JSON 解析失败: {e}")

