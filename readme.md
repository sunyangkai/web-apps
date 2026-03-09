# 微前端项目

基于 React 16 + Webpack Module Federation 构建的微前端架构。

## 快速开始

```bash
# 安装依赖
pnpm install

# 根据你的团队分工选择启动方式
pnpm dev              # 全本地开发
pnpm dev:local-user   # User 组开发
pnpm dev:local-sale   # Sale 组开发
pnpm dev:test         # 测试环境

# 访问应用
open http://localhost:3100
```

## 项目结构

```
packages/
├── host/     # 主应用（容器）- 端口 3100
├── base/     # 共享组件库 - 端口 3000
├── user/     # 用户管理模块 - 端口 3001
└── sale/     # 营销活动模块 - 端口 3002
```

## 核心特性

- ✅ **微前端架构** - 模块独立开发、部署
- ✅ **Git Submodule** - 每个模块独立仓库
- ✅ **环境配置** - 通过脚本自动生成，集中管理
- ✅ **混合开发** - 本地开发某模块，其他从远程加载
- ✅ **埋点 SDK** - 轻量化数据采集工具

## 文档

- **快速开始**: [QUICK_START.md](./QUICK_START.md)
- **Host 使用**: [HOST_USAGE.md](./HOST_USAGE.md)
- **Submodule 管理**: [SUBMODULES.md](./SUBMODULES.md)
- **详细启动指南**: [packages/host/START_GUIDE.md](./packages/host/START_GUIDE.md)

## 技术栈

- React 16.14.0
- Webpack 5 Module Federation
- React Router DOM 5.3.4
- pnpm + Turborepo
- dotenv-webpack

## 常用命令

### 开发

```bash
pnpm dev              # 全本地开发
pnpm dev:local-user   # User 组开发（推荐）
pnpm dev:local-sale   # Sale 组开发（推荐）
pnpm dev:test         # 测试环境联调
```

### 构建

```bash
pnpm build            # 构建所有模块
pnpm build:test       # 测试环境构建
pnpm build:prod       # 生产环境构建
```

### Git Submodule

```bash
pnpm sm:init          # 初始化子模块
pnpm sm:update        # 更新子模块
pnpm sm:status        # 查看子模块状态
pnpm sm:push          # 推送所有子模块
```

## 环境配置

所有环境配置集中在 `packages/host/config/remotes.config.js`：

```javascript
const DOMAIN_MAP = {
  local: 'http://localhost',
  test: 'http://test.example.com',
  staging: 'http://staging.example.com',
  production: 'https://cdn.example.com',
};
```

修改域名只需改这个配置文件，所有启动命令自动生效。

## 团队协作

- **User 组** → `pnpm dev:local-user`
- **Sale 组** → `pnpm dev:local-sale`
- **Base 组** → `pnpm dev:local-base`
- **全栈/测试** → `pnpm dev`

## License

MIT
