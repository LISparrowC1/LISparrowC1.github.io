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

把音频直接放进对应文件夹即可，构建时会自动扫描并生成播放清单，**不需要编辑任何 JSON**：

- `source/music/normal/`：日常歌曲
- `source/music/cny/`：春节歌曲
- `source/music/halloween/`：万圣节歌曲
- `source/music/christmas/`：圣诞歌曲

一个文件夹可以放任意多首。节日效果生效时，播放器自动改用对应节日文件夹；该文件夹为空时回落到 `normal/`。

- 歌曲名和作者优先读取音频文件里的标签（ID3、FLAC 等）；没有标签时，中文文件名按 `歌手 - 歌名` 自动拆，英文按 `歌名 - 作者` 自动拆；再没有就用整名，没有作者显示 `-`。
- 歌词：把同名的 `.lrc` 放在音频旁边即可，例如 `song.mp3` + `song.lrc`，构建时自动关联，不用改清单。格式是 `[mm:ss.xx]歌词`。
- 文件名不要以 `_` 或 `.` 开头（Hexo 默认不拷贝这类文件），建议使用简单的英文名。
- 顶部 `♪` 是音乐总开关，默认关闭，刷新不记忆。打开后左下角出现播放器，显示歌曲名和作者，可上一首/下一首。
- 没有歌曲、清单读取失败或音频加载失败时显示“无 / -”，不会显示假歌名。

## 访问计数

页脚使用 Busuanzi 显示访客和访问量；加载期间和失败时保留计数区域，不再自动隐藏。国内外源会自动回退。

## 白天 / 黑夜模式

右上角的月亮/太阳按钮切换，默认黑夜。图标显示当前模式：黑夜是月亮，白天是太阳。

- 黑夜：黑洞头图 `banner.webp`，紫蓝色星空与极光；主标题是深蓝 → 青 → 白 → 紫。
- 白天：暮色星空头图 `banner-light.webp`，深蓝偏青的星空、浅色文字和面板；主标题是蓝 → 青 → 白 → 薄荷 → 淡金。
- 首页头图本身保持原图，不叠极光光幕；极光只在头图下方的页面背景里，滚动到内容区能看到，而且已经压低了强度。

## 首页文案

编辑 `source/data/phrases.json` 里的 `zh.quotes`、`zh.greetings`、`en.quotes`、`en.greetings`；节日问候分别在 `cnyGreetings`、`halloweenGreetings`、`christmasGreetings`（中英各一份）；两种语言的初始句分别在 `zh.initial` / `en.initial`。打字机只在点击时切换下一句，不会自动轮播。

## 中英文切换

顶部导航的 `中 / EN` 显示**当前语言**，点击切换，默认中文并记住选择。界面文案在 `source/data/i18n.json` 里维护；首页打字机文案在 `source/data/phrases.json`；关于页有独立的中英文内容，其余文章正文仍按你写的内容显示。

文章页的目录、字数/分钟、作者/发布于/许可协议、日期、上一篇/下一篇、搜索框、页脚计数等界面文案都会跟随切换。目前关于页已完整翻译，两篇文章正文保留中文；文章正文里需要跟随切换的段落，可以用 Hexo 支持的内联 HTML：

```html
<span data-i18n-zh="中文内容" data-i18n-en="English content">中文内容</span>
```

切换时只替换纯文本，不解析 HTML。

## 字体

全站正文使用 LXGW WenKai（霞鹜文楷）。字体样式延迟加载，不阻塞首屏；未加载完时先显示系统字体，代码块保持等宽字体。

首页主标题 `ALIST` 使用 Orbitron 900 科技字体，**本地自托管**在 `source/fonts/`，不依赖 Google Fonts；OFL 许可见 `source/fonts/OFL-Orbitron.txt`。

## 节日预览

平时不会显示节日效果。在页面里输入下面任一关键词即可预览：

- `cny`：左侧两盏灯笼，烟花直接在灯笼旁引爆，首页打字机显示春节问候
- `halloween`：第一次向下滚动时，左右两侧各 12 只蝙蝠斜向上飞、快速拍翅，约 3 秒后消失，只触发一次；首页显示万圣节问候
- `christmas`：圣诞雪花；首页显示圣诞问候
- `festival`：依次循环三种节日
- `festivaloff`：关闭节日效果

春节问候语在 `source/data/phrases.json` 的 `cnyGreetings` 里维护。也可以直接用 `?festival=cny`、`?festival=halloween`、`?festival=christmas` 打开。

