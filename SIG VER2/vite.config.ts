import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // 청크 사이즈 경고 임계값 (kB) – 무거운 UI 라이브러리를 분리해도
    // 일부 청크는 500 kB를 초과할 수 있으므로 600 kB로 조정
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // MUI + Emotion: 가장 무거운 라이브러리를 별도 청크로 분리
          if (id.includes('node_modules/@mui/') ||
              id.includes('node_modules/@emotion/')) {
            return 'vendor-mui'
          }
          // Radix UI
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-radix'
          }
          // 애니메이션 (motion, gsap)
          if (id.includes('node_modules/motion/') ||
              id.includes('node_modules/gsap/')) {
            return 'vendor-animation'
          }
          // Supabase
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase'
          }
          // React 생태계 (react, react-dom, react-router 등 상호 의존성 있는 패키지 함께 묶음)
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react'
          }
        },
      },
    },
  },
})
