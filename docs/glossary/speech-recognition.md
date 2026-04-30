---
title: 语音识别
description: Speech Recognition，语音转文本
---

# 语音识别

把你说的话变成文字的技术。手机语音助手、会议自动记录字幕、语音输入法都靠它。现在的语音识别已经很准了，就算有口音、有背景噪音也能识别个八九不离十。

## 概述

语音识别（Speech Recognition），也称为自动语音识别（Automatic Speech Recognition，ASR），是指将人类语音信号转换为文本的技术。它是人机语音交互的输入通道，与 [语音合成](/glossary/text-to-speech) 共同构成完整的语音交互闭环。

语音识别经历了从模板匹配、隐马尔可夫模型（HMM）到深度学习、端到端模型的演进历程。现代语音识别系统在干净语音场景下已经接近甚至超越人类的识别准确率，但在噪声环境、方言、口语化表达等复杂场景下仍有挑战。

语音识别的核心挑战在于：语音信号具有高变异性——同一个人不同时间说同一句话可能不同，不同人说同一句话差异更大，同时还受到环境噪声、信道质量等因素的影响。

## 为什么重要

- **自然输入**：语音是人类最自然的交流方式，比打字更快捷
- **无障碍**：帮助听障人士通过字幕获取语音内容
- **效率提升**：语音输入速度可达 150-200 字/分钟，远超键盘输入
- **多模态交互**：语音是智能音箱、车载系统、IoT 设备的核心交互方式
- **数据价值**：海量语音数据（会议、客服、直播）需要自动转录

::: tip 提示
语音识别的准确率受多种因素影响：环境噪声、说话人口音、领域术语、信道质量等。在实际应用中，针对特定场景进行优化（如客服场景优化行业术语）比追求通用准确率更重要。
:::

## 核心技术原理

### 传统语音识别架构

传统 ASR 系统采用混合架构（Hybrid HMM-DNN）：

```text
音频信号 → 特征提取 → 声学模型 → 解码器 → 文本输出
                        ↑              ↑
                    HMM 状态        语言模型
```

**1. 特征提取（Feature Extraction）**

将原始音频信号转换为适合模型处理的特征：

- **MFCC（Mel-Frequency Cepstral Coefficients）**：模拟人耳听觉的频率响应
- **Filter Bank（Fbank）**：梅尔滤波器组能量
- **采样率**：通常 16kHz（窄带）或 48kHz（宽带）

```python
# 使用 librosa 提取梅尔频谱特征
import librosa
import numpy as np

# 加载音频
audio, sr = librosa.load("speech.wav", sr=16000)

# 提取梅尔频谱
mel_spec = librosa.feature.melspectrogram(
    y=audio, sr=sr, n_mels=80, hop_length=160
)
mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
# mel_spec_db shape: (80, T) - 80 个梅尔频带，T 个时间帧
```

**2. 声学模型（Acoustic Model）**

将声学特征映射为音素或字符的概率分布：

- **HMM-GMM**：隐马尔可夫模型 + 高斯混合模型（早期方案）
- **HMM-DNN**：用 DNN 替代 GMM 计算 HMM 状态概率
- **CTC（Connectionist Temporal Classification）**：端到端对齐损失函数
- **RNN-T（Recurrent Neural Network Transducer）**：流式端到端模型

**3. 语言模型（Language Model）**

提供先验的语言知识，帮助解码器在多个候选中选择最合理的文本：

- **N-gram**：基于统计的传统语言模型
- **Neural LM**：基于神经网络的语模型
- **LLM 融合**：利用大语言模型提升解码质量

### 端到端语音识别

现代 ASR 系统趋向端到端（End-to-End）架构，将声学模型、发音模型和语言模型统一为一个模型：

```text
音频 → 编码器（Encoder）→ 中间表示 → 解码器（Decoder）→ 文本
```

主流端到端架构：

| 架构               | 特点                       | 代表模型                    |
| ------------------ | -------------------------- | --------------------------- |
| CTC                | 简单高效，但独立性假设过强 | DeepSpeech、Wav2Vec 2.0     |
| RNN-T              | 支持流式识别，工业界主流   | Whisper、Conformer          |
| Attention-based    | 精度高，但延迟较高         | LAS、Transformer-Transducer |
| 混合 CTC/Attention | 兼顾训练稳定性和精度       | ESPnet 默认方案             |

### Whisper 模型

OpenAI 的 Whisper 是当前最流行的开源语音识别模型：

- **训练数据**：68 万小时多语言、多任务标注数据
- **架构**：Transformer Encoder-Decoder
- **能力**：99 种语言的语音识别和翻译
- **模型规模**：tiny（39M）到 large（1.5B）

```python
# 使用 OpenAI Whisper 进行语音识别
import whisper

# 加载模型
model = whisper.load_model("large-v3")

# 识别音频
result = model.transcribe(
    "meeting.wav",
    language="zh",           # 指定语言
    task="transcribe",       # transcribe 或 translate
    verbose=False,
    temperature=0.0          # 确定性输出
)

print(result["text"])
# 输出带时间戳的结果
for segment in result["segments"]:
    print(f"[{segment['start']:.1f}s → {segment['end']:.1f}s] {segment['text']}")
```

### 中文语音识别的特殊挑战

- **无空格分词**：中文没有天然的分词边界，需要联合建模分词
- **同音字**：大量同音字需要语言模型辅助消歧
- **方言和口音**：各地方言差异大，普通话不标准
- **中英混说**：日常交流中频繁出现中英文混合

## 主流产品与服务

### 云服务 API

| 服务                  | 厂商      | 特点                |
| --------------------- | --------- | ------------------- |
| Azure Speech          | Microsoft | 100+ 语言，实时转录 |
| Google Speech-to-Text | Google    | 高精度，支持方言    |
| 阿里云语音识别        | 阿里巴巴  | 中文效果优秀        |
| 讯飞语音识别          | 科大讯飞  | 中文 ASR 领导者     |
| 腾讯云语音识别        | 腾讯      | 支持粤语、方言      |

### 开源模型

| 模型        | 厂商       | 参数量     | 特点             |
| ----------- | ---------- | ---------- | ---------------- |
| Whisper     | OpenAI     | up to 1.5B | 多语言，最流行   |
| wav2vec 2.0 | Meta       | 300M       | 自监督预训练     |
| SenseVoice  | 阿里通义   | 150M       | 支持情感识别     |
| Paraformer  | 阿里达摩院 | -          | 非自回归，速度快 |
| Conformer   | -          | -          | 工业界主流架构   |

## 工程实践

### 评估指标

| 指标              | 说明                       | 计算方式           |
| ----------------- | -------------------------- | ------------------ |
| 词错误率（WER）   | 识别错误的词比例           | (S+D+I)/N          |
| 字符错误率（CER） | 识别错误的字符比例         | 中文常用           |
| 实时率（RTF）     | 处理时间/音频时长          | RTF < 1 表示可实时 |
| 首字延迟          | 从说话到输出第一个字的时间 | 流式场景关键指标   |

WER 计算公式：

```
WER = (Substitutions + Deletions + Insertions) / Total Words
```

其中 S 为替换数，D 为删除数，I 为插入数，N 为参考文本的总词数。WER 越低越好。

### 噪声鲁棒性优化

```text
提升噪声环境下的识别准确率：
1. 数据增强：在训练数据中添加噪声、混响
2. 前端处理：降噪、回声消除、波束成形（Beamforming）
3. 多麦克风阵列：利用空间信息增强目标语音
4. 说话人分离：区分不同说话人（Diarization）
```

### 流式识别（Streaming ASR）

流式识别边录音边识别，适用于实时字幕、语音助手等场景：

```python
# 使用 Whisper Streaming 实现流式识别
from whisper_streaming import WhisperStreaming

# 初始化流式识别器
asr = WhisperStreaming(
    model="large-v3",
    language="zh",
    chunk_size=1.0,      # 每次处理 1 秒音频
    latency_threshold=2.0  # 最大延迟 2 秒
)

# 实时处理音频流
for audio_chunk in audio_stream:
    partial_result = asr.process_chunk(audio_chunk)
    if partial_result:
        print(f"实时字幕: {partial_result.text}")
```

### 说话人分离（Speaker Diarization）

识别"谁在什么时候说了什么"：

```text
音频 → 语音活动检测（VAD）→ 说话人分割 → 说话人聚类 → 带说话人标签的转录

输出示例:
[00:00 - 00:15] 说话人A: 大家好，今天我们来讨论一下项目进展
[00:15 - 00:30] 说话人B: 好的，我先汇报一下我这边的情况
```

### 部署优化

```text
模型压缩：
- 量化（INT8/FP16）
- 知识蒸馏（大模型 → 小模型）
- 剪枝（移除冗余参数）

推理加速：
- ONNX Runtime / TensorRT
- 流式推理优化
- GPU/CPU 混合部署

服务架构：
- WebSocket 实时流
- gRPC 批量请求
- 边缘设备部署（移动端、IoT）
```

::: warning 注意
语音数据包含声纹等生物特征信息，属于敏感个人数据。在处理语音数据时，务必遵守 [数据隐私](/glossary/data-privacy) 相关法规，获取用户同意，并采取加密存储和传输措施。
:::

## 与其他概念的关系

- 与 [语音合成](/glossary/text-to-speech) 互补，构成语音交互闭环
- 是 [对话系统](/glossary/conversational-ai) 的输入组件
- 识别结果可作为 [大语言模型](/glossary/llm) 的输入，实现语音对话
- 说话人分离涉及声纹识别，与身份验证相关
- 语音数据需要 [数据隐私](/glossary/data-privacy) 保护

## 延伸阅读

- [Whisper 论文](https://cdn.openai.com/papers/whisper.pdf)
- [wav2vec 2.0 论文](https://arxiv.org/abs/2006.11477)
- [ESPnet 语音识别工具包](https://espnet.github.io/espnet/)
- [OpenAI Whisper GitHub](https://github.com/openai/whisper)
- [语音合成](/glossary/text-to-speech)
- [对话系统](/glossary/conversational-ai)
- [大语言模型](/glossary/llm)
