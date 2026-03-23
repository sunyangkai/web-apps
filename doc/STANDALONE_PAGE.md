# 独立页面打包指南

## 什么是独立页面？

独立页面是指可以**脱离主应用独立访问和部署**的页面，例如：
- 营销活动落地页（不需要完整应用框架）
- 独立的登录页
- 分享页面（微信分享、H5 页面）
- 报表页面（独立访问，无需导航栏）

## 场景示例

**需求：** 将 `/sale/campaign-123` 打包成独立页面，可以单独部署到 `https://h5.example.com/campaign-123`

## 推荐方案：统一 Webpack 配置（通过 BUILD_MODE 控制）

### 核心思想

在同一个 webpack.config.js 中，通过 `BUILD_MODE` 环境变量控制构建模式：
- `BUILD_MODE=main`（默认）→ 主应用模式（Module Federation）
- `BUILD_MODE=standalone` → 独立页面模式（无 Module Federation）

### 1. 创建独立页面入口

**文件结构：**
```
packages/sale/
├── src/
│   ├── App.jsx                    # 主应用（在 Host 中使用）
│   ├── index.js                   # 主应用入口
│   ├── standalone/                # 独立页面目录
│   │   ├── campaign/
│   │   │   ├── index.js          # 独立页面入口
│   │   │   ├── bootstrap.js
│   │   │   └── App.jsx           # 独立页面应用
│   │   └── landing/
│   │       └── ...
│   └── components/
│       └── CampaignDetail/
└── webpack.config.js
```

**创建独立页面应用：**

```javascript
// packages/sale/src/standalone/campaign/App.jsx
import React, { useEffect, useState } from 'react';
import CampaignDetail from '../../components/CampaignDetail';
import './App.css';

/**
 * 独立的营销活动页面
 * 不包含主应用的导航、布局等
 */
function StandaloneCampaign() {
  const [campaignId, setCampaignId] = useState(null);

  useEffect(() => {
    // 从 URL 或配置中获取活动 ID
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || window.__CAMPAIGN_ID__;
    setCampaignId(id);
  }, []);

  if (!campaignId) {
    return <div>加载中...</div>;
  }

  return (
    <div className="standalone-campaign">
      {/* 只渲染活动详情，无导航、无其他布局 */}
      <CampaignDetail campaignId={campaignId} />
    </div>
  );
}

export default StandaloneCampaign;
```

```javascript
// packages/sale/src/standalone/campaign/index.js
import('./bootstrap');
```

```javascript
// packages/sale/src/standalone/campaign/bootstrap.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

### 2. 配置统一 Webpack（通过环境变量控制）

**核心配置：** `packages/sale/webpack.config.js`

```javascript
const BUILD_MODE = process.env.BUILD_MODE || 'main'; // main | standalone
const isStandalone = BUILD_MODE === 'standalone';

module.exports = {
  // 根据模式切换入口
  entry: isStandalone
    ? './src/standalone/campaign/index.js'  // 独立页面
    : './src/index.js',                     // 主应用

  // 根据模式切换输出目录和端口
  devServer: {
    port: isStandalone ? 3003 : 3002,
  },

  output: {
    path: isStandalone ? 'dist-standalone/campaign' : 'dist',
    publicPath: isStandalone ? 'https://h5.example.com/campaign/' : 'http://localhost:3002/',
  },

  plugins: [
    // Module Federation 仅主应用需要
    ...(isStandalone ? [] : [
      new ModuleFederationPlugin({
        name: 'sale',
        exposes: { './App': './src/App' },
      }),
    ]),

    // 根据模式切换 HTML 模板
    new HtmlWebpackPlugin({
      template: isStandalone ? './public/standalone.html' : './public/index.html',
    }),
  ],

  // 独立页面启用代码分割优化
  optimization: isStandalone ? {
    splitChunks: { chunks: 'all' },
  } : undefined,
};
```

**优势：**
- ✅ 只需一个配置文件
- ✅ 通过环境变量切换模式
- ✅ 配置共享，减少重复

### 3. 添加构建脚本

**更新 package.json：**

```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "dev:h5": "BUILD_MODE=standalone webpack serve --mode development",
    "build": "webpack --mode production",
    "build:h5": "BUILD_MODE=standalone webpack --mode production"
  }
}
```

**说明：**
- `BUILD_MODE=main`（默认）- 主应用模式
- `BUILD_MODE=standalone` - 独立页面模式
- webpack.config.js 根据 BUILD_MODE 自动切换配置

### 4. 创建独立页面 HTML 模板

```html
<!-- packages/sale/public/standalone.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="营销活动详情">
    <title>营销活动</title>
    <!-- 可以注入特定的 meta 标签，用于微信分享等 -->
    <script>
      // 可以通过服务端渲染注入活动 ID
      window.__CAMPAIGN_ID__ = '123';
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 5. 构建和部署

```bash
# 构建独立页面
cd packages/sale
pnpm build:standalone

# 产物在 dist-standalone/campaign/ 目录
# 部署到 CDN 或独立服务器
```

**部署后访问：**
```
https://h5.example.com/campaign/?id=123
```

---

## 方案二：使用 Webpack 的 entry 配置多页面

### 1. 配置多个入口

```javascript
// packages/sale/webpack.config.js
module.exports = {
  entry: {
    main: './src/index.js',                      // 主应用
    campaign: './src/standalone/campaign/index.js', // 独立活动页
    landing: './src/standalone/landing/index.js',   // 独立落地页
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/[name].js',  // main/main.js, campaign/campaign.js
    clean: true,
  },
  plugins: [
    // 主应用
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      chunks: ['main'],
    }),
    // 独立活动页
    new HtmlWebpackPlugin({
      template: './public/campaign.html',
      filename: 'campaign/index.html',
      chunks: ['campaign'],
    }),
    // 独立落地页
    new HtmlWebpackPlugin({
      template: './public/landing.html',
      filename: 'landing/index.html',
      chunks: ['landing'],
    }),
  ],
};
```

### 2. 构建产物

```bash
pnpm build

# 产物结构：
dist/
├── index.html              # 主应用
├── main/
│   └── main.js
├── campaign/
│   ├── index.html          # 独立活动页
│   └── campaign.js
└── landing/
    ├── index.html          # 独立落地页
    └── landing.js
```

---

## 方案三：独立项目（推荐用于完全独立的页面）

### 1. 创建独立项目

```
packages/
├── sale/                    # 主应用
├── sale-h5/                 # 独立 H5 页面项目
│   ├── src/
│   │   ├── pages/
│   │   │   ├── campaign/
│   │   │   └── landing/
│   │   └── index.js
│   ├── webpack.config.js
│   └── package.json
```

### 2. 共享组件（通过 Module Federation）

```javascript
// packages/sale-h5/webpack.config.js
new ModuleFederationPlugin({
  name: 'saleH5',
  remotes: {
    sale: 'sale@http://localhost:3002/remoteEntry.js',  // 引用主应用组件
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
})
```

```javascript
// packages/sale-h5/src/pages/campaign/index.js
import React from 'react';
import ReactDOM from 'react-dom';

// 从主应用复用组件
import CampaignDetail from 'sale/CampaignDetail';

function App() {
  return (
    <div className="h5-campaign">
      <CampaignDetail campaignId="123" />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

---

## 使用场景对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **方案一：子应用独立入口** | 少量独立页面 | 代码复用，构建简单 | 配置稍复杂 |
| **方案二：多入口配置** | 多个独立页面 | 统一构建，易管理 | 所有页面在一个项目 |
| **方案三：独立项目** | 完全独立的 H5 | 完全解耦，独立部署 | 需要维护独立项目 |

---

## 实战示例：营销活动独立页

### 目标

将 `/sale/campaign-123` 打包成可以分享的独立 H5 页面

### 实现步骤

**1. 创建独立页面**

```javascript
// packages/sale/src/standalone/campaign/App.jsx
import React, { useEffect, useState } from 'react';
import CampaignDetail from '../../components/CampaignDetail';
import { Tracker } from 'base/Tracker';  // 可以复用埋点 SDK

function StandaloneCampaign() {
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    // 初始化埋点
    const tracker = new Tracker({
      endpoint: '/api/track',
      appId: 'sale-h5',
    });
    tracker.trackPageView();

    // 获取活动数据
    const id = new URLSearchParams(window.location.search).get('id');
    fetchCampaign(id).then(setCampaign);
  }, []);

  return (
    <div className="h5-campaign">
      {campaign && <CampaignDetail campaign={campaign} />}
    </div>
  );
}

export default StandaloneCampaign;
```

**2. 添加构建命令**

```json
{
  "scripts": {
    "build:h5": "BUILD_TARGET=standalone webpack --mode production"
  }
}
```

**3. 构建和部署**

```bash
pnpm build:h5

# 部署到 CDN
rsync -avz dist-standalone/ user@cdn.example.com:/var/www/h5/
```

**4. 访问独立页面**

```
https://h5.example.com/campaign/?id=123
```

---

## 优化建议

### 1. 代码分割

```javascript
// 独立页面也可以代码分割
const CampaignDetail = lazy(() => import('../../components/CampaignDetail'));

<Suspense fallback={<Loading />}>
  <CampaignDetail />
</Suspense>
```

### 2. 预渲染（SSR/SSG）

对于营销页面，可以使用预渲染提升首屏速度：

```bash
# 使用 react-snap 预渲染
pnpm add -D react-snap
```

```json
{
  "scripts": {
    "build:h5": "BUILD_TARGET=standalone webpack --mode production && react-snap"
  },
  "reactSnap": {
    "source": "dist-standalone",
    "include": ["/campaign"]
  }
}
```

### 3. 资源优化

- 压缩图片
- 使用 CDN
- 启用 gzip
- 懒加载非关键资源

### 4. 微信分享优化

```html
<!-- standalone.html -->
<head>
  <!-- 微信分享配置 -->
  <meta property="og:title" content="营销活动详情">
  <meta property="og:description" content="精彩活动，不容错过">
  <meta property="og:image" content="https://cdn.example.com/share.jpg">
</head>
```

---

## 总结

**推荐方案：**
- **少量独立页**：使用方案一（子应用独立入口）
- **大量独立页**：使用方案二（多入口配置）
- **完全独立的产品**：使用方案三（独立项目）

**核心思想：**
- 独立页面 = 独立的入口文件 + 独立的 HTML 模板
- 可以复用主应用的组件和逻辑
- 构建产物完全独立，可单独部署
