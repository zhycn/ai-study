---
title: Token
description: 模型处理文本的基本单位
---

# Token

## 概述

Token（词元）是语言模型处理文本时的基本单位，可以是一个单词、部分单词、字符或特殊符号。模型通过理解和生成 Token 来处理和产生文本。

## 为什么重要

- **计算基础**：Token 是模型计算的基本单元
- **成本计算**：API 调用费用通常按 Token 数量计费
- **上下文限制**：模型能处理的 Token 数量有限
- **语义单元**：Token 的选择影响模型理解效果

## Token 化

- **词级**：将文本分成完整单词
- **子词级**：将单词分成更小的子单元
- **字符级**：按字符分割
- **字节级**：使用字节作为基本单位

## 与其他概念的关系

- 数量受 [上下文窗口](/glossary/context-window) 限制
- 是 [Embedding](/glossary/embedding) 的输入
- 影响 [成本优化](/glossary/cost-optimization) 的关键因素

## 延伸阅读

- [上下文窗口](/glossary/context-window)
- [Embedding](/glossary/embedding)
- [成本优化](/glossary/cost-optimization)
