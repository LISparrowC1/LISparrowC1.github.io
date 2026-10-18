---
title: dsh-loop-guard：给失控的 Agent 踩一脚刹车
date: 2026-10-18 12:10:00
categories:
  - 项目
tags:
  - DSH
  - Agent
  - 插件
  - 开源
---

一个长任务卡住时，最危险的不是报错，而是它看起来还在工作：同一句话滚到响应上限，反复读同一个文件，或者在 A→B→A 之间打转。dsh-loop-guard 是给 DSH 写的插件，专门在这些“没有进展”的时刻把回合停下来。

<!-- more -->

![dsh-loop-guard 封面](/img/projects/dsh-loop-guard-cover.webp)

## 三种“看起来还在工作”

| 失控方式 | 看起来像什么 |
| --- | --- |
| 重复输出 | 模型把同一句话重复到响应上限，上下文越长越容易出现 |
| 工具循环 | 同一个目标反复读、同一个命令换参数重试，或者 A→B→A 来回走 |
| 失控回合 | 步数、时间、输出持续增长，却没有收敛 |

DSH 自带一个只检测“完全相同”工具调用的提醒，并且只建议模型停下。dsh-loop-guard 补的是更宽的那一段：近似重复、循环链、以及一直没有进展的回合。

![三种失控与 guard 的拦截流程](/img/projects/dsh-flow.webp)

## 它怎么判断

- **周期检测**：在流式文本里找任意长度的重复单元，专门抓“一句短话无限重复”。
- **滚动哈希 shingle**：用一个 64 字符切片覆盖窗口的大部分，抓重复段落，包括没有一直重复到末尾的情况。
- **近似工具链**：同一个工具在相近参数上反复执行时累计计数，到阈值先提醒模型，再继续就取消。
- **回合刹车**：步数、分钟、每小时调用次数、单回合输出长度都可以单独设上限。

工具调用的参数不会被当成模型输出。写文件、跑长命令是真实工作，不是退化。

## 安装

从 git 地址安装，需要把 `<profile>` 换成你实际运行的 DSH profile 名：

```bash
dsh plugin --profile <profile> add github:LISparrowC1/dsh-loop-guard
```

也可以手动把包放进 `$DSH_HOME/profiles/<profile>/node_modules/dsh-loop-guard/`，再在 `cordis.patch.yml` 里加一条 loader。两种方式选一种，重复挂载会让插件跑两遍。

profile patch 只在 DSH 启动时读取，装完要重启 DSH。

## 配置

所有字段都有保守的默认值，想先观察再加严可以先开 `dryRun`：

```yaml
- insert:
    - id: loop-guard
      name: 'dsh-loop-guard'
      config:
        enabled: true
        dryRun: false
        locale: zh
        repetition:
          minRepeats: 8
          minSpanChars: 400
        toolLoop:
          fuzzyAdvisoryAt: 5
          hardStopAt: 12
        brake:
          maxStepsPerTurn: 60
          maxTurnMinutes: 30
```

`dryRun: true` 只记录、不真正拦截；`logEvents: true` 会把判断写进 `$DSH_HOME/loop-guard/events.jsonl`，方便回看是哪一种循环触发的。

## 边界

它使用的是 DSH 文档里的扩展缝，不改 agent loop；被 guard 结束的回合会以明确的错误码收尾，并且最多按配置重跑一次。它不是“催模型继续”的工具，也不负责判断任务本身难不难——它只看有没有进展。

## 链接

- 源码与完整配置：<https://github.com/LISparrowC1/dsh-loop-guard>
- DSH：<https://github.com/deepseek-ai/deepseek-harness>
- MIT 协议
