---
title: IsmoType：358 道题，看见你的思考坐标
date: 2026-10-18 12:00:00
categories:
  - 项目
tags:
  - TypeScript
  - Vue
  - 人格测试
  - 开源
---

IsmoType 不是一道“你是什么类型”的选择题。它用 358 道题，同时描出你的四字母人格类型，以及你在 12 个构念、37 个维度上的位置。

<!-- more -->

![IsmoType 封面](/img/projects/ismotype-cover.webp)

## 一次作答，两条线

- **人格**：50 题 IPIP-50 性格底色 + 60 题风格类型，先得到四字母类型。
- **立场**：248 题六点量表，投影到 37 维向量，和 121 个主义的轮廓做余弦相似度。
- **时间**：按每题 3 秒估算约 18 分钟，中途可以停下，回来接着答。

![IsmoType 测试界面](/img/projects/ismotype-ui.webp)

## 结果页不编数字

没有常模时，页面会直接写“暂无可比常模”，不会造一个看起来很像百分位的数字。某个维度恰好 50/50 时，会再出一道二选一定向题，结果里不会出现“X”这种中间态。

结果页会给出类型卡、五条维度条、大五偏差条、每个构念的主义排名和前六名雷达图；还能一键生成 1080×1920 的分享长图，跟随当前亮暗主题。

## 纯前端

Vue 3.5 + Vite + Pinia + TypeScript strict。没有后端，作答数据只存在浏览器本地；图表和分享图都是手写内联 SVG / Canvas，没有引图表库。

## 在线体验

- 在线体验：<https://lisparrowc1.github.io/ismotype_test/>
- 源码：<https://github.com/LISparrowC1/ismotype_test>
- 完整实现细节：[IsmoType：一套测试，双重视角](/2026/10/17/ismotype/)

项目以 MIT 协议开源。风格类型段的题库与框架来自 16personalities（NERIS Type Explorer），界面沿用“MBTI”这个中文口语叫法；它不是官方 MBTI 测评工具，与 Myers & Briggs Foundation 及 The Myers-Briggs Company 没有关联。

> 没有标准答案，没有对错判断，每一次选择都在描摹你。
