# 🖥️ Luxas OS

> 一个轻量级实验性操作系统，采用微内核架构，核心内存占用 < 100KB。

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Linux%20(User%20Mode)-blue.svg)](https://www.linux.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Microkernel-orange.svg)](ARCHITECTURE.md)

## 📖 目录

- [项目简介](#-项目简介)
- [系统架构](#-系统架构)
- [环境要求](#-环境要求)
- [快速开始](#-快速开始)
  - [方式一：一键启动](#方式一一键启动推荐)
  - [方式二：分步操作](#方式二分步操作)
- [系统保护与管理](#-系统保护与管理)
- [系统配置](#-系统配置)
- [iOS 27 前端设计系统](#-ios-27-前端设计系统)
- [项目结构](#-项目结构)
- [常见问题](#-常见问题)
- [开源协议](#-开源协议)
- [贡献指南](#-贡献指南)

---

## 📝 项目简介

**Luxas OS** 是一个轻量级实验性操作系统，采用微内核（Microkernel）架构设计。系统以用户态方式运行于 Linux 宿主机环境，无需裸机安装。

核心特性：
- 🚀 **极致轻量**：核心组件总内存占用 < 100KB
- 🪟 **Windows 子系统**：支持 25 个系统调用、DLL 模拟、DirectX ↔ Vulkan 转换
- 🎨 **Luxas Shell**：图形化 Shell，支持合成器、窗口管理、AI 模块集成
- 🤖 **本地 AI 助手**：支持 GGUF/4-bit 模型加载，离线对话交互

---

## 🏗️ 系统架构

| 模块 | 描述 | 内存占用 | 延迟/性能 |
|------|------|----------|-----------|
| **Kernel Lite** | 轻量内核，IPC、进程调度、中断处理、内存管理 | < 100KB | 微秒级 |
| **Luxas Shell** | 图形化 Shell，合成器、窗口管理、Vulkan 渲染 | < 1ms | GPU 加速 |
| **Windows 子系统** | 系统调用映射、DLL 模拟、API 兼容层 | — | 原生兼容 |
| **AI 模块** | 本地大模型推理、对话交互、上下文管理 | 可配置 | 4-bit 量化 |

---

## 💻 环境要求

- **操作系统**：Linux（用户态运行，无需 Root）
- **最低内存**：280 MB
- **最低 CPU**：3 核
- **依赖工具**：`bash`, `tar`, `git`

---

## 🚀 快速开始

### 方式一：一键启动（推荐）bash

```# 1. 克隆仓库
git clone https://gitee.com/Luxas/luxas-os.git
cd luxas-os

# 2. 赋予执行权限
chmod +x run.sh build.sh start.sh clean.sh luxas_protect.sh

# 3. 一键启动（自动检测、编译并运行）
./
```

`run.sh` 会自动完成：
1. 检查系统文件是否被隐藏，如有则自动恢复
2. 检测核心二进制，缺失时自动调用 `build.sh` 编译
3. 启动 Kernel Lite 内核

### 方式二：分
```bash
# 1. 编译全部模块
./build.sh

# 2. 启动系统
./start.sh

# 3. 清理构建产物（可选）
./
```

---

## 🛡️ 系统保护与管理

`luxas_protect.sh` 提供完整的文件保护、隐藏与备份功能：bash

```./luxas_protect.sh help      # 查看帮助
./luxas_protect.sh hide      # 隐藏核心文件至 .luxas_os
./luxas_protect.sh show      # 恢复显示核心文件
./luxas_protect.sh protect   # 设置 immutable 属性防篡改
./luxas_protect.sh unprotect # 取消保护
./luxas_protect.sh status    # 查看保护状态
./luxas_protect.sh backup    # 备份系统
./luxas_protect.sh restore   # 从
```

> 💡 备份文件存储在 `backups/` 目录，命名格式：`luxas_os_backup_YYYYMMDD_HHMMSS.tar.gz`

---

## ⚙️ 系统配置

配置文件位于 `config/system`，支持自定义：
- 系统内存限制
- Luxas Shell 渲染参数
- Windows 子系统映射配置
- AI 模型路径与 GPU 加速选项

---

## 🎨 iOS 27 前端设计系统

本项目附带一套 **iOS 27 风格 Web 前端设计系统**，开箱即用：

| 文件 | 用途 |
|------|------|
| `ios27_design_system.css` | Design Tokens（颜色、字体、间距、圆角等） |
| `ios27_complete.css` | 完整 UI 样式库 |
| `ios27_fluid.css` | 流体动画样式（弹性动画 0.3-0.5s） |
| `ios27_interactions.js` | 交互逻辑处理 |
| `ios27_animations.js` | 粒子系统与动画效果 |
| `ios27_ui_templates.html` | 预设 UI 模板 |

#### 浏览器兼容性

✅ Chrome 90+ · ✅ Firefox 88+ · ✅ Safari 14+ · ✅ Edge 90+

#### 快速接入html

```<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iOS 27 示例</title>
  <link rel="stylesheet" href="ios27_complete.css">
  <link rel="stylesheet" href="ios27_fluid.css">
</head>
<body>
  <script src="ios27_animations.js"></script>
  <script src="ios27_interactions.js"></script>
</body>
</html>
```

---

## 📁 项目结构

```
luxas-os/
├── README.md                    # 项目说明
├── STARTUP.md                   # 启动流程说明
├── ARCHITECTURE.md              # 系统架构文档
├── CHECK_REPORT.md              # 系统检查报告
├── IMPLEMENTATION_SUMMARY.md    # 实现摘要
├── PROTECTION.md                # 保护机制说明
├── run.sh                       # 一键启动脚本
├── luxas_protect.sh             # 系统保护/备份工具
│
├── ios27_design_system.css      # iOS 27 设计 Tokens
├── ios27_complete.css           # 完整样式
├── ios27_fluid.css              # 流体动画
├── ios27_interactions.js        # 交互逻辑
├── ios27_animations.js          # 动画与粒子系统
├── ios27_ui_templates.html      # UI 模板
└── ios27_readme.md              # iOS 27 设计系统文档
```

> ⚠️ **注意**：核心内核与子系统源码（`kernel_lite/`、`luxas_shell/` 等）在启动后可能被自动隐藏至 `.luxas_os` 目录。使用 `./luxas_protect.sh show` 可恢复查看。

---

## ❓ 常见问题

#### 1. Canvas 元素未找到
确保 HTML 中存在 `<canvas id="aurora-canvas"></canvas>`。

#### 2. 窗口管理器未初始化
确保 `ios27_interactions.js` 已正确加载，且 DOM 加载完成后再调用。

#### 3. 控制中心无法打开
使用 `DOMContentLoaded` 事件确保 DOM 就绪后再调用 `controlCenter.open()`。

---

## 📜 开源协议

本项目采用 **MIT License** 开源协议。详见 [LICENSE](LICENSE) 文件。

---

## 🤝 贡献指南

欢迎提交 Issue 或 Pull Request！

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/xxx`）
3. 提交更改（`git commit -m 'feat: add xxx'`）
4. 推送到分支（`git push origin feature/xxx`）
5. 发起 Pull Request

#### 贡献建议
- 📝 完善文档（中文 / 英文）
- 🐛 提交 Bug 报告
- 💡 提出功能改进建议
- 🌐 参与 Gitee 社区交流`


```---

