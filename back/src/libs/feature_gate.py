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

"""功能开关模块(Feature Gate)

该模块提供统一的功能开关机制,用于控制互联网部署时的功能可用性。

主要功能:
1. 环境变量控制:通过 INTERNET_FEATURES_ENABLED 环境变量控制功能开关
2. 装饰器拦截:提供装饰器在功能执行前进行权限检查
3. 统一响应:返回标准的错误码和友好的提示信息

使用示例:
    @require_internet_feature("应用发布")
    def publish_app(self):
        # 业务逻辑
        pass
        
环境变量:
    INTERNET_FEATURES_ENABLED: "true" 或 "false"(默认),控制功能是否可用
"""

import os
from functools import wraps


class FeatureNotAvailableError(Exception):
    """功能不可用异常
    
    当某个功能被功能开关禁用时抛出此异常。
    
    Attributes:
        feature_name (str): 被禁用的功能名称
        message (str): 错误消息
    """
    
    def __init__(self, feature_name: str, message: str = None):
        """初始化功能不可用异常
        
        Args:
            feature_name (str): 被禁用的功能名称
            message (str, optional): 自定义错误消息。默认为None,使用标准消息。
        """
        self.feature_name = feature_name
        self.message = message or f"{feature_name}功能当前不可用,如需使用请私有化部署"
        super().__init__(self.message)


def is_internet_feature_enabled() -> bool:
    """检查互联网功能是否启用
    
    从环境变量 INTERNET_FEATURES_ENABLED 读取配置。
    默认为 false (关闭状态),确保部署到互联网时的安全性。
    
    Returns:
        bool: True 表示功能启用,False 表示功能禁用
        
    Examples:
        >>> os.environ['INTERNET_FEATURES_ENABLED'] = 'true'
        >>> is_internet_feature_enabled()
        True
        >>> os.environ['INTERNET_FEATURES_ENABLED'] = 'false'
        >>> is_internet_feature_enabled()
        False
    """
    enabled = os.getenv("INTERNET_FEATURES_ENABLED", "false").lower()
    return enabled in ("true", "1", "yes", "on")


def require_internet_feature(feature_name: str, custom_message: str = None):
    """功能开关装饰器
    
    用于装饰需要进行功能开关控制的API方法。
    当功能被禁用时,会拦截请求并返回统一的错误响应。
    
    Args:
        feature_name (str): 功能名称,用于错误提示
        custom_message (str, optional): 自定义错误消息。默认为None,使用标准消息。
        
    Returns:
        function: 装饰器函数
        
    Examples:
        ```python
        class MyApi(Resource):
            @login_required
            @require_internet_feature("应用发布")
            def post(self):
                # 只有当 INTERNET_FEATURES_ENABLED=true 时才会执行
                return {"result": "success"}
        ```
        
    Response Format:
        当功能被禁用时,返回:
        - HTTP Status Code: 423 (Locked)
        - Response Body: {
            "code": 423,
            "message": "XXX功能当前不可用,如需使用请私有化部署"
          }
    """
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not is_internet_feature_enabled():
                error_message = custom_message or f"{feature_name}功能当前不可用,如需使用请私有化部署"
                return {
                    "code": 423,
                    "message": error_message
                }, 423
            
            return func(*args, **kwargs)
        
        return wrapper
    return decorator


def check_internet_feature(feature_name: str, custom_message: str = None):
    """检查功能是否可用,不可用则抛出异常
    
    用于在业务逻辑中进行功能检查,而不是作为装饰器使用。
    
    Args:
        feature_name (str): 功能名称
        custom_message (str, optional): 自定义错误消息
        
    Raises:
        FeatureNotAvailableError: 当功能被禁用时抛出
        
    Examples:
        ```python
        def some_business_logic():
            check_internet_feature("数据导出")
            # 继续执行业务逻辑
            export_data()
        ```
    """
    if not is_internet_feature_enabled():
        raise FeatureNotAvailableError(feature_name, custom_message)

