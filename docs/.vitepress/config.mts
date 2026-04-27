import { defineConfig } from 'vitepress'
import { withPwa } from '@vite-pwa/vitepress'
import { katex } from '@mdit/plugin-katex'
import container from 'markdown-it-container'

export default withPwa(defineConfig({
  lang: 'zh-CN',
  title: 'VitePress Starter',
  description: '开箱即用的 VitePress 文档站点',
  base: '/VitePress-starter/',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://zhycn.github.io/VitePress-starter/'
  },
  vite: {},
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg'],
    manifest: {
      name: 'VitePress Starter',
      short_name: 'VitePress',
      description: '开箱即用的 VitePress 文档站点',
      theme_color: '#e8740c',
      icons: [
        {
          src: '/VitePress-starter/favicon.svg',
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
    ['meta', { name: 'theme-color', content: '#e8740c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['meta', { name: 'msapplication-TileColor', content: '#e8740c' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    // Google Fonts - Noto Sans SC
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
    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: 'VitePress Starter' }],
    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/config' },
      { text: '示例', link: '/examples/markdown' },
      {
        text: '更多',
        items: [
          { text: 'Markdown 扩展', link: '/markdown-examples' },
          { text: '运行时 API', link: '/api-examples' },
          { text: 'GitHub', link: 'https://github.com/zhycn/VitePress-starter' }
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '配置指南', link: '/guide/config' },
            { text: '性能优化', link: '/guide/performance' },
            { text: '多版本文档', link: '/guide/versioning' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          collapsed: false,
          items: [
            { text: '配置 API', link: '/api/config' },
            { text: '运行时 API', link: '/api/runtime' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          collapsed: false,
          items: [
            { text: 'Markdown 扩展', link: '/examples/markdown' },
            { text: '组件示例', link: '/examples/components' },
            { text: '数学公式', link: '/examples/katex' }
          ]
        }
      ],
      '/': [
        {
          text: '示例',
          collapsed: false,
          items: [
            { text: 'Markdown 扩展', link: '/markdown-examples' },
            { text: '运行时 API', link: '/api-examples' }
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
      pattern: 'https://github.com/zhycn/VitePress-starter/edit/main/docs/:path',
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
    socialLinks: [{ icon: 'github', link: 'https://github.com/zhycn/VitePress-starter' }]
  }
}))
