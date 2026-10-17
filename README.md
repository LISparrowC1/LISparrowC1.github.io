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

没有 `src` 时播放器会提示导入音乐，不会自动播放。

## 首页文案

编辑 `source/data/phrases.json` 里的 `quotes` 和 `greetings`；初始的“无限进步”固定在 `source/js/home-effects.js`。保存后刷新即可看到新文案。

## 节日预览

平时不会显示节日效果。在页面里输入下面任一关键词即可预览：

- `cny`：春节灯笼
- `halloween`：万圣节蝙蝠
- `christmas`：圣诞雪花
- `festival`：依次循环三种节日
- `festivaloff`：关闭节日效果

也可以直接用 `?festival=cny`、`?festival=halloween`、`?festival=christmas` 打开。

