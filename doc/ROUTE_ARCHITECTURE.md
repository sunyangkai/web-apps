# 路由架构说明

## 架构设计原则

**职责分离：**
- **Host（主应用）**：负责顶层路由，决定哪个路径对应哪个微应用
- **子应用（user/sale）**：负责内部路由，管理自己模块内的页面跳转

## 路由层级

```
┌─────────────────────────────────────────────────────────────┐
│                    Host 顶层路由                             │
├─────────────────────────────────────────────────────────────┤
│  /           →  首页（Home）                                 │
│  /user/*     →  User 微应用（内部路由由 user 自己管理）      │
│  /sale/*     →  Sale 微应用（内部路由由 sale 自己管理）      │
└─────────────────────────────────────────────────────────────┘
                    ↓                        ↓
        ┌───────────────────────┐  ┌───────────────────────┐
        │  User 应用内部路由     │  │  Sale 应用内部路由     │
        ├───────────────────────┤  ├───────────────────────┤
        │  /user      → 列表     │  │  /sale      → 列表     │
        │  /user/:id  → 详情     │  │  /sale/:id  → 详情     │
        │  /user/add  → 新增     │  │  /sale/add  → 新增     │
        └───────────────────────┘  └───────────────────────┘
```

## Host 顶层路由配置

**文件：** `packages/host/src/routes/index.js`

```javascript
const routes = [
  {
    path: '/',
    exact: true,
    component: Home,
  },
  {
    path: '/user',
    component: UserApp,    // UserApp 包含内部路由
    meta: {
      microApp: 'user',
    },
  },
  {
    path: '/sale',
    component: SaleApp,    // SaleApp 包含内部路由
    meta: {
      microApp: 'sale',
    },
  },
];
```

**职责：**
- 定义顶级路径分配（/user、/sale）
- 加载对应的微应用容器
- **不关心**微应用内部的路由细节

## 微应用内部路由

### User 应用路由示例

**文件：** `packages/user/src/App.jsx`

```javascript
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import UserList from './components/UserList';
import UserProfile from './components/UserProfile';
import UserAdd from './components/UserAdd';

function App() {
  const { path } = useRouteMatch();  // 获取当前匹配的路径 (/user)

  return (
    <div className="user-app">
      <Switch>
        <Route exact path={path}>
          <UserList />
        </Route>
        <Route path={`${path}/add`}>
          <UserAdd />
        </Route>
        <Route path={`${path}/:id`}>
          <UserProfile />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
```

**职责：**
- 管理 /user/* 下的所有子路由
- 决定内部页面跳转逻辑
- **独立维护**，不影响其他应用

### Sale 应用路由示例

**文件：** `packages/sale/src/App.jsx`

```javascript
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import CampaignList from './components/CampaignList';
import CampaignDetail from './components/CampaignDetail';
import CampaignAdd from './components/CampaignAdd';

function App() {
  const { path } = useRouteMatch();  // 获取当前匹配的路径 (/sale)

  return (
    <div className="sale-app">
      <Switch>
        <Route exact path={path}>
          <CampaignList />
        </Route>
        <Route path={`${path}/add`}>
          <CampaignAdd />
        </Route>
        <Route path={`${path}/:id`}>
          <CampaignDetail />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
```

## 容器组件

**文件：** `packages/host/src/containers/UserContainer.jsx`

```javascript
import React, { Suspense, lazy } from 'react';

// 导入 user 微应用的 App 组件
const UserApp = lazy(() => import('user/App'));

function UserContainer() {
  return (
    <div className="micro-app-container">
      <Suspense fallback={<div>加载中...</div>}>
        <UserApp />  {/* UserApp 内部有自己的路由 */}
      </Suspense>
    </div>
  );
}

export default UserContainer;
```

**职责：**
- 加载微应用的 App 组件
- 提供加载状态
- 作为微应用和主应用的桥梁

## Module Federation 配置

### User 微应用

**文件：** `packages/user/webpack.config.js`

```javascript
new ModuleFederationPlugin({
  name: 'user',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',  // ✅ 暴露整个应用
    './UserList': './src/components/UserList',     // 可选：单独暴露组件
    './UserProfile': './src/components/UserProfile',
  },
  // ...
})
```

## 路由跳转

### 跨应用跳转（在 Host 或任何子应用中）

```javascript
import { useHistory } from 'react-router-dom';

function SomeComponent() {
  const history = useHistory();

  const goToUser = () => {
    history.push('/user');  // 跳转到 user 应用
  };

  const goToSale = () => {
    history.push('/sale/123');  // 跳转到 sale 应用的详情页
  };

  return (
    <>
      <button onClick={goToUser}>去用户管理</button>
      <button onClick={goToSale}>查看活动详情</button>
    </>
  );
}
```

### 应用内跳转（在 User 应用内）

```javascript
import { useHistory, useRouteMatch } from 'react-router-dom';

function UserList() {
  const history = useHistory();
  const { url } = useRouteMatch();  // 获取当前路径 (/user)

  const goToDetail = (id) => {
    history.push(`${url}/${id}`);  // 跳转到 /user/:id
  };

  const goToAdd = () => {
    history.push(`${url}/add`);  // 跳转到 /user/add
  };

  return (
    <>
      <button onClick={goToAdd}>新增用户</button>
      <button onClick={() => goToDetail(123)}>查看用户123</button>
    </>
  );
}
```

## 添加新微应用

### 1. 在 Host 添加顶层路由

**packages/host/src/routes/index.js**

```javascript
const ProductApp = lazy(() => import('../containers/ProductContainer'));

const routes = [
  // ... 现有路由
  {
    path: '/product',
    component: ProductApp,
    meta: {
      microApp: 'product',
    },
  },
];
```

### 2. 创建容器组件

**packages/host/src/containers/ProductContainer.jsx**

```javascript
import React, { Suspense, lazy } from 'react';

const ProductApp = lazy(() => import('product/App'));

function ProductContainer() {
  return (
    <div className="micro-app-container">
      <Suspense fallback={<div>加载商品模块...</div>}>
        <ProductApp />
      </Suspense>
    </div>
  );
}

export default ProductContainer;
```

### 3. 在子应用中定义内部路由

**packages/product/src/App.jsx**

```javascript
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

function App() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <ProductList />
      </Route>
      <Route path={`${path}/:id`}>
        <ProductDetail />
      </Route>
    </Switch>
  );
}

export default App;
```

### 4. 配置 Module Federation

**packages/product/webpack.config.js**

```javascript
exposes: {
  './App': './src/App',
}
```

## 优势

### ✅ 职责清晰
- Host 只管理顶层路由划分
- 子应用独立管理内部路由

### ✅ 解耦独立
- 子应用路由变更不影响 Host
- 子应用可独立开发、测试、部署

### ✅ 灵活扩展
- 添加新应用只需在 Host 添加一个顶层路由
- 子应用内部路由随意调整

### ✅ 易于维护
- 每个团队维护自己的路由
- 路由配置更清晰

## 注意事项

### 1. 路径前缀

子应用内部使用 `useRouteMatch()` 获取当前路径前缀：

```javascript
const { path, url } = useRouteMatch();
// path: 用于定义 Route 路径模板
// url: 用于生成跳转链接
```

### 2. React Router 共享

确保 Host 和子应用共享同一个 React Router 实例：

```javascript
// webpack.config.js
shared: {
  'react-router-dom': {
    singleton: true,
  },
}
```

### 3. 子应用独立运行

子应用在独立运行时（http://localhost:3001），需要自己的 BrowserRouter：

```javascript
// packages/user/src/App.jsx
import { BrowserRouter } from 'react-router-dom';

// 如果在 Host 中运行，Host 已提供 Router，不需要再包裹
// 如果独立运行，需要自己的 Router

const App = () => (
  <div>
    {/* 内部路由 */}
  </div>
);

// 在 bootstrap.js 或 index.js 中判断是否需要 Router
```

## 总结

**架构核心：**
- **顶层路由**：Host 统一管理（一级路径）
- **内部路由**：子应用自己管理（二级及以下路径）
- **容器组件**：连接主应用和子应用
- **Module Federation**：暴露整个 App 组件

**团队协作：**
- User 组：只需关心 `/user/*` 下的路由
- Sale 组：只需关心 `/sale/*` 下的路由
- Host 组：只需关心顶层路由分配
