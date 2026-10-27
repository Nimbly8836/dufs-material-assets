/**
 * In-browser previews for formats browsers can't display natively.
 *
 * Files are fetched from dufs and parsed locally; nothing is sent to a third
 * party. Each parser is a dynamic import, so it is split into its own chunk
 * and only downloaded the first time that format is previewed.
 */

/** @typedef {'docx' | 'sheet' | 'pptx' | 'psd' | 'tiff'} LocalPreviewType */

/** @type {Record<LocalPreviewType, Set<string>>} */
const EXTS = {
    docx: new Set(['docx', 'docm', 'dotx', 'dotm']),
    sheet: new Set(['xlsx', 'xlsm', 'xlsb', 'xls', 'ods', 'csv']),
    pptx: new Set(['pptx', 'ppsx', 'potx', 'pptm', 'ppsm', 'potm']),
    psd: new Set(['psd']),
    tiff: new Set(['tif', 'tiff']),
};

/** Rendering more than this in a single HTML table freezes the page. */
export const SHEET_MAX_ROWS = 2000;
export const SHEET_MAX_COLS = 200;

/**
 * @param {string} ext lower-case extension
 * @returns {LocalPreviewType | null}
 */
export const localPreviewType = ext => {
    for (const [type, exts] of Object.entries(EXTS)) {
        if (exts.has(ext)) return /** @type {LocalPreviewType} */ (type);
    }
    return null;
};

/** @param {HTMLCanvasElement} canvas */
const fitCanvas = canvas => {
    canvas.className = 'local-preview__image';
    return canvas;
};

/**
 * @param {ArrayBuffer} buffer
 * @param {HTMLElement} el
 */
const renderDocx = async (buffer, el) => {
    const { renderAsync } = await import('docx-preview');
    await renderAsync(buffer, el, el, {
        className: 'docx',
        inWrapper: true,
        ignoreLastRenderedPageBreak: true,
        experimental: true,
    });
};

/**
 * Build a <table> from a worksheet with DOM APIs only. Cell text goes through
 * textContent, so spreadsheet content can never inject markup.
 * @param {typeof import('xlsx')} XLSX
 * @param {import('xlsx').WorkSheet} ws
 * @returns {HTMLTableElement}
 */
const buildSheetTable = (XLSX, ws) => {
    const table = document.createElement('table');
    table.className = 'local-preview__sheet';
    if (!ws['!ref']) return table;

    const range = XLSX.utils.decode_range(ws['!ref']);
    // Formatted text (dates, percentages, ...) as shown in Excel.
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '', blankrows: true, range });

    // Merged cells: the top-left cell spans, the others are skipped.
    const spans = new Map();
    const covered = new Set();
    for (const m of ws['!merges'] || []) {
        const r0 = m.s.r - range.s.r, c0 = m.s.c - range.s.c;
        if (r0 < 0 || c0 < 0 || m.s.r > range.e.r || m.s.c > range.e.c) continue;
        const rowspan = Math.min(m.e.r, range.e.r) - m.s.r + 1;
        const colspan = Math.min(m.e.c, range.e.c) - m.s.c + 1;
        spans.set(`${r0},${c0}`, { rowspan, colspan });
        for (let r = 0; r < rowspan; r++) {
            for (let c = 0; c < colspan; c++) {
                if (r || c) covered.add(`${r0 + r},${c0 + c}`);
            }
        }
    }

    const cols = range.e.c - range.s.c + 1;
    const tbody = table.createTBody();
    rows.forEach((row, r) => {
        const tr = tbody.insertRow();
        for (let c = 0; c < cols; c++) {
            if (covered.has(`${r},${c}`)) continue;
            const td = tr.insertCell();
            td.textContent = row[c] ?? '';
            const span = spans.get(`${r},${c}`);
            if (span) {
                if (span.rowspan > 1) td.rowSpan = span.rowspan;
                if (span.colspan > 1) td.colSpan = span.colspan;
            }
        }
    });
    return table;
};

/**
 * @param {ArrayBuffer} buffer
 * @param {HTMLElement} el
 * @returns {Promise<{ sheets: string[], show: (index: number) => { truncated: boolean } }>}
 */
const renderSheet = async (buffer, el) => {
    const [XLSX, cptable] = await Promise.all([
        import('xlsx'),
        // Code pages decode legacy .xls files saved in GBK, Big5, Shift-JIS, ...
        import('xlsx/dist/cpexcel.full.mjs'),
    ]);
    XLSX.set_cptable(cptable);
    const wb = XLSX.read(buffer, { type: 'array', dense: true, cellDates: true });
    const show = index => {
        const ws = wb.Sheets[wb.SheetNames[index]];
        let truncated = false;
        if (ws['!ref']) {
            const range = XLSX.utils.decode_range(ws['!ref']);
            if (range.e.r - range.s.r + 1 > SHEET_MAX_ROWS) {
                range.e.r = range.s.r + SHEET_MAX_ROWS - 1;
                truncated = true;
            }
            if (range.e.c - range.s.c + 1 > SHEET_MAX_COLS) {
                range.e.c = range.s.c + SHEET_MAX_COLS - 1;
                truncated = true;
            }
            ws['!ref'] = XLSX.utils.encode_range(range);
        }
        el.replaceChildren(buildSheetTable(XLSX, ws));
        return { truncated };
    };
    return { sheets: wb.SheetNames, show };
};

/**
 * @param {ArrayBuffer} buffer
 * @param {HTMLElement} el
 */
const renderPptx = async (buffer, el) => {
    const { init } = await import('pptx-preview');
    // Fit slides to the dialog (minus the 16px side padding from theme.css);
    // height follows each slide's aspect ratio.
    const width = Math.max(320, Math.floor((el.clientWidth || 880) - 32));
    const previewer = init(el, { width, mode: 'list' });
    await previewer.preview(buffer);
};

/**
 * @param {ArrayBuffer} buffer
 * @param {HTMLElement} el
 */
const renderPsd = async (buffer, el) => {
    const { readPsd } = await import('ag-psd');
    // Only the merged composite image is needed, not individual layers.
    const psd = readPsd(buffer, { skipLayerImageData: true, skipThumbnail: true });
    if (!psd.canvas) {
        throw new Error('This PSD has no composite image (saved without "Maximize compatibility").');
    }
    el.replaceChildren(fitCanvas(psd.canvas));
};

/**
 * @param {ArrayBuffer} buffer
 * @param {HTMLElement} el
 */
const renderTiff = async (buffer, el) => {
    const { default: UTIF } = await import('utif');
    const [ifd] = UTIF.decode(buffer);
    if (!ifd) throw new Error('No image found in TIFF file.');
    UTIF.decodeImage(buffer, ifd);
    const rgba = UTIF.toRGBA8(ifd);
    const canvas = document.createElement('canvas');
    canvas.width = ifd.width;
    canvas.height = ifd.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba.buffer), ifd.width, ifd.height), 0, 0);
    el.replaceChildren(fitCanvas(canvas));
};

/**
 * Render `buffer` into `el`. For spreadsheets, returns sheet names and a
 * function to switch sheets.
 * @param {LocalPreviewType} type
 * @param {ArrayBuffer} buffer
 * @param {HTMLElement} el
 */
export const renderLocalPreview = async (type, buffer, el) => {
    el.replaceChildren();
    switch (type) {
        case 'docx': return renderDocx(buffer, el);
        case 'sheet': return renderSheet(buffer, el);
        case 'pptx': return renderPptx(buffer, el);
        case 'psd': return renderPsd(buffer, el);
        case 'tiff': return renderTiff(buffer, el);
    }
};
