# 快速启动指南

## 🎯 开发模式速查

### 根据你的团队分工选择启动方式：

#### 🧑‍💻 User 组开发者

```bash
# 终端1: 启动 base（共享组件）
pnpm dev:base

# 终端2: 启动 user（你负责的模块）
pnpm dev:user

# 终端3: 启动 host（主应用，自动加载远程 sale）
pnpm dev:local-user
```

访问：http://localhost:3100/user

**配置：**
- ✅ base (localhost:3000) - 本地
- ✅ user (localhost:3001) - 本地（你的代码）
- 🌐 sale (test.example.com:3002) - 远程

---

#### 📢 Sale 组开发者

```bash
# 终端1: 启动 base
pnpm dev:base

# 终端2: 启动 sale（你负责的模块）
pnpm dev:sale

# 终端3: 启动 host（自动加载远程 user）
pnpm dev:local-sale
```

访问：http://localhost:3100/sale

**配置：**
- ✅ base (localhost:3000) - 本地
- 🌐 user (test.example.com:3001) - 远程
- ✅ sale (localhost:3002) - 本地（你的代码）

---

#### 🎨 Base 组开发者

```bash
# 终端1: 启动 base（你负责的模块）
pnpm dev:base

# 终端2: 启动 host（自动加载远程 user 和 sale）
pnpm dev:local-base
```

访问：http://localhost:3100

**配置：**
- ✅ base (localhost:3000) - 本地（你的代码）
- 🌐 user (test.example.com:3001) - 远程
- 🌐 sale (test.example.com:3002) - 远程

---

#### 🔧 全栈开发 / 集成测试

```bash
# 一次性启动所有微应用
pnpm dev
```

访问：http://localhost:3100

**配置：** 所有模块都在本地

---

## 🌐 环境说明

### 配置集中管理

所有环境域名在 `packages/host/config/remotes.config.js` 中配置：

```javascript
const DOMAIN_MAP = {
  local: 'http://localhost',           // 本地开发
  test: 'http://test.example.com',     // 测试环境
  staging: 'http://staging.example.com', // 预发布
  production: 'https://cdn.example.com',  // 生产环境
};

const MODULE_PORTS = {
  base: 3000,
  user: 3001,
  sale: 3002,
};
```

**优势：**
- ✅ 统一管理所有环境域名
- ✅ 修改一处，全局生效
- ✅ 自动生成配置，无需手动编辑 .env

---

## 📋 常用命令

### 在主目录执行

```bash
# 全本地开发
pnpm dev

# User 组开发（推荐）
pnpm dev:local-user

# Sale 组开发（推荐）
pnpm dev:local-sale

# Base 组开发（推荐）
pnpm dev:local-base

# 测试环境联调
pnpm dev:test

# 预发布环境
pnpm dev:staging
```

---

## 🔥 启动日志示例

运行 `pnpm dev:local-user` 会看到：

```
╔════════════════════════════════════════╗
║   微前端 Host 应用启动脚本            ║
╚════════════════════════════════════════╝

🚀 Host 启动配置:
   环境: local
   本地模块: user

📦 远程模块配置:
   base  : base@http://localhost:3000/remoteEntry.js (本地)
   user  : user@http://localhost:3001/remoteEntry.js (本地)
   sale  : sale@http://test.example.com:3002/remoteEntry.js (远程)

✅ 已生成配置文件: .env.temp

🔥 启动 webpack dev server...
```

---

## ❓ 常见问题

### Q: 如何修改测试环境地址？

**A:** 修改 `packages/host/config/remotes.config.js`

```javascript
const DOMAIN_MAP = {
  test: 'http://your-new-test-domain.com', // 改这里
};
```

### Q: 如何添加新的微应用？

**A:** 修改 `packages/host/config/remotes.config.js`

```javascript
const MODULE_PORTS = {
  base: 3000,
  user: 3001,
  sale: 3002,
  product: 3003,  // 添加新模块
};
```

然后就可以使用：
```bash
pnpm dev:local-product
```

### Q: 启动后页面空白怎么办？

**A:** 检查依赖的本地模块是否启动

```bash
# 如果使用 dev:local-user，需要先启动：
pnpm dev:base  # 终端1
pnpm dev:user  # 终端2
```

---

## 📚 更多文档

- **详细启动指南**: `packages/host/START_GUIDE.md`
- **配置说明**: `packages/host/ENV_CONFIG.md`
- **Host 使用文档**: `HOST_USAGE.md`
- **本地开发指南**: `LOCAL_DEV_GUIDE.md`

---

## 🎉 快速上手

**首次使用：**

```bash
# 1. 安装依赖
pnpm install

# 2. 根据你的团队分工选择启动方式
pnpm dev:local-user   # User 组
pnpm dev:local-sale   # Sale 组
pnpm dev:local-base   # Base 组

# 3. 访问应用
open http://localhost:3100
```

**日常开发：**

```bash
# 早上拉取代码
git pull
pnpm install

# 启动开发环境（根据你的分组）
pnpm dev:local-user

# 开发你的代码...

# 提交代码
cd packages/user
git add .
git commit -m "feat: xxx"
git push
```
