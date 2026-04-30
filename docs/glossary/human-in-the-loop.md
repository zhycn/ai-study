---
title: 人机协作
description: Human-in-the-loop，人类参与决策的 Agent 模式
---

# 人机协作

> 面向开发者的技术实战文章

## 概述

**人机协作（Human-in-the-loop，HITL）** 是一种将人类判断融入 AI 决策过程的设计模式。在关键步骤需要人类确认、审核或介入，确保 AI 系统的可靠性、安全性和合规性。

HITL 不是"AI 做不了才找人"，而是一种**主动设计**——在系统架构阶段就明确哪些决策必须由人类做出，哪些可以自动化，哪些需要人机共同决策。这种设计在保持自动化效率的同时，保留了人类对关键决策的控制权。

> 💡 核心理解
>
> HITL 不是 AI 的缺陷，而是负责任 AI 的设计原则。就像飞机有自动驾驶，但起飞、降落和紧急情况必须由飞行员控制。

## 为什么重要

### 纯自动化的风险

完全自主的 Agent 面临以下固有风险：

**幻觉与错误** LLM 可能生成看似合理但实际错误的内容。在医疗、金融等高风险领域，这种错误可能造成严重后果。

**安全漏洞** Agent 可能被提示注入（Prompt Injection）攻击，执行恶意操作。没有人类审核，攻击可能不被发现。

**伦理问题** AI 可能做出带有偏见或不公平的决策，需要人类进行伦理审查。

**合规要求** 许多行业法规要求关键决策必须有人类参与和审核记录。

### 核心价值

**质量保证** 人类审核确保输出质量，特别是在创意、准确性和适当性方面。

**风险控制** 关键决策（如删除数据、发送消息、执行代码）需要人工确认，防止不可逆的错误操作。

**持续学习** 人类反馈是改进 Agent 行为的最有效方式，通过反馈循环不断提升 Agent 的表现。

**合规与审计** 保留人类审核记录，满足行业合规要求和审计需要。

## 核心模式

### 审批模式（Approval）

Agent 在执行关键操作前请求人类批准。

```python
class ApprovalGateway:
    def __init__(self):
        self.pending_approvals: dict[str, dict] = {}

    async def request_approval(
        self,
        action: str,
        details: str,
        risk_level: str = "medium"
    ) -> bool:
        """请求人类审批"""
        approval_id = generate_id()

        self.pending_approvals[approval_id] = {
            "action": action,
            "details": details,
            "risk_level": risk_level,
            "status": "pending",
            "created_at": datetime.now()
        }

        # 通知人类（邮件、Slack、界面弹窗等）
        await notify_human(
            approval_id,
            f"请审批：{action}\n详情：{details}\n风险等级：{risk_level}"
        )

        # 等待审批（设置超时）
        return await self.wait_for_approval(approval_id, timeout=300)

    async def wait_for_approval(self, approval_id: str, timeout: float) -> bool:
        """等待人类审批结果"""
        start_time = time.time()

        while time.time() - start_time < timeout:
            approval = self.pending_approvals.get(approval_id)
            if approval["status"] == "approved":
                return True
            elif approval["status"] == "rejected":
                return False
            await asyncio.sleep(1)

        # 超时处理
        return self.handle_timeout(approval_id)

    def handle_timeout(self, approval_id: str) -> bool:
        """超时处理策略"""
        approval = self.pending_approvals[approval_id]

        if approval["risk_level"] == "low":
            # 低风险操作，超时后自动批准
            approval["status"] = "approved"
            return True
        else:
            # 中高风险操作，超时后拒绝
            approval["status"] = "timeout_rejected"
            return False
```

### 审核模式（Review）

Agent 完成工作后，由人类审核结果。

```python
class ReviewWorkflow:
    def __init__(self):
        self.review_queue: list[dict] = []

    async def submit_for_review(self, task: str, result: str, context: dict):
        """提交结果供人类审核"""
        review_item = {
            "task": task,
            "result": result,
            "context": context,
            "status": "pending_review",
            "submitted_at": datetime.now()
        }
        self.review_queue.append(review_item)

    async def process_review(self, review_id: str, feedback: dict):
        """处理人类审核反馈"""
        item = self.find_review(review_id)
        if not item:
            return

        if feedback["approved"]:
            item["status"] = "approved"
            await self.publish_result(item)
        else:
            item["status"] = "needs_revision"
            item["feedback"] = feedback["comments"]

            # 将反馈返回给 Agent 进行修订
            revised_result = await agent.revise(item["result"], feedback["comments"])
            await self.submit_for_review(item["task"], revised_result, item["context"])
```

### 协作模式（Collaboration）

人类和 Agent 交替工作，共同完成任务。

```python
class CollaborativeWorkflow:
    def __init__(self):
        self.turn = "human"  # 当前轮到谁

    async def run(self, task: str) -> str:
        context = {"task": task, "history": []}

        while not self.is_complete(context):
            if self.turn == "human":
                # 人类工作
                human_input = await get_human_input(
                    f"当前进度：{context['history']}\n请继续："
                )
                context["history"].append({"role": "human", "content": human_input})

            else:
                # Agent 工作
                agent_output = await agent.execute(
                    f"基于以下历史，请继续：\n{context['history']}"
                )
                context["history"].append({"role": "agent", "content": agent_output})

            # 切换回合
            self.turn = "agent" if self.turn == "human" else "human"

        return self.aggregate_result(context)
```

### 教学模式（Teaching）

人类通过示例和反馈教导 Agent。

```python
class TeachingWorkflow:
    def __init__(self):
        self.examples: list[dict] = []

    async def collect_example(self, task: str, expected_output: str):
        """收集人类提供的示例"""
        self.examples.append({
            "task": task,
            "output": expected_output,
            "timestamp": datetime.now()
        })

    async def provide_feedback(self, task: str, agent_output: str, feedback: str):
        """收集人类反馈"""
        self.examples.append({
            "task": task,
            "output": agent_output,
            "feedback": feedback,
            "timestamp": datetime.now()
        })

    def get_training_data(self) -> str:
        """将收集的示例转换为训练数据"""
        return "\n\n".join([
            f"任务：{ex['task']}\n期望输出：{ex['output']}"
            for ex in self.examples
        ])
```

## 主流框架与实现

### LangGraph Human-in-the-loop

[LangGraph](https://langchain-ai.github.io/langgraph/) 提供了内置的 HITL 支持，通过**中断（Interrupt）** 机制实现。

```python
from langgraph.graph import StateGraph, END
from langgraph.types import interrupt
from typing import TypedDict

class ReviewState(TypedDict):
    content: str
    review_status: str
    review_feedback: str

def generate_content(state: ReviewState) -> ReviewState:
    """Agent 生成内容"""
    state["content"] = llm.invoke(f"请生成关于 {state['task']} 的内容")
    return state

def human_review(state: ReviewState) -> ReviewState:
    """人类审核节点"""
    # 中断工作流，等待人类输入
    feedback = interrupt(
        {
            "type": "review",
            "content": state["content"],
            "message": "请审核以下内容，提供修改建议或输入 'APPROVE' 通过"
        }
    )

    if feedback == "APPROVE":
        state["review_status"] = "approved"
    else:
        state["review_status"] = "needs_revision"
        state["review_feedback"] = feedback

    return state

def revise_content(state: ReviewState) -> ReviewState:
    """根据反馈修订内容"""
    state["content"] = llm.invoke(
        f"请根据以下反馈修改内容：\n反馈：{state['review_feedback']}\n原内容：{state['content']}"
    )
    return state

# 构建图
builder = StateGraph(ReviewState)
builder.add_node("generate", generate_content)
builder.add_node("review", human_review)
builder.add_node("revise", revise_content)

builder.add_edge("generate", "review")
builder.add_conditional_edges(
    "review",
    lambda s: "revise" if s["review_status"] == "needs_revision" else END
)
builder.add_edge("revise", "review")
builder.set_entry_point("generate")

app = builder.compile()

# 执行时，工作流会在 review 节点中断
# 调用者需要提供人类反馈后继续
thread_config = {"configurable": {"thread_id": "review-1"}}
result = app.invoke({"task": "AI 发展趋势"}, thread_config)
```

### LangChain HumanInputTool

LangChain 提供了人类输入工具，可以在 Agent 执行过程中请求人类输入。

```python
from langchain_community.tools import HumanInputRun

# 创建人类输入工具
human_tool = HumanInputRun(input_func=input)

# 在 Agent 中使用
from langchain.agents import Tool

tools = [
    Tool(
        name="human_approval",
        func=human_tool.run,
        description="当需要人类审批时使用。输入为需要审批的操作描述。"
    ),
    # ... 其他工具
]
```

### 自定义 Web 界面

在生产环境中，通常通过 Web 界面实现 HITL。

```python
from fastapi import FastAPI, WebSocket
from pydantic import BaseModel

app = FastAPI()

class ApprovalRequest(BaseModel):
    id: str
    action: str
    details: str
    risk_level: str

class ApprovalResponse(BaseModel):
    id: str
    approved: bool
    comments: str = ""

# 存储待审批请求
pending_requests: dict[str, ApprovalRequest] = {}
approval_events: dict[str, asyncio.Event] = {}
approval_results: dict[str, ApprovalResponse] = {}

@app.post("/api/approval/request")
async def request_approval(request: ApprovalRequest):
    """Agent 发起审批请求"""
    pending_requests[request.id] = request
    approval_events[request.id] = asyncio.Event()
    return {"status": "pending", "id": request.id}

@app.post("/api/approval/respond")
async def respond_approval(response: ApprovalResponse):
    """人类提交审批结果"""
    if response.id in approval_events:
        approval_results[response.id] = response
        approval_events[response.id].set()
        return {"status": "ok"}
    return {"status": "error", "message": "审批请求不存在"}

@app.websocket("/ws/notifications")
async def notifications(websocket: WebSocket):
    """WebSocket 推送待审批请求给人类"""
    await websocket.accept()
    while True:
        for req in pending_requests.values():
            if req.id not in approval_results:
                await websocket.send_json(req.model_dump())
        await asyncio.sleep(1)
```

## 工程实践

### 介入时机设计

不是所有步骤都需要人类介入，合理设计介入时机：

**必须介入** 高风险操作（删除数据、发送邮件、执行生产部署）、法律合规要求、伦理敏感决策。

**建议介入** 创意内容生成、复杂分析结论、首次执行的新类型任务。

**可选介入** 低风险操作、重复性任务、Agent 置信度高的决策。

```python
class InterventionPolicy:
    def __init__(self):
        self.rules: list[dict] = []

    def add_rule(self, condition: Callable, action: str, required: bool):
        self.rules.append({
            "condition": condition,
            "action": action,
            "required": required
        })

    def should_intervene(self, context: dict) -> list[dict]:
        """判断是否需要人类介入"""
        interventions = []

        for rule in self.rules:
            if rule["condition"](context):
                interventions.append({
                    "action": rule["action"],
                    "required": rule["required"]
                })

        return interventions

# 使用示例
policy = InterventionPolicy()
policy.add_rule(
    condition=lambda c: c.get("operation") == "delete_data",
    action="确认数据删除",
    required=True
)
policy.add_rule(
    condition=lambda c: c.get("confidence", 1.0) < 0.7,
    action="确认 Agent 的判断",
    required=False
)
```

### 超时与降级策略

人类可能无法及时响应，需要超时和降级策略。

```python
class TimeoutHandler:
    def __init__(self, default_timeout: float = 300):
        self.default_timeout = default_timeout

    async def wait_with_timeout(
        self,
        event: asyncio.Event,
        timeout: float | None = None,
        fallback_action: Callable | None = None
    ) -> bool:
        """等待事件，超时后执行降级策略"""
        timeout = timeout or self.default_timeout

        try:
            await asyncio.wait_for(event.wait(), timeout=timeout)
            return True
        except asyncio.TimeoutError:
            if fallback_action:
                return await fallback_action()
            return False

# 降级策略示例
async def auto_approve_low_risk() -> bool:
    """低风险操作超时后自动批准"""
    return True

async def reject_high_risk() -> bool:
    """高风险操作超时后拒绝"""
    return False
```

### 反馈收集与分析

收集人类审核反馈，持续改进 Agent。

```python
class FeedbackAnalyzer:
    def __init__(self):
        self.feedback_log: list[dict] = []

    def record_feedback(self, task: str, agent_output: str, feedback: str, action: str):
        self.feedback_log.append({
            "task": task,
            "agent_output": agent_output,
            "feedback": feedback,
            "action": action,  # approved, rejected, modified
            "timestamp": datetime.now()
        })

    def get_common_issues(self, top_n: int = 5) -> list[dict]:
        """分析常见的审核不通过原因"""
        rejected = [f for f in self.feedback_log if f["action"] == "rejected"]
        feedback_texts = [f["feedback"] for f in rejected]

        # 使用 LLM 分析常见模式
        analysis = llm.invoke(f"""
        分析以下审核反馈，找出最常见的 {top_n} 个问题：
        {''.join(feedback_texts)}
        """)

        return parse_analysis(analysis)

    def generate_improvement_report(self) -> str:
        """生成 Agent 改进建议报告"""
        issues = self.get_common_issues()
        return llm.invoke(f"""
        基于以下常见问题，给出改进 Agent 行为的具体建议：
        {issues}
        """)
```

> 🔧 最佳实践：定期分析人类审核反馈，识别 Agent 的系统性错误模式，针对性地优化提示词、增加示例或调整工具使用策略。

### 用户体验设计

HITL 的用户体验直接影响系统的可用性：

**清晰的信息展示** 让人类快速理解 Agent 做了什么、为什么这么做、需要做什么决策。

**便捷的操作方式** 一键审批、批量操作、快捷键支持。

**上下文完整性** 提供足够的背景信息，让审核者做出正确判断。

```python
class ReviewUI:
    def generate_review_card(self, approval_request: dict) -> dict:
        """生成审核卡片"""
        return {
            "title": f"审批请求：{approval_request['action']}",
            "risk_badge": self.risk_badge(approval_request["risk_level"]),
            "details": approval_request["details"],
            "agent_reasoning": approval_request.get("reasoning", ""),
            "context": approval_request.get("context", {}),
            "actions": [
                {"label": "批准", "type": "approve", "shortcut": "a"},
                {"label": "拒绝", "type": "reject", "shortcut": "r"},
                {"label": "修改后批准", "type": "approve_with_changes", "shortcut": "m"}
            ],
            "comment_placeholder": "输入修改建议或拒绝原因..."
        }

    def risk_badge(self, risk_level: str) -> dict:
        badges = {
            "low": {"color": "green", "text": "低风险"},
            "medium": {"color": "orange", "text": "中风险"},
            "high": {"color": "red", "text": "高风险"}
        }
        return badges.get(risk_level, badges["medium"])
```

## 与其他概念的关系

**核心依赖**：
- [Agent](/glossary/agent) — HITL 是 Agent 系统中的人类参与机制，没有 Agent 就无需 HITL
- [自主 Agent](/glossary/autonomous-agent) — HITL 与自主 Agent 形成光谱的两端，实际系统通常介于两者之间

**应用场景**：
- [多 Agent 系统](/glossary/multi-agent) — 人类可以作为特殊节点加入多 Agent 系统，提供指导和审核
- [Agent 编排](/glossary/agent-orchestration) — 编排层可以在关键步骤插入人工审核节点

**技术基础**：
- [AI 安全](/glossary/ai-safety) — HITL 是 AI 安全的重要保障机制
- [规划](/glossary/planning) — 人类可以在规划阶段审核 Agent 的执行计划

## 延伸阅读

- [Agent](/glossary/agent)
- [自主 Agent](/glossary/autonomous-agent)
- [AI 安全](/glossary/ai-safety)
- [LangGraph HITL 文档](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/)
- [Human-in-the-loop Machine Learning 论文](https://arxiv.org/abs/2009.05157)
