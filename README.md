# dufs-material-assets

[![CI](https://github.com/Nimbly8836/dufs-material-assets/actions/workflows/ci.yml/badge.svg)](https://github.com/Nimbly8836/dufs-material-assets/actions/workflows/ci.yml) [![Pages](https://github.com/Nimbly8836/dufs-material-assets/actions/workflows/pages.yml/badge.svg)](https://nimbly8836.github.io/dufs-material-assets/) [![Release](https://img.shields.io/github/v/release/Nimbly8836/dufs-material-assets)](https://github.com/Nimbly8836/dufs-material-assets/releases)

[dufs](https://github.com/sigoden/dufs) 的 Material Design 风格自定义前端界面。

**在线演示：<https://nimbly8836.github.io/dufs-material-assets/>**（只读，部署在 GitHub Pages 上，由 GitHub Actions 自动构建）

> 本仓库 fork 自 [TransparentLC/dufs-material-assets](https://github.com/TransparentLC/dufs-material-assets)，在其基础上调整了界面风格（简约配色、浅色/深色切换及动画、代码查看与编辑器高亮等）。这些修改在 AI 辅助下完成。

使用 Vue 3 + Vuetify 构建，部分设计参考 [Cloudreve](https://github.com/cloudreve/Cloudreve)，添加了一些额外的功能。

如果你是为了部署本地文件共享或 WebDAV 服务（不包括挂载网盘），因为最近的“AList 被商业收购/投毒事件”而选择 dufs 作为替代品，那么你大概也会对这个项目感兴趣～

|  |  |  |
| - | - | - |
| <picture><source media="(prefers-color-scheme:dark)" srcset="https://github.com/TransparentLC/dufs-material-assets/assets/47057319/f8488128-ad2b-4f3d-950e-10c2a11ac390"><img src="https://github.com/TransparentLC/dufs-material-assets/assets/47057319/094fa2be-afeb-4010-9bec-d014b888b97b"></picture> | <picture><source media="(prefers-color-scheme:dark)" srcset="https://p.sda1.dev/29/85cb90f522dbb8b4eabec7f3f74ec7dd/J8uL.avif"><img src="https://p.sda1.dev/29/8be21ca522b4e72a413803470ccafb11/h5K6.avif"></picture> | <picture><source media="(prefers-color-scheme:dark)" srcset="https://p.sda1.dev/29/2c54e52cef25e1267f3359451499fd8b/hRnv.avif"><img src="https://p.sda1.dev/29/a20f9d52828b74db2ac7baada95276ea/nJFN.avif"></picture> |

* 按照[“自定义界面”](#自定义界面)的介绍进行配置即可实现图 2 的效果
    * 背景图片来自 Pixabay [#1](https://pixabay.com/photos/mountains-lake-canada-banff-nature-9606525/) [#2](https://pixabay.com/photos/architecture-building-business-city-1868667/)
* 实现图 3 的效果除了按照[“自定义界面”](#自定义界面)进行配置，还需要编辑这个项目的 HTML 文件，并引入额外编写的 JS 和 CSS 等资源
    * 图中的主题设计取自“maimai でらっくす Splash”的[官方网站](https://web.archive.org/web/20201231182646/https://maimai.sega.jp/)
    * 进行这种程度的修改需要基本的前端开发知识

## 已实现/适配的功能

标有✨的是原版前端界面未支持，在本项目中额外添加的功能。

* 文件列表
* URL 路径前缀
* 显示符号链接
* 打包下载
* 登录后复制带有 Token 的下载链接✨
    * dufs [v0.44.0](https://github.com/sigoden/dufs/pull/603) 添加的功能
    * 此类链接可用于浏览器以外的下载器，无需在下载器中配置登录
* 文件上传
    * 支持拖拽
* 新建文件夹
* 移动/重命名/删除/编辑文件
* 搜索
* 深色模式
* 响应式设计
* README 文件展示✨
    * 自动在文件列表下方展示当前目录的 `README.md`、`README.txt` 或 `README` 文件
* 文本文件预览✨
    * 代码高亮（使用 [prism](https://prismjs.com) 实现）
    * 数学公式渲染（使用 https://i.upmath.me/ 的 API 实现）
    * 支持渲染 Markdown 文件（使用 [Marked](https://marked.js.org/) 实现）
* 本地文档预览✨
    * 在浏览器里直接预览 Word（docx）、表格（xlsx、xls、ods、csv）、PowerPoint（pptx）、PSD 和 TIFF 文件，文件不会发送给第三方网站
    * 分别使用 [docx-preview](https://github.com/VolodymyrBaydalka/docxjs)、[SheetJS](https://sheetjs.com/)、[pptx-preview](https://www.npmjs.com/package/pptx-preview)、[ag-psd](https://github.com/Agamnentzar/ag-psd)、[UTIF.js](https://github.com/photopea/UTIF.js) 实现，按需加载
    * 表格最多显示前 2000 行、200 列；PSD 显示合并后的预览图（需要保存时开启“最大兼容性”）
    * pptx 支持文字、图片、形状和基本图表，不支持动画；复杂版式可能和 PowerPoint 有差异
    * 嵌入 dufs 二进制文件的版本不支持此功能
* 文档预览✨
    * 支持在线查看 PDF 文件，docx、xlsx、pptx 等 Office 文档和 draw&period;io、VSDX 等图表
    * Office 文档查看使用 https://view.officeapps.live.com/op/view.aspx 实现，可以在线查看 10 MB 以内的文件
    * draw&period;io 图表查看使用 [draw.io 的网页版](https://www.drawio.com/blog/online-diagram-viewer)实现
    * 部署的 dufs 实例需要可以在公网访问才能预览 Office 文档和 draw&period;io 图表，预览时文件会被服务提供者获取并缓存
    * 默认不启用，有需要的话请在正确配置 dufs 后通过[“自定义界面”](#自定义界面)启用
* 图片查看器✨
    * 支持加载 [jxl-rs-polyfill](https://github.com/hjanuschka/jxl-rs-polyfill) 在没有原生支持（[Can I Use...](https://caniuse.com/jpegxl)）的浏览器上查看 JPEG XL 图片
    * 支持[一键打开 Photopea](https://github.com/photopea/photopea/issues/966) 编辑图片
    * 也可以使用 Photopea 查看浏览器不支持的 PSD、AI、JPEG XL 等格式的图片
    * 需要配置好 CORS（启动 dufs 时设置 `--enable-cors` 或通过 nginx 等反向代理时添加 `Access-Control-Allow-Origin: https://www.photopea.com`），因为是本地获取文件后使用 Photopea 打开所以无需公网访问
    * 默认不启用，有需要的话请在正确配置 dufs 后通过[“自定义界面”](#自定义界面)启用
* 视频播放器
    * 使用 `<video>` 标签实现，支持的封装和编码可以参见 [Can I Use...](https://caniuse.com/?search=video%20format)
    * 支持显示同目录下同名的 WebVTT、SRT、ASS 字幕（使用 [subsrt](https://www.npmjs.com/package/subsrt) 转换为 WebVTT 后使用 `<track>` 标签显示，因此无法支持样式）
    * 例如对于视频文件 `example.mp4`，会自动加载 `example.{vtt,srt,ass}` 和 `example.*.{vtt,srt,ass}`。
* 音乐播放器✨
    * 使用 `<audio>` 标签实现，支持的封装和编码可以参见 [Can I Use...](https://caniuse.com/?search=audio%20format)
    * 同一目录下音频文件顺序/随机/循环播放
    * 解析并展示标题、艺术家、专辑名称、封面图等元数据（使用 [jsmediatags](https://www.npmjs.com/package/jsmediatags) 实现）
* 字体查看器✨
* 自定义页面标题和主题色✨
* 自定义页脚✨
* 分页展示文件✨
    * 适用于目录内有上千个文件的情况
    * 默认不启用，可以通过[“自定义界面”](#自定义界面)启用
* 多语言支持✨
    * 已支持的语言或添加翻译请参见 [`src/i18n.js`](https://github.com/Nimbly8836/dufs-material-assets/blob/master/src/i18n.js)

## 使用方法

从 [Releases](https://github.com/Nimbly8836/dufs-material-assets/releases) 下载 `dufs-material-assets-<版本>.zip`，解压到一个目录（例如 `dufs-material-assets`），在启动 dufs 时添加参数 `--assets dufs-material-assets`。

压缩包里没有外层目录，解压后的结构如下：

```plain
dufs-material-assets
    index.html
    index.js
    index.css
    vite.svg
```

每次推送 `v*` 格式的 tag（例如 `v1.0.0`）都会由 [Release 工作流](https://github.com/Nimbly8836/dufs-material-assets/actions/workflows/release.yml) 自动构建并发布 Release。

master 分支的最新构建也可以从 [GitHub Actions](https://github.com/Nimbly8836/dufs-material-assets/actions/workflows/ci.yml) 或 [nightly.link](https://nightly.link/Nimbly8836/dufs-material-assets/workflows/ci/master) 下载。也可以自己构建前端资源。

如果不想单独保存这个项目的前端资源和在每次启动 dufs 时设定 `--assets` 参数，可以手动运行 [Build dufs with embed assets](https://github.com/Nimbly8836/dufs-material-assets/actions/workflows/build-embed.yml) 工作流，编译嵌入了这个项目前端资源（替换了原版的前端资源）的 dufs 二进制文件，不过以这种方式使用将无法自定义界面。

如果你使用过 dufs 原版的前端资源，然后切换到这个项目的前端资源重新运行，打开网页时可能会出现“No data”的提示，这是因为你的浏览器仍然在使用缓存的原版前端资源的 `index.js`，清除缓存后刷新即可（例如使用 <kbd>Ctrl+F5</kbd>）。

<details>

<summary>对于开发的补充说明</summary>

```shell
pnpm run dev
pnpm run dufs-api
```

开发服务器会把 `/prefix/` 下的 API 请求代理到 `http://localhost:5000`，可以用环境变量 `DUFS_API_TARGET` 修改（例如 macOS 上 5000 端口被“隔空播放接收器”占用时）。

在线演示使用 `pnpm run build:demo` 构建到 `dist-demo/`：它会复制仓库中的部分文件作为示例内容，并为每个目录生成 dufs 格式的 JSON 列表，因此不需要 dufs 服务端。演示站是只读的，上传、删除、搜索、打包下载等功能不可用。

为了方便适配各个功能，`dufs-api` 固定了一些启动 dufs 的参数，与代码中仅在开发模式下会运行的部分对应。

</details>

## 截图

<details>

<summary>搜索/响应式设计</summary>

![](https://github.com/TransparentLC/dufs-material-assets/assets/47057319/bbf048b9-5be6-49fe-a9b1-22467575f5be)

</details>

<details>

<summary>文本文件预览</summary>

![](https://github.com/TransparentLC/dufs-material-assets/assets/47057319/5f094480-1e53-4d80-8a5a-56b2db95be23)

</details>

<details>

<summary>图片查看器</summary>

![](https://github.com/TransparentLC/dufs-material-assets/assets/47057319/17119400-d218-4a6d-85dd-3b9fa9e436e1)

</details>

<details>

<summary>视频播放器</summary>

![](https://github.com/TransparentLC/dufs-material-assets/assets/47057319/253dd093-de65-4ffc-8461-6139b23b47a7)

</details>

<details>

<summary>音乐播放器</summary>

![](https://github.com/TransparentLC/dufs-material-assets/assets/47057319/c7852e66-495c-4ec0-86e6-db8a6c316f20)

</details>

<details>

<summary>字体查看器</summary>

![](https://github.com/user-attachments/assets/cb1905f3-bb6d-40cd-ac27-7acbcfeffae9)

</details>

## 自定义界面

按照以下指引在 `index.html` 的 `<script>` 部分添加 `window.__DUFS_MATERIAL_CONFIG__`：

```js
window.__DUFS_MATERIAL_CONFIG__ = {
    // 网页标题
    document: 'Index of ${path} - Custom title',
    // 左上角显示的标题和 LOGO
    page: {
        title: 'Custom title',
        logo: {
            light: 'https://example.com/logo-light.png',
            dark: 'https://example.com/logo-dark.png',
        },
        // 也可以在浅色和深色主题下使用同一个 LOGO
        // logo: 'https://example.com/logo.png',
    },
    // 自定义页脚
    // 可以使用 Markdown 格式
    footer: 'Copyright © 2025 **John Doe** ![](https://img.shields.io/badge/any_text-you_like-blue)\\n\\n[京ICP备XXXXXXXX号-X](https://beian.miit.gov.cn/)',
    // 背景图片
    background: {
        light: 'https://example.com/background-light.webp',
        dark: 'https://example.com/background-dark.webp',
    },
    // 也可以在浅色和深色主题下使用同一张背景图片
    // background: 'https://example.com/background.webp',
    // 浅色和深色主题
    // 参见 https://vuetifyjs.com/zh-Hans/features/theme/ 的 colors 部分
    theme: {
        light: {
            primary: '#0288d1',
            secondary: '#00b0ff',
        },
        dark: {
            primary: '#026da7',
            secondary: '#008dcc',
        },
    },
    // 为卡片添加毛玻璃效果
    // 可以设置模糊半径（单位 px）和不透明度（范围 0-1）
    // 建议和背景图片配合使用
    glassmorphism: {
        // 顶部应用栏
        appbar: { blur: 5, alpha: .6 },
        // 文件列表
        filelist: { blur: 5, alpha: .8 },
        // README
        readme: { blur: 5, alpha: .8 },
        // 预览窗口
        preview: { blur: 5, alpha: .8 },
    },
    // 分页大小
    limit: 100,
    // 是否允许使用第三方服务查看文件（Microsoft Office Online、draw.io、Photopea）
    // 部署时需要满足对应条件，否则即使启用了也无法查看
    externalViewer: false,
    // 是否在浏览器本地预览 docx、xlsx/xls/ods/csv、pptx、psd、tiff 文件，默认启用
    // 文件只会从 dufs 下载到当前浏览器解析，不会发送给任何第三方网站
    // 解析库放在前端资源的 assets 目录里，第一次预览对应格式时才会加载
    // 同时启用 externalViewer 时，这些格式优先使用本地预览
    localViewer: true,
    // 本地预览的文件大小上限（单位 MB），超过时不显示本地预览按钮
    localViewerMaxSize: 50,
    // 是否启用 polyfill 以支持查看 JPEG XL 格式的图片
    // 如果浏览器原生支持 JPEG XL（参见 https://caniuse.com/jpegxl）则不会有影响
    // 如果没有原生支持，启用后查看 JPEG XL 图片时会自动加载 polyfill（https://github.com/hjanuschka/jxl-rs-polyfill）
    // 未启用但是设置了 externalViewer 的话，也可以使用 Photopea 查看
    // 默认从 https://cdn.jsdelivr.net/npm/jxl-rs-polyfill/dist/jxl-polyfill.min.js 加载 polyfill
    // 也可以自行保存 jxl-polyfill.js、jxl_wasm.js、jxl_wasm_bg.wasm 后在这里填写 jxl-polyfill.js 的 URL
    jxlPolyfill: false,
    // 点击文件名时，如果是可以预览的文件类型则显示预览而不是下载文件
    // 仍然可以点击右边和预览对话框的下载按钮下载，以及在文件名上右键复制链接
    preferPreview: false,
    // 预览代码时，如果总行数或单行长度超过阈值则不进行代码高亮
    codeHighlightMaxLines: 0,
    codeHighlightMaxLineLength: 0,
};

// 由 dufs 填充的页面内容，不要修改
window.__DUFS_PREFIX__ = "__ASSETS_PREFIX__";
window.__INITIAL_DATA__ = JSON.parse(decodeURIComponent(escape(atob("__INDEX_DATA__"))));
```

如果 LOGO 和背景图片需要从本地加载，假设前端资源的目录结构如下：

```plain
dufs-material-assets
│  index.html
│  vite.svg
│
└─assets
        index-xxxxxxxx.js
        index-xxxxxxxx.css
```

你可以将图片（假定为 `image.webp`）放在 `assets` 目录下，然后地址填写为 `__ASSETS_PREFIX__assets/image.webp` 即可。dufs 会把 `index.html` 的 `__ASSETS_PREFIX__` 替换成 `/prefix/__dufs_v0.0.0__/` 这样的带有 `--path-prefix` 设定的前缀（如果有的话）和 dufs 版本号的路径，最后会指向 `--assets` 指定的目录里面的内容。

`window.__DUFS_MATERIAL_CONFIG__` 的所有项目都是可选的，例如只想自定义 LOGO 的话，只写这一部分就可以了：

```js
window.__DUFS_MATERIAL_CONFIG__ = {
    page: {
        logo: '__ASSETS_PREFIX__assets/logo.svg',
    },
};
```
