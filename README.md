# ALIST

LI_SparrowC1 的博客：<https://lisparrowc1.github.io/>

基于 Hexo 8 + Fluid 1.9。

## 本地运行

```bash
npm install
npx hexo server
```

打开 <http://localhost:4000>。

## 构建

```bash
npx hexo generate
```

产物在 `public/`。推送到 `main` 后由 GitHub Actions 发布到 GitHub Pages。

## 音乐

1. 把音频文件放进 `source/music/`。
2. 编辑 `source/data/music.json`，把 `daily`、`cny`、`halloween`、`christmas` 的 `src` 填成 `/music/文件名.mp3`。
3. 顶部导航栏的 `♪` 是音乐总开关，默认关闭；打开后左下角出现播放器，再点播放。
4. 没有导入文件或加载失败时，播放器会显示“无音乐”，不会播放。

歌词是可选的：在 `source/music/` 放一个同名的 `.lrc` 文件（例如 `daily.lrc`），然后在 `music.json` 对应曲目里填 `"lyrics": "/music/daily.lrc"`。歌曲播放时，首页打字机的位置会变成同步歌词显示。LRC 使用标准的 `[mm:ss.xx]歌词` 格式。

## 首页文案

编辑 `source/data/phrases.json` 里的 `zh.quotes`、`zh.greetings`、`en.quotes`、`en.greetings`；两种语言的初始句分别在 `zh.initial` / `en.initial`。打字机只在点击时切换下一句，不会自动轮播。

## 中英文切换

顶部导航栏的 `EN / 中` 是语言开关，默认中文并记住选择。界面文案在 `source/data/i18n.json` 里维护；首页打字机文案在 `source/data/phrases.json`；文章正文仍按你写的内容显示。

需要在文章正文里跟随切换的文字，可以直接用 Hexo 支持的内联 HTML：

```html
<span data-i18n-zh="中文内容" data-i18n-en="English content">中文内容</span>
```

切换时只替换纯文本，不解析 HTML。

## 字体

全站使用 LXGW WenKai（霞鹜文楷），从 jsDelivr 按需加载中文子集；字体未加载完时先显示系统字体。代码块保持等宽字体。

## 节日预览

平时不会显示节日效果。在页面里输入下面任一关键词即可预览：

- `cny`：春节灯笼
- `halloween`：万圣节蝙蝠
- `christmas`：圣诞雪花
- `festival`：依次循环三种节日
- `festivaloff`：关闭节日效果

也可以直接用 `?festival=cny`、`?festival=halloween`、`?festival=christmas` 打开。

