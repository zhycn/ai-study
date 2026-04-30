import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import { katex } from '@mdit/plugin-katex'
import container from 'markdown-it-container'

export default withPwa(defineConfig({
  lang: 'zh-CN',
  title: 'AI Study',
  description: 'AI 学习笔记与资源整理',
  base: '/ai-study/',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://zhycn.github.io/ai-study/'
  },
  vite: {},
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg'],
    manifest: {
      name: 'AI Study',
      short_name: 'AI Study',
      description: 'AI 学习笔记与资源整理',
      theme_color: '#6366f1',
      icons: [
        {
          src: '/ai-study/favicon.svg',
          sizes: '32x32',
          type: 'image/svg+xml'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}']
    }
  },
  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true
    },
    config: (md) => {
      md.use(katex)
      md.use(container, 'card-grid')
      md.use(container, 'steps')
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['meta', { name: 'msapplication-TileColor', content: '#6366f1' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous'
      }
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
      }
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: 'AI Study' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '词条', link: '/glossary/' },
      { text: 'Prompt', link: '/prompt/' },
      { text: 'RAG', link: '/rag/' },
      { text: 'Agent', link: '/agent/' },
      { text: '微调', link: '/finetuning/' },
      { text: '资源', link: '/resources/' },
      { text: 'GitHub', link: 'https://github.com/zhycn/ai-study' }
    ],
    sidebar: {
      '/glossary/': [
        {
          text: 'AI 词条',
          collapsed: true,
          items: [
            { text: '总览', link: '/glossary/' }
          ]
        },
        {
          text: '基础概念',
          collapsed: true,
          items: [
            { text: 'AI', link: '/glossary/ai' },
            { text: '机器学习', link: '/glossary/machine-learning' },
            { text: '深度学习', link: '/glossary/deep-learning' },
            { text: '神经网络', link: '/glossary/neural-network' },
            { text: '生成式 AI', link: '/glossary/generative-ai' }
          ]
        },
        {
          text: '模型与架构',
          collapsed: true,
          items: [
            { text: '大语言模型', link: '/glossary/llm' },
            { text: 'Transformer', link: '/glossary/transformer' },
            { text: '多模态模型', link: '/glossary/multimodal-model' },
            { text: '开源模型', link: '/glossary/open-source-model' },
            { text: '闭源模型', link: '/glossary/proprietary-model' }
          ]
        },
        {
          text: '核心技术',
          collapsed: true,
          items: [
            { text: '自然语言处理', link: '/glossary/nlp' },
            { text: '计算机视觉', link: '/glossary/computer-vision' },
            { text: '强化学习', link: '/glossary/reinforcement-learning' },
            { text: '迁移学习', link: '/glossary/transfer-learning' },
            { text: '联邦学习', link: '/glossary/federated-learning' }
          ]
        },
        {
          text: '交互与工程',
          collapsed: true,
          items: [
            { text: '提示词工程', link: '/glossary/prompt-engineering' },
            { text: 'RAG', link: '/glossary/rag' },
            { text: 'Agent', link: '/glossary/agent' },
            { text: 'MCP', link: '/glossary/mcp' },
            { text: '微调', link: '/glossary/fine-tuning' },
            { text: '函数调用', link: '/glossary/function-calling' },
            { text: '工作流', link: '/glossary/workflow' }
          ]
        },
        {
          text: '关键概念',
          collapsed: true,
          items: [
            { text: 'Token', link: '/glossary/token' },
            { text: 'Embedding', link: '/glossary/embedding' },
            { text: '注意力机制', link: '/glossary/attention' },
            { text: '上下文窗口', link: '/glossary/context-window' },
            { text: '幻觉', link: '/glossary/hallucination' },
            { text: '温度', link: '/glossary/temperature' },
            { text: '思维链', link: '/glossary/chain-of-thought' },
            { text: '对齐', link: '/glossary/alignment' },
            { text: '基准测试', link: '/glossary/benchmark' }
          ]
        },
        {
          text: '工具与基础设施',
          collapsed: true,
          items: [
            { text: '向量数据库', link: '/glossary/vector-database' },
            { text: '知识图谱', link: '/glossary/knowledge-graph' },
            { text: 'GPU', link: '/glossary/gpu' },
            { text: 'TPU', link: '/glossary/tpu' },
            { text: 'API', link: '/glossary/api' }
          ]
        },
        {
          text: 'Agent 生态',
          collapsed: true,
          items: [
            { text: '多 Agent 系统', link: '/glossary/multi-agent' },
            { text: 'Agent 编排', link: '/glossary/agent-orchestration' },
            { text: '工具使用', link: '/glossary/tool-use' },
            { text: '规划', link: '/glossary/planning' },
            { text: '记忆', link: '/glossary/memory' },
            { text: 'Skills', link: '/glossary/skills' },
            { text: 'Commands', link: '/glossary/commands' },
            { text: '人机协作', link: '/glossary/human-in-the-loop' },
            { text: '自主 Agent', link: '/glossary/autonomous-agent' }
          ]
        },
        {
          text: '工程与实践',
          collapsed: true,
          items: [
            { text: '模型评估', link: '/glossary/model-evaluation' },
            { text: '可观测性', link: '/glossary/observability' },
            { text: '缓存', link: '/glossary/caching' },
            { text: '流式输出', link: '/glossary/streaming' },
            { text: '批处理', link: '/glossary/batch-processing' },
            { text: '成本优化', link: '/glossary/cost-optimization' },
            { text: '延迟优化', link: '/glossary/latency-optimization' },
            { text: '版本管理', link: '/glossary/versioning' }
          ]
        },
        {
          text: '安全与伦理',
          collapsed: true,
          items: [
            { text: 'AI 安全', link: '/glossary/ai-safety' },
            { text: '提示词注入', link: '/glossary/prompt-injection' },
            { text: '数据隐私', link: '/glossary/data-privacy' },
            { text: '偏见', link: '/glossary/bias' },
            { text: '内容审核', link: '/glossary/content-moderation' },
            { text: '红队测试', link: '/glossary/red-teaming' },
            { text: '可解释性', link: '/glossary/explainability' },
            { text: '版权', link: '/glossary/copyright' }
          ]
        },
        {
          text: '行业与应用',
          collapsed: true,
          items: [
            { text: '对话系统', link: '/glossary/conversational-ai' },
            { text: '代码生成', link: '/glossary/code-generation' },
            { text: '图像生成', link: '/glossary/image-generation' },
            { text: '语音合成', link: '/glossary/text-to-speech' },
            { text: '语音识别', link: '/glossary/speech-recognition' },
            { text: 'AI 搜索', link: '/glossary/ai-search' },
            { text: '推荐系统', link: '/glossary/recommendation-system' },
            { text: '数据分析', link: '/glossary/data-analysis' }
          ]
        },
        {
          text: '模型优化',
          collapsed: true,
          items: [
            { text: '量化', link: '/glossary/quantization' },
            { text: '蒸馏', link: '/glossary/distillation' },
            { text: '剪枝', link: '/glossary/pruning' }
          ]
        }
      ],
      '/prompt/': [
        {
          text: 'Prompt Engineering',
          collapsed: false,
          items: [
            { text: '概览', link: '/prompt/' },
            { text: '基础技巧', link: '/prompt/basics' },
            { text: '高级技巧', link: '/prompt/advanced' }
          ]
        }
      ],
      '/rag/': [
        {
          text: 'RAG',
          collapsed: false,
          items: [
            { text: '概览', link: '/rag/' },
            { text: 'RAG 基础', link: '/rag/basics' },
            { text: '进阶实践', link: '/rag/advanced' }
          ]
        }
      ],
      '/agent/': [
        {
          text: 'AI Agent',
          collapsed: false,
          items: [
            { text: '概览', link: '/agent/' },
            { text: '框架对比', link: '/agent/framework' },
            { text: '实战案例', link: '/agent/practice' }
          ]
        }
      ],
      '/finetuning/': [
        {
          text: '模型微调',
          collapsed: false,
          items: [
            { text: '概览', link: '/finetuning/' },
            { text: 'SFT 监督微调', link: '/finetuning/sft' },
            { text: 'LoRA / QLoRA', link: '/finetuning/lora' }
          ]
        }
      ],
      '/resources/': [
        {
          text: '资源整理',
          collapsed: false,
          items: [
            { text: '资源导航', link: '/resources/' },
            { text: '常用工具', link: '/resources/tools' },
            { text: '课程推荐', link: '/resources/courses' },
            { text: '论文追踪', link: '/resources/papers' }
          ]
        }
      ]
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索'
              },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '重置搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '输入',
                  navigateText: '导航',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc'
                }
              }
            }
          }
        },
        miniSearch: {
          options: {
            tokenize: (text: string) => text.match(/[\p{L}\p{N}]+/gu) ?? []
          }
        }
      }
    },
    editLink: {
      pattern: 'https://github.com/zhycn/ai-study/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2026 zhycn'
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    notFound: {
      quote: '抱歉，您访问的页面不存在或已被移除',
      linkLabel: '返回首页',
      linkText: '回到首页'
    },
    externalLinkIcon: true,
    socialLinks: [{ icon: 'github', link: 'https://github.com/zhycn/ai-study' }]
  }
}))
