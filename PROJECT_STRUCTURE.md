# 项目结构和 Turbo 配置说明

## 项目结构

```
web-apps/
├── .git/                           # Git 仓库
├── .gitignore                      # Git 忽略文件配置
├── .npmrc                          # pnpm 配置
├── .prettierrc                     # Prettier 代码格式化配置
├── .prettierignore                 # Prettier 忽略文件
├── package.json                    # 根项目配置
├── pnpm-workspace.yaml             # pnpm workspace 配置
├── pnpm-lock.yaml                  # pnpm 依赖锁定文件（自动生成）
├── turbo.json                      # Turborepo 配置
├── node_modules/                   # 根依赖目录
│   ├── .pnpm/                     # pnpm 存储区
│   ├── turbo/                     # Turborepo
│   └── prettier/                  # Prettier
│
└── packages/                       # 子项目目录
    ├── base/                      # 基础模块 (端口 3000)
    │   ├── public/
    │   │   └── index.html
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── Button.jsx     # 公共按钮组件
    │   │   │   └── Header.jsx     # 公共头部组件
    │   │   ├── styles/
    │   │   │   └── common.css     # 公共样式
    │   │   ├── utils/
    │   │   │   └── index.js       # 工具函数
    │   │   └── index.js           # 入口文件
    │   ├── dist/                  # 构建输出（被 Turbo 缓存）
    │   ├── .babelrc               # Babel 配置
    │   ├── package.json           # base 包配置
    │   ├── webpack.config.js      # Webpack 配置
    │   └── node_modules/          # base 特有依赖
    │
    ├── user/                      # 用户模块 (端口 3001)
    │   ├── public/
    │   │   └── index.html
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── UserList.jsx   # 用户列表组件
    │   │   │   └── UserProfile.jsx # 用户详情组件
    │   │   ├── styles/
    │   │   │   └── user.css       # 用户模块样式
    │   │   ├── App.jsx            # 用户应用主组件
    │   │   └── index.js           # 入口文件
    │   ├── dist/                  # 构建输出（被 Turbo 缓存）
    │   ├── .babelrc
    │   ├── package.json           # user 包配置
    │   ├── webpack.config.js
    │   └── node_modules/          # user 特有依赖
    │
    └── sale/                      # 营销模块 (端口 3002)
        ├── public/
        │   └── index.html
        ├── src/
        │   ├── components/
        │   │   ├── CampaignList.jsx    # 活动列表组件
        │   │   └── CampaignDetail.jsx  # 活动详情组件
        │   ├── styles/
        │   │   └── sale.css       # 营销模块样式
        │   ├── App.jsx            # 营销应用主组件
        │   └── index.js           # 入口文件
        ├── dist/                  # 构建输出（被 Turbo 缓存）
        ├── .babelrc
        ├── package.json           # sale 包配置
        ├── webpack.config.js
        └── node_modules/          # sale 特有依赖
```

---

## 核心配置文件说明

### 1. pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
```

**作用**: 定义 pnpm workspace，让 pnpm 知道哪些目录是子项目。

**生效机制**:
- pnpm 扫描 `packages/*` 目录
- 自动链接子项目之间的依赖
- 共享 node_modules 中的公共依赖

---

### 2. turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"],
      "inputs": [
        "src/**/*.js",
        "src/**/*.jsx",
        "src/**/*.ts",
        "src/**/*.tsx",
        "public/**",
        "webpack.config.js",
        "package.json"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.js", "src/**/*.jsx", "test/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**配置项详解**:

#### `globalDependencies`
```json
"globalDependencies": ["**/.env.*local"]
```
- 全局依赖文件
- 这些文件变化会使所有缓存失效

#### `pipeline.build`
```json
"build": {
  "dependsOn": ["^build"],
  "outputs": ["dist/**", "build/**"],
  "inputs": [...]
}
```

**字段说明**:
- `dependsOn: ["^build"]`: 依赖关系
  - `^build` 表示先构建依赖的包
  - 例如：user 依赖 base，会先构建 base 再构建 user

- `outputs`: 构建产物目录
  - `dist/**`: 构建输出到 dist 目录
  - Turbo 会缓存这些文件

- `inputs`: 输入文件
  - 这些文件改变会触发重新构建
  - 不在此列表的文件改变不影响缓存

#### `pipeline.dev`
```json
"dev": {
  "cache": false,
  "persistent": true
}
```

**字段说明**:
- `cache: false`: 开发模式不缓存
- `persistent: true`: 持续运行的任务（不会自动退出）

#### `pipeline.test`
```json
"test": {
  "dependsOn": ["build"],
  "outputs": ["coverage/**"],
  "inputs": ["src/**/*.js", "src/**/*.jsx", "test/**"]
}
```

**字段说明**:
- `dependsOn: ["build"]`: test 依赖 build（不是 ^build）
- 表示本包的 test 依赖本包的 build

---

## Turbo 配置如何生效

### 1. 运行流程

#### 执行 `pnpm dev`
```
1. pnpm 读取 package.json 中的 scripts
   "dev": "turbo run dev"

2. Turbo 读取 turbo.json
   找到 pipeline.dev 配置

3. Turbo 扫描所有 packages
   base, user, sale

4. 执行每个包的 dev 脚本
   并行运行: base:dev, user:dev, sale:dev

5. 因为 persistent: true
   进程持续运行，不会退出
```

#### 执行 `pnpm build`
```
1. pnpm 调用 turbo run build

2. Turbo 分析依赖关系
   - base 没有依赖
   - user 依赖 base (通过 ^build)
   - sale 依赖 base (通过 ^build)

3. Turbo 计算输入哈希
   - 读取 inputs 中定义的文件
   - src/**/*.js, webpack.config.js 等
   - 计算文件内容的 hash 值

4. Turbo 检查缓存
   - 在 .turbo/ 目录查找对应 hash 的缓存
   - 如果命中缓存 → 直接返回缓存结果
   - 如果没有缓存 → 执行构建

5. Turbo 执行构建
   顺序: base → (user + sale 并行)

6. Turbo 保存缓存
   - 将 outputs (dist/*) 保存到 .turbo/
   - 下次相同 hash 可直接使用
```

### 2. 缓存机制详解

#### 哈希计算
```
输入文件:
  - src/components/Button.jsx
  - src/styles/common.css
  - webpack.config.js
  - package.json
    ↓
计算 hash
    ↓
  abc123def456
    ↓
检查缓存: .turbo/abc123def456/
```

#### 缓存命中
```
首次构建:
  计算 hash: abc123def456
  检查缓存: 无
  执行构建: 45s
  保存缓存: dist/ → .turbo/abc123def456/

第二次构建（无修改）:
  计算 hash: abc123def456
  检查缓存: 命中！
  返回缓存: 0.1s
  显示: >>> FULL TURBO
```

#### 增量构建
```
修改 user/src/App.jsx:
  - base hash: abc123 (未变)
  - user hash: def456 → xyz789 (改变)
  - sale hash: ghi012 (未变)

构建过程:
  ✓ base >>> CACHED (abc123)
  ✓ user building... (xyz789 无缓存)
  ✓ sale >>> CACHED (ghi012)
```

### 3. 依赖关系处理

#### `^build` 语法
```json
"build": {
  "dependsOn": ["^build"]
}
```

**含义**:
- `^` 表示依赖包的任务
- `build` 表示任务名称
- 整体意思: 先执行依赖包的 build 任务

#### 实际效果

**项目依赖关系**:
```
base (无依赖)
  ↑
  ├── user (依赖 base)
  └── sale (依赖 base)
```

**执行顺序**:
```
pnpm build

Turbo 分析:
  1. base 没有依赖 → 可以立即构建
  2. user 依赖 base → 等待 base 完成
  3. sale 依赖 base → 等待 base 完成

执行流程:
  [Step 1] base 构建 (45s)
  [Step 2] user + sale 并行构建 (30s)

总耗时: 75s (而非 105s)
```

### 4. 实际场景演示

#### 场景 1: 首次构建
```bash
pnpm build

# Turbo 输出:
• Packages in scope: base, user, sale
• Running build in 3 packages

base:build: webpack compiled successfully in 45s
user:build: webpack compiled successfully in 30s
sale:build: webpack compiled successfully in 30s

Tasks:    3 successful, 3 total
Cached:   0 cached, 3 total
Time:     75s

Cache miss count: 3
```

#### 场景 2: 无修改重建
```bash
pnpm build

# Turbo 输出:
base:build: cache hit, replaying output
user:build: cache hit, replaying output
sale:build: cache hit, replaying output

Tasks:    3 successful, 3 total
Cached:   3 cached, 3 total
Time:     0.1s >>> FULL TURBO

Cache hit rate: 100%
Time saved: 74.9s
```

#### 场景 3: 修改 base
```bash
# 修改 packages/base/src/components/Button.jsx
pnpm build

# Turbo 输出:
base:build: cache miss, executing
user:build: cache miss, executing (depends on base)
sale:build: cache miss, executing (depends on base)

Tasks:    3 successful, 3 total
Cached:   0 cached, 3 total
Time:     75s

Reason: Input files changed in base
```

#### 场景 4: 只修改 user
```bash
# 修改 packages/user/src/App.jsx
pnpm build

# Turbo 输出:
base:build: cache hit, replaying output
user:build: cache miss, executing
sale:build: cache hit, replaying output

Tasks:    3 successful, 3 total
Cached:   2 cached, 3 total
Time:     30s

Cache hit rate: 66%
Time saved: 45s
```

---

## package.json 配置

### 根目录 package.json
```json
{
  "scripts": {
    "dev": "turbo run dev",           // 运行所有包的 dev
    "build": "turbo run build",       // 运行所有包的 build
    "dev:base": "turbo run dev --filter=base",
    "build:base": "turbo run build --filter=base"
  }
}
```

### 子包 package.json
```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production"
  }
}
```

**执行流程**:
```
pnpm dev
  ↓
调用根目录 package.json 的 dev 脚本
  ↓
turbo run dev
  ↓
Turbo 找到所有包的 dev 脚本
  ↓
并行执行: base:dev, user:dev, sale:dev
  ↓
每个包运行自己的 webpack serve
```

---

## 总结

### Turbo 的核心作用
1. **任务编排**: 自动分析依赖关系，确定执行顺序
2. **智能缓存**: 基于文件 hash 缓存构建结果
3. **并行执行**: 无依赖关系的任务并行运行
4. **增量构建**: 只构建改变的部分

### 配置生效顺序
1. `pnpm-workspace.yaml` → 定义工作区
2. `turbo.json` → 定义任务配置
3. `package.json` → 定义具体脚本
4. Turbo → 执行和缓存

### 性能提升关键
- `outputs`: 告诉 Turbo 缓存什么
- `inputs`: 告诉 Turbo 监控什么
- `dependsOn`: 告诉 Turbo 执行顺序
- `cache`: 告诉 Turbo 是否缓存
