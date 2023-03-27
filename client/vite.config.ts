import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import viteTsconfigPaths from 'vite-tsconfig-paths';
// import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 4000,
        open: true
      },
  plugins: [react()],
  build: {
    outDir: 'build',
  }
});
