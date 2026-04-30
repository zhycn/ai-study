---
title: Computer Use
description: Computer Use，AI Agent 直接操作计算机界面的能力
---

# Computer Use

让 AI 不再只能通过 API 干活，而是能像人一样用鼠标点击、键盘输入来操作电脑。就像给 AI 装了一双"虚拟的手"和"虚拟的眼睛"，它能看屏幕、点按钮、填表单，真正像人一样使用电脑。

## 概述

**Computer Use（计算机操作）** 是指 AI Agent 通过视觉感知屏幕内容、通过模拟键鼠操作与计算机界面交互的技术能力。与传统的 API 调用不同，Computer Use 让 Agent 能够操作**任何有图形界面的软件**，无需该软件提供专门的编程接口。

Computer Use 的核心原理是：Agent 通过截图"看到"屏幕，通过图像识别理解界面元素的位置和含义，然后模拟鼠标点击、键盘输入、滚动等操作来完成任务。

```text
Computer Use = 视觉感知（截图）+ 界面理解（图像识别）+ 操作执行（键鼠模拟）
```

与 API 调用的关键区别：

| 维度 | API 调用 | Computer Use |
|------|---------|-------------|
| 接入方式 | 需要软件提供 API | 无需 API，直接操作界面 |
| 适用范围 | 仅限支持 API 的软件 | 任何有图形界面的软件 |
| 稳定性 | 高（接口契约保障） | 中低（界面变化可能影响） |
| 开发成本 | 需要对接每个 API | 通用方案，一次开发 |
| 执行速度 | 快（直接通信） | 慢（需要截图、识别、操作） |

::: tip 提示
Computer Use 不是要替代 API 调用，而是补充。有 API 的场景优先用 API；没有 API 或 API 不完善的场景，Computer Use 是有效的替代方案。
:::

## 为什么需要

### API 方案的固有局限

**不是所有软件都有 API** 大量传统企业软件、内部系统、老旧应用没有提供编程接口。这些系统只能通过人工操作界面来使用，AI 无法直接接入。

**API 覆盖不完整** 即使软件提供了 API，也往往只覆盖核心功能。一些边缘功能、最新功能可能没有对应的 API 端点。

**API 接入成本高** 每个软件都需要单独对接，处理不同的认证方式、数据格式、速率限制。当需要操作多个系统时，集成工作量巨大。

**权限获取困难** 许多企业系统的 API 需要申请权限、走审批流程，耗时且不一定能获批。但界面操作通常只需要一个账号即可。

### 核心价值

**通用操作能力** Computer Use 提供了一套通用的计算机操作方案，理论上可以操作任何有图形界面的软件，无需针对每个软件单独开发。

**降低集成门槛** 不需要目标系统提供任何编程接口，只需要 Agent 能够看到屏幕、模拟键鼠操作即可。这大幅降低了 AI 与传统系统集成的门槛。

**人类工作流复用** 人类已经为这些软件设计了成熟的操作流程。Computer Use 让 AI 可以直接复用人类的操作方式，而不需要重新设计一套 API 级别的交互逻辑。

**快速原型验证** 在 API 尚未开发完成时，可以先用 Computer Use 快速验证 AI 应用的可行性，加速产品迭代。

## 核心原理

### 视觉感知与界面理解

Computer Use 的第一步是让 Agent"看到"并"理解"屏幕内容：

```python
# 屏幕截图与界面元素识别
class ScreenPerception:
    def __init__(self, vision_model: MultimodalModel):
        self.vision_model = vision_model

    def capture_and_analyze(self) -> dict:
        """截取屏幕并分析界面元素"""
        # 1. 截取屏幕
        screenshot = self.take_screenshot()

        # 2. 识别界面元素
        elements = self.detect_elements(screenshot)

        # 3. 理解元素语义
        semantic_map = self.understand_semantics(elements)

        return {
            "screenshot": screenshot,
            "elements": elements,        # 按钮、输入框、文本等
            "semantic_map": semantic_map, # 每个元素的含义
            "focus_area": self.identify_focus_area(semantic_map)
        }

    def detect_elements(self, screenshot: Image) -> list[dict]:
        """检测屏幕上的界面元素"""
        # 使用多模态模型识别界面元素
        prompt = """分析这张截图，识别所有可交互的界面元素。
对每个元素返回：
- 类型（button/input/text/dropdown/checkbox 等）
- 位置（x, y, width, height）
- 文本内容
- 可交互性（是否可点击/输入）"""

        return self.vision_model.analyze(screenshot, prompt)
```

界面理解的关键挑战：

- **元素重叠**：弹窗、下拉菜单等可能遮挡其他元素
- **动态内容**：页面内容可能随时间变化
- **分辨率差异**：不同设备的屏幕分辨率不同
- **视觉相似性**：不同功能的按钮可能看起来一样

### 操作规划与执行

Agent 理解界面后，需要规划并执行操作：

```python
class ActionExecutor:
    def __init__(self):
        self.mouse = MouseController()
        self.keyboard = KeyboardController()

    def execute_action(self, action: dict, elements: list[dict]) -> bool:
        """执行界面操作"""
        action_type = action["type"]

        if action_type == "click":
            target = self.find_element(action["target"], elements)
            if target:
                self.mouse.move_to(target["center"])
                self.mouse.click()
                return True

        elif action_type == "type":
            target = self.find_element(action["target"], elements)
            if target:
                self.mouse.move_to(target["center"])
                self.mouse.click()  # 先点击聚焦
                self.keyboard.type(action["text"])
                return True

        elif action_type == "scroll":
            direction = action.get("direction", "down")
            amount = action.get("amount", 300)
            self.mouse.scroll(direction, amount)
            return True

        elif action_type == "shortcut":
            self.keyboard.press_combination(action["keys"])
            return True

        return False

    def find_element(self, description: str, elements: list[dict]) -> dict | None:
        """根据描述找到目标元素"""
        # 语义匹配：找到最符合描述的元素
        best_match = None
        best_score = 0

        for elem in elements:
            score = self.semantic_similarity(description, elem["text"])
            if score > best_score:
                best_score = score
                best_match = elem

        return best_match if best_score > 0.7 else None
```

### 决策循环

Computer Use Agent 的核心是一个**观察-思考-行动**循环：

```python
class ComputerUseAgent:
    def __init__(self, llm: LLM, vision_model: MultimodalModel):
        self.llm = llm
        self.perception = ScreenPerception(vision_model)
        self.executor = ActionExecutor()
        self.max_steps = 50

    def run(self, task: str) -> str:
        """执行计算机操作任务"""
        history = []

        for step in range(self.max_steps):
            # 1. 观察：截取并分析屏幕
            screen_state = self.perception.capture_and_analyze()

            # 2. 思考：决定下一步操作
            action = self.llm.decide_action(
                task=task,
                screen_state=screen_state,
                history=history
            )

            if action["type"] == "done":
                return action.get("result", "任务完成")

            if action["type"] == "failed":
                return f"任务失败：{action.get('reason', '未知原因')}"

            # 3. 行动：执行操作
            success = self.executor.execute_action(
                action, screen_state["elements"]
            )

            history.append({
                "step": step,
                "screen_state": screen_state,
                "action": action,
                "success": success
            })

            # 等待界面更新
            time.sleep(1)

        return "达到最大步骤数，任务未完成"
```

### 坐标系统与操作映射

Computer Use 需要精确的坐标系统来定位操作目标：

```python
# 坐标系统
class CoordinateSystem:
    def __init__(self, screen_width: int, screen_height: int):
        self.width = screen_width
        self.height = screen_height

    def normalize(self, x: int, y: int) -> tuple[float, float]:
        """将绝对坐标归一化到 [0, 1] 范围"""
        return (x / self.width, y / self.height)

    def denormalize(self, nx: float, ny: float) -> tuple[int, int]:
        """将归一化坐标还原为绝对坐标"""
        return (int(nx * self.width), int(ny * self.height))

    def element_center(self, element: dict) -> tuple[int, int]:
        """计算元素中心点坐标"""
        cx = element["x"] + element["width"] // 2
        cy = element["y"] + element["height"] // 2
        return (cx, cy)

# 操作映射
ACTION_MAPPING = {
    "click": {"mouse": "move_and_click", "params": ["x", "y"]},
    "double_click": {"mouse": "move_and_double_click", "params": ["x", "y"]},
    "right_click": {"mouse": "move_and_right_click", "params": ["x", "y"]},
    "type": {"keyboard": "type_text", "params": ["text"]},
    "press_key": {"keyboard": "press_key", "params": ["key"]},
    "scroll": {"mouse": "scroll", "params": ["direction", "amount"]},
    "drag": {"mouse": "drag", "params": ["from_x", "from_y", "to_x", "to_y"]},
    "hover": {"mouse": "move_to", "params": ["x", "y"]},
}
```

## 实施步骤

### 步骤 1：环境准备

配置 Computer Use Agent 的运行环境：

```yaml
# computer_use_config.yaml
environment:
  # 屏幕配置
  screen:
    width: 1920
    height: 1080
    scaling: 1.0  # 显示缩放比例

  # 截图配置
  screenshot:
    format: png
    quality: 85
    max_size_mb: 5  # 最大截图大小

  # 操作配置
  action:
    mouse_speed: normal  # 鼠标移动速度
    typing_delay_ms: 50  # 打字间隔
    action_delay_ms: 500  # 操作间隔等待时间

  # 安全配置
  safety:
    max_steps: 50
    allowed_apps:  # 允许操作的应用白名单
      - chrome
      - excel
      - sap_gui
    blocked_actions:  # 禁止的操作
      - delete_system_files
      - format_disk
      - change_admin_password
```

### 步骤 2：构建 Agent 核心

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict
import pyautogui
from PIL import Image

class ComputerUseState(TypedDict):
    task: str
    screenshot: Image.Image
    screen_elements: list[dict]
    action_plan: list[dict]
    current_action: dict
    history: list[dict]
    result: str
    step_count: int

# 感知节点
def perceive_screen(state: ComputerUseState) -> ComputerUseState:
    """截取屏幕并识别界面元素"""
    # 截图
    screenshot = pyautogui.screenshot()

    # 使用多模态模型分析
    elements = vision_model.analyze_screen(screenshot)

    return {
        "screenshot": screenshot,
        "screen_elements": elements
    }

# 规划节点
def plan_action(state: ComputerUseState) -> ComputerUseState:
    """根据当前屏幕状态规划下一步操作"""
    prompt = f"""任务：{state['task']}

当前屏幕上的元素：
{format_elements(state['screen_elements'])}

历史操作：
{format_history(state['history'])}

请决定下一步操作。可选操作：
- click: 点击某个元素
- type: 在输入框中输入文字
- scroll: 滚动页面
- press_key: 按下键盘快捷键（如 Ctrl+C）
- done: 任务完成
- failed: 任务无法完成

返回 JSON 格式的操作指令。"""

    action = llm.generate(prompt)
    return {"current_action": parse_action(action)}

# 执行节点
def execute_action(state: ComputerUseState) -> ComputerUseState:
    """执行规划的操作"""
    action = state["current_action"]
    elements = state["screen_elements"]

    if action["type"] == "click":
        target = find_element(action["target"], elements)
        if target:
            pyautogui.click(target["center_x"], target["center_y"])
        success = target is not None

    elif action["type"] == "type":
        target = find_element(action["target"], elements)
        if target:
            pyautogui.click(target["center_x"], target["center_y"])
            time.sleep(0.2)
            pyautogui.typewrite(action["text"], interval=0.05)
        success = target is not None

    elif action["type"] == "scroll":
        pyautogui.scroll(action.get("amount", -300))
        success = True

    elif action["type"] == "done":
        return {"result": action.get("message", "任务完成"), "step_count": state["step_count"] + 1}

    elif action["type"] == "failed":
        return {"result": f"任务失败：{action.get('reason')}", "step_count": state["step_count"] + 1}

    else:
        success = False

    # 记录历史
    history_entry = {
        "step": state["step_count"],
        "action": action,
        "success": success
    }

    return {
        "history": state["history"] + [history_entry],
        "step_count": state["step_count"] + 1
    }

# 构建图
graph = StateGraph(ComputerUseState)
graph.add_node("perceive", perceive_screen)
graph.add_node("plan", plan_action)
graph.add_node("execute", execute_action)

graph.set_entry_point("perceive")
graph.add_edge("perceive", "plan")
graph.add_edge("plan", "execute")

def route_next(state: ComputerUseState) -> str:
    if state.get("result"):
        return "end"
    if state["step_count"] >= 50:
        return "end"
    return "perceive"

graph.add_conditional_edges("execute", route_next, {
    "end": END,
    "perceive": "perceive"
})

app = graph.compile()
```

### 步骤 3：配置多模态模型

```python
# 使用多模态模型进行界面理解
class MultimodalInterfaceAnalyzer:
    def __init__(self, model: str = "gpt-4o"):
        self.client = OpenAI()
        self.model = model

    def analyze_screen(self, screenshot: Image.Image) -> list[dict]:
        """分析屏幕截图，返回可交互元素列表"""
        # 将截图编码为 base64
        buffered = io.BytesIO()
        screenshot.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": self._build_analysis_prompt()},
                    {"type": "image_url", "image_url": {
                        "url": f"data:image/png;base64,{img_base64}",
                        "detail": "high"
                    }}
                ]
            }],
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)["elements"]

    def _build_analysis_prompt(self) -> str:
        return """分析这张屏幕截图，识别所有可交互的界面元素。

对每个元素，返回以下信息：
- id: 唯一标识
- type: 元素类型（button/input/text/link/dropdown/checkbox/radio/table）
- text: 元素上显示的文本或标签
- x, y: 元素左上角坐标
- width, height: 元素尺寸
- interactable: 是否可交互（true/false）
- description: 元素的功能描述

以 JSON 格式返回：{"elements": [...]}"""
```

### 步骤 4：实现安全护栏

```python
class ComputerUseGuardrails:
    """Computer Use 安全护栏"""

    def __init__(self):
        self.blocked_shortcuts = [
            ["ctrl", "alt", "delete"],  # 任务管理器
            ["win", "l"],               # 锁屏
            ["alt", "f4"],              # 关闭当前窗口
        ]
        self.blocked_commands = [
            "rm -rf",      # 删除文件
            "format",      # 格式化
            "shutdown",    # 关机
            "del ",        # 删除
        ]

    def validate_action(self, action: dict) -> dict:
        """验证操作是否安全"""
        # 检查键盘快捷键
        if action["type"] == "press_key":
            keys = action.get("keys", [])
            for blocked in self.blocked_shortcuts:
                if set(keys) == set(blocked):
                    return {"safe": False, "reason": f"禁止的快捷键：{keys}"}

        # 检查输入内容
        if action["type"] == "type":
            text = action.get("text", "").lower()
            for blocked in self.blocked_commands:
                if blocked in text:
                    return {"safe": False, "reason": f"检测到危险命令"}

        return {"safe": True}

    def require_confirmation(self, action: dict) -> bool:
        """判断操作是否需要人工确认"""
        high_risk_actions = ["delete", "send", "submit", "publish"]
        return any(kw in action.get("type", "") for kw in high_risk_actions)
```

### 步骤 5：测试与评估

```python
# Computer Use 测试用例
test_cases = [
    {
        "task": "在浏览器中打开 Google 搜索'AI 趋势'",
        "app": "chrome",
        "expected_steps": ["点击浏览器", "输入网址", "等待加载", "点击搜索框", "输入搜索词", "按回车"],
        "max_steps": 15
    },
    {
        "task": "在 Excel 中 A1 单元格输入'Hello'，B1 输入'World'",
        "app": "excel",
        "expected_steps": ["点击 A1", "输入 Hello", "点击 B1", "输入 World"],
        "max_steps": 10
    },
    {
        "task": "在系统设置中关闭屏幕自动锁定",
        "app": "settings",
        "expected_outcome": "blocked",  # 应被安全护栏拦截
        "max_steps": 20
    },
]

def evaluate_computer_use(app, test_cases: list[dict]) -> dict:
    """评估 Computer Use Agent 表现"""
    results = {"total": 0, "success": 0, "avg_steps": 0, "errors": []}

    for case in test_cases:
        results["total"] += 1

        try:
            output = app.invoke({
                "task": case["task"],
                "screenshot": None,
                "screen_elements": [],
                "action_plan": [],
                "current_action": {},
                "history": [],
                "result": None,
                "step_count": 0
            })

            if output.get("result") and "失败" not in output["result"]:
                results["success"] += 1
                results["avg_steps"] += output.get("step_count", 0)

        except Exception as e:
            results["errors"].append({
                "task": case["task"],
                "error": str(e)
            })

    if results["success"] > 0:
        results["avg_steps"] /= results["success"]

    return results
```

### 步骤 6：优化与调优

- **截图优化**：降低分辨率、压缩格式，减少传输延迟
- **元素识别优化**：使用专门的 UI 检测模型（如 UI-TARS）替代通用多模态模型
- **操作加速**：减少不必要的等待时间，并行处理截图和分析
- **缓存机制**：对常见界面布局进行缓存，减少重复分析

## 主流框架对比

| 框架/方案 | 核心机制 | 适用场景 | 优势 | 局限 |
|-----------|---------|---------|------|------|
| **Anthropic Computer Use** | 截图 + Claude 视觉 + 键鼠模拟 | 通用桌面操作 | 官方支持，文档完善 | 仅限 Linux，延迟较高 |
| **OS-Copilot / FRIDAY** | 多模态理解 + 操作规划 | 跨应用任务自动化 | 学术研究，开源 | 需要较多配置 |
| **UI-TARS** | 专用 GUI 理解模型 + 操作 | 界面操作 | 界面识别准确率高 | 模型较大，需要 GPU |
| **OmniParser** | 屏幕解析 + 图标识别 | 界面元素定位 | 轻量级，速度快 | 仅支持元素定位 |
| **SeeAct** | 视觉-语言模型 + 操作 | 网页操作 | 网页场景效果好 | 主要针对网页 |

### Anthropic Computer Use 示例

```python
# 使用 Anthropic Computer Use API
from anthropic import Anthropic

client = Anthropic()

# 定义可用工具（包括计算机操作工具）
tools = [
    {
        "type": "computer_20250124",
        "name": "computer",
        "display_width_px": 1920,
        "display_height_px": 1080,
        "display_number": 1
    }
]

messages = [{
    "role": "user",
    "content": "请打开浏览器，访问 example.com，然后点击 Contact 链接"
}]

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    tools=tools,
    messages=messages
)

# 处理计算机操作请求
for content in response.content:
    if content.type == "tool_use" and content.name == "computer":
        action = content.input["action"]  # click, type, key, etc.
        coordinate = content.input.get("coordinate")

        # 执行对应操作
        if action == "click" and coordinate:
            pyautogui.click(coordinate[0], coordinate[1])
        elif action == "type":
            pyautogui.typewrite(content.input["text"])
        elif action == "key":
            pyautogui.hotkey(*content.input["text"].split("+"))

        # 截取新屏幕并返回
        screenshot = pyautogui.screenshot()
        # 将截图返回给 Claude 继续决策
```

## 最佳实践

### 环境配置

**专用虚拟机** 在虚拟机或容器中运行 Computer Use Agent，避免误操作影响主机系统。

```bash
# 使用 Docker 隔离运行环境
docker run -it --rm \
  -e DISPLAY=:99 \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  computer-use-agent:latest
```

**固定分辨率** 使用固定的屏幕分辨率，避免界面布局变化导致识别失败。

**关闭干扰元素** 关闭桌面通知、屏保、自动更新等可能干扰 Agent 操作的系统功能。

### 提示词设计

```python
# Computer Use 系统提示词
COMPUTER_USE_SYSTEM_PROMPT = """你是一个能够操作计算机的 AI 助手。

操作规则：
1. 每次操作前先观察屏幕，理解当前状态
2. 找到目标元素的准确位置后再操作
3. 操作后等待界面更新，不要连续快速操作
4. 如果操作没有达到预期效果，尝试其他方法
5. 最多尝试 {max_steps} 次

安全规则：
1. 不要删除任何文件
2. 不要修改系统设置
3. 不要关闭正在运行的程序
4. 涉及发送、提交、发布的操作需要用户确认

输出格式：
每次操作请说明：
- 当前看到了什么
- 打算做什么
- 为什么这样做
- 操作结果是否符合预期
"""
```

### 错误处理

```python
class ComputerUseErrorHandler:
    """Computer Use 错误处理"""

    def __init__(self, max_retries: int = 3):
        self.max_retries = max_retries

    def handle_failed_action(self, action: dict, screen_before: Image,
                            screen_after: Image) -> dict:
        """处理操作失败"""
        # 比较操作前后的屏幕变化
        diff = self.calculate_screen_diff(screen_before, screen_after)

        if diff < 0.01:  # 屏幕几乎没有变化
            return {
                "status": "failed",
                "reason": "操作未生效，可能点击位置不正确",
                "suggestion": "尝试重新识别元素位置"
            }

        if self.detect_error_dialog(screen_after):
            return {
                "status": "failed",
                "reason": "操作触发了错误提示",
                "suggestion": "关闭错误提示，尝试替代方案"
            }

        return {"status": "unknown", "suggestion": "继续观察"}

    def recovery_strategy(self, failure: dict) -> dict:
        """制定恢复策略"""
        reason = failure.get("reason", "")

        if "位置不正确" in reason:
            return {"strategy": "re-identify", "action": "重新识别元素位置"}
        elif "元素不存在" in reason:
            return {"strategy": "navigate_back", "action": "返回上一步，重新导航"}
        elif "错误提示" in reason:
            return {"strategy": "dismiss_and_retry", "action": "关闭提示后重试"}
        else:
            return {"strategy": "handoff", "action": "转人工处理"}
```

### 性能优化

**增量截图** 只截取变化区域，减少数据传输量。

**元素缓存** 对稳定界面的元素位置进行缓存，避免每次都重新识别。

**操作批处理** 将多个连续操作合并执行，减少截图和分析次数。

```python
class ActionOptimizer:
    """操作优化器"""

    def optimize_action_sequence(self, actions: list[dict]) -> list[dict]:
        """优化操作序列"""
        optimized = []

        for action in actions:
            if action["type"] == "click":
                # 检查下一个操作是否是输入
                next_action = self.peek_next(actions)
                if next_action and next_action["type"] == "type":
                    # 合并：点击 + 输入
                    optimized.append({
                        "type": "click_and_type",
                        "target": action["target"],
                        "text": next_action["text"]
                    })
                    self.skip_next(actions)
                    continue

            optimized.append(action)

        return optimized
```

## 常见问题与避坑

### Q1：Computer Use 和 API 调用该怎么选？

**优先 API 的场景**：

- 目标系统提供完善的 API
- 对执行速度和稳定性要求高
- 需要批量、高频操作

**适合 Computer Use 的场景**：

- 目标系统没有 API 或 API 不完善
- 需要操作多个不同类型的系统
- 快速原型验证
- 操作人类常用的软件（如 Excel、SAP 等）

### Q2：截图识别准确率不高怎么办？

- **提高截图质量**：使用 PNG 格式、适当分辨率
- **使用专用模型**：UI-TARS 等专用 GUI 理解模型比通用多模态模型更准确
- **添加标注**：在截图上叠加元素标注，帮助模型定位
- **减少干扰**：关闭不必要的桌面元素（通知、悬浮窗等）

### Q3：操作速度太慢如何优化？

- **降低截图频率**：不是每次操作后都需要截图，可以连续操作几次后再检查
- **增量更新**：只截取变化区域
- **预加载模型**：保持模型常驻内存，避免冷启动延迟
- **异步处理**：截图和分析可以异步进行

### Q4：安全性如何保障？

::: warning 警告
Computer Use 让 AI 获得了直接操作计算机的能力，安全风险极高。必须部署完善的安全护栏。
:::

- **虚拟机隔离**：在沙箱环境中运行
- **操作白名单**：只允许操作指定的应用
- **危险操作拦截**：拦截删除文件、修改系统设置等危险操作
- **人工审批**：关键操作（发送、提交、发布）必须人工确认
- **操作审计**：完整记录所有操作，便于事后审查

### Q5：界面变化导致操作失败怎么办？

- **动态重新识别**：每次操作前重新识别元素位置，不依赖缓存
- **容错策略**：操作失败时自动尝试替代方案
- **版本管理**：对不同版本的界面维护不同的操作脚本
- **人工反馈**：收集操作失败案例，持续优化识别模型

## 与其他概念的关系

**核心依赖**：

- [Agent](/glossary/agent) — Computer Use 是 Agent 的一种高级操作模式，Agent 是 Computer Use 的决策主体
- [工具使用](/glossary/tool-use) — Computer Use 本质上是 Agent 使用了一种特殊的"工具"——计算机界面

**技术支撑**：

- [多模态模型](/glossary/multimodal-model) — Computer Use 依赖多模态模型的视觉理解能力
- [规划](/glossary/planning) — Agent 需要规划一系列界面操作来完成复杂任务

**对比方案**：

- [MCP](/glossary/mcp) — MCP 是标准化的 API 接入方案，Computer Use 是无 API 时的替代方案
- [函数调用](/glossary/function-calling) — 函数调用通过 API 操作，Computer Use 通过界面操作，两者互补

## 延伸阅读

- [Anthropic Computer Use 文档](https://docs.anthropic.com/en/docs/build-with-claude/computer-use) - 官方 Computer Use 实现
- [UI-TARS GitHub 仓库](https://github.com/bytedance/UI-TARS) - 专用 GUI 理解模型
- [OS-Copilot 论文](https://arxiv.org/abs/2402.13373) - 面向通用计算机操作的 Agent 框架
- [SeeAct 论文](https://arxiv.org/abs/2401.01614) - 基于视觉-语言模型的网页操作
- [OmniParser GitHub](https://github.com/microsoft/OmniParser) - 微软的屏幕解析工具
- [Agent](/glossary/agent)
- [工具使用](/glossary/tool-use)
- [多模态模型](/glossary/multimodal-model)
