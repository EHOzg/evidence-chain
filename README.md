# Evidence Chain (证据链)

本项目是一个跨平台的证据管理与存证平台，旨在通过技术手段确保电子证据的真实性、完整性和法律效力。

## 🚀 项目概览

本项目采用 **Monorepo** 架构管理，集成了 Web 端、桌面端以及移动端（规划中）的开发流程。

### 技术栈

- **前端框架**: [Vue 3.5+](https://vuejs.org/) (使用 Composition API 和 `<script setup>`)
- **构建工具**: [Vite 7+](https://vitejs.dev/)
- **桌面端方案**: [Tauri 2+](https://tauri.app/) (Rust 驱动的轻量级桌面架构)
- **编程语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式处理**: [Sass](https://sass-lang.com/)
- **包管理**: [pnpm](https://pnpm.io/)

## 📂 目录结构

```text
.
├── apps/                # 应用入口
│   ├── web/            # 网页端应用
│   ├── desktop/        # 桌面端应用 (基于 Tauri)
│   ├── android/        # 安卓端 (规划中)
│   ├── ios/            # iOS端 (规划中)
│   └── weep/           # 其他特定业务端
├── packages/           # 共享模块
│   ├── ui/             # 核心 UI 组件库 (符合 Vue 最佳实践)
│   ├── api/            # 封装的 API 请求层
│   ├── store/          # Pinia 状态管理
│   ├── router/         # 路由配置
│   ├── assets/         # 静态资源 (图标、字体等)
│   ├── utils/          # 工具函数库
│   └── types/          # TypeScript 类型定义
├── .agents/            # AI 助手配置与技能 (find-skills, vue-best-practices 等)
├── Cargo.toml          # Rust 工作区配置 (Tauri)
└── package.json        # 根项目配置
```

## 🛠️ 快速开始

### 环境依赖

- **Node.js**: >= 18
- **pnpm**: >= 9
- **Rust**: 最新稳定版 (开发桌面端时需要)

### 安装依赖

```bash
pnpm install
```

### 开发启动

启动 Web 端开发环境：

```bash
pnpm dev:web
```

启动桌面端开发环境：

```bash
pnpm dev:desktop
```

### 项目构建

构建所有子项目：

```bash
pnpm build
```

## 💎 开发规范

本项目严格遵循 [Vue 最佳实践](.agents/skills/vue-best-practices/SKILL.md)：

1.  **Reactivity**: 优先使用 `shallowRef` 处理原始数据类型以提升性能。
2.  **SFC**: 统一使用 `Vue 3.5+` 的 `useTemplateRef` 进行 DOM 访问。
3.  **UI**: 组件开发遵循统一的 UI 规范，存放于 `packages/ui`。

## 📜 许可证

[待定]

## 🤝 贡献指南

欢迎提交 Pull Request！在开始之前，请阅读以下流程：

1. **分支规范**：`feature/xxx`、`fix/xxx`、`docs/xxx`。
2. **代码风格**：遵循项目的 ESLint + Prettier 配置，使用 `pnpm lint` 检查。
3. **提交信息**：遵循 Conventional Commits。
4. **本地调试**：运行 `pnpm dev:web` 或 `pnpm dev:desktop`。
5. **单元测试**：使用 Vitest，执行 `pnpm test`。

## 🐞 常见问题

- **如何在桌面端调试 Tauri？**  
  参考官方文档 `pnpm dev:desktop`，并在 VS Code 中使用 `Tauri: Debug`。

- **依赖冲突**：  
  运行 `pnpm install --frozen-lockfile` 确保锁文件一致。

## 🚀 部署

- **Web 端**：`pnpm build` 生成 `dist`，部署至任意静态服务器（如 Nginx）。
- **桌面端**：`pnpm build` 后执行 `pnpm tauri build`，生成对应平台的安装包。
