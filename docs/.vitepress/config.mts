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
      { text: 'Prompt', link: '/prompt/' },
      { text: 'RAG', link: '/rag/' },
      { text: 'Agent', link: '/agent/' },
      { text: '微调', link: '/finetuning/' },
      { text: '资源', link: '/resources/' },
      { text: 'GitHub', link: 'https://github.com/zhycn/ai-study' }
    ],
    sidebar: {
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
