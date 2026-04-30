---
title: 语音合成
description: Text-to-Speech (TTS)，文本转语音
---

# 语音合成

把文字变成"人声"读出来的技术。从导航里的"前方右转"、智能音箱的回复，到有声书自动朗读，好的语音合成几乎听不出是机器在说话，还能模仿不同的音色和情感。

## 概述

语音合成（Text-to-Speech，TTS）是指将文本转换为自然语音的技术，使机器能够以人类声音的方式输出信息。它是人机交互中不可或缺的输出通道，与 [语音识别](/glossary/speech-recognition) 共同构成了完整的语音交互闭环。

现代语音合成技术已经从机械的"机器音"进化到几乎无法与真人区分的自然语音，支持多种音色、情感、语言甚至歌唱。基于深度学习的端到端 TTS 系统能够在保持高自然度的同时，实现实时合成。

TTS 系统的核心挑战在于：如何将离散的文本序列转换为连续的声学信号，同时保持语义的准确传达和听觉的自然流畅。

## 为什么重要

- **无障碍访问**：帮助视障人士获取数字内容，是信息无障碍的重要组成部分
- **解放双手双眼**：驾驶、运动等场景下提供免提信息获取
- **多语言沟通**：实时翻译并合成目标语言语音，打破语言障碍
- **品牌差异化**：定制化的品牌声音（Brand Voice）提升用户体验
- **内容创作**：有声书、播客、视频配音等场景的自动化生产

::: tip 提示
2024 年以来，语音合成进入"克隆时代"——仅需 3-10 秒的参考音频即可克隆目标音色。这带来了巨大的应用潜力，同时也引发了深度伪造（Deepfake）的安全风险。
:::

## 核心技术原理

### 传统 TTS 流程

传统 TTS 系统采用流水线架构：

```text
文本 → 文本规范化 → 音素转换 → 韵律预测 → 声学模型 → 声码器 → 音频波形
```

**1. 文本规范化（Text Normalization）**

将原始文本转换为适合合成的格式：

- 数字转换："2024 年" → "二零二四年"
- 缩写展开："Dr." → "Doctor"
- 多音字消歧："银行" → "yín háng"（而非 "yín xíng"）

**2. 前端处理（Frontend）**

- **分词**：将文本切分为词单元
- **词性标注**：识别词性以辅助韵律预测
- **音素转换（G2P, Grapheme-to-Phoneme）**：将文字转换为音素序列

```python
# 使用 pypinyin 进行中文拼音转换示例
from pypinyin import pinyin, Style

text = "语音合成技术"
result = pinyin(text, style=Style.TONE3)
# [['yu3'], ['yin1'], ['he2'], ['cheng4'], ['ji4'], ['shu4']]
```

**3. 声学模型（Acoustic Model）**

将音素序列转换为声学特征（如梅尔频谱）：

- **Tacotron 2**：基于 Seq2Seq + Attention 的经典架构
- **FastSpeech 2**：非自回归架构，支持快速并行合成
- **VITS**：端到端变分推理模型，直接输出波形

**4. 声码器（Vocoder）**

将声学特征转换为音频波形：

- **WaveNet**：Google 提出的自回归声码器，质量高但速度慢
- **HiFi-GAN**：基于 GAN 的快速声码器，实时合成
- **WaveGlow**：基于流（Flow）的声码器

### 端到端 TTS 架构

现代 TTS 系统趋向端到端（End-to-End）设计，将声学模型和声码器统一为一个模型：

```python
# 使用 Coqui TTS 进行语音合成示例
from TTS.api import TTS

# 加载预训练模型
tts = TTS(model_name="tts_models/zh-CN/baker/tacotron2-DDC-GST",
          progress_bar=False)

# 合成语音并保存
tts.tts_to_file(
    text="你好，欢迎使用语音合成系统。",
    file_path="output.wav",
    speaker="default"
)
```

### 主流模型架构

| 模型         | 架构类型             | 特点                 |
| ------------ | -------------------- | -------------------- |
| Tacotron 2   | Seq2Seq + Attention  | 经典架构，自然度高   |
| FastSpeech 2 | 非自回归 Transformer | 合成速度快，可控性强 |
| VITS         | 变分推理 + Flow      | 端到端，质量最优     |
| Vall-E       | 神经编解码语言模型   | 零样本音色克隆       |
| ChatTTS      | 对话优化 TTS         | 适合对话场景         |
| CosyVoice    | 流匹配 + LLM         | 阿里开源，支持多语言 |
| Fish Speech  | VQ-GAN + LLM         | 开源音色克隆方案     |

## 主流产品与服务

### 云服务 API

| 服务             | 厂商      | 特点                     |
| ---------------- | --------- | ------------------------ |
| Azure TTS        | Microsoft | 100+ 音色，神经语音技术  |
| Google Cloud TTS | Google    | WaveNet 技术，多语言支持 |
| 阿里云 TTS       | 阿里巴巴  | 中文效果优秀，支持方言   |
| 腾讯云 TTS       | 腾讯      | 情感化语音，游戏场景优化 |
| 讯飞 TTS         | 科大讯飞  | 中文语音合成领导者       |

### 开源项目

| 项目        | 特点                                  |
| ----------- | ------------------------------------- |
| Coqui TTS   | 最全面的开源 TTS 框架，支持 100+ 语言 |
| VITS        | 端到端 TTS 的参考实现                 |
| CosyVoice   | 阿里开源，支持零样本音色克隆          |
| Fish Speech | 轻量级音色克隆方案                    |
| OpenVoice   | InstantVoice 的开源实现               |

## 实施步骤

### 从零搭建语音合成服务

**阶段 1：需求分析与技术选型**

| 需求场景       | 推荐方案                    | 理由                           |
| -------------- | --------------------------- | ------------------------------ |
| 高质量有声书   | Azure TTS / 讯飞 TTS        | 自然度高，情感丰富             |
| 实时对话       | CosyVoice / Fish Speech     | 低延迟，支持流式合成           |
| 音色克隆       | CosyVoice / VALL-E          | 零样本克隆，3-10 秒参考音频    |
| 多语言支持     | Google Cloud TTS / Coqui TTS| 100+ 语言覆盖                  |
| 离线部署       | VITS / Coqui TTS            | 开源可本地部署，数据不出域     |

**阶段 2：环境搭建**

```bash
# 使用 Coqui TTS（开源方案）
pip install TTS

# 或使用 CosyVoice
git clone https://github.com/FunAudioLLM/CosyVoice.git
cd CosyVoice
pip install -r requirements.txt

# 下载预训练模型
# CosyVoice 模型约 1GB，支持零样本音色克隆
```

**阶段 3：基础合成**

```python
# 使用 Coqui TTS 进行基础语音合成
from TTS.api import TTS

# 加载中文模型
tts = TTS(model_name="tts_models/zh-CN/baker/tacotron2-DDC-GST", progress_bar=False)

# 基础合成
tts.tts_to_file(
    text="你好，欢迎使用语音合成系统。今天天气真不错。",
    file_path="output.wav"
)

# 使用 CosyVoice 进行音色克隆合成
from cosyvoice.cli.cosyvoice import CosyVoice

model = CosyVoice('pretrained_models/CosyVoice-300M')

# 零样本克隆：提供参考音频即可
output = model.inference_zero_shot(
    text="这是克隆音色后的语音合成效果",
    prompt_text="参考音频中的文本内容",
    prompt_speech_16k=reference_audio  # 3-10 秒参考音频
)
```

**阶段 4：文本前端处理**

```python
# 中文文本规范化处理
import re
from pypinyin import pinyin, Style

def normalize_text(text: str) -> str:
    """文本规范化：数字、缩写、多音字处理"""
    # 数字转中文
    text = re.sub(r'\d+', lambda m: num_to_chinese(m.group()), text)
    # 英文缩写处理
    text = text.replace('Dr.', '医生').replace('Mr.', '先生')
    return text

def handle_polyphone(text: str) -> str:
    """多音字消歧"""
    # 使用词典或规则处理常见多音字
    polyphone_dict = {
        '银行': 'yín háng',
        '行长': 'háng zhǎng',
        '重': {'重要': 'zhòng', '重复': 'chóng'}
    }
    # 根据上下文选择正确读音
    ...
```

**阶段 5：情感与风格控制**

```python
# 情感控制合成
def synthesize_with_emotion(text: str, emotion: str, intensity: float = 0.5):
    """
    情感语音合成
    emotion: happy/sad/angry/surprised/neutral
    intensity: 0.0-1.0 情感强度
    """
    # 方式 1：使用 GST（全局风格令牌）
    # 从参考音频提取风格特征
    style_embedding = extract_style_from_reference(emotion_audio)

    # 方式 2：使用情感嵌入
    emotion_vector = get_emotion_embedding(emotion, intensity)

    # 合成
    audio = tts.synthesize(
        text=text,
        style=style_embedding,
        emotion=emotion_vector
    )
    return audio
```

**阶段 6：服务化部署**

```text
部署架构：
客户端 → API Gateway → TTS 服务 → 声学模型 → 声码器 → 音频流
                            ↓
                      音色库管理
                      文本前端处理

性能指标：
- 实时率（RTF）< 0.5（合成 1 秒音频耗时 < 0.5 秒）
- 首字延迟 < 200ms（流式合成）
- 支持并发请求数 > 100
- 音频质量 MOS > 4.0
```

## 主流框架对比

| 框架/模型    | 类型     | 语言支持    | 音色克隆 | 延迟     | 适用场景               |
| ------------ | -------- | ----------- | -------- | -------- | ---------------------- |
| CosyVoice    | 开源     | 中/英/日等  | 支持     | 中等     | 对话场景，音色克隆     |
| Fish Speech  | 开源     | 多语言      | 支持     | 低       | 轻量级音色克隆         |
| VITS         | 开源     | 多语言      | 不支持   | 低       | 高质量端到端合成       |
| Coqui TTS    | 开源框架 | 100+ 语言   | 部分支持 | 中等     | 多语言通用方案         |
| Azure TTS    | 商业 API | 100+ 语言   | 有限     | 低       | 企业级应用，高可用性   |
| 讯飞 TTS     | 商业 API | 中文/方言   | 支持     | 低       | 中文场景最优           |

## 工程实践

### 评估维度

| 维度                      | 说明                     | 评估方法                       |
| ------------------------- | ------------------------ | ------------------------------ |
| 自然度（MOS）             | 听起来像真人的程度       | 主观评分（Mean Opinion Score） |
| 可懂度（Intelligibility） | 语音内容的可理解程度     | 词正确率测试                   |
| 韵律（Prosody）           | 语调、停顿、重音的自然性 | 主观评价 + 客观指标            |
| 音色相似度                | 与目标音色的接近程度     | 主观评价 + 声纹识别            |
| 实时率（RTF）             | 合成速度与音频时长的比值 | RTF < 1 表示可实时合成         |
| 鲁棒性                    | 处理异常文本的能力       | 特殊字符、多语言混合测试       |

### 多语言与方言支持

```text
多语言 TTS 的关键技术：
1. 统一音素集：构建覆盖多种语言的音素集合
2. 语言嵌入：为每种语言添加语言标识
3. 共享声学模型：多语言数据联合训练
4. 代码切换（Code-Switching）：支持句中语言切换
```

中文方言支持的特殊挑战：

- **粤语**：声调系统（6-9 个声调）比普通话复杂
- **闽南语**：存在大量文白异读
- **吴语**：声调和韵母系统与普通话差异大

### 情感语音合成

让合成语音带有特定情感色彩：

```python
# 情感控制 TTS 示例（伪代码）
tts.synthesize(
    text="你真的太棒了！",
    emotion="happy",        # 情感：happy/sad/angry/surprised
    emotion_intensity=0.8,  # 情感强度 0-1
    speaker="female_warm"   # 音色
)
```

实现方式：

- **全局风格令牌（GST）**：从参考音频提取风格特征
- **情感嵌入**：在模型中添加情感维度的条件输入
- **大模型驱动**：利用 LLM 理解文本情感并指导合成

### 性能优化

```text
合成加速：
- 非自回归模型（FastSpeech 系列）
- 模型量化（INT8/FP16）
- ONNX/TensorRT 部署优化
- 流式合成（边生成边播放）

边缘部署：
- 模型剪枝和蒸馏
- 移动端推理引擎（Core ML、NNAPI）
- WebAssembly 浏览器端合成
```

::: warning 注意
音色克隆技术可能被用于语音诈骗和身份冒充。在涉及金融、身份验证等敏感场景时，务必部署反欺骗（Anti-spoofing）检测系统。
:::

## 常见问题与避坑

### FAQ

**Q1：合成语音听起来不自然、有机械感怎么办？**

- 选择更先进的模型架构（VITS > FastSpeech 2 > Tacotron 2）
- 增加训练数据量和多样性
- 调整韵律参数（语速、音调、停顿）
- 使用情感 TTS 模型，注入情感特征

**Q2：中文多音字读错如何处理？**

- 在文本前端加入多音字消歧模块
- 使用基于上下文的多音字预测模型
- 提供拼音标注作为模型输入
- 对高频错误词建立词典映射

**Q3：如何实现低延迟的实时合成？**

- 使用非自回归模型（FastSpeech 2），支持并行合成
- 流式合成：边生成边播放，不等待完整音频
- 模型量化（INT8）和推理加速（ONNX/TensorRT）
- 预合成常用语句，缓存结果

**Q4：音色克隆需要多少参考音频？**

- 零样本克隆：3-10 秒参考音频即可
- 高质量克隆：建议 30 秒 -3 分钟
- 参考音频要求：清晰无噪音、语速适中、情感中性
- 参考音频的文本内容最好与目标文本风格接近

**Q5：多语言混合（中英混读）如何处理？**

- 使用支持代码切换（Code-Switching）的模型
- 在文本前端识别语言边界，分别处理
- 使用统一音素集，覆盖多种语言的发音
- 部分模型（如 CosyVoice）原生支持中英混读

::: warning 避坑指南
1. **不要忽视文本前端**：TTS 质量 50% 取决于文本规范化处理
2. **不要忽略多音字**：中文场景必须处理多音字消歧
3. **不要直接克隆音色用于商业用途**：需获得音色授权，避免法律风险
4. **不要忽视音频后处理**：添加适当的淡入淡出、降噪处理
5. **不要忽略无障碍设计**：为视障用户提供清晰的语音反馈
:::

## 与其他概念的关系

- 与 [语音识别](/glossary/speech-recognition) 互补，共同构成语音交互闭环
- 是 [对话系统](/glossary/conversational-ai) 的关键输出组件
- 音色克隆涉及 [数据隐私](/glossary/data-privacy) 和身份安全问题
- 多模态场景中可与 [图像生成](/glossary/image-generation) 结合，创建虚拟数字人
- 情感语音合成需要理解文本语义，与 [大语言模型](/glossary/llm) 结合

## 延伸阅读

- [Tacotron 2 论文](https://arxiv.org/abs/1712.05884)
- [VITS 论文](https://arxiv.org/abs/2106.06103)
- [Coqui TTS 文档](https://tts.readthedocs.io/)
- [CosyVoice 项目](https://github.com/FunAudioLLM/CosyVoice)
- [语音识别](/glossary/speech-recognition)
- [对话系统](/glossary/conversational-ai)
- [大语言模型](/glossary/llm)
