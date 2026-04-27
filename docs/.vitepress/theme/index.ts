import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Card from './components/Card.vue'
import Badge from './components/Badge.vue'
import type { EnhanceAppContext } from 'vitepress'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('Card', Card)
    app.component('Badge', Badge)
  }
}
