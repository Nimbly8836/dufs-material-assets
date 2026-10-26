<template>
    <!--
        A <textarea> cannot colour its text, so a syntax-highlighted <pre> is
        rendered underneath a textarea with transparent text. Both layers use
        identical font metrics and padding; scrolling is mirrored from the
        textarea to the <pre>.
    -->
    <div class="code-editor" :class="{ 'code-editor--nowrap': !wrap }">
        <pre
            ref="highlightLayer"
            class="code-editor__layer code-editor__highlight"
            aria-hidden="true"
        ><code v-html="highlighted"></code></pre>
        <textarea
            ref="inputLayer"
            class="code-editor__layer code-editor__input"
            :value="modelValue"
            :wrap="wrap ? 'soft' : 'off'"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            @input="onInput"
            @scroll="syncScroll"
            @keydown.tab.prevent="insertTab"
        ></textarea>
    </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import prism from 'prismjs';
import { codeLanguageTable } from '../common.js';

const props = defineProps({
    modelValue: { type: String, default: '' },
    ext: { type: String, default: '' },
    wrap: { type: Boolean, default: true },
});
const emit = defineEmits(['update:modelValue']);

// Re-highlighting runs on every keystroke; fall back to plain text for very
// large files, honouring the same limits the preview uses.
const MAX_HIGHLIGHT_LENGTH = 200_000;
const maxLines = window.__DUFS_MATERIAL_CONFIG__?.codeHighlightMaxLines;
const maxLineLength = window.__DUFS_MATERIAL_CONFIG__?.codeHighlightMaxLineLength;

const highlightLayer = ref(null);
const inputLayer = ref(null);

const escapeHtml = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

const shouldHighlight = text => {
    if (text.length > MAX_HIGHLIGHT_LENGTH) return false;
    if (!maxLines && !maxLineLength) return true;
    const lines = text.split('\n');
    if (maxLines && lines.length > maxLines) return false;
    if (maxLineLength && lines.some(l => l.trim().length > maxLineLength)) return false;
    return true;
};

const highlighted = computed(() => {
    const text = props.modelValue;
    const lang = codeLanguageTable[props.ext?.toLowerCase()];
    const grammar = lang && prism.languages[lang];
    let html = grammar && shouldHighlight(text)
        ? prism.highlight(text, grammar, lang).replace(
            // Prism escapes `<` but not `>`, so accept both forms of the close.
            /(&lt;%[\s\S]*?%(?:&gt;|>))/g,
            '<span class="template-directive">$1</span>',
        )
        : escapeHtml(text);
    // A trailing newline has no height in <pre>; pad it so both layers match.
    if (text.endsWith('\n') || !text) html += ' ';
    return html;
});

const syncScroll = () => {
    if (!highlightLayer.value || !inputLayer.value) return;
    highlightLayer.value.scrollTop = inputLayer.value.scrollTop;
    highlightLayer.value.scrollLeft = inputLayer.value.scrollLeft;
};

const onInput = e => {
    emit('update:modelValue', e.target.value);
    nextTick(syncScroll);
};

const insertTab = e => {
    const el = e.target;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const next = `${value.slice(0, start)}\t${value.slice(end)}`;
    emit('update:modelValue', next);
    nextTick(() => {
        el.selectionStart = el.selectionEnd = start + 1;
        syncScroll();
    });
};

// Content is loaded asynchronously and wrapping can change; keep layers aligned.
watch(() => [props.modelValue, props.wrap], () => nextTick(syncScroll));
</script>
