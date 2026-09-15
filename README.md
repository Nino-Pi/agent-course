# Agent 工程课程

一套持续更新的中文学习资料：从智能代理（Agent）怎样围绕目标行动，逐步理解运行支撑（Agent Harness）如何组织模型、工具、状态、权限与协作，再进入系统设计、能力改进与算法复习。

**[在线课程首页](https://nino-pi.github.io/agent-course/)** · **[从第 01 章开始](https://nino-pi.github.io/agent-course/notes/maka/learning/01-agent-components.html)** · **[前沿进阶](https://nino-pi.github.io/agent-course/frontier/index.html)** · **[Hot100 三小时系统速览](https://nino-pi.github.io/agent-course/extras/hot100-python39.html#quick-review)**

## 仓库包含什么

截至 2026-09-13，已发布 **66 章基础课程、8 章前沿进阶，以及一份 Hot100 完整指南**。课程目录、术语表、图解索引和审核材料分别列出，不计入正文章数。

| 内容 | 覆盖范围 | 阅读入口 |
| --- | --- | --- |
| **Agent 工程基础** | 01–66 章，分五个阶段，从最小执行循环到完整系统设计与代表实现 | [学习路线](https://nino-pi.github.io/agent-course/notes/maka/learning/README.html) |
| **Agent 前沿进阶** | 已发布 01–08 章，讨论失败诊断、实验评价、经验使用、主动取证和训练基础 | [进阶目录](https://nino-pi.github.io/agent-course/frontier/index.html) |
| **Hot100 · Python 3.9** | 输入输出、21 个知识单元、三小时系统速览、分轮题单与完整参考程序 | [完整指南](https://nino-pi.github.io/agent-course/extras/hot100-python39.html) |
| **随读查阅材料** | 中英文术语、专题路线、运行案例和图解索引 | [术语表](https://nino-pi.github.io/agent-course/notes/maka/learning/glossary.html) · [运行案例](https://nino-pi.github.io/agent-course/notes/maka/learning/labs/README.html) · [工程图解](https://nino-pi.github.io/agent-course/notes/maka/learning/advanced/diagram-index.html) |

## 基础课程的五阶段框架

课程以代码修复任务为贯穿案例：理解目标、检查项目、选择动作、读取结果、处理失败，最后说明交付依据。先用 mini-SWE-agent 理解最小循环，再用 Maka 展开各项机制，并结合 Codex、Claude Code 等代表实现分析设计取舍。

| 阶段 | 章节 | 主要内容 | 核心问题 |
| --- | --- | --- | --- |
| **一、最小 Agent、项目环境与机制桥接** | [01–10](https://nino-pi.github.io/agent-course/notes/maka/learning/01-agent-components.html) | 模型请求、行动与观察、代码修复、执行轨迹、崩溃窗口、项目环境、Python 与 TypeScript 读法 | 模型提出的请求怎样成为真实执行？最小循环还需要哪些保障？ |
| **二、Maka 核心机制与任务接续** | [11–27](https://nino-pi.github.io/agent-course/notes/maka/learning/11-agent-architecture.html) | 请求生命周期、工作身份、事件、上下文、工具、权限、恢复、记忆、技能与子代理、跨会话接续 | 一次任务的输入、执行、状态与后续工作怎样配合？ |
| **三、工程设计、代表实现与综合** | [28–47](https://nino-pi.github.io/agent-course/notes/maka/learning/28-system-design.html) | 工具合同、沙箱后端、代码检索、上下文与记忆、编排、任务评价、检查点与重放 | 同一问题有哪些实现方式？组合后怎样处理失败并比较成本？ |
| **四、设计问题与完整案例** | [48–62](https://nino-pi.github.io/agent-course/notes/maka/learning/48-design-answers.html) | 从需求推导接口、状态、权限、输入组织、工具调度、连续执行与验证方案 | 怎样把机制知识组织成一套完整设计？ |
| **五、代表运行支撑与跨场景机制** | [63–66](https://nino-pi.github.io/agent-course/notes/maka/learning/63-deepseek-harness.html) | DeepSeek Harness、Pi、观察与对象定位、Muse 个人代理 | 前面学到的责任怎样在不同系统和使用场景中组合？ |

贯穿五个阶段的是六组职责：**输入组织（Input Composition）、模型与工具循环（Model / Tool Loop）、状态与恢复（State / Recovery）、权限与隔离（Permissions / Isolation）、任务推进与协作（Task Progress / Collaboration）、观察与评价（Observation / Evaluation）**。这是帮助阅读的教学分组，各章再说明具体机制之间的关系。

第一次接触智能代理（Agent），从第 01 章顺序读即可。已有编程经验、希望按主题回查，可以使用[学习路线](https://nino-pi.github.io/agent-course/notes/maka/learning/README.html)和[工程深化目录](https://nino-pi.github.io/agent-course/notes/maka/learning/advanced/README.html)；准备梳理设计思路，可以进入[设计问题与完整案例目录](https://nino-pi.github.io/agent-course/notes/maka/learning/interview/README.html)，同时保留章首列出的前置知识。

## 前沿进阶：从执行走向改进

这一册面向已有智能代理（Agent）与运行支撑（Agent Harness）基本概念的读者，围绕“改哪里、怎样比较、经验由谁使用、更新如何改变输出”展开。

- **01–05：诊断、实验与经验。** 从一次失败定位改进对象，理解配对实验、选择偏差、归因、任务评分，以及执行轨迹怎样被诊断、记忆、程序优化和训练使用。
- **06：固定模型时的主动取证。** 面对资料冲突，怎样选择下一次观察，整理上下文，并按证据和预算决定何时停止。
- **07–08：模型训练的数学基础。** 从概率与张量读到损失、梯度、优化器状态和低秩适配（Low-Rank Adaptation，LoRA），用数值例子解释参数更新怎样改变下一次输出。

[进阶目录](https://nino-pi.github.io/agent-course/frontier/index.html)按七编组织：从执行走向改进、固定模型时的能力提升、环境与经验生产、模型训练、系统自动演化、评价与监督深化、自主研究与递归自我改进（Recursive Self-Improvement，RSI）。**目前已发布的是上述 8 章，其余主题在目录中标为后续计划。** 各章给出实际前置关系，读者可按兴趣选择固定模型路线或数学与训练路线。

## Hot100：理论速览与三天编码练习

以 Python 3.9 标准库为基础，提供算法讲解、代码注释、复杂度比较、完整输入输出、样例与边界。

| 内容 | 用途 | 入口 |
| --- | --- | --- |
| **三小时速览** | 从统一程序框架开始，系统回顾 Hot100 涉及的数据结构与算法 | [开始阅读](https://nino-pi.github.io/agent-course/extras/hot100-python39.html#quick-review) |
| **三天编码练习** | 每天按类换题，分别安排 21、20、21 道核心；共 62 道不同核心与 38 道按需加练 | [三天总表](https://nino-pi.github.io/agent-course/extras/hot100-python39.html#interview-rounds) |
| **Hot100 完整教材** | 第一轮 38 道代表题，第二轮 62 道迁移与综合题；按 21 个知识单元查阅全部 100 题 | [教材与题单](https://nino-pi.github.io/agent-course/extras/hot100-python39.html#hot100-index) |
| **第三轮按需强化** | 面试经典 150 精选 18 题，以及额外模型、完整程序与强化视频 | [第三轮](https://nino-pi.github.io/agent-course/extras/hot100-python39.html#third-round-study) |

本次复习顺序是“三小时理论回顾 → 三天编码练习”，完整教材随题查阅。教材的第一、第二轮是同一套 Hot100 的另一种阅读顺序。三小时、三天练习和教材前两轮只使用 Hot100；额外题目、通用强化模板与混合例题视频集中在第三轮。

每天覆盖 18 个轮换类别，加 2 道专项核心，保留全部 12 道 Hard。每个日期页都有全部 100 题的主解材料：当天核心展开，同类其他题折叠附后。三小时是已有基础读者的回顾预算，阅读与练习进度按实际耗时调整。

**[第 1 天 · 周二](https://nino-pi.github.io/agent-course/extras/hot100-day-1.html)** · **[第 2 天 · 周三](https://nino-pi.github.io/agent-course/extras/hot100-day-2.html)** · **[第 3 天 · 周四](https://nino-pi.github.io/agent-course/extras/hot100-day-3.html)**

## 怎样阅读

- 在电脑或 iPad 浏览器中打开[在线课程](https://nino-pi.github.io/agent-course/)，无需配置模型服务或运行课程中的项目。
- 基础课程以概念、代码讲解、案例过程与参考问答为主。教学推演和实际运行的条件会分别说明，阅读时结合章首概览与案例背景。
- 目录、章节链接和页内跳转用于定位内容，浏览器返回可回到上一处阅读位置；较宽的表格与图解可按页面提示横向查看。
- 当前提供在线静态网页，尚未提供整套课程的自动离线缓存。离线备份可以保存完整仓库；在电脑上解压或克隆后，从仓库根目录启动静态服务即可阅读本地页面，外部原题与资料链接仍需联网。

本地预览可使用 Python 自带的静态服务：

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

随后在同一台电脑的浏览器中访问 `http://127.0.0.1:8000/`。

## 仓库结构与维护

仓库保存用于 GitHub Pages 发布的 HTML、样式、脚本和教学附件。

```text
agent-course/
├── README.md                 # 仓库介绍与阅读入口
├── index.html                # 在线课程首页
├── notes/maka/learning/      # 基础课程 01–66 章、路线、术语与图解索引
├── frontier/                 # 前沿进阶正文、目录与页面资源
├── extras/                   # Hot100 完整指南与三个独立编码练习页
├── attachments/              # 课程引用的教学附件与示例
├── assets/                   # 公共样式、阅读脚本、图解与字体等资源
├── reviews/                  # 审核范围与课程重构说明
├── extended-reading.html     # 未随本站收录的扩展资料说明
└── .nojekyll                 # GitHub Pages 静态文件发布配置
```

需要了解维护背景时，可查看[基础课程准确性审核](https://nino-pi.github.io/agent-course/reviews/foundation-accuracy.html)和[进阶重构方案](https://nino-pi.github.io/agent-course/reviews/frontier-reconstruction.html)。这些页面记录审核范围与维护判断，不作为课程章节。部分原始研究资料未随本站收录，相关入口会指向[扩展资料说明](https://nino-pi.github.io/agent-course/extended-reading.html)。

课程持续更新。新增章节或调整阅读路线时，同步维护本 README 的内容总览、章节范围和入口；发布更新时保留仓库说明文件。发现错字、断链或解释不清的地方，可以在 [Issues](https://github.com/Nino-Pi/agent-course/issues) 中附上页面链接与具体段落。
