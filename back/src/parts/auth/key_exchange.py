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
ECDH 密钥交换 API

提供 ECDH 密钥交换接口，用于前后端协商共享密钥。
无需预先约定密钥，适合开源项目。
"""

from flask_restful import reqparse

from core.restful import Resource
from parts.urls import api
from utils.util_ecdh import ECDHSessionManager

# 会话密钥过期时间（秒）
SESSION_KEY_EXPIRY = 300  # 5分钟


class KeyExchangeApi(Resource):
    """ECDH 密钥交换 API
    
    接收前端公钥，生成后端密钥对，计算共享密钥，返回后端公钥和会话 ID。
    前端使用返回的公钥计算相同的共享密钥，然后使用共享密钥加密数据。
    """
    
    def post(self):
        """
        进行 ECDH 密钥交换
        
        请求格式：
        {
            "frontend_public_key": "Base64编码的前端公钥"
        }
        
        响应格式：
        {
            "backend_public_key": "Base64编码的后端公钥",
            "session_id": "会话ID（UUID）",
            "expires_in": 300,
            "algorithm": "ECDH-P256 + AES-256-GCM"
        }
        
        Returns:
            dict: 包含后端公钥和会话 ID 的字典
        
        Raises:
            ValueError: 当前端公钥格式错误时抛出
        """
        parser = reqparse.RequestParser()
        parser.add_argument(
            "frontend_public_key",
            type=str,
            required=True,
            location="json",
            help="前端公钥（Base64 编码）"
        )
        body = parser.parse_args()
        
        try:
            # 创建 ECDH 会话
            session_id, backend_public_key_b64, _ = ECDHSessionManager.create_session(
                body.frontend_public_key
            )
            
            return {
                "backend_public_key": backend_public_key_b64,
                "session_id": session_id,
                "expires_in": SESSION_KEY_EXPIRY,
                "algorithm": "ECDH-P256 + AES-256-GCM",
                "curve": "secp256r1",
                "key_size": 256
            }
        
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"ECDH 密钥交换失败: {e}", exc_info=True)
            raise ValueError(f"密钥交换失败: {str(e)}")


api.add_resource(KeyExchangeApi, "/key_exchange")

