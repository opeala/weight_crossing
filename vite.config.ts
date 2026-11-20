import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    preprocessorOptions: {
      // Every component's <style lang="scss"> gets the design tokens automatically.
      scss: { additionalData: `@use "@/theme/tokens" as *;\n` },
    },
  },
  server: { port: 5173 },
});
