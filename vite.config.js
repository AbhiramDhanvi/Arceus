import { defineConfig, loadEnv } from 'vite';
import { voiceMiddleware } from './server/voice.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['SARVAM_']);
  const attach = (server) => {
    server.middlewares.use('/api/voice', voiceMiddleware(env.SARVAM_API_KEY));
  };
  return {
    plugins: [{ name: 'arceus-local-voice', configureServer: attach, configurePreviewServer: attach }],
    build: {
      rolldownOptions: {
        output: { codeSplitting: { groups: [{ name: 'supabase-client', test: /[\\/]@supabase[\\/]/, priority: 10 }] } },
      },
    },
  };
});
