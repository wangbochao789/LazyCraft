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

firms = {
    "SenseNova": ["llm", "embedding"],
    "Deepseek": ["llm"],
    "Qwen": ["llm", "embedding", "reranker"],
    "GLM": ["llm", "embedding", "reranker"],
    "Doubao": ["llm", "embedding"],
    "Kimi": ["llm"],
    "OpenAI": ["llm", "embedding"],
}

# 模型类别
model_kinds = {
    "localLLM": "大模型",
    "OnlineLLM": "大模型",
    "Embedding": "向量模型",
    "reranker": "重排序",
    "VQA": "视觉问答",
    "SD": "文生图",
    "TTS": "文字转语音",
    "STT": "语音转文字",
}
# 模型仓库卡片类别
model_card_kinds = {
    "localLLM": "大模型（localLLM）",
    "OnlineLLM": "大模型（OnlineLLM）",
    "Embedding": "向量模型（Embedding）",
    "reranker": "重排序（Reranker）",
    "VQA": "视觉问答（VQA）",
    "SD": "文生图（SD）",
    "TTS": "文字转语音（TTS）",
    "STT": "语音转文字（STT）",
}

# local_finetune_model_list = [
#     "Baichuan-13B-Chat",
#     "Baichuan-7B",
#     "Baichuan2-13B-Chat",
#     "Baichuan2-7B-Chat",
#     "chatglm3-6b",
#     "glm-4-9b-chat",
#     "internlm2-20b",
#     "internlm2-7b",
#     "internlm2-chat-1_8b",
#     "internlm2-chat-1_8b-sft",
#     "internlm2-chat-20b",
#     "internlm2-chat-20b-sft",
#     "internlm2-chat-7b",
#     "internlm2_5-7b-chat",
#     "Llama-2-13b",
#     "Llama-2-70b",
#     "Llama-2-7b",
#     "Qwen-14B",
#     "Qwen-1_8B",
#     "Qwen-72B",
#     "Qwen-7B",
#     "Qwen1.5-0.5B-Chat",
#     "Qwen1.5-1.8B",
#     "Qwen1.5-14B",
#     "Qwen1.5-14B-Chat",
#     "Qwen1.5-4B",
#     "Qwen1.5-72B",
#     "Qwen1.5-7B"
# ]

online_model_list = {
    "SenseNova": {
        "llm_list": [
            {"model_name": "SenseChat-5", "support_finetune": False, "type": "LLM"},
            {"model_name": "SenseChat", "support_finetune": False, "type": "LLM"},
            {"model_name": "SenseChat-32K", "support_finetune": False, "type": "LLM"},
            {"model_name": "SenseChat-128K", "support_finetune": False, "type": "LLM"},
            {"model_name": "SenseChat-Turbo", "support_finetune": False, "type": "LLM"},
        ],
        "embedding_list": [
            {
                "model_name": "nova-embedding-stable",
                "support_finetune": False,
                "type": "embedding",
            }
        ],
        "vqa_list": [
            {"model_name": "SenseNova-V6-5-Pro", "support_finetune": False, "type": "VQA"},
            {"model_name": "SenseNova-V6-5-Turbo", "support_finetune": False, "type": "VQA"},
            {"model_name": "SenseNova-V6-Turbo", "support_finetune": False, "type": "VQA"},
            {"model_name": "SenseNova-V6-Pro", "support_finetune": False, "type": "VQA"}
        ],
    },
    "Deepseek": {
        "llm_list": [
            {"model_name": "deepseek-chat", "support_finetune": False, "type": "LLM"}
        ]
    },
    "Qwen": {
        "reranker_list": [
            {"model_name": "gte-rerank", "support_finetune": False, "type": "rerank"},
        ],
        "embedding_list": [
            {
                "model_name": "text-embedding-v1",
                "support_finetune": False,
                "type": "embedding",
            },
            {
                "model_name": "text-embedding-v2",
                "support_finetune": False,
                "type": "embedding",
            },
            {
                "model_name": "text-embedding-v3",
                "support_finetune": False,
                "type": "embedding",
            },
        ],
        "llm_list": [
            {"model_name": "qwen-plus", "support_finetune": False, "type": "LLM"},
            {"model_name": "qwen-turbo-0919", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "qwen2.5-0.5b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2.5-1.5b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2.5-3b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2.5-7b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2.5-14b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2.5-32b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2.5-72b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen-turbo-latest",
                "support_finetune": False,
                "type": "LLM",
            },
            {"model_name": "qwen-plus-0919", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "qwen-plus-latest",
                "support_finetune": False,
                "type": "LLM",
            },
            {"model_name": "qwen-max-0919", "support_finetune": False, "type": "LLM"},
            {"model_name": "qwen-max-latest", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "qwen2-72b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2-7b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2-0.5b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2-1.5b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen2-57b-a14b-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {"model_name": "qwen-long", "support_finetune": False, "type": "LLM"},
            {"model_name": "qwen-max-0428", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "qwen1.5-110b-chat",
                "support_finetune": False,
                "type": "LLM",
            },
            {"model_name": "qwen-7b-chat", "support_finetune": True, "type": "LLM"},
            {
                "model_name": "qwen-1.8b-longcontext-chat",
                "support_finetune": False,
                "type": "LLM",
            },
            {"model_name": "qwen-1.8b-chat", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "qwen1.5-0.5b-chat",
                "support_finetune": False,
                "type": "LLM",
            },
            {"model_name": "qwen-72b-chat", "support_finetune": True, "type": "LLM"},
            {"model_name": "qwen-14b-chat", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "qwen-max-longcontext",
                "support_finetune": False,
                "type": "LLM",
            },
            {"model_name": "qwen-max-1201", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "qwen1.5-32b-chat",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen1.5-72b-chat",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qqwen1.5-7b-chat",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen1.5-1.8b-chat",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "qwen1.5-14b-chat",
                "support_finetune": False,
                "type": "LLM",
            },
            {"model_name": "qwen-max", "support_finetune": False, "type": "LLM"},
            {"model_name": "qwen-turbo", "support_finetune": True, "type": "LLM"},
            {"model_name": "qwen-max-0107", "support_finetune": False, "type": "LLM"},
            {"model_name": "qwen-max-0403", "support_finetune": False, "type": "LLM"},
        ],
        "tts_list": [
            {"model_name": "qwen-tts", "support_finetune": False, "type": "TTS"}
        ],
        "sd_list": [
            {"model_name": "wanx2.1-t2i-turbo", "support_finetune": False, "type": "SD"}
        ],
        "vqa_list": [
            {"model_name": "qwen-vl-plus", "support_finetune": False, "type": "VQA"}
        ],
    },
    "GLM": {
        "embedding_list": [
            {
                "model_name": "embedding-2",
                "support_finetune": False,
                "type": "embedding",
            },
            {
                "model_name": "embedding-3",
                "support_finetune": False,
                "type": "embedding",
            },
        ],
        "llm_list": [
            {"model_name": "glm-4", "support_finetune": False, "type": "LLM"},
            {"model_name": "glm-4-plus", "support_finetune": False, "type": "LLM"},
            {"model_name": "glm-4-0520", "support_finetune": False, "type": "LLM"},
            {"model_name": "glm-4-air", "support_finetune": False, "type": "LLM"},
            {"model_name": "glm-4-long", "support_finetune": False, "type": "LLM"},
            {"model_name": "glm-4-airx", "support_finetune": False, "type": "LLM"},
            {"model_name": "glm-4-flashx", "support_finetune": False, "type": "LLM"},
            {"model_name": "glm-4-flash", "support_finetune": False, "type": "LLM"},
            {"model_name": "chatglm3-6b", "support_finetune": True, "type": "LLM"},
            {"model_name": "chatglm_12b", "support_finetune": True, "type": "LLM"},
            {"model_name": "chatglm_32b", "support_finetune": True, "type": "LLM"},
            {"model_name": "chatglm_66b", "support_finetune": True, "type": "LLM"},
            {"model_name": "chatglm_130b", "support_finetune": True, "type": "LLM"},
        ],
        "reranker_list": [
            {"model_name": "rerank", "support_finetune": True, "type": "rerank"}
        ],
        "stt_list": [
            {"model_name": "glm-asr", "support_finetune": False, "type": "STT"}
        ],
    },
    "Doubao": {
        "llm_list": [
            {
                "model_name": "doubao-1-5-pro-32k-250115",
                "support_finetune": False,
                "type": "LLM",
            }
        ],
        "embedding_list": [
            {
                "model_name": "doubao-embedding-text-240715",
                "support_finetune": False,
                "type": "embedding",
            }
        ],
    },
    "Kimi": {
        "llm_list": [
            {"model_name": "moonshot-v1-8k", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "moonshot-v1-128k",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "moonshot-v1-32kK",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "moonshot-v1-auto",
                "support_finetune": False,
                "type": "LLM",
            },
        ]
    },
    "OpenAI": {
        "embedding_list": [
            {
                "model_name": "text-embedding-ada-002",
                "support_finetune": False,
                "type": "embedding",
            },
            {
                "model_name": "text-embedding-3-large",
                "support_finetune": False,
                "type": "embedding",
            },
            {
                "model_name": "text-embedding-3-small",
                "support_finetune": False,
                "type": "embedding",
            },
        ],
        "llm_list": [
            {"model_name": "gpt-3.5-turbo", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "gpt-3.5-turbo-0125",
                "support_finetune": True,
                "type": "LLM",
            },
            {
                "model_name": "gpt-3.5-turbo-1106",
                "support_finetune": True,
                "type": "LLM",
            },
            {
                "model_name": "gpt-3.5-turbo-instruct",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "gpt-3.5-turbo-instruct-0914",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "gpt-4-1106-preview",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "gpt-4-0125-preview",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "gpt-4-turbo-preview",
                "support_finetune": False,
                "type": "LLM",
            },
            {"model_name": "gpt-4-turbo", "support_finetune": False, "type": "LLM"},
            {
                "model_name": "gpt-4-turbo-2024-04-09",
                "support_finetune": False,
                "type": "LLM",
            },
            {
                "model_name": "gpt-3.5-turbo-0613",
                "support_finetune": True,
                "type": "LLM",
            },
            {"model_name": "babbage-002", "support_finetune": True, "type": "LLM"},
            {"model_name": "davinci-002", "support_finetune": True, "type": "LLM"},
            {"model_name": "gpt-4-0613", "support_finetune": True, "type": "LLM"},
        ],
    },
}

local_model_list = {
    "llm_list": [
        "Baichuan-13B-Chat",
        "Baichuan-7B",
        "Baichuan2-13B-Chat",
        "Baichuan2-13B-Chat-4bits",
        "Baichuan2-7B-Chat",
        "Baichuan2-7B-Chat-4bits",
        "Baichuan2-7B-Intermediate-Checkpoints",
        "chatglm3-6b",
        "chatglm3-6b-128k",
        "chatglm3-6b-32k",
        "CodeLlama-13b-hf",
        "CodeLlama-34b-hf",
        "CodeLlama-70b-hf",
        "CodeLlama-7b-hf",
        "glm-4-9b-chat",
        "internlm-20b",
        "internlm-7b",
        "internlm-chat-20b",
        "internlm-chat-20b-4bit",
        "internlm-chat-7b",
        "internlm2-1_8b",
        "internlm2-20b",
        "internlm2-7b",
        "internlm2-chat-1_8b",
        "internlm2-chat-1_8b-sft",
        "internlm2-chat-20b",
        "internlm2-chat-20b-4bits",
        "internlm2-chat-20b-sft",
        "internlm2-chat-7b",
        "internlm2-chat-7b-4bits",
        "internlm2-chat-7b-sft",
        "internlm2_5-7b-chat",
        "internlm2-math-20b",
        "internlm2-math-7b",
        "Llama-2-13b",
        "Llama-2-70b",
        "Llama-2-7b",
        "Meta-Llama-3-70B",
        "Meta-Llama-3-8B",
        "Qwen-14B",
        "Qwen-1_8B",
        "Qwen-72B",
        "Qwen-7B",
        "Qwen1.5-0.5B-Chat",
        "Qwen1.5-1.8B",
        "Qwen1.5-14B",
        "Qwen1.5-14B-Chat",
        "Qwen1.5-4B",
        "Qwen1.5-72B",
        "Qwen1.5-7B",
        "Qwen2-72B-Instruct",
        "Qwen2-72B-Instruct-AWQ",
        "Qwen2-7B-Instruct",
        "InternVL-Chat-V1-5",
        "llava-1.5-13b-hf",
        "llava-1.5-7b-hf",
        "Mini-InternVL-Chat-2B-V1-5",
        "bark",
        "ChatTTS",
        "musicgen-medium",
        "musicgen-stereo-small",
        "stable-diffusion-3-medium",
        "SenseVoiceSmall",
    ],
    "embedding_list": ["bge-large-zh-v1.5", "bge-m3"],
    "reranker_list": ["bge-reranker-large"],
}

local_model_builtins = {
    "localLLM": [
        {"model_key": "Baichuan-13B-Chat", "model_from": "modelscope"},
        {"model_key": "Baichuan-7B", "model_from": "modelscope"},
        {"model_key": "Baichuan2-13B-Chat", "model_from": "modelscope"},
        {"model_key": "Baichuan2-13B-Chat-4bits", "model_from": "modelscope"},
        {"model_key": "Baichuan2-7B-Chat", "model_from": "modelscope"},
        {"model_key": "Baichuan2-7B-Chat-4bits", "model_from": "modelscope"},
        {
            "model_key": "Baichuan2-7B-Intermediate-Checkpoints",
            "model_from": "modelscope",
        },
        {"model_key": "chatglm3-6b", "model_from": "modelscope"},
        {"model_key": "chatglm3-6b-128k", "model_from": "modelscope"},
        {"model_key": "chatglm3-6b-32k", "model_from": "modelscope"},
        {"model_key": "CodeLlama-13b-hf", "model_from": "modelscope"},
        {"model_key": "CodeLlama-34b-hf", "model_from": "modelscope"},
        {"model_key": "CodeLlama-70b-hf", "model_from": "modelscope"},
        {"model_key": "CodeLlama-7b-hf", "model_from": "modelscope"},
        {"model_key": "glm-4-9b-chat", "model_from": "modelscope"},
        {"model_key": "internlm-20b", "model_from": "modelscope"},
        {"model_key": "internlm-7b", "model_from": "modelscope"},
        {"model_key": "internlm-chat-20b", "model_from": "modelscope"},
        {"model_key": "internlm-chat-20b-4bit", "model_from": "modelscope"},
        {"model_key": "internlm-chat-7b", "model_from": "modelscope"},
        {"model_key": "internlm2-1_8b", "model_from": "modelscope"},
        {"model_key": "internlm2-20b", "model_from": "modelscope"},
        {"model_key": "internlm2-7b", "model_from": "modelscope"},
        {"model_key": "internlm2-chat-1_8b", "model_from": "modelscope"},
        {"model_key": "internlm2-chat-1_8b-sft", "model_from": "modelscope"},
        {"model_key": "internlm2-chat-20b", "model_from": "modelscope"},
        {"model_key": "internlm2-chat-20b-4bits", "model_from": "modelscope"},
        {"model_key": "internlm2-chat-20b-sft", "model_from": "modelscope"},
        {"model_key": "internlm2-chat-7b", "model_from": "modelscope"},
        {"model_key": "internlm2-chat-7b-4bits", "model_from": "modelscope"},
        {"model_key": "internlm2-chat-7b-sft", "model_from": "modelscope"},
        {"model_key": "internlm2_5-7b-chat", "model_from": "modelscope"},
        {"model_key": "internlm2-math-20b", "model_from": "modelscope"},
        {"model_key": "internlm2-math-7b", "model_from": "modelscope"},
        {"model_key": "Llama-2-13b", "model_from": "modelscope"},
        {"model_key": "Llama-2-70b", "model_from": "modelscope"},
        {"model_key": "Llama-2-7b", "model_from": "modelscope"},
        {"model_key": "Meta-Llama-3-70B", "model_from": "modelscope"},
        {"model_key": "Meta-Llama-3-8B", "model_from": "modelscope"},
        {"model_key": "Qwen-14B", "model_from": "modelscope"},
        {"model_key": "Qwen-1_8B", "model_from": "modelscope"},
        {"model_key": "Qwen-72B", "model_from": "modelscope"},
        {"model_key": "Qwen-7B", "model_from": "modelscope"},
        {"model_key": "Qwen1.5-0.5B-Chat", "model_from": "modelscope"},
        {"model_key": "Qwen1.5-1.8B", "model_from": "modelscope"},
        {"model_key": "Qwen1.5-14B", "model_from": "modelscope"},
        {"model_key": "Qwen1.5-14B-Chat", "model_from": "modelscope"},
        {"model_key": "Qwen1.5-4B", "model_from": "modelscope"},
        {"model_key": "Qwen1.5-72B", "model_from": "modelscope"},
        {"model_key": "Qwen1.5-7B", "model_from": "modelscope"},
        {"model_key": "Qwen2-72B-Instruct", "model_from": "modelscope"},
        {"model_key": "Qwen2-72B-Instruct-AWQ", "model_from": "modelscope"},
        {"model_key": "Qwen2-7B-Instruct", "model_from": "modelscope"},
    ],
    "VQA": [
        {"model_key": "InternVL-Chat-V1-5", "model_from": "modelscope"},
        {"model_key": "Mini-InternVL-Chat-2B-V1-5", "model_from": "modelscope"},
        {"model_key": "llava-1.5-13b-hf", "model_from": "modelscope"},
        {"model_key": "llava-1.5-7b-hf", "model_from": "modelscope"},
    ],
    "SD": [{"model_key": "stable-diffusion-3-medium", "model_from": "modelscope"}],
    "TTS": [
        {"model_key": "ChatTTS", "model_from": "modelscope"},
        {"model_key": "musicgen-stereo-small", "model_from": "modelscope"},
        {"model_key": "musicgen-medium", "model_from": "modelscope"},
        {"model_key": "bark", "model_from": "modelscope"},
    ],
    "STT": [{"model_key": "SenseVoiceSmall", "model_from": "modelscope"}],
    "reranker": [{"model_key": "bge-reranker-large", "model_from": "modelscope"}],
    "Embedding": [
        {"model_key": "bge-large-zh-v1.5", "model_from": "modelscope"},
        {"model_key": "bge-m3", "model_from": "modelscope"},
    ],
}

# AMS内置的模型
ams_model_list = [
    # localLLM 模型
    {
        "name": "AquilaChat2-7B",
        "key": "BAAI/AquilaChat2-7B",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "BAAI"
    },
    {
        "name": "Baichuan2-7B-Chat",
        "key": "Baichuan2-7B-Chat",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Baichuan"
    },
    {
        "name": "chatglm3-6b",
        "key": "chatglm3-6b",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "ChatGLM"
    },
    {
        "name": "ChatGLM2-6B",
        "key": "ChatGLM2-6B",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "ChatGLM"
    },
    {
        "name": "gpt-neox-20b",
        "key": "EleutherAI/gpt-neox-20b",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "EleutherAI"
    },
    {
        "name": "gpt-neo-2.7B",
        "key": "EleutherAI/gpt-neo-2.7B",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "EleutherAI"
    },
    {
        "name": "gpt-neo-1.3B",
        "key": "EleutherAI/gpt-neo-1.3B",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "EleutherAI"
    },
    {
        "name": "flan-t5-large",
        "key": "google/flan-t5-large",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Google"
    },
    {
        "name": "flan-t5-base",
        "key": "google/flan-t5-base",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Google"
    },
    {
        "name": "internlm2_5-20b-chat",
        "key": "internlm2_5-20b-chat",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "InternLM"
    },
    {
        "name": "internlm2_5-7b-chat",
        "key": "internlm2_5-7b-chat",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "InternLM"
    },
    {
        "name": "Meta-Llama-3-8B-Instruct",
        "key": "Meta-Llama-3-8B-Instruct",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Meta"
    },
    {
        "name": "Meta-Llama-3.1-8B-Instruct",
        "key": "Meta-Llama-3.1-8B-Instruct",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Meta"
    },
    {
        "name": "DialoGPT-small",
        "key": "microsoft/DialoGPT-small",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Microsoft"
    },
    {
        "name": "QwQ-32B",
        "key": "QwQ-32B",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    {
        "name": "Qwen2.5-72B-Instruct",
        "key": "Qwen2.5-72B-Instruct",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    {
        "name": "Qwen3-32B",
        "key": "Qwen3-32B",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "Mindie",
        "endpoint": "/generate",
        "model_brand": "Qwen"
    },
    {
        "name": "Qwen2.5-72B-Instruct-AWQ",
        "key": "Qwen2.5-72B-Instruct-AWQ",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    {
        "name": "Qwen2.5-Coder-7B",
        "key": "Qwen2.5-Coder-7B",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    {
        "name": "Qwen2.5-7B-Instruct",
        "key": "Qwen2.5-7B-Instruct",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    {
        "name": "Qwen2.5-3B-Instruct",
        "key": "Qwen2.5-3B-Instruct",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    {
        "name": "Qwen2.5-1.5B-Instruct",
        "key": "Qwen2.5-1.5B-Instruct",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "localLLM",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    
    # Embedding 模型
    {
        "name": "bge-m3",
        "key": "bge-m3",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "Embedding",
        "model_from": "modelscope",
        "framework": "EmbeddingDeploy",
        "endpoint": "/generate",
        "model_brand": "BAAI"
    },
    {
        "name": "BGE-VL-v1.5-mmeb",
        "key": "BGE-VL-v1.5-mmeb",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "Embedding",
        "model_from": "modelscope",
        "framework": "EmbeddingDeploy",
        "endpoint": "/generate",
        "model_brand": "BAAI"
    },
    {
        "name": "bge-large-zh-v1.5",
        "key": "bge-large-zh-v1.5",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": True,
        "model_kind": "Embedding",
        "model_from": "modelscope",
        "framework": "EmbeddingDeploy",
        "endpoint": "/generate",
        "model_brand": "BAAI"
    },
    
    # STT 模型
    {
        "name": "sensevoicesmall",
        "key": "sensevoicesmall",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "STT",
        "model_from": "modelscope",
        "framework": "SenseVoiceDeploy",
        "endpoint": "/generate",
        "model_brand": "SenseVoice"
    },
    
    # TTS 模型
    {
        "name": "bark",
        "key": "bark",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "TTS",
        "model_from": "modelscope",
        "framework": "BarkDeploy",
        "endpoint": "/generate",
        "model_brand": "Bark"
    },
    {
        "name": "ChatTTS-new",
        "key": "ChatTTS-new",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "TTS",
        "model_from": "modelscope",
        "framework": "ChatTTSDeploy",
        "endpoint": "/generate",
        "model_brand": "ChatTTS"
    },
    
    # VQA 模型
    {
        "name": "Mini-InternVL-Chat-2B-V1-5",
        "key": "Mini-InternVL-Chat-2B-V1-5",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "VQA",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "InternVL"
    },
    {
        "name": "Qwen2.5-VL-32B-Instruct",
        "key": "Qwen2.5-VL-32B-Instruct",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "VQA",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    {
        "name": "Qwen2-VL-7B-Instruct",
        "key": "Qwen2-VL-7B-Instruct",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "VQA",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    {
        "name": "qwen2.5-vl-3b-instruct",
        "key": "qwen2.5-vl-3b-instruct",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "VQA",
        "model_from": "modelscope",
        "framework": "LMDeploy",
        "endpoint": "/v1/chat/interactive",
        "model_brand": "Qwen"
    },
    
    # reranker 模型
    {
        "name": "bge-reranker-large",
        "key": "bge-reranker-large",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "reranker",
        "model_from": "modelscope",
        "framework": "RerankerDeploy",
        "endpoint": "/generate",
        "model_brand": "BAAI"
    },
    {
        "name": "bge-reranker-v2-m3",
        "key": "bge-reranker-v2-m3",
        "model_type": "local",
        "model_status": 1,
        "is_finetune_model": False,
        "can_finetune_model": False,
        "model_kind": "reranker",
        "model_from": "modelscope",
        "framework": "RerankerDeploy",
        "endpoint": "/generate",
        "model_brand": "BAAI"
    }
]

for item in ams_model_list:
    item["model_name"] = item["name"]
