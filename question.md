

 ## 1. turbo 的 dependsOn 有几种常用配置？

### 1. `["^build"]` - 依赖包的任务（最常用）
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```
**含义**：先执行依赖包的 build 任务
**例如**：user 依赖 base，会先构建 base 再构建 user

---

### 2. `["build"]` - 本包的其他任务
```json
{
  "pipeline": {
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```
**含义**：test 依赖本包的 build 任务
**执行顺序**：先 build，再 test

---

### 3. `["^build", "lint"]` - 组合依赖
```json
{
  "pipeline": {
    "deploy": {
      "dependsOn": ["^build", "lint", "test"]
    }
  }
}
```
**含义**：
- `^build` - 先构建依赖包
- `lint` - 再执行本包的 lint
- `test` - 再执行本包的 test
- 最后才执行 deploy

---

### 4. `[]` - 无依赖
```json
{
  "pipeline": {
    "dev": {
      "dependsOn": []
    }
  }
}
```
**含义**：无依赖，直接并行执行

---

### 5. `["$SOME_ENV_VAR"]` - 环境变量依赖
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build", "$DATABASE_URL"]
    }
  }
}
```
**含义**：依赖环境变量，环境变量改变会使缓存失效

---

### 对比表

| 配置 | 含义 | 使用场景 |
|------|------|----------|
| `["^build"]` | 依赖包的 build | 构建任务，需要先构建依赖 |
| `["build"]` | 本包的 build | test/deploy 依赖本包的 build |
| `["^build", "lint"]` | 组合依赖 | 复杂流程，多个前置任务 |
| `[]` | 无依赖 | dev/clean 等独立任务 |
| `["$ENV"]` | 环境变量 | 依赖环境配置的任务 |

---

### 当前项目中的配置

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]  // user/sale 先构建 base
    },
    "dev": {
      "cache": false,
      "persistent": true       // 无 dependsOn，并行启动
    },
    "test": {
      "dependsOn": ["build"]   // test 依赖本包的 build
    },
    "clean": {
      "cache": false           // 无 dependsOn
    }
  }
}
```



## 2. turbo 的缓存是怎么生效的

### 缓存工作流程

```
运行 pnpm build
    ↓
1. 计算输入哈希值
    ↓
2. 检查缓存
    ↓
3a. 缓存命中 → 恢复缓存
3b. 缓存未命中 → 执行构建 → 保存缓存
```

---

### 1. 计算输入哈希值

Turbo 根据 `turbo.json` 中的 `inputs` 配置计算哈希：

```json
{
  "pipeline": {
    "build": {
      "inputs": [
        "src/**/*.js",
        "src/**/*.jsx",
        "public/**",
        "webpack.config.js",
        "package.json"
      ]
    }
  }
}
```

**计算哈希的内容**：
- `src/**/*.js` - 所有源代码文件内容
- `webpack.config.js` - 配置文件内容
- `package.json` - 依赖信息
- 环境变量（如果配置了）

**生成哈希**：
```
文件内容 → SHA-256 → abc123def456789
```

---

### 2. 检查缓存

Turbo 在 `.turbo/` 目录查找对应哈希的缓存：

```
.turbo/
  └── cache/
      └── abc123def456789/     ← 查找这个目录
          ├── dist/            ← 构建产物
          └── .turbo-cache.json ← 缓存元数据
```

---

### 3. 缓存命中/未命中

#### 场景 A：缓存命中

```bash
pnpm build

# Turbo 检查：
哈希: abc123def456789
缓存: 存在 ✓

# 输出：
base:build >>> FULL TURBO (cached)
user:build >>> FULL TURBO (cached)
sale:build >>> FULL TURBO (cached)

Time: 0.1s
Cache hit rate: 100%
```

**操作**：
1. 从 `.turbo/cache/abc123def456789/dist/` 复制文件到 `packages/base/dist/`
2. 输出缓存的日志
3. 完成（无需执行 webpack）

---

#### 场景 B：缓存未命中

```bash
# 修改了 src/App.jsx
pnpm build

# Turbo 检查：
哈希: xyz789new（文件改变，哈希变了）
缓存: 不存在 ✗

# 输出：
base:build cache miss, executing
webpack compiled successfully in 45s

# 保存缓存：
.turbo/cache/xyz789new/
  └── dist/  ← 保存构建产物
```

---

### 实际案例演示

#### 案例 1：首次构建

```bash
pnpm build

# Turbo 计算：
base 哈希: aaa111
user 哈希: bbb222
sale 哈希: ccc333

# 缓存检查：
aaa111: 不存在
bbb222: 不存在
ccc333: 不存在

# 执行构建：
base: 45s
user: 30s
sale: 30s

# 保存缓存：
.turbo/cache/aaa111/ → base/dist/
.turbo/cache/bbb222/ → user/dist/
.turbo/cache/ccc333/ → sale/dist/

Total: 105s
```

---

#### 案例 2：无修改重建

```bash
pnpm build

# Turbo 计算：
base 哈希: aaa111  (未变)
user 哈希: bbb222  (未变)
sale 哈希: ccc333  (未变)

# 缓存检查：
aaa111: 存在 ✓
bbb222: 存在 ✓
ccc333: 存在 ✓

# 恢复缓存：
.turbo/cache/aaa111/ → base/dist/
.turbo/cache/bbb222/ → user/dist/
.turbo/cache/ccc333/ → sale/dist/

Total: 0.1s >>> FULL TURBO
```

---

#### 案例 3：只修改 user

```bash
# 修改 packages/user/src/App.jsx
pnpm build

# Turbo 计算：
base 哈希: aaa111  (未变)
user 哈希: ddd444  (改变！)
sale 哈希: ccc333  (未变)

# 缓存检查：
aaa111: 存在 ✓
ddd444: 不存在 ✗
ccc333: 存在 ✓

# 执行：
base: 从缓存恢复 (0.1s)
user: 重新构建 (30s)
sale: 从缓存恢复 (0.1s)

# 保存新缓存：
.turbo/cache/ddd444/ → user/dist/

Total: 30s
Cache hit rate: 66%
```

---

### 哈希计算的关键因素

```json
{
  "inputs": ["src/**/*.js", "webpack.config.js"]
}
```

**影响哈希的因素**：
1. `src/**/*.js` 文件内容改变
2. `webpack.config.js` 配置改变
3. `package.json` 依赖改变
4. 环境变量改变（如果配置了）

**不影响哈希的**：
- 注释改变（代码逻辑未变）
- 空格、换行（通常被忽略）
- 文件修改时间
- 其他未列在 `inputs` 中的文件

---

### outputs 配置的作用

```json
{
  "build": {
    "outputs": ["dist/**", "build/**"]
  }
}
```

**作用**：告诉 Turbo 缓存哪些文件

**缓存内容**：
```
.turbo/cache/abc123/
  ├── dist/
  │   ├── main.js
  │   ├── index.html
  │   └── vendors.js
  └── .turbo-cache.json  (元数据)
```

---

### 缓存目录结构

```
.turbo/
  ├── cache/                    # 缓存存储
  │   ├── abc123def456/        # 哈希 1 的缓存
  │   │   └── dist/
  │   ├── xyz789ghi012/        # 哈希 2 的缓存
  │   │   └── dist/
  │   └── ...
  └── daemon/                   # Turbo 守护进程
```

---

### cache: false 的情况

```json
{
  "dev": {
    "cache": false,
    "persistent": true
  }
}
```

**不缓存的原因**：
- `dev` 是持续运行的进程
- 每次运行结果都不同（端口占用、实时编译）
- 缓存无意义

**其他不缓存的场景**：
- `clean` - 清理任务
- `lint` - 检查任务（输出少）

---

### 查看缓存统计

```bash
pnpm build

# 输出示例：
Tasks:    3 successful, 3 total
Cached:   2 cached, 3 total
Time:     30.5s >>> FULL TURBO

Cache Hit Rate: 66%  ← 缓存命中率
Time Saved: 75s      ← 节省的时间
```

---

### 清除缓存

```bash
# 清除所有缓存
rm -rf .turbo

# 强制重新构建（忽略缓存）
pnpm build --force

# 或
pnpm cache:clear
```

---

### 总结

Turbo 缓存的核心机制：

1. **输入哈希** = `inputs` 文件的内容 → SHA-256
2. **查找缓存** = `.turbo/cache/哈希值/`
3. **命中** → 复制缓存文件
4. **未命中** → 执行构建 → 保存缓存

**关键配置**：
```json
{
  "inputs": ["src/**"],   // 监控这些文件
  "outputs": ["dist/**"]  // 缓存这些文件
}
```

**性能提升**：
- 首次构建: 100%
- 无修改: 0.1% (快 1000 倍)
- 部分修改: 30% (只重建改变的包)