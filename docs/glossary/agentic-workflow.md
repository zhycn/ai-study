---
title: Agentic Workflow
description: Agentic Workflow，基于 Agent 自主决策的动态工作流
---

# Agentic Workflow

让 AI 不再死板地按固定流程执行，而是能像人一样根据情况灵活调整策略。遇到新问题自己想办法，走不通就换条路，真正具备"见机行事"的能力。

## 概述

**Agentic Workflow（Agent 工作流）** 是一种以 Agent 自主决策为核心的动态工作流模式。与传统工作流（Workflow）中预定义的固定步骤不同，Agentic Workflow 允许 Agent 根据任务状态、环境变化和中间结果，实时调整执行策略和路径。

可以将 Agentic Workflow 理解为"有大脑的流水线"——传统流水线每个工位做什么早已定好，而 Agentic Workflow 中的每个 Agent 都能自己判断下一步该做什么、怎么做。

Agentic Workflow 的核心公式：

```text
Agentic Workflow = 工作流编排 + Agent 自主决策 + 动态路径规划
```

与传统工作流的关键区别：

| 维度 | 传统工作流 | Agentic Workflow |
|------|-----------|------------------|
| 路径 | 预定义、固定 | 动态生成、可调整 |
| 决策 | 开发者编码 | Agent 自主判断 |
| 异常处理 | 预设分支 | Agent 自主应对 |
| 灵活性 | 低 | 高 |
| 可预测性 | 高 | 中等 |

::: tip 提示
Agentic Workflow 不是要取代传统工作流，而是补充。流程明确、确定性高的场景用传统工作流更高效；需要灵活应对、动态规划的场景用 Agentic Workflow 更合适。
:::

## 为什么需要

### 传统工作流的根本局限

**无法应对未知情况** 传统工作流的所有路径都必须预先编码。当遇到设计时未考虑的场景时，工作流要么崩溃，要么走入错误的分支。现实世界充满了不确定性，预先枚举所有可能性几乎不可能。

**维护成本随复杂度爆炸** 每增加一种异常情况的处理，就需要添加新的条件分支。当业务逻辑复杂时，工作流图会变成难以维护的"意大利面条"。

**缺乏自适应能力** 传统工作流不会因为执行经验的积累而变得更聪明。同样的错误会反复出现，同样的低效路径会一直被使用。

### 核心价值

**动态路径规划** Agent 根据当前状态实时决定下一步行动，而不是走预设的固定路径。这使得系统能够处理设计时未预见到的情况。

**自我修复能力** 当某个步骤失败时，Agent 可以自主尝试替代方案，而不是直接报错退出。这大幅提升了系统的鲁棒性。

**持续优化** Agent 可以从历史执行中学习，逐渐找到更高效的执行路径。随着使用次数增加，整体效率会不断提升。

**人机协作更自然** 人类只需定义目标和约束，Agent 自行决定如何实现。这比要求人类提前想好每一步要自然得多。

## 核心原理

### 自主决策循环

Agentic Workflow 的核心是 Agent 的**感知-决策-执行**循环：

```text
感知环境 → 分析状态 → 制定计划 → 执行行动 → 观察结果 → 反思调整 → 继续循环
```

每个循环中，Agent 会：

1. **感知（Perceive）**：收集当前环境信息，包括任务状态、可用工具、历史执行记录
2. **决策（Decide）**：基于当前信息，决定下一步做什么
3. **执行（Act）**：调用工具或生成内容
4. **反思（Reflect）**：评估执行结果，判断是否需要调整策略

```python
# Agentic Workflow 核心循环
class AgenticWorkflow:
    def __init__(self, agent: Agent, tools: list[Tool]):
        self.agent = agent
        self.tools = tools
        self.execution_history = []

    def run(self, task: str, max_steps: int = 20) -> str:
        state = {"task": task, "status": "in_progress", "results": []}

        for step in range(max_steps):
            # 1. 感知：收集当前状态
            context = self.build_context(state, self.execution_history)

            # 2. 决策：Agent 自主决定下一步
            decision = self.agent.decide(context, self.tools)

            # 3. 执行：调用工具或生成内容
            if decision.action == "use_tool":
                result = self.execute_tool(decision.tool, decision.params)
                state["results"].append(result)
            elif decision.action == "finish":
                state["status"] = "completed"
                return decision.output
            elif decision.action == "adjust_plan":
                # Agent 自主调整策略
                state["plan"] = decision.new_plan

            # 4. 反思：评估结果
            reflection = self.agent.reflect(state, result)
            self.execution_history.append({
                "step": step,
                "decision": decision,
                "result": result,
                "reflection": reflection
            })

            # 检查是否需要终止
            if reflection.should_stop:
                state["status"] = reflection.stop_reason
                break

        return self.generate_final_output(state)
```

### 动态路径规划

Agentic Workflow 中，执行路径不是预先画好的图，而是 Agent **边走边画**的：

```python
# 传统工作流：路径固定
# A → B → C → D（如果 C 失败则走 E）

# Agentic Workflow：路径由 Agent 实时决定
def dynamic_routing(agent: Agent, state: dict) -> str:
    """Agent 根据当前状态动态选择下一步"""

    available_actions = agent.get_available_actions(state)

    # Agent 评估每个行动的预期价值和风险
    scored_actions = []
    for action in available_actions:
        value = agent.estimate_value(action, state)
        risk = agent.estimate_risk(action, state)
        scored_actions.append((action, value - risk * 0.5))

    # 选择最优行动
    best_action = max(scored_actions, key=lambda x: x[1])[0]
    return best_action
```

这种动态规划的关键优势：

- **适应性**：遇到新情况能自动调整
- **鲁棒性**：单点失败不导致整体崩溃
- **效率**：能找到比预设路径更优的路线

### 多 Agent 协作模式

Agentic Workflow 中多个 Agent 的协作不是固定的流水线，而是**动态组队**：

```python
# 动态多 Agent 协作
class DynamicTeamWorkflow:
    def __init__(self, agent_pool: list[Agent]):
        self.agent_pool = agent_pool  # 可用 Agent 池
        self.active_tasks = {}

    def handle_task(self, task: str) -> str:
        # 1. 任务分析：需要哪些技能
        required_skills = self.analyze_task(task)

        # 2. 动态组队：根据技能需求选择 Agent
        team = self.select_team(required_skills)

        # 3. 任务分解：Manager Agent 拆分子任务
        manager = self.get_manager_agent()
        subtasks = manager.decompose(task, team)

        # 4. 动态分配：根据 Agent 当前负载分配任务
        assignments = self.assign_tasks(subtasks, team)

        # 5. 执行与协调：Agent 自主执行，必要时请求协助
        results = {}
        for agent, subtask in assignments.items():
            result = agent.execute(subtask)
            if result.needs_help:
                # 动态请求其他 Agent 协助
                helper = self.find_helper(result.help_request)
                result = helper.assist(result)
            results[agent.id] = result

        # 6. 结果整合
        return manager.integrate(results)
```

### 状态管理与记忆

Agentic Workflow 需要完善的状态管理来支撑自主决策：

```python
class WorkflowState:
    def __init__(self, task: str):
        self.task = task
        self.current_plan = []
        self.completed_steps = []
        self.failed_steps = []
        self.context_window = []  # 当前上下文
        self.long_term_memory = []  # 长期记忆（跨会话）
        self.tool_results = {}
        self.cost_tracker = {"tokens": 0, "api_calls": 0}

    def add_step_result(self, step: dict):
        """记录步骤执行结果"""
        if step["status"] == "success":
            self.completed_steps.append(step)
        else:
            self.failed_steps.append(step)

        # 更新上下文窗口（保持大小限制）
        self.context_window.append(step)
        if len(self.context_window) > 10:
            # 压缩早期上下文
            self.context_window = self.compress_context(self.context_window)

    def get_decision_context(self) -> dict:
        """构建决策所需的上下文"""
        return {
            "task": self.task,
            "progress": f"{len(self.completed_steps)}/{len(self.current_plan)}",
            "recent_results": self.context_window[-5:],
            "past_failures": self.failed_steps[-3:],
            "available_tools": self.get_available_tools(),
            "budget_remaining": self.get_remaining_budget()
        }
```

## 实施步骤

### 步骤 1：定义任务目标与约束

明确 Agent 需要达成的目标和不能逾越的边界：

```yaml
# workflow_config.yaml
workflow:
  name: customer_inquiry_handler
  type: agentic  # 标记为 Agentic Workflow

  objective: "处理客户咨询，给出准确答复或转人工"

  constraints:
    max_steps: 15
    max_cost_usd: 0.5
    timeout_seconds: 60
    allowed_tools:
      - order_query
      - faq_search
      - knowledge_base
      - human_handoff  # 必须保留人工介入通道

  success_criteria:
    - 客户问题得到准确回答
    - 或已正确转接人工客服

  guardrails:
    - 不能承诺退款金额
    - 不能修改用户账户信息
    - 敏感操作必须人工确认
```

### 步骤 2：构建 Agent 能力矩阵

为 Agent 配置所需的技能和工具：

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

# 定义工作流状态
class AgenticState(TypedDict):
    task: str
    plan: list[str]
    current_step: str
    observations: Annotated[list, operator.add]
    final_output: str
    step_count: int
    needs_human: bool

# 定义 Agent 节点
def planner_node(state: AgenticState) -> AgenticState:
    """规划节点：Agent 自主制定或调整计划"""
    if state["plan"]:
        # 已有计划，检查是否需要调整
        should_adjust = evaluate_plan(state["plan"], state["observations"])
        if should_adjust:
            new_plan = adjust_plan(state["plan"], state["observations"])
            return {"plan": new_plan}
    else:
        # 首次规划
        plan = create_initial_plan(state["task"])
        return {"plan": plan}

    return {"plan": state["plan"]}

def executor_node(state: AgenticState) -> AgenticState:
    """执行节点：Agent 自主选择合适的工具执行"""
    current_step = state["plan"][0] if state["plan"] else None
    if not current_step:
        return {"current_step": "done"}

    # Agent 自主选择工具
    tool = select_best_tool(current_step, available_tools)
    result = tool.execute(current_step)

    return {
        "current_step": current_step,
        "observations": [{"step": current_step, "result": result}],
        "plan": state["plan"][1:]  # 移除已完成的步骤
    }

def reflector_node(state: AgenticState) -> AgenticState:
    """反思节点：评估执行结果，决定下一步"""
    last_observation = state["observations"][-1]

    if is_success(last_observation["result"]):
        if not state["plan"]:
            return {"final_output": generate_response(state["observations"])}
        return {}  # 继续执行

    if state["step_count"] >= 15:
        return {"needs_human": True, "final_output": "达到最大步骤数，转人工处理"}

    # 反思失败原因，调整策略
    adjustment = analyze_failure(last_observation)
    return {"plan": adjust_plan(state["plan"], adjustment)}

# 构建图
graph = StateGraph(AgenticState)
graph.add_node("planner", planner_node)
graph.add_node("executor", executor_node)
graph.add_node("reflector", reflector_node)

graph.set_entry_point("planner")
graph.add_edge("planner", "executor")
graph.add_edge("executor", "reflector")

# 条件边：根据状态决定下一步
def route_next(state: AgenticState) -> str:
    if state.get("needs_human"):
        return "human"
    if state.get("final_output"):
        return "end"
    if not state["plan"]:
        return "planner"  # 计划执行完，重新规划
    return "executor"

graph.add_conditional_edges("reflector", route_next, {
    "human": END,
    "end": END,
    "planner": "planner",
    "executor": "executor"
})

app = graph.compile()
```

### 步骤 3：配置工具集与权限

```python
# 工具定义
tools = [
    {
        "name": "order_query",
        "description": "查询订单状态和物流信息",
        "parameters": {
            "order_id": {"type": "string", "required": True}
        },
        "execution": lambda order_id: query_order_api(order_id),
        "permission": "read"  # 只读权限
    },
    {
        "name": "faq_search",
        "description": "在常见问题库中搜索答案",
        "parameters": {
            "query": {"type": "string", "required": True}
        },
        "execution": lambda query: search_faq(query),
        "permission": "read"
    },
    {
        "name": "human_handoff",
        "description": "转接人工客服",
        "parameters": {
            "reason": {"type": "string", "required": True},
            "context": {"type": "string", "required": True}
        },
        "execution": lambda reason, context: handoff_to_human(reason, context),
        "permission": "write"  # 写权限，需要审计
    }
]

# 权限检查中间件
def check_permission(tool_name: str, permission: str) -> bool:
    """检查工具调用权限"""
    allowed = get_allowed_tools_for_permission(permission)
    return tool_name in allowed
```

### 步骤 4：实现安全护栏

```python
class SafetyGuardrails:
    """Agentic Workflow 安全护栏"""

    def __init__(self):
        self.blocked_patterns = [
            r"退款.*\d+元",  # 不能承诺具体退款金额
            r"修改.*密码",   # 不能修改密码
            r"删除.*账户",   # 不能删除账户
        ]

    def check_input(self, user_input: str) -> bool:
        """检查用户输入是否安全"""
        for pattern in self.blocked_patterns:
            if re.search(pattern, user_input):
                return False
        return True

    def check_output(self, agent_output: str) -> dict:
        """检查 Agent 输出是否合规"""
        issues = []

        for pattern in self.blocked_patterns:
            if re.search(pattern, agent_output):
                issues.append(f"检测到敏感内容：{pattern}")

        return {
            "safe": len(issues) == 0,
            "issues": issues
        }

    def check_tool_call(self, tool_name: str, params: dict) -> bool:
        """检查工具调用是否合法"""
        if tool_name == "human_handoff":
            # 转人工需要记录原因
            if not params.get("reason"):
                return False
        return True
```

### 步骤 5：测试与评估

```python
# 测试用例集
test_cases = [
    {
        "input": "我的订单 12345 到哪了？",
        "expected_tools": ["order_query"],
        "expected_outcome": "success"
    },
    {
        "input": "我想退货怎么办？",
        "expected_tools": ["faq_search"],
        "expected_outcome": "success"
    },
    {
        "input": "给我退款 500 元",
        "expected_tools": ["human_handoff"],
        "expected_outcome": "handoff"  # 应转人工
    },
    {
        "input": "帮我修改登录密码",
        "expected_tools": ["human_handoff"],
        "expected_outcome": "handoff"  # 应转人工
    },
]

def evaluate_workflow(app, test_cases: list[dict]) -> dict:
    """评估 Agentic Workflow 表现"""
    results = {
        "total": len(test_cases),
        "passed": 0,
        "failed": 0,
        "avg_steps": 0,
        "avg_cost": 0,
        "details": []
    }

    for case in test_cases:
        output = app.invoke({
            "task": case["input"],
            "plan": [],
            "current_step": "",
            "observations": [],
            "final_output": "",
            "step_count": 0,
            "needs_human": False
        })

        passed = (
            output.get("final_output") is not None and
            (case["expected_outcome"] == "handoff") == output.get("needs_human", False)
        )

        results["passed" if passed else "failed"] += 1
        results["avg_steps"] += output.get("step_count", 0)
        results["details"].append({
            "input": case["input"],
            "passed": passed,
            "steps": output.get("step_count", 0),
            "output": output.get("final_output", "")
        })

    results["avg_steps"] /= results["total"]
    return results
```

### 步骤 6：部署与持续优化

- **可观测性**：记录完整的决策链路（Thought-Action-Observation-Reflection）
- **A/B 测试**：对比不同提示词和工具配置的效果
- **反馈循环**：收集用户反馈，持续优化 Agent 行为
- **成本监控**：跟踪每次执行的 token 消耗和 API 成本

## 主流框架对比

| 框架 | 核心机制 | 适用场景 | 学习曲线 | 自主决策能力 |
|------|---------|---------|---------|-------------|
| **LangGraph** | 状态图 + 条件边 | 需要精细控制流程的 Agentic Workflow | 中等 | 高（节点内自主决策） |
| **CrewAI** | 角色驱动 + 任务链 | 多 Agent 协作的内容创作 | 低 | 中（任务级自主） |
| **AutoGen** | 对话驱动 | 代码生成、数据分析 | 中等 | 高（对话中自主规划） |
| **OpenAI Agents SDK** | Handoffs + Guardrails | 轻量级 Agent 应用 | 低 | 中（交接点自主） |
| **DSPy** | 声明式编程 + 优化 | 需要自动优化提示词的 Workflow | 较高 | 中（编译时优化） |

### LangGraph Agentic Workflow 示例

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class ResearchState(TypedDict):
    topic: str
    search_queries: list[str]
    findings: list[str]
    summary: str
    needs_more_research: bool

def generate_queries(state: ResearchState) -> ResearchState:
    """自主生成搜索查询"""
    if not state["search_queries"]:
        # 首次：根据主题生成初始查询
        queries = llm_generate_queries(state["topic"])
        return {"search_queries": queries}
    else:
        # 基于已有发现，生成补充查询
        new_queries = llm_generate_follow_up(state["findings"])
        return {"search_queries": state["search_queries"] + new_queries}

def search_and_collect(state: ResearchState) -> ResearchState:
    """执行搜索并收集结果"""
    query = state["search_queries"].pop(0)
    results = web_search(query)
    return {"findings": state["findings"] + results}

def evaluate_completeness(state: ResearchState) -> ResearchState:
    """评估研究是否充分"""
    needs_more = llm_evaluate_completeness(
        state["topic"], state["findings"]
    )
    return {"needs_more_research": needs_more}

def write_summary(state: ResearchState) -> ResearchState:
    """撰写研究总结"""
    summary = llm_write_summary(state["topic"], state["findings"])
    return {"summary": summary}

# 构建 Agentic Workflow
graph = StateGraph(ResearchState)
graph.add_node("plan", generate_queries)
graph.add_node("search", search_and_collect)
graph.add_node("evaluate", evaluate_completeness)
graph.add_node("summarize", write_summary)

graph.set_entry_point("plan")
graph.add_edge("plan", "search")
graph.add_edge("search", "evaluate")

# Agent 自主决定是否需要更多研究
graph.add_conditional_edges("evaluate",
    lambda s: "plan" if s["needs_more_research"] else "summarize",
    {"plan": "plan", "summarize": "summarize"}
)

graph.add_edge("summarize", END)

app = graph.compile()
```

## 最佳实践

### 设计原则

**目标导向而非流程导向** 定义 Agent 要达成的目标，而不是规定每一步怎么做。给 Agent 足够的自由度来找到最优路径。

**设置合理的约束** 完全自由的 Agent 可能产生不可预测的行为。通过最大步骤数、成本上限、工具白名单等约束来平衡灵活性和可控性。

**保留人工介入通道** 无论 Agent 多聪明，都应该保留人工介入的选项。对于敏感操作，设置强制人工审批。

**渐进式自主权** 从有限的自主权开始（如只能选择工具，不能改变流程），随着信任度提升逐步扩大自主范围。

### 提示词工程

```python
# Agentic Workflow 系统提示词模板
SYSTEM_PROMPT = """你是一个自主决策的 AI 助手，负责处理客户咨询。

你的目标：准确回答客户问题，或在无法回答时转接人工客服。

你可用的工具：
- order_query：查询订单状态
- faq_search：搜索常见问题
- knowledge_base：搜索知识库
- human_handoff：转接人工客服

决策原则：
1. 优先尝试自己回答
2. 使用工具获取必要信息
3. 如果工具无法解决问题，转接人工
4. 最多尝试 {max_steps} 次
5. 不要承诺退款金额或修改账户信息

每次行动前，请先思考：
- 我当前掌握什么信息？
- 我还需要什么信息？
- 哪个工具能帮我获取这些信息？
- 如果所有工具都失败了，我该怎么办？
"""
```

### 成本控制

```python
class WorkflowCostController:
    """Agentic Workflow 成本控制"""

    def __init__(self, max_cost_usd: float = 1.0):
        self.max_cost = max_cost_usd
        self.current_cost = 0.0

    def can_proceed(self, estimated_cost: float) -> bool:
        """判断是否还能继续执行"""
        return self.current_cost + estimated_cost <= self.max_cost

    def record_cost(self, cost: float):
        """记录实际消耗"""
        self.current_cost += cost

    def get_remaining_budget(self) -> float:
        return self.max_cost - self.current_cost

    def should_handoff(self) -> bool:
        """预算不足时应转人工"""
        return self.current_cost >= self.max_cost * 0.9  # 90% 时预警
```

### 可观测性设计

```python
class WorkflowTracer:
    """Agentic Workflow 执行追踪"""

    def __init__(self):
        self.traces = []

    def record_decision(self, step: int, thought: str, action: str, result: str):
        self.traces.append({
            "step": step,
            "thought": thought,       # Agent 的思考过程
            "action": action,         # 采取的行动
            "result": result,         # 行动结果
            "timestamp": datetime.now().isoformat()
        })

    def generate_report(self) -> str:
        """生成执行报告"""
        total_steps = len(self.traces)
        tool_calls = [t for t in self.traces if t["action"].startswith("tool:")]

        return f"""
执行报告：
- 总步骤数：{total_steps}
- 工具调用次数：{len(tool_calls)}
- 决策链路：{' → '.join(t['action'] for t in self.traces)}
        """.strip()
```

## 常见问题与避坑

### Q1：Agentic Workflow 和传统工作流该怎么选？

**判断标准**：

- 流程固定、异常可枚举 → 传统工作流（更高效、更可预测）
- 场景多变、异常难枚举 → Agentic Workflow（更灵活、更鲁棒）
- 混合场景 → 外层用传统工作流，关键节点用 Agent 自主决策

### Q2：Agent 自主决策会不会失控？

**控制策略**：

- **护栏机制（Guardrails）**：设置不可逾越的红线
- **预算限制**：最大步骤数、成本上限、时间限制
- **人工审批**：关键操作必须人工确认
- **审计日志**：完整记录所有决策，便于事后审查

::: warning 警告
永远不要在没有护栏的情况下部署 Agentic Workflow。Agent 的自主决策能力是一把双刃剑，必须配合完善的安全机制。
:::

### Q3：调试 Agentic Workflow 太困难怎么办？

- **思维可视化**：输出 Agent 的完整思考过程
- **决策树记录**：记录每个决策点的可选方案和最终选择
- **回放功能**：重现历史执行过程
- **断点调试**：在关键决策点暂停，检查状态

### Q4：成本太高如何优化？

- **模型分级**：简单决策用小模型，复杂决策用大模型
- **缓存复用**：相同场景直接返回历史决策
- **提前终止**：达到满意结果后立即停止，不浪费额外步骤
- **批量处理**：合并相似的独立任务

### Q5：如何评估 Agentic Workflow 的效果？

关键指标：

| 指标 | 说明 | 目标值 |
|------|------|--------|
| 任务完成率 | 成功完成任务的比例 | > 90% |
| 平均步骤数 | 完成任务所需的平均步骤 | 越少越好 |
| 人工介入率 | 需要人工介入的比例 | < 10% |
| 平均成本 | 每次执行的平均 API 成本 | 在预算内 |
| 用户满意度 | 用户对结果的评分 | > 4.0/5.0 |

## 与其他概念的关系

**核心依赖**：

- [Agent](/glossary/agent) — Agentic Workflow 的决策主体，每个决策点都由 Agent 驱动
- [工作流](/glossary/workflow) — Agentic Workflow 是工作流的一种高级模式，在传统工作流基础上增加自主决策
- [规划](/glossary/planning) — Agent 的规划能力是 Agentic Workflow 动态路径规划的基础

**技术支撑**：

- [工具使用](/glossary/tool-use) — Agent 通过工具调用来执行具体行动
- [记忆](/glossary/memory) — Agent 需要记忆来维持跨步骤的上下文一致性
- [人机协作](/glossary/human-in-the-loop) — 人工介入是 Agentic Workflow 的安全底线

**进阶模式**：

- [多 Agent 系统](/glossary/multi-agent) — 多个 Agent 协作形成更复杂的 Agentic Workflow
- [Agent 编排](/glossary/agent-orchestration) — Agentic Workflow 需要编排层来协调多个 Agent 的自主行为

## 延伸阅读

- [Agentic Workflow 概念论文](https://arxiv.org/abs/2402.01030) - 关于 Agent 自主工作流的学术讨论
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/) - 构建 Agentic Workflow 的主流框架
- [Anthropic Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) - 构建高效 Agent 的最佳实践
- [Agent](/glossary/agent)
- [工作流](/glossary/workflow)
- [规划](/glossary/planning)
- [工具使用](/glossary/tool-use)
- [多 Agent 系统](/glossary/multi-agent)
