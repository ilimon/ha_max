import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'copy-hyperaudio-files',
        closeBundle() {
          const rootDir = __dirname;
          const distDir = path.resolve(rootDir, 'dist');
          const dirsToCopy = ['assets', 'data', 'addons', 'iem', 'speaker', 'docs'];
          for (const dir of dirsToCopy) {
            const srcPath = path.resolve(rootDir, dir);
            const destPath = path.resolve(distDir, dir);
            if (fs.existsSync(srcPath)) {
              fs.cpSync(srcPath, destPath, { recursive: true });
            }
          }
          const filesToCopy = [
            'site.webmanifest',
            'robots.txt',
            'sitemap.xml',
            'SHA256SUMS',
            'README.md',
            'ATTRIBUTION.md',
            'LICENSE',
            'LICENSE.md',
            'LICENSE-MIT',
            'LICENSE-CC-BY-SA-4.0',
            'Google_Grade_HyperAudio_DSP.zip',
            'Finalized_Champion_DSP_Trios.zip',
            'download.html',
          ];
          for (const file of filesToCopy) {
            const srcFile = path.resolve(rootDir, file);
            const destFile = path.resolve(distDir, file);
            if (fs.existsSync(srcFile)) {
              fs.copyFileSync(srcFile, destFile);
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
