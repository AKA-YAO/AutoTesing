# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

基于 `pure-admin-thin` 的 Vue 3 管理模板。轻量级管理后台，使用 Element Plus、Pinia，支持双级权限系统（页面级 + 按钮级）。

## 包管理器

**必须使用 pnpm**（preinstall 钩子会阻止 npm/yarn）。
Node 版本：`^20.19.0 || >=22.13.0`（`.nvmrc`：`v22.20.0`）

## 常用命令

```bash
pnpm dev          # 启动开发服务器（端口 8848）
pnpm build        # 生产环境构建
pnpm build:staging # 预发布环境构建
pnpm preview      # 预览生产构建
pnpm lint         # 运行所有代码检查
pnpm lint:eslint  # 仅运行 eslint
pnpm typecheck    # TypeScript 类型检查
pnpm clean:cache  # 清除缓存并重新安装
```

## 架构说明

### 路由 (`src/router/`)

- **静态路由**：通过 Vite glob 自动导入 `src/router/modules/*.ts`
- **动态路由**：从后端获取（`getAsyncRoutes()`），在 `utils.ts` 中处理
- 多级路由扁平化为二级路由以支持 `keep-alive`
- 权限控制：`meta.roles`（页面级）、`meta.auths`（按钮级）

### 状态管理 (`src/store/`)

Pinia stores：`user`、`permission`（菜单/缓存）、`multiTags`（标签页）、`settings`（主题）。
在 setup 上下文之外使用 `useXxxStoreHook()`。

### HTTP (`src/utils/http/`)

`PureHttp` 类：自动附加 token、token 刷新机制、拦截器。

### 认证 (`src/utils/auth.ts`)

`setToken/getToken/removeToken` 用于 token 管理。`hasPerms()` 用于按钮权限判断。

### 布局 (`src/layout/`)

响应式侧边栏，支持垂直/水平/混合模式，深色/浅色主题。

### 权限控制

`<Auth>/<Perms>` 组件、`v-auth/v-perms` 指令用于按钮级权限控制。

### Mock (`mock/`)

通过 `vite-plugin-fake-server` 模拟 API。登录接口根据用户名返回角色。

### 配置

`public/platform-config.json`：运行时配置。`.env.*`：构建时环境变量。

## 规范约定

- 路径别名：`@/` → `src/`，`@build/` → `build/`
- 组件命名：`Re` 前缀（如 `ReIcon`、`ReAuth`）
- 图标：通过 `unplugin-icons` 使用 `@iconify/vue`
- 提交信息：规范类型（`feat`、`fix`、`perf` 等）

## 添加新页面

1. 在 `src/views/` 中创建页面文件
2. 在 `src/router/modules/` 添加静态路由，或由后端返回动态路由
3. 配置 `meta`：`title`、`icon`、`rank`、`roles`、`auths`、`showLink`、`keepAlive`
