/**
 * Build a static, read-only demo for GitHub Pages into `dist-demo/`.
 *
 * GitHub Pages has no dufs server, so this script:
 *   1. builds the app in demo mode (DUFS_DEMO=1, see vite.config.js),
 *   2. copies a selection of this repository as browsable sample content,
 *   3. writes a dufs-compatible JSON listing per directory (src/demo.js
 *      redirects `?json` requests to it),
 *   4. drops the SPA's index.html into every directory and as 404.html so
 *      deep links and refreshes keep working.
 *
 * Env:
 *   DEMO_BASE          URL path the site is served from (default /dufs-material-assets/)
 *   DEMO_DUFS_VERSION  dufs version shown in the footer (default 0.0.0)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'dist-demo';
const LISTING_FILENAME = '__dufs_listing.json';
const BASE = process.env.DEMO_BASE || '/dufs-material-assets/';

// Repository paths shown in the demo. Directory entries are copied recursively.
const CONTENT = ['README.md', 'LICENSE', 'package.json', 'vite.config.js', 'src', 'public', 'patches', '.github'];
// Skip names that would clash with the generated SPA files.
const SKIP = new Set(['index.html', '404.html', LISTING_FILENAME, '.DS_Store']);

const run = (cmd, args, env = {}) => execFileSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });

fs.rmSync(OUT, { recursive: true, force: true });
run('pnpm', ['exec', 'vite', 'build', '--outDir', OUT, '--emptyOutDir'], { DUFS_DEMO: '1', DEMO_BASE: BASE });
const spaHtml = fs.readFileSync(path.join(OUT, 'index.html'), 'utf-8');

/** Copy repository content, skipping files that clash with generated ones. */
const copy = (src, dest) => {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const name of fs.readdirSync(src)) {
            if (!SKIP.has(name)) copy(path.join(src, name), path.join(dest, name));
        }
    } else if (!SKIP.has(path.basename(src))) {
        fs.copyFileSync(src, dest);
        fs.utimesSync(dest, stat.atime, stat.mtime);
    }
};
for (const entry of CONTENT) {
    if (fs.existsSync(entry)) copy(entry, path.join(OUT, entry));
}

/** Count entries the way dufs reports directory "size" (number of children). */
const countChildren = dir => fs.readdirSync(dir).filter(n => !SKIP.has(n)).length;

/** Write `<dir>/__dufs_listing.json` and `<dir>/index.html`, recursively. */
const generate = (dir, href) => {
    const paths = fs.readdirSync(dir, { withFileTypes: true })
        .filter(e => !SKIP.has(e.name) && !(dir === OUT && e.name === 'assets'))
        .map(e => {
            const full = path.join(dir, e.name);
            const stat = fs.statSync(full);
            if (e.isDirectory()) generate(full, `${href}${e.name}/`);
            return {
                path_type: e.isDirectory() ? 'Dir' : 'File',
                name: e.name,
                mtime: Math.round(stat.mtimeMs),
                size: e.isDirectory() ? countChildren(full) : stat.size,
            };
        })
        // dufs lists directories first, then files, each alphabetically.
        .sort((a, b) => (a.path_type === b.path_type ? a.name.localeCompare(b.name) : a.path_type === 'Dir' ? -1 : 1));

    const listing = {
        href,
        kind: 'Index',
        uri_prefix: BASE,
        allow_upload: false,
        allow_delete: false,
        allow_search: false,
        allow_archive: false,
        dir_exists: true,
        auth: false,
        user: null,
        paths,
    };
    fs.writeFileSync(path.join(dir, LISTING_FILENAME), JSON.stringify(listing));
    if (dir !== OUT) fs.writeFileSync(path.join(dir, 'index.html'), spaHtml);
};
generate(OUT, '/');

fs.writeFileSync(path.join(OUT, '404.html'), spaHtml);
// Let files and folders starting with `_` or `.` through (e.g. __dufs_listing.json, .github).
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`Demo built in ${OUT}/ for base ${BASE}`);
