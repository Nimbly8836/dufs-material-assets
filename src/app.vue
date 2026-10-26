<template>
    <v-app :style="background ? {
        backgroundImage: `url(${background})`,
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
    } : undefined">
        <v-app-bar color="surface" class="app-shell-bar" :style="glassmorphism">
            <template v-slot:prepend>
                <img v-if="logo" :src="logo" height="40" style="margin-left:20px">
            </template>
            <v-app-bar-title v-if="title">{{ title }}</v-app-bar-title>

            <template v-slot:append>
                <v-tooltip :text="isDark ? '切换到浅色模式' : '切换到深色模式'">
                    <template v-slot:activator="{ props }">
                        <v-btn
                            v-bind="props"
                            variant="text"
                            :icon="isDark ? '$mdiWhiteBalanceSunny' : '$mdiWeatherNight'"
                            :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
                            @click="toggleTheme"
                        ></v-btn>
                    </template>
                </v-tooltip>
                <div id="app-bar-append"></div>
            </template>
        </v-app-bar>

        <v-main>
            <v-container class="app-shell-container">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component v-if="$route?.meta?.keepAlive" :is="Component" :key="$route.fullPath"></component>
                    </keep-alive>
                    <component v-if="!$route?.meta?.keepAlive" :is="Component"></component>
                </router-view>
            </v-container>
        </v-main>

        <!--
            感谢你使用 dufs-material-assets！如果我看到有其他人也在使用的话会很开心的！
            因此希望你可以保留页脚的项目链接，它不会影响美观，同时也是对我（以及 dufs 的原作者）的鼓励和支持～
        -->
        <footer class="app-shell-footer text-body-small text-grey text-center mb-8" v-html="footer"></footer>
    </v-app>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useTheme } from 'vuetify';
import { marked, Renderer } from 'marked';
import { pathPrefix, dufsVersion } from './common.js';
import renderer from './marked-renderer.js';

const matchDark = matchMedia('(prefers-color-scheme:dark)');
const systemIsDark = ref(matchDark.matches);
const savedTheme = localStorage.getItem('dufs-theme');
const themePreference = ref(['system', 'light', 'dark'].includes(savedTheme) ? savedTheme : 'light');
const isDark = computed(() => themePreference.value === 'dark' || (themePreference.value === 'system' && systemIsDark.value));
matchDark.addEventListener('change', e => systemIsDark.value = e.matches);

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const WIPE_DURATION = 820;
const WIPE_FRAMES = 24;
const WIPE_BAND_WIDTH = 110;
const COS30 = Math.cos(Math.PI / 6);

/**
 * Keyframes for a "lane wipe": the viewport is cut into stripes tilted 30deg.
 * The stripe under the toggle opens first and the rest follow outwards; each
 * stripe widens from its centre line with an ease-out curve.
 *
 * Coordinates use a rotated basis: `across` runs perpendicular to the stripes
 * (direction (1/2, cos30)) and `along` runs with them (direction (cos30, -1/2)).
 * @param {number} originX
 * @param {number} originY
 * @returns {string[]} clip-path polygons
 */
const laneWipeFrames = (originX, originY) => {
    const w = innerWidth;
    const h = innerHeight;
    const toScreen = (across, along) =>
        `${(across * 0.5 + along * COS30).toFixed(1)}px ${(across * COS30 - along * 0.5).toFixed(1)}px`;

    // Extent of the viewport in the rotated basis (corners projected onto each axis).
    const acrossSpan = w * 0.5 + h * COS30;
    const alongStart = -h * 0.5 - 2;
    const alongEnd = w * COS30 + 2;

    const bands = Math.max(6, Math.round(acrossSpan / WIPE_BAND_WIDTH));
    const pitch = acrossSpan / bands;
    const originBand = Math.min(bands - 1, Math.floor((originX * 0.5 + originY * COS30) / pitch));
    // Delay per band of distance, so the farthest band starts halfway through.
    const stagger = 0.5 / Math.max(originBand, bands - 1 - originBand, 1);
    const easeOutCubic = t => 1 - (1 - t) ** 3;

    const frames = [];
    for (let f = 0; f <= WIPE_FRAMES; f++) {
        const t = f / WIPE_FRAMES;
        const points = [];
        for (let b = 0; b < bands; b++) {
            const local = Math.min(Math.max((t - Math.abs(b - originBand) * stagger) * 2, 0), 1);
            // +1px overlap so neighbouring stripes leave no hairline gaps.
            const half = (pitch / 2 + 1) * easeOutCubic(local);
            const centre = (b + 0.5) * pitch;
            points.push(
                toScreen(centre - half, alongStart),
                toScreen(centre - half, alongEnd),
                toScreen(centre + half, alongEnd),
                toScreen(centre + half, alongStart),
            );
        }
        frames.push(`polygon(${points.join(', ')})`);
    }
    return frames;
};

/**
 * Switch theme with a lane wipe from the toggle button. Falls back to an
 * instant switch without the View Transitions API or when reduced motion is on.
 * @param {MouseEvent} e
 */
const toggleTheme = async e => {
    const apply = () => {
        themePreference.value = isDark.value ? 'light' : 'dark';
        localStorage.setItem('dufs-theme', themePreference.value);
    };
    if (!document.startViewTransition || reduceMotion.matches) return apply();

    // Use the button centre so keyboard activation (clientX/Y = 0) also works.
    const rect = e?.currentTarget?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : innerWidth;
    const y = rect ? rect.top + rect.height / 2 : 0;
    const frames = laneWipeFrames(x, y);

    const transition = document.startViewTransition(async () => {
        apply();
        // Let the isDark watcher switch the Vuetify theme and re-render first.
        await nextTick();
    });
    await transition.ready;
    // Easing is baked into the frames, so play them linearly.
    document.documentElement.animate(
        { clipPath: frames },
        { duration: WIPE_DURATION, easing: 'linear', pseudoElement: '::view-transition-new(root)' },
    );
};

const title = window.__DUFS_MATERIAL_CONFIG__?.page?.title === undefined ? (location.host + decodeURIComponent(pathPrefix === '/' ? '' : pathPrefix)) : window.__DUFS_MATERIAL_CONFIG__?.page?.title;
const logo = computed(() => {
    const e = window.__DUFS_MATERIAL_CONFIG__?.page?.logo;
    return e && (typeof e === 'string' ? e : (isDark.value ? e.dark : e.light));
});
const background = computed(() => {
    const e = window.__DUFS_MATERIAL_CONFIG__?.background;
    return e && (typeof e === 'string' ? e : (isDark.value ? e.dark : e.light));
});
const glassmorphism = (() => {
    const e = window.__DUFS_MATERIAL_CONFIG__?.glassmorphism?.appbar;
    return e ? {
        backdropFilter: `blur(${e.blur}px)`,
        backgroundColor: `color-mix(in srgb, rgb(var(--v-theme-primary)) ${e.alpha * 100}%, transparent) !important`,
    } : {};
})();
const footerRenderer = new Renderer;
Object.assign(footerRenderer, {
    ...renderer,
    image(token) {
        return Renderer.prototype.image.apply(this, [token]).replace(/^<img/, '<img style="vertical-align:middle"');
    },
    link(token) {
        return Renderer.prototype.link.apply(this, [token]).replace(/^<a/, '<a target="_blank" rel="noopener noreferrer" style="color:unset"');
    },
});
const footer = marked.parse(`${window.__DUFS_MATERIAL_CONFIG__?.footer || ''}\n\nPowered by [dufs](https://github.com/sigoden/dufs) v${dufsVersion} & [dufs-material-assets](https://github.com/TransparentLC/dufs-material-assets)`, { renderer: footerRenderer });

const theme = useTheme();
watch(isDark, value => theme.change(value ? 'dark' : 'light'), { immediate: true });

</script>
