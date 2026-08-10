import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const comfyUiTarget = env.VITE_COMFYUI_BASE_URL;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // The browser talks to the same-origin path below; Vite forwards it to
      // the real ComfyUI instance server-to-server. This sidesteps CORS,
      // since ComfyUI doesn't send Access-Control-Allow-Origin by default.
      proxy:
        comfyUiTarget !== undefined && comfyUiTarget.length > 0
          ? {
              '/comfyui-api': {
                target: comfyUiTarget,
                changeOrigin: true,
                ws: true,
                rewrite: (path: string) => path.replace(/^\/comfyui-api/, ''),
              },
            }
          : undefined,
    },
  };
});
