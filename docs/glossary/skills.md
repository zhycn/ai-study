---
title: Skills
description: Agent 可执行的技能集合
---

# Skills

AI 助手的"专业技能包"。每个 Skill 是一种特定能力，比如写代码、做数据分析、生成文档等。就像人的简历上写的技能一样，AI 拥有的 Skill 越多，能干的活就越多。

> 面向开发者的技术实战文章

## 概述

**Skills（技能）** 是 AI Agent 可执行的模块化能力单元。每个 Skill 定义了特定的输入输出格式、执行逻辑和触发条件，使 Agent 能够灵活组合和调用各种能力来完成复杂任务。

Skill 与 [工具使用](/glossary/tool-use) 中的"工具"概念密切相关但有区别：**工具**通常是外部服务或 API（搜索、计算、数据库），而 **Skill** 是 Agent 自身的能力封装（代码生成、文档撰写、数据分析）。工具偏向"调用外部资源"，Skill 偏向"执行内部逻辑"。

> 💡 类比理解
>
> 如果 Agent 是一个人，工具是他使用的设备（手机、电脑），Skill 是他掌握的手艺（编程、写作、翻译）。设备需要购买和连接，手艺需要学习和练习。

## 为什么需要

### 能力模块化的必要性

随着 Agent 能力的增长，将所有逻辑写在一个庞大的系统提示词中会导致：

**提示词膨胀** 系统提示词过长会稀释关键指令，降低模型对重要信息的注意力。

**难以维护** 修改一个能力可能影响其他能力，缺乏隔离性。

**无法复用** 相同的能力在不同 Agent 中需要重复定义。

**难以测试** 无法单独测试某个能力是否正确工作。

### 核心价值

**能力模块化** 将复杂能力拆分为独立、可复用的技能单元，每个 Skill 有明确的职责边界。

**可扩展性** 添加新 Skill 不需要修改现有代码，只需注册新的技能定义。

**标准化接口** 统一的输入输出格式便于集成、测试和组合。

**组合性** 多个 Skill 可以编排成更复杂的工作流，实现能力的乘数效应。

## 核心原理

### Skill 接口定义

一个完整的 Skill 应该包含以下要素：

```python
from abc import ABC, abstractmethod
from typing import Any
from pydantic import BaseModel, Field

class SkillInput(BaseModel):
    """Skill 输入的基类"""
    pass

class SkillOutput(BaseModel):
    """Skill 输出的基类"""
    success: bool = Field(description="是否执行成功")
    result: Any = Field(default=None, description="执行结果")
    error: str | None = Field(default=None, description="错误信息")

class Skill(ABC):
    """Skill 抽象基类"""

    @property
    @abstractmethod
    def name(self) -> str:
        """Skill 唯一标识符"""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Skill 描述，用于 Agent 理解何时使用该 Skill"""
        pass

    @property
    @abstractmethod
    def input_model(self) -> type[SkillInput]:
        """输入参数的 Pydantic 模型"""
        pass

    @property
    @abstractmethod
    def output_model(self) -> type[SkillOutput]:
        """输出参数的 Pydantic 模型"""
        pass

    @abstractmethod
    async def execute(self, input_data: SkillInput) -> SkillOutput:
        """执行 Skill 的核心逻辑"""
        pass

    def to_tool_definition(self) -> dict:
        """转换为 LLM 函数调用格式"""
        schema = self.input_model.model_json_schema()
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": schema
            }
        }
```

### Skill 实现示例

````python
class CodeReviewInput(SkillInput):
    code: str = Field(description="需要审查的代码")
    language: str = Field(default="python", description="编程语言")
    focus_areas: list[str] = Field(
        default=[],
        description="重点关注的方面，如 ['性能', '安全', '可读性']"
    )

class CodeReviewOutput(SkillOutput):
    issues: list[dict] = Field(default=[], description="发现的问题列表")
    suggestions: list[str] = Field(default=[], description="改进建议")
    score: int = Field(default=0, description="代码质量评分 1-10")

class CodeReviewSkill(Skill):
    @property
    def name(self) -> str:
        return "code_review"

    @property
    def description(self) -> str:
        return "审查代码质量，发现潜在问题并提供改进建议。当用户提供代码并请求审查时使用。"

    @property
    def input_model(self) -> type[CodeReviewInput]:
        return CodeReviewInput

    @property
    def output_model(self) -> type[CodeReviewOutput]:
        return CodeReviewOutput

    async def execute(self, input_data: CodeReviewInput) -> CodeReviewOutput:
        prompt = f"""请审查以下 {input_data.language} 代码：

```{input_data.language}
{input_data.code}
````

重点关注：{', '.join(input_data.focus_areas) if input_data.focus_areas else '全面审查'}

请输出：

1.  发现的问题（严重程度、位置、描述）
2.  改进建议
3.  代码质量评分（1-10）"""

        response = await llm.invoke(prompt)
        parsed = parse_review_response(response)

        return CodeReviewOutput(
            success=True,
            issues=parsed["issues"],
            suggestions=parsed["suggestions"],
            score=parsed["score"]
        )

````

### Skill 注册与发现

Agent 需要知道有哪些 Skill 可用，以及何时使用哪个 Skill。

```python
class SkillRegistry:
    def __init__(self):
        self.skills: dict[str, Skill] = {}

    def register(self, skill: Skill):
        """注册一个 Skill"""
        if skill.name in self.skills:
            raise ValueError(f"Skill '{skill.name}' 已存在")
        self.skills[skill.name] = skill

    def unregister(self, name: str):
        """注销一个 Skill"""
        if name in self.skills:
            del self.skills[name]

    def list_skills(self) -> list[dict]:
        """列出所有可用的 Skill"""
        return [
            {"name": s.name, "description": s.description}
            for s in self.skills.values()
        ]

    def get_tool_definitions(self) -> list[dict]:
        """获取所有 Skill 的 LLM 函数调用定义"""
        return [s.to_tool_definition() for s in self.skills.values()]

    async def execute(self, name: str, input_data: dict) -> Any:
        """执行指定的 Skill"""
        skill = self.skills.get(name)
        if not skill:
            raise ValueError(f"Skill '{name}' 不存在")

        # 验证输入
        validated_input = skill.input_model(**input_data)

        # 执行
        return await skill.execute(validated_input)

# 使用示例
registry = SkillRegistry()
registry.register(CodeReviewSkill())
registry.register(DocumentationSkill())
registry.register(TestingSkill())

# Agent 使用 registry 获取可用工具定义
tools = registry.get_tool_definitions()
````

## 主流框架与实现

### Claude Code Skills

Claude Code 使用 Skills 来扩展 Agent 的能力，每个 Skill 是一个包含指令和资源的目录。

```
skills/
  my-skill/
    SKILL.md          # 技能描述和使用说明
    scripts/          # 相关脚本
    references/       # 参考文档
```

SKILL.md 示例：

```markdown
---
name: api-docs-search
description: 搜索 API 文档并获取使用示例
---

# API 文档搜索

当用户询问 API 用法、需要查找文档或需要代码示例时，使用此 Skill。

## 使用步骤

1. 确定用户需要的 API 或库
2. 在文档中搜索相关内容
3. 提取使用示例
4. 返回结果
```

### LangChain Tools as Skills

在 LangChain 中，Tool 和 Skill 的概念高度重合。

```python
from langchain_core.tools import BaseTool
from pydantic import BaseModel, Field

class TranslateInput(BaseModel):
    text: str = Field(description="需要翻译的文本")
    target_language: str = Field(description="目标语言，如 '中文'、'English'")

class TranslateTool(BaseTool):
    name: str = "translate"
    description: str = "将文本翻译为指定语言"
    args_schema: type[BaseModel] = TranslateInput

    def _run(self, text: str, target_language: str) -> str:
        return translate_text(text, target_language)

    async def _arun(self, text: str, target_language: str) -> str:
        return await async_translate(text, target_language)
```

### OpenAI Assistant Tools

OpenAI Assistant API 中的 Tools 也是一种 Skill 实现方式。

```python
from openai import OpenAI

client = OpenAI()

assistant = client.beta.assistants.create(
    name="代码助手",
    instructions="你是一个专业的编程助手",
    model="gpt-4o",
    tools=[
        {"type": "code_interpreter"},           # 内置工具：代码执行
        {"type": "file_search"},                # 内置工具：文件搜索
        {                                       # 自定义工具
            "type": "function",
            "function": {
                "name": "search_api_docs",
                "description": "搜索 API 文档",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "library": {"type": "string"}
                    },
                    "required": ["query"]
                }
            }
        }
    ]
)
```

## 实施步骤

### 步骤 1：定义 Skill 接口

```python
from abc import ABC, abstractmethod
from pydantic import BaseModel

class SkillInput(BaseModel):
    pass

class SkillOutput(BaseModel):
    success: bool
    result: Any = None
    error: str | None = None

class Skill(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        pass

    @abstractmethod
    async def execute(self, input_data: SkillInput) -> SkillOutput:
        pass
```

### 步骤 2：实现具体 Skill

```python
class CodeReviewInput(SkillInput):
    code: str
    language: str = "python"

class CodeReviewOutput(SkillOutput):
    issues: list[dict] = []
    suggestions: list[str] = []

class CodeReviewSkill(Skill):
    @property
    def name(self) -> str:
        return "code_review"

    @property
    def description(self) -> str:
        return "审查代码质量，发现潜在问题并提供改进建议"

    async def execute(self, input_data: CodeReviewInput) -> CodeReviewOutput:
        # 实现代码审查逻辑
        pass
```

### 步骤 3：注册与发现

```python
class SkillRegistry:
    def __init__(self):
        self.skills: dict[str, Skill] = {}

    def register(self, skill: Skill):
        self.skills[skill.name] = skill

    def get_tool_definitions(self) -> list[dict]:
        return [s.to_tool_definition() for s in self.skills.values()]
```

### 步骤 4：编写 Skill 文档

每个 Skill 需要清晰的文档：

```markdown
---
name: code-review
description: 审查代码质量
---

# 代码审查 Skill

## 何时使用

- 用户请求审查代码
- 提交代码前自动审查

## 输入

- code: 需要审查的代码
- language: 编程语言

## 输出

- issues: 发现的问题
- suggestions: 改进建议
```

### 步骤 5：测试与部署

- 编写**单元测试**覆盖正常和异常场景
- 进行**集成测试**验证与其他 Skill 的协作
- 部署到**生产环境**并监控表现

## 主流框架对比

| 框架/平台                  | Skill 形式       | 特点               | 适用场景      |
| -------------------------- | ---------------- | ------------------ | ------------- |
| **Claude Code Skills**     | 目录+SKILL.md    | 文档驱动、易扩展   | 开发助手      |
| **LangChain Tools**        | Python 类/装饰器 | 统一接口、丰富生态 | 通用 Agent    |
| **OpenAI Assistant Tools** | API 定义         | 云端托管、免运维   | OpenAI 生态   |
| **CrewAI Tools**           | Python 类        | 角色绑定、易用     | 多 Agent 协作 |

## 最佳实践

### Skill 组合与编排

复杂任务需要多个 Skill 的组合。

```python
class SkillPipeline:
    def __init__(self, registry: SkillRegistry):
        self.registry = registry
        self.steps: list[tuple[str, dict]] = []

    def add_step(self, skill_name: str, input_overrides: dict | None = None):
        self.steps.append((skill_name, input_overrides or {}))

    async def execute(self, initial_input: dict) -> Any:
        context = initial_input

        for skill_name, overrides in self.steps:
            # 合并上下文和覆盖
            input_data = {**context, **overrides}

            # 执行 Skill
            result = await self.registry.execute(skill_name, input_data)

            # 更新上下文
            context.update(result.model_dump())

        return context

# 使用示例：代码开发流水线
pipeline = SkillPipeline(registry)
pipeline.add_step("requirement_analysis")     # 1. 需求分析
pipeline.add_step("architecture_design")      # 2. 架构设计
pipeline.add_step("code_generation")          # 3. 代码生成
pipeline.add_step("code_review")              # 4. 代码审查
pipeline.add_step("test_generation")          # 5. 测试生成

result = await pipeline.execute({
    "requirement": "实现一个用户注册功能"
})
```

### Skill 版本管理

Skill 会迭代改进，需要版本管理。

```python
class VersionedSkillRegistry:
    def __init__(self):
        self.skills: dict[str, dict[str, Skill]] = {}  # name -> {version -> skill}

    def register(self, skill: Skill, version: str = "1.0.0"):
        if skill.name not in self.skills:
            self.skills[skill.name] = {}
        self.skills[skill.name][version] = skill

    def get(self, name: str, version: str | None = None) -> Skill:
        if name not in self.skills:
            raise ValueError(f"Skill '{name}' 不存在")

        if version:
            return self.skills[name][version]

        # 默认返回最新版本
        versions = list(self.skills[name].keys())
        return self.skills[name][versions[-1]]

    def list_versions(self, name: str) -> list[str]:
        return list(self.skills.get(name, {}).keys())
```

### Skill 测试与评估

每个 Skill 应该有对应的测试用例。

```python
class SkillTestCase(BaseModel):
    name: str
    input: dict
    expected_output: dict | None = None
    expected_success: bool = True
    assertion: Callable | None = None  # 自定义断言

class SkillTestSuite:
    def __init__(self, skill: Skill):
        self.skill = skill
        self.test_cases: list[SkillTestCase] = []

    def add_test(self, test_case: SkillTestCase):
        self.test_cases.append(test_case)

    async def run_all(self) -> list[dict]:
        results = []

        for test_case in self.test_cases:
            try:
                input_data = self.skill.input_model(**test_case.input)
                output = await self.skill.execute(input_data)

                passed = test_case.expected_success and output.success

                if test_case.expected_output:
                    passed = passed and self._matches(output, test_case.expected_output)

                if test_case.assertion:
                    passed = passed and test_case.assertion(output)

                results.append({
                    "test": test_case.name,
                    "passed": passed,
                    "output": output.model_dump()
                })

            except Exception as e:
                results.append({
                    "test": test_case.name,
                    "passed": False,
                    "error": str(e)
                })

        return results

# 使用示例
test_suite = SkillTestSuite(CodeReviewSkill())
test_suite.add_test(SkillTestCase(
    name="简单代码审查",
    input={"code": "def add(a, b): return a + b", "language": "python"},
    expected_success=True
))
test_suite.add_test(SkillTestCase(
    name="空代码",
    input={"code": "", "language": "python"},
    expected_success=False
))

results = await test_suite.run_all()
```

> ⚠️ 最佳实践：每个 Skill 都应该有对应的测试套件，覆盖正常情况、边界情况和错误情况。Skill 的测试应该像普通代码一样纳入 CI/CD 流程。

### Skill 权限控制

某些 Skill 可能涉及敏感操作，需要权限控制。

```python
from enum import Enum

class SkillPermission(Enum):
    READ = "read"
    WRITE = "write"
    EXECUTE = "execute"
    ADMIN = "admin"

class PermissionControlledSkill(Skill):
    def __init__(self):
        self.required_permission = SkillPermission.EXECUTE

    async def check_permission(self, user_id: str) -> bool:
        """检查用户是否有权限执行此 Skill"""
        user_permissions = get_user_permissions(user_id)
        return self.required_permission in user_permissions

    async def execute(self, input_data: SkillInput, user_id: str) -> SkillOutput:
        if not await self.check_permission(user_id):
            return SkillOutput(
                success=False,
                error=f"权限不足：需要 {self.required_permission.value} 权限"
            )
        return await self._do_execute(input_data)

    @abstractmethod
    async def _do_execute(self, input_data: SkillInput) -> SkillOutput:
        pass
```

## 常见问题与避坑

### Q1：Skill 和 Tool 有什么区别？

- **Tool**：外部服务或 API（搜索、计算、数据库）
- **Skill**：Agent 自身能力封装（代码生成、文档撰写）

### Q2：Skill 太多如何管理？

- **分组管理**：按功能分类
- **动态加载**：按需加载 Skill
- **版本控制**：使用语义化版本号

### Q3：如何保证 Skill 质量？

- 每个 Skill 编写**测试用例**
- 设置**质量门禁**（覆盖率、性能）
- 定期**审查和优化**

### Q4：Skill 执行失败怎么办？

- 实现**重试机制**
- 提供**降级方案**
- 记录**详细错误日志**

### Q5：如何设计 Skill 的输入输出？

- 使用 **Pydantic 模型**验证
- 定义清晰的**字段描述**
- 提供**默认值**和**示例**

:::warning 常见陷阱

- **职责不清**：一个 Skill 做太多事情
- **缺乏测试**：修改后引入回归 bug
- **文档缺失**：其他开发者不知道如何使用
- **版本混乱**：不兼容的变更未做好版本管理
  :::

## 与其他概念的关系

**核心依赖**：

- [Agent](/glossary/agent) — Skill 是 Agent 能力的具体实现单元，Agent 通过组合 Skill 构建完整能力
- [工具使用](/glossary/tool-use) — Skill 和工具使用相辅相成，Skill 侧重内部逻辑封装，工具侧重外部服务调用
- [Commands](/glossary/commands) — Commands 是用户触发 Skill 的入口，一个 Command 可以调用一个或多个 Skill

**应用场景**：

- [自主 Agent](/glossary/autonomous-agent) — 自主 Agent 需要丰富的 Skill 集来独立完成复杂任务
- [多 Agent 系统](/glossary/multi-agent) — 不同 Agent 可以拥有不同的 Skill 集，实现专业化分工

**技术基础**：

- [函数调用](/glossary/function-calling) — Skill 的执行通常通过函数调用机制触发
- [规划](/glossary/planning) — 规划能力决定 Agent 如何组合和编排多个 Skill

## 延伸阅读

- [Agent](/glossary/agent)
- [工具使用](/glossary/tool-use)
- [Commands](/glossary/commands)
- [LangChain Tools 文档](https://python.langchain.com/docs/modules/agents/tools)
- [OpenAI Assistant Tools 文档](https://platform.openai.com/docs/assistants/tools)
