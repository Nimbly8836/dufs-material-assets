/**
 * Static demo mode (GitHub Pages).
 *
 * There is no dufs server behind the demo: scripts/build-demo.js writes a
 * dufs-compatible listing to `<dir>/__dufs_listing.json` for every directory.
 * GitHub Pages ignores query strings, so a `<dir>/?json` request would return
 * the SPA's HTML; rewrite those requests to the pre-generated listing instead.
 */
export const LISTING_FILENAME = '__dufs_listing.json';

export const installDemoFetch = () => {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
        const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href);
        if (url.origin === location.origin && url.searchParams.has('json')) {
            const dir = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
            return nativeFetch(`${dir}${LISTING_FILENAME}`, init);
        }
        return nativeFetch(input, init);
    };
};
