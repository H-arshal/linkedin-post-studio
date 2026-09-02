import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), react()],
  base: command === 'build' ? '/linkedin-post-studio/' : '/',
}))
