---
title: 工程篇
---

# 工程篇：模板化、版本管理与评估

当提示词从实验走向生产，我们需要像管理代码一样管理提示词。工程篇涵盖提示词版本管理、模板化设计、评估体系、A/B 测试、性能优化和监控告警，帮助你将提示词实践从"能用"提升到"好用、可控、可维护"。

## 提示词版本管理

### 为什么需要版本管理

提示词是 AI 应用的核心资产。与代码一样，提示词会随需求变化而迭代，如果没有版本管理，你将面临以下问题：

- **无法追溯变更**：效果变差时不知道是哪次修改导致的
- **难以回滚**：发现问题后无法快速恢复到上一个稳定版本
- **协作混乱**：多人同时修改同一提示词时容易冲突
- **A/B 测试困难**：无法精确对比不同版本的输出质量

**版本管理（Version Control）** 让你能够追踪提示词的每一次变更，记录修改原因、预期效果和实际表现，为持续优化提供数据支撑。

### YAML 配置文件示例

将提示词从硬编码中提取为结构化配置，推荐使用 YAML 格式：

```yaml
# prompts/summarize.yaml
version: 1.2.0
name: summarize
description: 文章摘要生成
template: |
  请用 {num_points} 个要点总结以下文章，每个要点不超过 {max_chars} 字。

  文章：
  """
  {article}
  """
variables:
  num_points:
    type: integer
    default: 3
    description: 要点数量
  max_chars:
    type: integer
    default: 30
    description: 每个要点最大字数
evaluation:
  metrics: [accuracy, completeness, format]
  test_cases: tests/summarize_cases.json
changelog:
  - version: 1.2.0
    date: 2026-04-30
    changes:
      - 添加变量配置
      - 优化模板结构
  - version: 1.1.0
    date: 2026-04-15
    changes:
      - 增加分隔符防止注入
```

这种配置方式的优势在于：

- **模板与变量分离**：修改参数时无需改动模板本身
- **版本内嵌**：配置文件中直接包含版本号和变更日志
- **评估关联**：每个提示词自带测试用例和评估指标

::: tip 提示
建议将提示词配置文件存放在独立的 `prompts/` 目录，与业务代码分离管理。
:::

### Git 集成

将提示词配置文件纳入 Git 版本控制：

```bash
# 初始化提示词仓库
mkdir prompts && cd prompts
git init

# 提交新版本
git add summarize.yaml
git commit -m "feat(prompt): 升级摘要提示词至 v1.2.0

- 添加 num_points 和 max_chars 变量配置
- 使用三引号分隔符防止提示词注入
- 预期效果：摘要格式更统一，注入风险降低"
```

**Commit Message 规范**：

- 使用 `feat(prompt)` 表示新增提示词功能
- 使用 `fix(prompt)` 表示修复提示词问题
- 使用 `perf(prompt)` 表示优化提示词性能
- 在 body 中说明变更原因和预期效果

**PR 审查机制**：

- 提示词变更必须通过 Pull Request 提交
- 审查者需运行关联的测试用例
- 记录输出质量对比结果
- 至少一人批准后方可合并

### 最佳实践

- **每次修改必须更新版本号**：遵循语义化版本（Semantic Versioning）规范，主版本号表示不兼容的模板结构变更，次版本号表示新增变量或功能，修订号表示小幅优化
- **记录变更原因和预期效果**：在 changelog 中说明为什么修改、期望改善什么指标
- **保留历史版本以便回滚**：不要删除旧版本文件，可以移动到 `prompts/archive/` 目录
- **建立标签机制**：使用 Git Tag 标记重要版本，如 `v1.0.0-stable`
- **定期清理废弃版本**：每季度审查一次，移除超过半年未使用的旧版本

## 模板化设计

### 变量替换机制

模板化的核心是**变量替换（Variable Substitution）**，将提示词中的可变部分抽象为占位符，运行时动态填充。

```python
# Python 示例
from string import Template

prompt_template = Template("""
你是一位${role}，请完成以下任务：

${task}

约束条件：
${constraints}
""")

prompt = prompt_template.substitute(
    role='技术文档工程师',
    task='将以下技术文档转换为用户友好的操作指南',
    constraints='- 每步不超过 50 字\n- 避免技术术语'
)
```

```javascript
// JavaScript 示例
const promptTemplate = ({ role, task, constraints }) => `
你是一位${role}，请完成以下任务：

${task}

约束条件：
${constraints}
`

const prompt = promptTemplate({
  role: '技术文档工程师',
  task: '将以下技术文档转换为用户友好的操作指南',
  constraints: '- 每步不超过 50 字\n- 避免技术术语'
})
```

**变量类型**：

| 类型   | 说明     | 示例                           |
| ------ | -------- | ------------------------------ |
| 字符串 | 文本内容 | 角色描述、任务说明             |
| 整数   | 数值参数 | 要点数量、最大字数             |
| 布尔值 | 开关选项 | 是否启用思维链                 |
| 枚举   | 固定选项 | 输出格式（json/markdown/text） |
| 数组   | 列表数据 | Few-shot 示例列表              |

::: warning 注意
变量名使用统一的命名规范，如 `snake_case`，避免使用过于简短的名称（如 `a`、`b`），确保可读性。
:::

### 条件逻辑处理

根据运行时参数选择不同的提示词模板：

```yaml
# router.yaml - 提示词路由配置
templates:
  code_review:
    condition: "${task_type} == 'code_review'"
    template: 'prompts/code_review.yaml'
  summarization:
    condition: "${task_type} == 'summarization'"
    template: 'prompts/summarize.yaml'
  translation:
    condition: "${task_type} == 'translation'"
    template: 'prompts/translate.yaml'
  default:
    template: 'prompts/general.yaml'
```

```python
# Python 路由实现
import yaml

class PromptRouter:
    def __init__(self, config_path):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)

    def get_template(self, task_type):
        for name, rule in self.config['templates'].items():
            if name == 'default':
                continue
            if eval(rule['condition']):
                return self._load_template(rule['template'])
        return self._load_template(self.config['templates']['default']['template'])

    def _load_template(self, path):
        with open(path) as f:
            return yaml.safe_load(f)
```

**适用场景**：

- 多业务线共用一套提示词基础设施
- 根据用户输入自动选择最合适的提示策略
- 灰度发布时按比例路由到不同版本

### 模板继承与组合

通过继承机制减少重复配置：

```yaml
# base.yaml - 基础模板
base_prompt: |
  你是一位 AI 助手，请用中文回答。

  # 任务
  {task}
```

```yaml
# code_review.yaml - 继承基础模板
extends: base.yaml
prompt: |
  {base_prompt}

  # 约束
  - 指出代码中的潜在问题
  - 给出优化建议
  - 提供修改后的代码示例

  # 代码
  """
  {code}
  """
```

```yaml
# translate.yaml - 另一个继承示例
extends: base.yaml
prompt: |
  {base_prompt}

  # 翻译要求
  - 保持原文语气和风格
  - 专业术语保留原文并添加括号标注
  - 输出格式：原文 | 译文

  # 源语言
  source: {source_lang}
  # 目标语言
  target: {target_lang}
  # 原文
  text: |
    {text}
```

**组合策略**：

- **基础层**：通用系统指令、语言设定、安全约束
- **任务层**：特定任务的指令和格式要求
- **实例层**：运行时填充的具体输入数据

### 模板库管理

建立可复用的提示词模板库：

| 模板名称           | 用途     | 变量数 | 版本  | 状态   |
| ------------------ | -------- | ------ | ----- | ------ |
| summarize          | 文章摘要 | 3      | 1.2.0 | 稳定   |
| code_review        | 代码审查 | 2      | 1.0.0 | 测试中 |
| translate          | 翻译优化 | 4      | 2.0.0 | 稳定   |
| qa_generator       | 问答生成 | 3      | 1.1.0 | 稳定   |
| sentiment_analysis | 情感分析 | 2      | 1.0.0 | 草稿   |
| data_extractor     | 数据提取 | 5      | 1.3.0 | 稳定   |

**管理建议**：

- 为每个模板编写 README 说明用途和使用方法
- 定期审查使用频率，移除长期未使用的模板
- 建立模板贡献流程，鼓励团队成员共享优质模板
- 使用标签分类（如 `nlp`、`code`、`data`）便于检索

## 评估体系

### 定义评估指标

没有评估就无法优化。建立多维度的评估指标体系：

| 指标                           | 说明                     | 测量方法                |
| ------------------------------ | ------------------------ | ----------------------- |
| 准确性（Accuracy）             | 输出内容是否正确         | 人工审核 / 自动化对比   |
| 完整性（Completeness）         | 是否覆盖所有要求         | 检查清单匹配            |
| 格式合规（Format Compliance）  | 是否符合指定格式         | 正则 / JSON Schema 验证 |
| 响应时间（Latency）            | 从输入到输出的时间       | 日志记录                |
| Token 效率（Token Efficiency） | 输入输出 Token 比率      | API 返回统计            |
| 一致性（Consistency）          | 相同输入是否产生相同输出 | 多次运行对比            |

::: tip 提示
评估指标应根据业务场景定制。例如代码审查场景应增加"建议可操作性"指标，翻译场景应增加"语义保真度"指标。
:::

### 构建测试集

测试集是评估的基础，需要覆盖典型场景和边界情况：

```json
// tests/summarize_cases.json
[
  {
    "id": "case_001",
    "input": "一篇 500 字的技术文章",
    "variables": {
      "num_points": 3,
      "max_chars": 30
    },
    "expected": {
      "points_count": 3,
      "max_chars_per_point": 30,
      "format": "markdown_list"
    }
  },
  {
    "id": "case_002",
    "input": "一篇 2000 字的论文",
    "variables": {
      "num_points": 5,
      "max_chars": 50
    },
    "expected": {
      "points_count": 5,
      "max_chars_per_point": 50,
      "format": "json"
    }
  },
  {
    "id": "case_003",
    "input": "包含恶意指令的用户输入",
    "variables": {
      "num_points": 3,
      "max_chars": 30
    },
    "expected": {
      "injection_blocked": true,
      "format": "markdown_list"
    }
  }
]
```

**测试集构建原则**：

- **覆盖度**：至少覆盖 80% 的日常使用场景
- **边界值**：包含极短输入、极长输入、空输入等极端情况
- **对抗样本**：包含可能触发提示词注入的恶意输入
- **定期更新**：每月根据线上反馈补充新的测试用例
- **数据脱敏**：测试数据不得包含真实用户隐私信息

### 自动化测试脚本示例

```python
import yaml
import json
import time

def render_template(template_str, variables):
    """渲染提示词模板"""
    for key, value in variables.items():
        template_str = template_str.replace(f'{{{key}}}', str(value))
    return template_str

def call_llm(prompt, model='gpt-4'):
    """调用大语言模型（示例实现）"""
    # 实际项目中替换为真实的 API 调用
    start_time = time.time()
    response = {'content': '模拟响应', 'usage': {'total_tokens': 100}}
    latency = time.time() - start_time
    return response, latency

def validate_response(response, expected):
    """验证输出是否符合预期"""
    results = {}

    # 检查要点数量
    if 'points_count' in expected:
        actual_count = response['content'].count('\n- ')
        results['points_count'] = actual_count == expected['points_count']

    # 检查格式
    if 'format' in expected:
        if expected['format'] == 'json':
            try:
                json.loads(response['content'])
                results['format'] = True
            except json.JSONDecodeError:
                results['format'] = False
        else:
            results['format'] = expected['format'] in response['content']

    return all(results.values()) if results else True

def test_prompt(prompt_file, test_cases_file):
    """运行提示词测试"""
    with open(prompt_file) as f:
        prompt_config = yaml.safe_load(f)

    with open(test_cases_file) as f:
        test_cases = json.load(f)

    results = []
    for case in test_cases:
        # 生成提示词
        variables = case.get('variables', {})
        prompt = render_template(prompt_config['template'], variables)

        # 调用模型
        response, latency = call_llm(prompt)

        # 验证输出
        passed = validate_response(response, case['expected'])
        results.append({
            'case': case['id'],
            'passed': passed,
            'latency': latency,
            'tokens': response.get('usage', {}).get('total_tokens', 0),
        })

    # 汇总统计
    total = len(results)
    passed = sum(1 for r in results if r['passed'])
    avg_latency = sum(r['latency'] for r in results) / total

    return {
        'total': total,
        'passed': passed,
        'pass_rate': f'{passed / total * 100:.1f}%',
        'avg_latency': f'{avg_latency:.2f}s',
        'details': results,
    }

# 运行测试
if __name__ == '__main__':
    report = test_prompt('prompts/summarize.yaml', 'tests/summarize_cases.json')
    print(f'通过率: {report["pass_rate"]}')
    print(f'平均延迟: {report["avg_latency"]}')
```

**测试报告示例**：

```
测试报告 - summarize v1.2.0
==================
总用例: 30
通过: 27
通过率: 90.0%
平均延迟: 1.23s
平均 Token: 450

失败用例:
- case_015: 格式验证失败（期望 JSON，实际 Markdown）
- case_023: 要点数量不符（期望 5，实际 4）
- case_028: 响应超时（>10s）
```

## A/B 测试

### 实验设计

**A/B 测试（A/B Testing）** 是对比两个提示词版本效果的标准方法：

1. **准备两个版本**：版本 A（当前线上版本）和版本 B（待验证新版本）
2. **控制变量**：除提示词本身外，其他条件（模型、温度参数、测试集）保持一致
3. **随机分配**：如果在线上环境测试，将流量随机分配到两个版本
4. **记录输出**：保存每个版本的完整输出用于后续分析

::: warning 注意
A/B 测试期间不要频繁修改提示词，否则无法判断效果变化是由版本差异还是中途修改导致的。
:::

### 对比指标

| 维度         | 版本 A | 版本 B | 胜出 |
| ------------ | ------ | ------ | ---- |
| 准确率       | 85%    | 92%    | B    |
| 平均响应时间 | 1.2s   | 1.5s   | A    |
| Token 消耗   | 120    | 150    | A    |
| 用户满意度   | 4.2/5  | 4.6/5  | B    |
| 格式合规率   | 88%    | 95%    | B    |

**综合评估**：版本 B 在准确率、用户满意度和格式合规率上显著优于版本 A，虽然响应时间和 Token 消耗略高，但整体收益更大，建议升级到版本 B。

### 统计显著性

仅凭直觉判断不够可靠，需要使用统计学方法验证：

- **样本量**：至少 30 个测试样本，推荐 50-100 个
- **假设检验**：使用 t 检验（t-test）判断差异是否显著
- **显著性水平**：p < 0.05 认为差异显著
- **效应量**：除了 p 值，还需关注实际差异大小（Cohen's d）

### 示例流程

```
1. 定义假设：版本 B 比版本 A 准确率更高
2. 收集数据：使用相同测试集运行 50 个测试用例
3. 统计分析：
   - 版本 A 准确率：85%（42.5/50）
   - 版本 B 准确率：92%（46/50）
   - t 检验结果：t = 2.15, p = 0.03
4. 得出结论：p = 0.03 < 0.05，差异显著，假设成立
5. 部署版本 B：将版本 B 设为线上默认版本
6. 持续监控：部署后继续观察一周，确认效果稳定
```

**Python 统计示例**：

```python
from scipy import stats

# 两个版本的准确率数据（每个数据点是一个测试用例的得分 0 或 1）
version_a = [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1,
             1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
             1, 0, 1, 1, 1, 1, 1, 1, 0, 1]
version_b = [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
             1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
             1, 1, 1, 1, 1, 1, 1, 1, 1, 0]

# 独立样本 t 检验
t_stat, p_value = stats.ttest_ind(version_a, version_b)

print(f't 统计量: {t_stat:.3f}')
print(f'p 值: {p_value:.3f}')
print(f'差异显著: {"是" if p_value < 0.05 else "否"}')
```

## 性能优化

### Token 效率

**Token** 是大语言模型处理文本的基本单位，直接影响调用成本和响应速度。优化 Token 效率的策略：

**精简提示词**：

```yaml
# 优化前（冗余描述）
template: |
  你是一位非常专业、非常有经验的 AI 助手，你的任务是帮助用户总结文章。
  请你仔细阅读用户提供的文章内容，然后根据你的专业知识，
  用简洁明了的语言总结出文章的几个核心要点。
  请注意，你总结的每个要点都应该能够准确反映原文的主要意思。

# 优化后（精简表达）
template: |
  请用 {num} 个要点总结以下文章，每点不超过 {chars} 字。
  文章：
  """
  {article}
  """
```

优化前约 80 Token，优化后约 40 Token，节省 50%。

**其他优化技巧**：

- 使用缩写和缩写词（在模型能理解的前提下）
- 减少示例数量到最低有效值（通常 1-3 个足够）
- 移除重复的约束条件
- 使用结构化格式（如 YAML、JSON）替代冗长的自然语言描述

### 缓存友好型提示

**缓存（Caching）** 可以显著降低重复请求的成本。设计缓存友好的提示词：

```yaml
# 设计缓存友好的提示词
cache_key_template: 'summarize:{model}:{num_points}:{max_chars}'

# 相同配置的请求可以复用缓存
# 例如：summarize:gpt-4:3:30 的缓存可以被所有相同参数的请求复用
```

**缓存策略**：

| 策略     | 说明                          | 适用场景                   |
| -------- | ----------------------------- | -------------------------- |
| 精确匹配 | 提示词完全相同时复用缓存      | 固定模板 + 固定参数        |
| 语义缓存 | 使用 Embedding 判断输入相似度 | 用户输入变化但意图相同     |
| 部分缓存 | 缓存提示词的前缀部分          | 系统指令固定，用户输入变化 |

::: tip 提示
语义缓存需要使用 Embedding 模型将输入转换为向量，然后计算余弦相似度。相似度超过阈值（如 0.95）时复用缓存。
:::

### 批量处理策略

**批量处理（Batch Processing）** 可以 amortize（分摊）网络延迟和 API 调用开销：

```python
# 批量处理多个输入
batch_inputs = [article1, article2, article3, ...]
batch_prompts = [render_template(template, {'article': inp}) for inp in batch_inputs]

# 方式一：并发调用（适合实时性要求高的场景）
import asyncio

async def call_llm_async(prompt):
    # 异步调用 API
    pass

async def batch_process(prompts):
    tasks = [call_llm_async(p) for p in prompts]
    return await asyncio.gather(*tasks)

# 方式二：批量 API（适合离线处理场景）
# 部分 API 支持批量请求，如 OpenAI Batch API
batch_response = call_llm_batch(batch_prompts)
```

**批量大小建议**：

- 实时场景：5-10 个/批
- 离线场景：50-100 个/批
- 注意不要超过 API 的速率限制（Rate Limit）

### 成本估算

| 任务     | 单次 Token | 每日调用量 | 月度成本（$） |
| -------- | ---------- | ---------- | ------------- |
| 摘要生成 | 500        | 1000       | 15            |
| 代码审查 | 800        | 500        | 20            |
| 翻译     | 600        | 2000       | 60            |
| 问答生成 | 400        | 3000       | 60            |
| 情感分析 | 300        | 5000       | 75            |

**成本优化建议**：

- 优先使用小模型处理简单任务（如分类、情感分析）
- 复杂任务再使用大模型（如推理、创作）
- 利用缓存减少重复调用
- 定期审查 Token 使用报告，识别异常消耗

## 监控与告警

### 输出质量监控

生产环境中需要持续监控提示词输出质量：

**关键指标记录**：

- 每次请求的输入 Token 数和输出 Token 数
- 响应时间（从发送请求到收到响应）
- 输出格式验证结果（是否通过 JSON Schema 校验等）
- 用户反馈评分（如有）

**质量阈值设置**：

```yaml
quality_thresholds:
  format_compliance_rate: 0.90 # 格式合规率低于 90% 告警
  avg_latency_ms: 5000 # 平均延迟超过 5 秒告警
  error_rate: 0.05 # 错误率超过 5% 告警
  user_satisfaction: 3.5 # 用户满意度低于 3.5/5 告警
```

**定期报告**：

- 每日生成质量日报，汇总关键指标
- 每周生成趋势分析，识别指标变化
- 每月生成优化建议，指导下一步改进

### 异常检测

| 异常类型   | 检测方式          | 处理策略            |
| ---------- | ----------------- | ------------------- |
| 输出过长   | 超过预期长度 2 倍 | 截断 + 重新生成     |
| 格式错误   | JSON 解析失败     | 重试 + 记录日志     |
| 响应超时   | 超过 10 秒        | 降级到简化提示词    |
| 内容违规   | 敏感词检测        | 拦截 + 人工审核     |
| Token 超限 | 超过上下文窗口    | 截断输入 + 重新生成 |
| 模型降级   | 输出质量突降      | 切换到备用模型      |

::: warning 警告
内容违规检测必须包含敏感词过滤和人工审核环节，自动化检测不能完全替代人工判断。
:::

### 自动降级策略

当主提示词出现问题时，自动切换到备用版本：

```yaml
fallback_chain:
  - primary: 'prompts/v2/summarize.yaml'
    description: '最新版本，使用思维链推理'
  - secondary: 'prompts/v1/summarize.yaml'
    description: '稳定版本，简单直接'
  - fallback: 'prompts/simple/summarize.yaml'
    description: '降级版本，最小化 Token 消耗'
```

```python
# 降级实现示例
class PromptExecutor:
    def __init__(self, fallback_chain):
        self.fallback_chain = fallback_chain

    def execute(self, variables, max_retries=2):
        for level in self.fallback_chain:
            try:
                prompt = self._load_template(level['primary'])
                response = self._call_llm(prompt, variables)
                if self._validate(response):
                    return response
            except Exception as e:
                print(f'降级: {level["description"]}, 原因: {e}')
                continue
        raise RuntimeError('所有提示词版本均执行失败')
```

**降级触发条件**：

- 连续 3 次请求失败
- 输出质量低于阈值
- 模型 API 返回错误状态码
- 响应时间超过 SLA 约定

## 与其他概念的关系

- [版本管理](/glossary/versioning) 是提示词工程的基础实践，确保每次变更可追溯、可回滚
- [缓存](/glossary/caching) 可以显著降低重复请求的成本，提升响应速度
- [成本优化](/glossary/cost-optimization) 通过 Token 效率和批量处理实现
- [可观测性](/glossary/observability) 提供质量监控和异常检测能力
- [模型评估](/glossary/model-evaluation) 为提示词评估提供方法论支撑
- [批量处理](/glossary/batch-processing) 是提升吞吐量的关键手段

## 延伸阅读

- 上一篇：[进阶篇](/prompt/advanced) — 学习思维链、ReAct、提示词链等高级推理模式
- 下一篇：[安全篇](/prompt/security) — 学习提示词注入防护、幻觉防护、敏感信息处理
- 下一篇：[模式库](/prompt/patterns) — 获取可复用的提示词模板
- [LangSmith 提示词管理](https://docs.smith.langchain.com/) — LangChain 官方的提示词追踪和评估平台
- [PromptLayer](https://www.promptlayer.com/) — 提示词版本管理和 A/B 测试工具
- [OpenAI Evals](https://github.com/openai/evals) — OpenAI 开源的评估框架
- [Ragas](https://docs.ragas.io/) — RAG 应用评估框架，也可用于提示词评估
