# 项目更新日志

## 2026-03-09 - 配置优化

### 🎯 主要改动

**优化配置管理方式，从多个 .env 文件改为脚本自动生成**

### ✅ 新增

1. **集中配置文件**
   - `packages/host/config/remotes.config.js` - 统一管理所有环境域名和模块配置

2. **自定义启动脚本**
   - `packages/host/scripts/start.js` - 自动生成配置并启动应用

3. **新的启动命令**
   ```bash
   pnpm dev:local-user   # User 组开发
   pnpm dev:local-sale   # Sale 组开发
   pnpm dev:test         # 测试环境
   pnpm dev:staging      # 预发布环境
   ```

4. **文档**
   - `QUICK_START.md` - 快速启动指南
   - `packages/host/START_GUIDE.md` - 详细启动说明
   - 更新 `README.md` - 项目概览

### ❌ 删除

1. **废弃的 .env 文件**
   - `.env.development`
   - `.env.test`
   - `.env.production`
   - `.env.local.user`
   - `.env.local.sale`
   - `.env.local.base`

2. **过时的文档**
   - `LOCAL_DEV_GUIDE.md`
   - `MICRO_FRONTEND_NAVIGATION.md`
   - `packages/host/ENV_CONFIG.md`

### 🔧 优化

1. **配置集中管理**
   - 所有环境域名在 `remotes.config.js` 中配置
   - 修改一处，全局生效

2. **自动生成配置**
   - 启动时自动生成 `.env.temp` 文件
   - 无需手动编辑 .env

3. **清晰的启动日志**
   - 显示当前环境
   - 显示本地模块
   - 显示远程模块配置

### 📋 迁移指南

**旧方式：**
```bash
# 修改 .env.local.user 文件
REMOTE_SALE_URL=sale@http://test.example.com:3002/remoteEntry.js

# 启动
pnpm dev:local-user
```

**新方式：**
```bash
# 修改 config/remotes.config.js
const DOMAIN_MAP = {
  test: 'http://test.example.com',
};

# 启动（命令不变）
pnpm dev:local-user
```

### 💡 核心优势

- ✅ **统一配置** - 一个文件管理所有环境
- ✅ **资源统一** - base/user/sale 名称一致
- ✅ **变量控制** - 通过参数灵活切换
- ✅ **易于维护** - 添加新模块/环境只需修改配置文件
- ✅ **清晰日志** - 启动时显示详细配置

---

## 2026-03-06 - 环境配置

### ✅ 新增

- 添加 dotenv-webpack 支持多环境配置
- 创建 `.env.development`、`.env.test`、`.env.production` 文件
- 支持环境切换：`NODE_ENV=test pnpm build`

---

## 2026-03-06 - 埋点 SDK

### ✅ 新增

- 创建轻量化埋点 SDK (`packages/base/src/sdk/tracker.js`)
- 支持页面浏览、点击、错误、性能追踪
- 批量上报、自动上报机制
- 详细使用文档 (`packages/base/src/sdk/README.md`)
- 原理解析文档 (`packages/base/src/sdk/PRINCIPLES.md`)

---

## 2026-03-06 - Git Submodule

### ✅ 新增

- 将 packages 转换为 Git Submodule 架构
- 每个模块独立 Git 仓库
- 添加 submodule 管理命令：`pnpm sm:init`、`pnpm sm:update`、`pnpm sm:push` 等
- 创建 `SUBMODULES.md` 说明文档

---

## 初始化

### ✅ 新增

- 创建基础微前端架构
- 三个微应用：base、user、sale
- Webpack Module Federation 配置
- pnpm + Turborepo 构建工具
- 基础组件和样式
