import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During `npm run dev` the frontend runs on its own port (5173) and
// proxies /api calls to the Express server on port 3000. In production,
// `npm run build` outputs to dist/ and the Express server serves it
// directly from the same port -- no proxy needed there.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
