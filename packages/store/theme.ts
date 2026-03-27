import { defineStore } from 'pinia'
import tinycolor from 'tinycolor2'

const DEFAULT_PRIMARY_COLOR = '#0052D9'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: (localStorage.getItem('theme-mode') || 'light') as 'light' | 'dark',
    primaryColor: localStorage.getItem('theme-primary') || '#0052D9', // 默认值
  }),

  actions: {
    applyTheme(colorHex: string, mode?: 'light' | 'dark') {
      if (mode) this.mode = mode
      this.primaryColor = colorHex

      const root = document.documentElement
      const base = tinycolor(colorHex)
      const isDark = this.mode === 'dark'

      // ==========================================
      // 1. 品牌色阶自动推导 (与 SCSS $p-hover/$p-active 对应)
      // ==========================================
      const brandPalette: Record<string, string> = {
        '--p-1': isDark
          ? base.clone().darken(35).toRgbString()
          : base.clone().lighten(40).toRgbString(),
        '--p-2': base.clone().setAlpha(0.1).toRgbString(),
        '--p-3': base.clone().setAlpha(0.2).toRgbString(),
        '--p-4': base.clone().setAlpha(0.4).toRgbString(),
        '--p-5': isDark
          ? base.clone().lighten(10).toString()
          : base.clone().lighten(5).toString(), // Hover
        '--p-6': colorHex, // Normal
        '--p-7': isDark
          ? base.clone().darken(5).toString()
          : base.clone().darken(10).toString(), // Active
        '--p-8': base.clone().darken(15).toString(),
        '--p-9': base.clone().darken(25).toString(),

        // 辅助语义
        '--p-text': base.isLight() ? '#1D2129' : '#FFFFFF',
        '--p-grad': `linear-gradient(135deg, ${colorHex} 0%, ${base.clone().darken(15).toString()} 100%)`,
        '--p-shadow': base.clone().setAlpha(0.2).toRgbString(),
      }

      // ==========================================
      // 2. 状态色交互推导 (补全 info-hover, danger-hover 等)
      // ==========================================
      const statusBase = {
        success: '#00B42A',
        warning: '#FF7D00',
        danger: '#F53F3F',
        info: '#165DFF',
      }

      const statusPalette: Record<string, string> = {}
      Object.entries(statusBase).forEach(([key, hex]) => {
        const c = tinycolor(hex)
        statusPalette[`--${key}`] = hex
        // 核心：推导交互态
        statusPalette[`--${key}-hover`] = isDark
          ? c.lighten(10).toString()
          : c.darken(10).toString()
      })

      // 补充 link 交互
      statusPalette['--link-hover'] = isDark
        ? base.clone().lighten(15).toString()
        : base.clone().lighten(10).toString()

      // ==========================================
      // 3. 中性色/背景体系
      // ==========================================
      const lightTokens = {
        '--bg-1': '#F7F8FA',
        '--bg-2': '#F5F5F5',
        '--bg-3': '#FFFFFF',
        '--bg-4': '#F2F3F5',
        '--bg-h': 'rgba(0, 0, 0, 0.04)',
        '--bg-s': 'rgba(0, 0, 0, 0.08)',
        '--bg-m': 'rgba(29, 33, 41, 0.6)',
        '--t-1': '#1D2129',
        '--t-2': '#4E5969',
        '--t-3': '#86909C',
        '--t-dis': '#C9CDD4',
        '--b-1': '#E5E6EB',
        '--b-2': '#D3D9E0',
        '--f-1': '#F2F3F5',
        '--f-2': '#E5E6EB',
        '--s-1': '0 2px 8px rgba(0,0,0,0.08)',
        '--s-2': '0 8px 16px rgba(0,0,0,0.12)',
        '--s-3': '0 12px 32px rgba(0,0,0,0.15)',
        '--link': colorHex,
      }

      const darkTokens = {
        '--bg-1': '#121212',
        '--bg-2': '#17171A',
        '--bg-3': '#232324',
        '--bg-4': '#2A2A2B',
        '--bg-h': 'rgba(255, 255, 255, 0.08)',
        '--bg-s': 'rgba(255, 255, 255, 0.12)',
        '--bg-m': 'rgba(0, 0, 0, 0.8)',
        '--t-1': '#F5F5F5',
        '--t-2': '#C9CDD4',
        '--t-3': '#86909C',
        '--t-dis': '#4E5969',
        '--b-1': '#303030',
        '--b-2': '#424242',
        '--f-1': '#2E2E30',
        '--f-2': '#39393B',
        '--s-1': '0 4px 10px rgba(0,0,0,0.3)',
        '--s-2': '0 8px 20px rgba(0,0,0,0.4)',
        '--s-3': '0 16px 40px rgba(0,0,0,0.5)',
        '--link': base.clone().lighten(10).toString(),
      }

      const neutralColors = isDark ? darkTokens : lightTokens

      // ==========================================
      // 4. 统一注入
      // ==========================================
      const allVars = { ...brandPalette, ...statusPalette, ...neutralColors }

      Object.entries(allVars).forEach(([key, val]) => {
        root.style.setProperty(key, val)
      })

      root.classList.toggle('dark-mode', isDark)
      localStorage.setItem('theme-mode', this.mode)
      localStorage.setItem('theme-primary', this.primaryColor)
    },

    initTheme() {
      this.applyTheme(this.primaryColor, this.mode)
    },
    resetDefaultTheme() {
      this.applyTheme(DEFAULT_PRIMARY_COLOR)
    },
  },
})
