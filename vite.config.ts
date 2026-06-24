import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// base path para o GitHub Pages servir os assets em /agenda-filarmonica/.
// Em dev usa-se '/' para o servidor local funcionar na raiz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/agenda-filarmonica/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Agenda Filarmónica',
        short_name: 'Agenda',
        description: 'Agenda e controlo de assiduidade para bandas filarmónicas',
        display: 'standalone',
        background_color: '#2b6cb0',
        theme_color: '#2b6cb0',
        start_url: '.',
        // Ícones por adicionar — coloca PNGs em public/ e referencia-os aqui.
        icons: [],
      },
    }),
  ],
}));
