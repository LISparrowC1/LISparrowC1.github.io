---
title: 泰拉瑞亚地图全亮工具：不改模组，直接写存档
date: 2026-10-16 21:00:00
categories:
  - 项目
tags:
  - Python
  - 泰拉瑞亚
  - 工具
---

泰拉瑞亚 1.4.5.x 的地图工具：不装模组、不改世界文件，直接读写存档里的 `.map` 地图文件，把没探索过的地方按世界真实地形显示出来；顺便可以清理不再需要的人物、地图和备份。

<!-- more -->

![TerrariaMapReveal 封面](/img/projects/terraria-cover.webp)

## 两个功能

- **点亮地图**：读取 `.wld` 世界文件，生成一张全亮地图写进 `.map`。矿脉、洞穴、生物群系、浮空岛、地狱都会按真实地形出现。
- **清理存档**：列出人物、地图、备份的占用，删除时一律进 Windows 回收站，删错了可以还原。世界文件 `.wld` 不在清理范围。

![同一张地图，点亮前 / 点亮后](/img/projects/terraria-map.webp)

## 怎么用

1. 完全退出游戏（游戏退出时会把地图写回存档）。
2. 双击 `一键全亮地图.cmd`，选 `1` 点亮或 `2` 清理。
3. 按提示选角色、选世界、确认 `Y`。
4. 工具会先生成前后对比图并打开预览文件夹，然后问要不要恢复成点亮前的样子。
5. 进游戏，选对应角色和世界，按 `M` 看地图。

每次点亮前都会把原地图备份成 `<原文件名>.map.bak-日期时间`，放在同一个角色文件夹里；想恢复时把最新的备份改名覆盖 `.map` 即可。

## 一些实现细节

- 直接按 1.4.5 的原生存档格式读写 `.map`，不依赖模组，也不修改 `.wld`。
- 会校验世界 ID 和尺寸，世界和地图不匹配就跳过，不会写出坏文件。
- 地图最外圈 40 格是游戏每次读档时自己清空的，进游戏走到附近会重新点亮。
- 64 种带配色分支的装饰方块统一使用默认配色，地形本身完全一致。
- 游戏版本更新、存档格式变化时会明确报错，而不是硬写。

## 命令行

```powershell
python reveal_map.py --list          # 只列出角色/世界/地图
python reveal_map.py --player 角色名  # 跳过选角色
python reveal_map.py --world 世界名   # 跳过选世界
python reveal_map.py --yes           # 跳过 Y/N 确认
python reveal_map.py --dark-air      # 只亮地形，未探索的空气保持黑色
python reveal_map.py --dry-run       # 只试算不写文件
python cleanup.py --list             # 只列出占用空间
```

依赖 Python 3 + numpy + Pillow；读取角色难度还需要 `cryptography` 或 `pycryptodome`，缺失时难度显示“未知”，不影响点亮地图。

## 链接

- 源码：<https://github.com/LISparrowC1/TerrariaMapReveal>
- MIT 协议

只影响本地单机地图；开过 Steam 云存档的角色，退出游戏后本地地图会照常上传同步，这是游戏自身行为。
