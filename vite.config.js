import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createHtmlPlugin } from 'vite-plugin-html';
import vuetify from 'vite-plugin-vuetify';
import { visualizer } from 'rollup-plugin-visualizer';
import fs from 'node:fs';

const __IS_PROD__ = process.env.NODE_ENV === 'production';
const __DUFS_API_TARGET__ = process.env.DUFS_API_TARGET || 'http://localhost:5000';

// Static demo build for GitHub Pages (see scripts/build-demo.js).
const __DEMO__ = Boolean(process.env.DUFS_DEMO);
const __DEMO_BASE__ = process.env.DEMO_BASE || '/dufs-material-assets/';
const __DEMO_DUFS_VERSION__ = process.env.DEMO_DUFS_VERSION || '0.0.0';
const __DEMO_CONFIG__ = {
    page: { title: 'dufs-material-assets demo' },
    footer: 'Read-only demo hosted on GitHub Pages',
    preferPreview: true,
};

const injectScript = __DEMO__
    ? `
        <script>
            window.__DUFS_PREFIX__ = '${__DEMO_BASE__}__dufs_v${__DEMO_DUFS_VERSION__}__/';
            window.__DUFS_DEMO__ = true;
            window.__DUFS_MATERIAL_CONFIG__ = ${JSON.stringify(__DEMO_CONFIG__)};
        </script>
    `
    : `
        <script>
            window.__DUFS_PREFIX__ = '${__IS_PROD__ ? '__ASSETS_PREFIX__' : '/prefix/__dufs_v0.0.0__/'}';
            ${__IS_PROD__ ? `window.__INITIAL_DATA__ = JSON.parse((e => Uint8Array.fromBase64 ? (new TextDecoder).decode(Uint8Array.fromBase64(e)) : decodeURIComponent(escape(atob(e))))("__INDEX_DATA__"));` : ''}
        </script>
    `;

// https://vitejs.dev/config/
export default defineConfig({
    base: __DEMO__ ? __DEMO_BASE__ : '/',
    plugins: [
        vue(),
        vuetify({
            autoImport: true,
        }),
        createHtmlPlugin({
            minify: {
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                decodeEntities: true,
                removeComments: true,
                removeAttributeQuotes: false,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                removeEmptyAttributes: true,
                useShortDoctype: true,
                processConditionalComments: true,
                sortAttributes: true,
                sortClassName: true,
                minifyCSS: true,
                minifyJS: true,
                minifyURLs: false,
            },
            inject: {
                data: {
                    DUFS_EMBED_FILENAME: process.env.DUFS_EMBED_FILENAME,
                    injectScript,
                },
            },
        }),
    ],
    css: {
        transformer: 'lightningcss',
    },
    build: {
        chunkSizeWarningLimit: Infinity,
        minify: 'oxc',
        cssMinify: 'lightningcss',
        rollupOptions: {
            plugins: [
                visualizer({
                    gzipSize: true,
                    brotliSize: true,
                }),
            ],
            // Fixed, unhashed filenames next to index.html:
            //   DUFS_EMBED_FILENAME  for compiling into dufs (favicon.ico from dufs)
            //   DUFS_FLAT_ASSETS     for `dufs --assets <dir>` releases (keeps vite.svg)
            ...(process.env.DUFS_EMBED_FILENAME || process.env.DUFS_FLAT_ASSETS ? {
                output: {
                    entryFileNames: 'index.js',
                    assetFileNames: '[name][extname]',
                },
            } : {}),
        },
    },
    define: {
        __IS_PROD__,
        __BUILD_TIME__: `"${(new Date).toISOString()}"`,
        __VUE_VERSION__: `"Vue ${JSON.parse(fs.readFileSync('./node_modules/vue/package.json', {encoding: 'utf-8'})).version}"`,
        __VITE_VERSION__: `"Vite ${JSON.parse(fs.readFileSync('./node_modules/vite/package.json', {encoding: 'utf-8'})).version}"`,
        __VUETIFY_VERSION__: `"Vuetify ${JSON.parse(fs.readFileSync('./node_modules/vuetify/package.json', {encoding: 'utf-8'})).version}"`,
    },
    server: {
        proxy: {
            '^/prefix(?:/|$)': {
                target: __DUFS_API_TARGET__,
                bypass: req => req.headers.accept?.includes('text/html') ? req.url : undefined,
            },
        },
    },
});
