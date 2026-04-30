---
title: Commands
description: Agent 的命令系统
---

# Commands

用户给 AI 下达的"明确指令"。跟随便聊天不同，Command 是用特定格式告诉 AI"你现在去干这个"，就像给员工下达工单一样，确保 AI 准确理解你要它做什么。

> 面向开发者的技术实战文章

## 概述

**Commands（命令）** 是用户与 AI Agent 交互时使用的结构化指令格式。通过特定的命令语法，用户可以明确触发 Agent 执行特定操作、调用特定 [Skill](/glossary/skills) 或切换工作模式。

Command 与自然语言交互的核心区别在于**明确性**和**可预测性**。自然语言灵活但可能产生歧义，Command 通过预定义的格式确保 Agent 准确理解用户意图并执行对应操作。

> 💡 类比理解
>
> 自然语言对话像日常聊天，Command 像终端命令。聊天灵活但有歧义，命令精确但需要学习语法。好的 Agent 系统同时支持两种方式。

## 为什么需要

### 自然语言的局限性

纯自然语言交互在以下场景存在问题：

**意图模糊** "帮我处理一下这个文件"——处理是什么意思？格式化？分析？翻译？

**参数不明确** "搜索最近的新闻"——最近是多久？什么主题？哪个来源？

**操作不可预测** 同样的请求在不同时间可能得到不同的响应，无法保证行为一致性。

**复杂操作困难** "把 A 文件的内容合并到 B 文件，然后运行测试，如果通过了就提交"——这种多步骤操作用自然语言描述容易遗漏细节。

### 核心价值

**明确意图** 命令格式消除了歧义，Agent 不需要猜测用户想要什么。

**标准化交互** 统一的命令格式提高交互效率，用户可以快速执行常见操作。

**功能入口** 命令是用户调用 Agent 各种能力的快捷入口，无需每次都用自然语言描述。

**可扩展性** 新命令的添加不影响现有命令，系统可以持续增长。

## 核心原理

### 命令格式

常见的命令格式有以下几种：

**斜杠命令（Slash Command）** 最流行的格式，以 `/` 开头。

```
/format          # 格式化当前文件
/test            # 运行测试
/deploy prod     # 部署到生产环境
/help            # 显示帮助信息
```

**前缀命令（Prefix Command）** 使用特定前缀标识命令。

```
!format          # 格式化
!test            # 运行测试
```

**自然语言命令（Natural Language Command）** 用自然语言描述，但通过模式匹配识别。

```
"请格式化这个文件"    → 触发 format 命令
"运行一下测试"        → 触发 test 命令
```

### 命令解析器

```python
import re
from typing import Any, Callable
from dataclasses import dataclass

@dataclass
class CommandDefinition:
    name: str
    description: str
    handler: Callable
    parameters: list[dict] | None = None
    aliases: list[str] | None = None

class CommandParser:
    def __init__(self):
        self.commands: dict[str, CommandDefinition] = {}
        self.prefix = "/"

    def register(self, command: CommandDefinition):
        """注册命令"""
        self.commands[command.name] = command
        for alias in (command.aliases or []):
            self.commands[alias] = command

    def parse(self, input_text: str) -> tuple[str, dict] | None:
        """解析输入，返回 (命令名, 参数) 或 None"""
        input_text = input_text.strip()

        # 斜杠命令解析
        if input_text.startswith(self.prefix):
            parts = input_text[1:].split()
            command_name = parts[0]
            args = parts[1:]

            if command_name in self.commands:
                command = self.commands[command_name]
                parsed_args = self._parse_args(command, args)
                return command_name, parsed_args

        return None

    def _parse_args(self, command: CommandDefinition, args: list[str]) -> dict:
        """根据命令定义解析参数"""
        if not command.parameters:
            return {"raw_args": args}

        parsed = {}
        for i, param in enumerate(command.parameters):
            if i < len(args):
                parsed[param["name"]] = args[i]
            elif param.get("default"):
                parsed[param["name"]] = param["default"]
            else:
                raise ValueError(f"缺少必需参数：{param['name']}")

        return parsed

# 使用示例
parser = CommandParser()

parser.register(CommandDefinition(
    name="format",
    description="格式化代码文件",
    handler=format_code,
    aliases=["fmt"],
    parameters=[
        {"name": "file", "description": "文件路径"},
        {"name": "style", "description": "格式化风格", "default": "auto"}
    ]
))

parser.register(CommandDefinition(
    name="test",
    description="运行测试",
    handler=run_tests,
    aliases=["t"],
    parameters=[
        {"name": "pattern", "description": "测试文件匹配模式", "default": "**/test_*.py"}
    ]
))

# 解析命令
result = parser.parse("/format src/main.py")
# 返回：("format", {"file": "src/main.py", "style": "auto"})
```

### 命令执行器

```python
class CommandExecutor:
    def __init__(self, parser: CommandParser):
        self.parser = parser
        self.history: list[dict] = []

    async def execute(self, input_text: str, context: dict | None = None) -> Any:
        """执行命令"""
        parsed = self.parser.parse(input_text)

        if parsed is None:
            # 不是命令，作为自然语言处理
            return await self.handle_natural_language(input_text)

        command_name, args = parsed
        command = self.parser.commands[command_name]

        try:
            # 执行命令处理器
            result = await command.handler(args, context or {})

            # 记录历史
            self.history.append({
                "command": command_name,
                "args": args,
                "result": str(result)[:200],
                "timestamp": datetime.now().isoformat()
            })

            return result

        except Exception as e:
            return f"命令执行失败：{e}"

    async def handle_natural_language(self, text: str) -> Any:
        """处理自然语言输入"""
        # 调用 LLM 进行常规对话
        return await llm.invoke(text)
```

## 命令类型

### 系统命令

控制 Agent 本身的行为和配置。

```python
class SystemCommands:
    @staticmethod
    async def settings(args: dict, context: dict) -> str:
        """查看或修改 Agent 配置"""
        if "show" in args:
            return format_settings(context["config"])
        elif "set" in args:
            key, value = args["set"].split("=")
            context["config"][key] = value
            return f"已设置 {key} = {value}"

    @staticmethod
    async def reset(args: dict, context: dict) -> str:
        """重置对话上下文"""
        context["memory"].clear()
        return "对话上下文已重置"

    @staticmethod
    async def mode(args: dict, context: dict) -> str:
        """切换工作模式"""
        mode = args.get("name", "default")
        context["mode"] = mode
        return f"已切换到 {mode} 模式"
```

常见系统命令：

- `/settings` — 查看/修改配置
- `/reset` — 重置对话
- `/mode <name>` — 切换工作模式
- `/help` — 显示帮助
- `/history` — 查看命令历史

### 技能命令

触发 Agent 执行特定 [Skill](/glossary/skills)。

```python
class SkillCommands:
    def __init__(self, skill_registry: SkillRegistry):
        self.registry = skill_registry

    async def execute_skill(self, args: dict, context: dict) -> Any:
        """执行指定 Skill"""
        skill_name = args.get("name")
        if not skill_name:
            return "请指定要执行的 Skill 名称"

        return await self.registry.execute(skill_name, args)

# 注册
parser.register(CommandDefinition(
    name="skill",
    description="执行指定 Skill",
    handler=skill_commands.execute_skill,
    aliases=["s"],
    parameters=[
        {"name": "name", "description": "Skill 名称"}
    ]
))
```

### 工作流命令

触发预定义的多步骤工作流。

```python
class WorkflowCommands:
    def __init__(self, workflows: dict[str, Workflow]):
        self.workflows = workflows

    async def run_workflow(self, args: dict, context: dict) -> Any:
        """运行工作流"""
        workflow_name = args.get("name")
        if workflow_name not in self.workflows:
            return f"未知的工作流：{workflow_name}"

        workflow = self.workflows[workflow_name]
        return await workflow.execute(args.get("input", {}))

# 使用示例
# /workflow code-review --file=src/main.py
# /workflow deploy --env=production
```

## 主流框架与实现

### Claude Code Commands

Claude Code 使用斜杠命令系统，内置多个常用命令。

```
/help          # 显示帮助信息
/init          # 初始化项目
/compact       # 压缩上下文
/clear         # 清屏
```

自定义命令通过 `.opencode/commands/` 目录定义，每个命令是一个可执行脚本或配置文件。

### LangChain Agent Executor

LangChain 的 Agent Executor 支持命令式交互。

```python
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个助手。可用命令：/format, /test, /deploy"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

agent = create_openai_functions_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 用户输入命令时，Agent 会识别并执行对应工具
result = executor.invoke({"input": "/format src/main.py"})
```

### CLI 风格的 Agent 命令

将 Agent 封装为 CLI 工具，通过命令行参数控制行为。

```python
import argparse
import asyncio

async def main():
    parser = argparse.ArgumentParser(description="AI Agent CLI")
    parser.add_argument("command", choices=["chat", "review", "generate", "test"])
    parser.add_argument("--input", "-i", help="输入文件或文本")
    parser.add_argument("--output", "-o", help="输出文件")
    parser.add_argument("--model", "-m", default="gpt-4o", help="使用的模型")

    args = parser.parse_args()

    agent = Agent(model=args.model)

    if args.command == "chat":
        await agent.chat(args.input)
    elif args.command == "review":
        result = await agent.review(args.input)
        if args.output:
            Path(args.output).write_text(result)
        else:
            print(result)
    elif args.command == "generate":
        result = await agent.generate(args.input)
        Path(args.output).write_text(result)
    elif args.command == "test":
        result = await agent.run_tests(args.input)
        print(result)

asyncio.run(main())
```

## 实施步骤

### 步骤 1：设计命令格式

选择合适的命令格式：

| 格式     | 示例              | 适用场景      |
| -------- | ----------------- | ------------- |
| 斜杠命令 | `/format file.py` | CLI、聊天界面 |
| 前缀命令 | `!format file.py` | 类 Unix 环境  |
| 自然语言 | "请格式化文件"    | 对话式交互    |

### 步骤 2：定义命令解析器

```python
class CommandParser:
    def __init__(self, prefix: str = "/"):
        self.prefix = prefix
        self.commands: dict[str, CommandDefinition] = {}

    def register(self, command: CommandDefinition):
        self.commands[command.name] = command
        for alias in command.aliases or []:
            self.commands[alias] = command

    def parse(self, input_text: str) -> tuple[str, dict] | None:
        if not input_text.startswith(self.prefix):
            return None
        parts = input_text[1:].split()
        command_name = parts[0]
        if command_name in self.commands:
            return command_name, self._parse_args(command_name, parts[1:])
        return None
```

### 步骤 3：实现命令处理器

```python
class CommandExecutor:
    async def execute(self, command_name: str, args: dict, context: dict) -> Any:
        command = self.parser.commands[command_name]
        try:
            return await command.handler(args, context)
        except Exception as e:
            return f"命令执行失败：{e}"
```

### 步骤 4：注册命令

```python
parser = CommandParser()

parser.register(CommandDefinition(
    name="format",
    description="格式化代码文件",
    handler=format_code,
    aliases=["fmt"],
    parameters=[
        {"name": "file", "description": "文件路径"}
    ]
))
```

### 步骤 5：添加辅助功能

- **自动补全**：提升用户体验
- **权限控制**：限制敏感命令
- **日志审计**：记录命令执行历史

## 主流框架对比

| 框架/平台           | 命令格式 | 特点         | 适用场景     |
| ------------------- | -------- | ------------ | ------------ |
| **Claude Code**     | 斜杠命令 | 内置丰富命令 | 开发助手     |
| **Discord Bot**     | 斜杠命令 | 平台原生支持 | 社群机器人   |
| **Slack Bot**       | 斜杠命令 | 企业集成     | 工作流自动化 |
| **LangChain Agent** | 工具调用 | LLM 驱动     | AI Agent     |

## 最佳实践

### 命令自动补全

提升用户体验的重要功能。

```python
class CommandCompleter:
    def __init__(self, parser: CommandParser):
        self.parser = parser

    def get_completions(self, partial_input: str) -> list[str]:
        """根据部分输入返回可能的补全建议"""
        if not partial_input.startswith(self.parser.prefix):
            return []

        parts = partial_input[1:].split()
        if len(parts) == 1:
            # 补全命令名
            query = parts[0]
            return [
                f"{self.parser.prefix}{cmd}"
                for cmd in self.parser.commands.keys()
                if cmd.startswith(query)
            ]
        elif len(parts) == 2:
            # 补全命令参数
            command_name = parts[0]
            command = self.parser.commands.get(command_name)
            if command and command.parameters:
                query = parts[1]
                return [
                    f"{self.parser.prefix}{command_name} {param['name']}"
                    for param in command.parameters
                    if param["name"].startswith(query)
                ]

        return []

# 使用示例
completer = CommandCompleter(parser)
completer.get_completions("/f")
# 返回：["/format"]

completer.get_completions("/format ")
# 返回：["/format file", "/format style"]
```

### 命令权限控制

```python
class CommandPermission:
    def __init__(self):
        self.permissions: dict[str, set[str]] = {}  # command -> set of roles

    def set_permission(self, command: str, roles: set[str]):
        self.permissions[command] = roles

    def check(self, command: str, user_role: str) -> bool:
        allowed_roles = self.permissions.get(command, set())
        return user_role in allowed_roles or "admin" in allowed_roles

# 使用示例
permission = CommandPermission()
permission.set_permission("deploy", {"admin", "devops"})
permission.set_permission("test", {"admin", "devops", "developer"})
permission.set_permission("format", {"admin", "devops", "developer", "intern"})
```

### 命令错误处理

```python
class CommandError(Exception):
    def __init__(self, message: str, suggestion: str | None = None):
        self.message = message
        self.suggestion = suggestion
        super().__init__(message)

class CommandErrorHandler:
    @staticmethod
    def handle(error: CommandError) -> str:
        response = f"命令错误：{error.message}"
        if error.suggestion:
            response += f"\n建议：{error.suggestion}"
        return response

    @staticmethod
    def suggest_command(input_text: str, parser: CommandParser) -> str | None:
        """当用户输入了不存在的命令时，给出相似命令建议"""
        if not input_text.startswith(parser.prefix):
            return None

        command_name = input_text[1:].split()[0]
        available = list(parser.commands.keys())

        # 使用编辑距离找最相似的
        closest = min(available, key=lambda x: levenshtein_distance(command_name, x))
        if levenshtein_distance(command_name, closest) <= 2:
            return f"你是想输入 /{closest} 吗？"

        return None
```

### 命令日志与审计

```python
import json
from pathlib import Path

class CommandLogger:
    def __init__(self, log_file: str = ".agent_commands.log"):
        self.log_file = Path(log_file)

    def log(self, command: str, args: dict, result: Any, user: str, duration: float):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "user": user,
            "command": command,
            "args": args,
            "result": str(result)[:500],
            "duration_ms": duration * 1000,
            "status": "success" if result else "error"
        }

        with open(self.log_file, "a") as f:
            f.write(json.dumps(entry) + "\n")

    def get_recent(self, limit: int = 10) -> list[dict]:
        """获取最近的命令记录"""
        if not self.log_file.exists():
            return []

        lines = self.log_file.read_text().strip().split("\n")
        entries = [json.loads(line) for line in lines[-limit:]]
        return entries[::-1]  # 最新的在前
```

## 常见问题与避坑

### Q1：命令与自然语言如何区分？

- 使用**特定前缀**（如 `/`）标识命令
- 未匹配到命令时**降级为自然语言处理**
- 提供**模糊匹配**建议（"你是想输入 /format 吗？"）

### Q2：命令参数太多怎么办？

- 使用**命名参数**而非位置参数
- 提供**合理的默认值**
- 支持**交互式输入**（逐步引导用户）

### Q3：如何防止命令滥用？

- 实现**权限控制**（角色-based）
- 记录**审计日志**
- 设置**频率限制**

### Q4：命令执行失败如何反馈？

- 返回**清晰的错误信息**
- 提供**解决建议**
- 记录**详细日志**便于调试

### Q5：如何管理大量命令？

- **分组管理**：按功能分类
- **命令发现**：提供 `/help` 和搜索
- **文档完善**：每个命令都有说明

:::warning 常见陷阱

- **命令冲突**：名称重复或别名冲突
- **参数验证缺失**：未校验输入导致错误
- **缺乏反馈**：用户不知道命令是否执行成功
- **权限失控**：敏感命令未做权限检查
  :::

## 与其他概念的关系

**核心依赖**：

- [Agent](/glossary/agent) — Command 是用户与 Agent 交互的结构化接口
- [Skills](/glossary/skills) — Command 通常用于触发和执行 Skill，一个 Command 可以对应一个或多个 Skill

**应用场景**：

- [自主 Agent](/glossary/autonomous-agent) — 自主 Agent 内部也可以使用 Command 系统来管理自身的子任务
- [人机协作](/glossary/human-in-the-loop) — Command 是人机协作中人类发出指令的主要方式

**技术基础**：

- [工具使用](/glossary/tool-use) — Command 的执行底层往往依赖工具调用
- [函数调用](/glossary/function-calling) — Command 可以通过函数调用机制触发

## 延伸阅读

- [Agent](/glossary/agent)
- [Skills](/glossary/skills)
- [工具使用](/glossary/tool-use)
- [Claude Code 文档](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [LangChain Agent 文档](https://python.langchain.com/docs/modules/agents)
