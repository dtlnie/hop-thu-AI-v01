
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Ép kiểu về string để tránh lỗi reference tại runtime
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Tăng giới hạn cảnh báo dung lượng chunk
  },
  server: {
    port: 3000,
  }
});
