

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