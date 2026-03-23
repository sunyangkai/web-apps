# Host 主应用使用指南

## 什么是 Host？

Host 是微前端架构的**主应用（容器应用）**，它提供：

✅ 统一的应用入口和导航
✅ 无刷新的应用间跳转
✅ 共享的依赖管理（React、React Router）
✅ 统一的布局和样式

## 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     Host 主应用 (3100)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           导航栏：首页 | 用户管理 | 营销活动          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  路由切换区域                                         │   │
│  │                                                       │   │
│  │  /       → 首页（应用导航卡片）                       │   │
│  │  /user   → 加载 user 微应用 (3001)                   │   │
│  │  /sale   → 加载 sale 微应用 (3002)                   │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  依赖: base (3000) - 共享组件、工具、埋点SDK               │
└─────────────────────────────────────────────────────────────┘
```

## 快速开始

### 方式一：启动所有应用（推荐）

```bash
# 在主目录执行，Turborepo 会同时启动所有微应用
pnpm dev
```

然后访问：
- **Host 主应用：** http://localhost:3100
- base: http://localhost:3000
- user: http://localhost:3001
- sale: http://localhost:3002

### 方式二：单独启动 Host

```bash
# 先启动依赖的微应用
pnpm dev:base   # 终端1
pnpm dev:user   # 终端2
pnpm dev:sale   # 终端3

# 最后启动 host
pnpm dev:host   # 终端4
```

**重要：** Host 依赖其他微应用，必须先启动 base、user、sale！

## 功能演示

### 1. 首页导航

访问 `http://localhost:3100/`

```
┌──────────────────────────────────────┐
│    欢迎使用微前端系统                  │
│                                      │
│  ┌─────────┐      ┌─────────┐       │
│  │   👥    │      │   📢    │       │
│  │ 用户管理  │      │ 营销活动  │       │
│  │         │      │         │       │
│  └─────────┘      └─────────┘       │
└──────────────────────────────────────┘
```

点击卡片即可跳转到对应模块。

### 2. 用户管理模块

访问 `http://localhost:3100/user`

- 显示用户列表（来自 user 微应用）
- 点击用户查看详情
- 无刷新跳转，体验流畅

### 3. 营销活动模块

访问 `http://localhost:3100/sale`

- 显示营销活动列表（来自 sale 微应用）
- 点击活动查看详情
- 与用户模块之间可以无刷新切换

## 应用间跳转

### 在 Host 中跳转

```javascript
import { Link, useHistory } from 'react-router-dom';

// 方式1：使用 Link
<Link to="/user">去用户管理</Link>
<Link to="/sale">去营销活动</Link>

// 方式2：使用 useHistory
const history = useHistory();
history.push('/user');
```

### 在子应用中跳转回 Host

由于 user 和 sale 被加载到 Host 中，它们共享 Host 的 Router：

```javascript
// packages/user/src/components/UserList.jsx
import { useHistory } from 'react-router-dom';

function UserList() {
  const history = useHistory();

  const goToSale = () => {
    history.push('/sale'); // 跳转到营销活动模块
  };

  return (
    <div>
      <button onClick={goToSale}>查看营销活动</button>
    </div>
  );
}
```

## 状态共享

### 方式1：通过 LocalStorage

```javascript
// user 应用中保存
localStorage.setItem('currentUser', JSON.stringify(user));

// sale 应用中读取
const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
```

### 方式2：通过 base 共享模块

```javascript
// packages/base/src/utils/store.js
let globalState = {};

export const getState = (key) => globalState[key];
export const setState = (key, value) => {
  globalState[key] = value;
};

// user 应用中设置
import { setState } from 'base/utils';
setState('selectedUser', user);

// sale 应用中获取
import { getState } from 'base/utils';
const user = getState('selectedUser');
```

### 方式3：通过 URL 参数

```javascript
// user 跳转时传参
history.push('/sale?userId=123&source=user');

// sale 读取参数
const params = new URLSearchParams(window.location.search);
const userId = params.get('userId');
const source = params.get('source');
```

## 独立运行 vs Host 运行

### 独立运行模式

user 和 sale 可以独立运行（用于开发调试）：

```bash
pnpm dev:user
# 访问 http://localhost:3001
```

特点：
- 完整的 HTML 页面
- 独立的导航和布局
- 页面刷新式跳转

### Host 集成模式

在 Host 中运行（用于生产环境）：

```bash
pnpm dev
# 访问 http://localhost:3100/user
```

特点：
- 共享 Host 的导航和布局
- 无刷新跳转
- 共享 React Router

## 环境配置

Host 支持多环境部署：

```bash
# 开发环境（默认）
pnpm dev

# 测试环境
NODE_ENV=test pnpm build

# 生产环境
NODE_ENV=production pnpm build
```

环境变量配置在 `packages/host/.env.*` 文件中：

```env
# .env.development
REMOTE_BASE_URL=base@http://localhost:3000/remoteEntry.js
REMOTE_USER_URL=user@http://localhost:3001/remoteEntry.js
REMOTE_SALE_URL=sale@http://localhost:3002/remoteEntry.js

# .env.production
REMOTE_BASE_URL=base@https://cdn.example.com/base/remoteEntry.js
REMOTE_USER_URL=user@https://cdn.example.com/user/remoteEntry.js
REMOTE_SALE_URL=sale@https://cdn.example.com/sale/remoteEntry.js
```

## 添加新的微应用

### 1. 在 webpack.config.js 中注册

```javascript
// packages/host/webpack.config.js
remotes: {
  base: process.env.REMOTE_BASE_URL,
  user: process.env.REMOTE_USER_URL,
  sale: process.env.REMOTE_SALE_URL,
  product: 'product@http://localhost:3003/remoteEntry.js', // 新增
}
```

### 2. 在 App.jsx 中添加路由

```javascript
// packages/host/src/App.jsx
const ProductApp = lazy(() => import('product/ProductList'));

<Route path="/product">
  <ProductApp />
</Route>
```

### 3. 在导航中添加链接

```javascript
<NavLink to="/product" activeClassName="active">
  商品管理
</NavLink>
```

## 常见问题

### Q1: 启动 Host 后页面空白？

**A:** 检查是否先启动了依赖的微应用（base、user、sale）

```bash
# 查看端口占用
netstat -ano | findstr "3000"  # base
netstat -ano | findstr "3001"  # user
netstat -ano | findstr "3002"  # sale
```

### Q2: 如何调试特定微应用？

**A:** 使用单独启动模式

```bash
# 只启动 user
pnpm dev:user

# 访问 http://localhost:3001 独立调试
```

### Q3: 生产环境如何部署？

**A:** 分别构建和部署各个微应用

```bash
# 构建所有应用
NODE_ENV=production pnpm build

# 部署到 CDN
packages/base/dist  → https://cdn.example.com/base/
packages/user/dist  → https://cdn.example.com/user/
packages/sale/dist  → https://cdn.example.com/sale/
packages/host/dist  → https://cdn.example.com/host/
```

### Q4: 应用间如何通信？

**A:** 三种方式
1. LocalStorage/SessionStorage（简单数据）
2. base 共享模块（实时状态）
3. URL 参数（临时数据）

## 技术架构

- **React 16.14.0** - 核心框架
- **React Router DOM 5.3.4** - 路由管理
- **Webpack 5 Module Federation** - 微前端加载
- **dotenv-webpack** - 环境变量管理
- **Turborepo** - Monorepo 构建工具

## 更多资源

- [Module Federation 文档](https://webpack.js.org/concepts/module-federation/)
- [React Router 文档](https://v5.reactrouter.com/)
- [微前端导航方案](./MICRO_FRONTEND_NAVIGATION.md)
