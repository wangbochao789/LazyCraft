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


import os
import re

from core.account_manager import CommonError
from libs.timetools import TimeTools
from utils.util_database import db

from .model import DocStatus, Documents


class DocService:
    """文档服务类。

    提供文档的增删改查、发布/下架、索引刷新等业务逻辑处理
    """

    model_cls = Documents

    def __init__(self, account):
        """初始化文档服务。

        Args:
            account: 当前用户账户对象
        """
        self.account = account

    def get_paginate_docs(self, args):
        """获取分页文档列表。

        Args:
            args (dict): 查询参数，包含 page、limit、search_name 等

        Returns:
            Pagination: 分页对象，包含文档列表和分页信息
        """
        model_cls = self.model_cls
        filters = [model_cls.deleted_flag == 0]
        if args.get("search_name"):
            search_name = args["search_name"][:30]
            filters.append(model_cls.title.ilike(f"%{search_name}%"))
        pagination = db.paginate(
            db.select(model_cls).where(*filters).order_by(model_cls.index.asc()),
            page=args["page"],
            per_page=args["limit"],
            error_out=False,
        )
        return pagination

    def create_doc(self, data):
        """创建新文档。

        Args:
            data (dict): 文档数据，包含 title、doc_content、index、publish 等字段

        Returns:
            Documents: 创建的文档对象
        """
        model_cls = self.model_cls
        item = model_cls()
        item.created_at = TimeTools.get_china_now()
        item.updated_at = TimeTools.get_china_now()
        item.created_by = self.account.id
        item.tenant_id = self.account.current_tenant_id
        item.index = data.get("index", 0)
        item.doc_content = data.get("doc_content", "")
        item.title = data.get("title")
        if "publish" in data and data.get("publish") >= 1:
            item.status = DocStatus.PUBLISH.value
        else:
            item.status = DocStatus.UNPUBLISH.value
        db.session.add(item)
        db.session.commit()
        self.referesh_index()
        return item

    def delete_doc(self, id):
        """删除文档（软删除）。

        Args:
            id (int): 文档ID

        Returns:
            bool: 删除成功返回 True

        Raises:
            CommonError: 当文档不存在时抛出异常
        """
        item = Documents.query.get(id)
        if item is None:
            raise CommonError("doc not exists")
        item.deleted_flag = 1
        db.session.commit()
        self.referesh_index()
        return True

    def update_doc(self, data):
        """更新文档信息。

        Args:
            data (dict): 更新的文档数据，包含 id、title、doc_content、index、publish 等字段

        Returns:
            Documents: 更新后的文档对象

        Raises:
            CommonError: 当文档不存在时抛出异常
        """
        item = Documents.query.get(data.get("id"))
        if item is None:
            raise CommonError("doc not exists")
        item.updated_at = TimeTools.get_china_now()
        index = item.index
        item.index = data.get("index", 0)
        item.doc_content = data.get("doc_content", "")
        item.title = data.get("title")
        if "publish" in data and data.get("publish") >= 1:
            item.status = DocStatus.PUBLISH.value
        else:
            item.status = DocStatus.UNPUBLISH.value
        db.session.commit()
        if index > item.index:
            order = "desc"
        else:
            order = "asc"
        self.referesh_index(order=order)
        return item

    def get_doc(self, id):
        """根据ID获取文档。

        Args:
            id (int): 文档ID

        Returns:
            Documents: 文档对象，如果不存在返回 None
        """
        item = Documents.query.get(id)
        return item

    def publish_doc(self, id):
        """发布文档。

        Args:
            id (int): 文档ID

        Returns:
            bool: 发布成功返回 True
        """
        item = Documents.query.get(id)
        item.status = DocStatus.PUBLISH.value
        db.session.commit()
        return True

    def unpublish_doc(self, id):
        """下架文档。

        Args:
            id (int): 文档ID

        Returns:
            bool: 下架成功返回 True
        """
        item = Documents.query.get(id)
        item.status = DocStatus.UNPUBLISH.value
        db.session.commit()
        return True

    def referesh_index(self, order="desc"):
        """刷新文档索引顺序。

        Args:
            order (str): 排序方式，"asc" 为升序，"desc" 为降序，默认为 "desc"
        """
        filters = [
            Documents.deleted_flag == 0,
        ]
        query = (
            db.session.query(Documents).filter(*filters).order_by(Documents.index.asc())
        )

        if order == "asc":
            query = query.order_by(Documents.updated_at.asc())

        if order == "desc":
            query = query.order_by(Documents.updated_at.desc())

        items = query.all()
        index = 1
        for item in items:
            item.index = index
            index = index + 1
        db.session.commit()

    def _parse_readme_headings(self):
        """从 README.md 文件中解析标题结构生成导航菜单。
        
        只解析 README.md 文件中的一级（#）和二级（##）标题，生成目录结构。
        确保每个二级标题只属于它应该属于的一级标题，维护正确的层级关系。
        严格按照文档中的顺序提取标题，不缺失、不错位、不多出。

        Returns:
            list: 标题菜单列表，每个元素包含 title、id、level 和 children（二级标题列表）
        """
        # 获取 README.md 文件路径（只从 template 目录读取）
        current_dir = os.path.dirname(os.path.abspath(__file__))
        readme_path = os.path.join(current_dir, "template", "README.md")
        
        if not os.path.exists(readme_path):
            return []
        
        menus = []
        current_level1 = None
        first_heading_found = False
        
        try:
            # 只读取 README.md 文件的内容
            with open(readme_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            heading_pattern = r'^(#{1,2})(?!#)\s+(.+)$'
            lines = content.split('\n')
            in_code_block = False
            
            for line in lines:
                if line.strip().startswith('```'):
                    in_code_block = not in_code_block
                    continue

                if in_code_block:
                    continue
                
                match = re.match(heading_pattern, line.strip())
                if match:
                    level = len(match.group(1))
                    title = match.group(2).strip()
                    
                    title_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', title)
                    if not title_text or title_text.strip() == '':
                        continue
                    
                    anchor_text = title_text.lower()
                    anchor_text = re.sub(r'^[一二三四五六七八九十\d]+[、.]\s*', '', anchor_text)
                    anchor = re.sub(r'[^\w\u4e00-\u9fa5]+', '-', anchor_text)
                    anchor = re.sub(r'-+', '-', anchor).strip('-')
                    if level == 1 and not first_heading_found:
                        first_heading_found = True
                        if "帮助文档" in title_text or len(title_text) > 20:
                            continue
                    
                    if level == 1:
                        current_level1 = {
                            "title": title_text,
                            "id": f"#{anchor}" if anchor else "#",
                            "level": 1,
                            "children": []
                        }
                        menus.append(current_level1)
                    elif level == 2:
                        if current_level1 is not None:
                            current_level1["children"].append({
                                "title": title_text,
                                "id": f"#{anchor}" if anchor else "#",
                                "level": 2
                            })
                        
        except Exception as e:
            print(f"Error parsing README.md: {e}")
            import traceback
            traceback.print_exc()
        
        return menus

    def doc_menu(self):
        """获取文档菜单列表。

        始终从 README.md 解析标题生成导航栏，确保导航栏反映 README.md 的文档结构。
        只返回 README.md 中的标题，不包含数据库中的其他文档。

        Returns:
            list: 文档菜单列表，每个元素包含 title、id 和可选的 children
        """
        readme_menus = self._parse_readme_headings()
        if readme_menus:
            return readme_menus
        return []

    def home_page(self):
        """获取首页文档。

        始终返回 None，以便使用模板目录下的 README.md 文件。
        这样可以避免数据库中的旧文档内容与 README.md 冲突，
        确保只显示 README.md 中的内容。

        Returns:
            None: 始终返回 None，使用模板文件
        """
        return None
