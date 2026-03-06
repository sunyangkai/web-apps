# 多仓库 Submodule 方案详细计划

## 方案目标

实现每个子项目分给不同团队独立维护，回滚某个项目时不影响其他团队。

---

## 当前架构 vs 目标架构

### 当前架构（单仓库 Monorepo）

```
git@github-syk:sunyangkai/web-apps.git
├── packages/
│   ├── base/     ← 所有代码在一个 git 仓库
│   ├── user/     ← 共享同一个 git 历史
│   └── sale/     ← 回滚会影响整个仓库
├── package.json
└── turbo.json
```

**问题**：
- ❌ 所有包共享一个 git 历史
- ❌ 回滚一个包会影响整个仓库
- ❌ 无法独立的权限控制

---

### 目标架构（多仓库 + Submodule）

```
主仓库: git@github-syk:sunyangkai/web-apps.git
├── packages/
│   ├── base/  → git@github-syk:sunyangkai/web-apps-base.git (独立仓库)
│   ├── user/  → git@github-syk:sunyangkai/web-apps-user.git (独立仓库)
│   └── sale/  → git@github-syk:sunyangkai/web-apps-sale.git (独立仓库)
├── package.json
└── turbo.json

独立仓库 1: web-apps-base
├── src/
├── public/
├── package.json
└── webpack.config.js

独立仓库 2: web-apps-user
├── src/
├── public/
├── package.json
└── webpack.config.js

独立仓库 3: web-apps-sale
├── src/
├── public/
├── package.json
└── webpack.config.js
```

**优势**：
- ✅ 每个包有独立的 git 仓库和历史
- ✅ 独立回滚，互不影响
- ✅ 独立的权限控制（可以分配不同团队）
- ✅ 独立的分支策略
- ✅ 独立的 PR 流程

---

## 实施步骤

### 第一步：创建独立仓库

在 GitHub 上手动创建 3 个空仓库：

| 仓库名 | 地址 | 团队 |
|--------|------|------|
| web-apps-base | git@github-syk:sunyangkai/web-apps-base.git | Base 团队 |
| web-apps-user | git@github-syk:sunyangkai/web-apps-user.git | User 团队 |
| web-apps-sale | git@github-syk:sunyangkai/web-apps-sale.git | Sale 团队 |

**创建时注意**：
- 选择 Private（如果需要私有）
- 不要勾选 "Add README"
- 不要添加 .gitignore
- 不要选择 License

---

### 第二步：提取子项目历史

使用 `git filter-repo` 工具提取每个子项目的 git 历史到独立仓库。

#### 安装 git-filter-repo

```bash
# macOS
brew install git-filter-repo

# Windows (需要 Python)
pip install git-filter-repo

# Linux
apt-get install git-filter-repo
```

#### 提取 base 项目

```bash
# 1. 克隆主仓库到临时目录
cd /tmp
git clone git@github-syk:sunyangkai/web-apps.git web-apps-base
cd web-apps-base

# 2. 只保留 packages/base 的历史
git filter-repo --path packages/base/ --path-rename packages/base/:

# 3. 设置新的远程仓库
git remote add origin git@github-syk:sunyangkai/web-apps-base.git

# 4. 推送到新仓库
git push -u origin main --force
git push origin --tags --force
```

#### 提取 user 项目

```bash
cd /tmp
git clone git@github-syk:sunyangkai/web-apps.git web-apps-user
cd web-apps-user
git filter-repo --path packages/user/ --path-rename packages/user/:
git remote add origin git@github-syk:sunyangkai/web-apps-user.git
git push -u origin main --force
git push origin --tags --force
```

#### 提取 sale 项目

```bash
cd /tmp
git clone git@github-syk:sunyangkai/web-apps.git web-apps-sale
cd web-apps-sale
git filter-repo --path packages/sale/ --path-rename packages/sale/:
git remote add origin git@github-syk:sunyangkai/web-apps-sale.git
git push -u origin main --force
git push origin --tags --force
```

**结果**：
- ✅ 3 个独立仓库创建完成
- ✅ 每个仓库包含对应包的完整 git 历史
- ✅ 所有历史提交、标签都被保留

---

### 第三步：主仓库改用 Submodule

```bash
cd C:/Users/Administrator/sunyk/web-apps

# 1. 创建备份分支（以防万一）
git checkout -b backup-before-submodule
git push origin backup-before-submodule

# 2. 回到 main 分支
git checkout main

# 3. 删除现有的 packages
git rm -rf packages/base packages/user packages/sale
git commit -m "chore: remove packages before converting to submodules"

# 4. 添加 submodule
git submodule add git@github-syk:sunyangkai/web-apps-base.git packages/base
git submodule add git@github-syk:sunyangkai/web-apps-user.git packages/user
git submodule add git@github-syk:sunyangkai/web-apps-sale.git packages/sale

# 5. 提交
git commit -m "feat: convert to submodule architecture"
git push origin main
```

**生成的文件**：
- `.gitmodules` - 记录 submodule 配置
- `packages/base/` - 指向 base 仓库的引用
- `packages/user/` - 指向 user 仓库的引用
- `packages/sale/` - 指向 sale 仓库的引用

---

## 团队工作流程

### Base 团队的工作流程

#### 1. 克隆项目
```bash
git clone --recursive git@github-syk:sunyangkai/web-apps.git
cd web-apps
```

#### 2. 开发新功能
```bash
cd packages/base
git checkout -b feature/new-button

# 修改代码
vim src/components/Button.jsx

git add .
git commit -m "add: new button component"
git push origin feature/new-button
```

#### 3. 创建 PR
在 `web-apps-base` 仓库创建 Pull Request

#### 4. 合并后更新主仓库
```bash
cd packages/base
git checkout main
git pull origin main

cd ../..
git add packages/base
git commit -m "chore: update base to latest"
git push origin main
```

---

### User 团队的工作流程

#### 1. 克隆项目
```bash
git clone --recursive git@github-syk:sunyangkai/web-apps.git
cd web-apps
```

#### 2. 开发新功能
```bash
cd packages/user
git checkout -b feature/user-profile

# 修改代码
vim src/components/UserProfile.jsx

git add .
git commit -m "add: user profile page"
git push origin feature/user-profile
```

#### 3. 创建 PR
在 `web-apps-user` 仓库创建 Pull Request

---

### Sale 团队的工作流程

与 User 团队类似，在 `packages/sale` 目录工作。

---

## 独立回滚示例

### 场景：Base 团队需要回滚一个错误的提交

#### 问题
```bash
# Base 团队昨天提交了一个有 bug 的按钮
# commit hash: abc123
# 现在需要回滚这个提交
```

#### 单仓库的问题
```bash
# 如果用单仓库
cd web-apps
git revert abc123

# 问题：
# 如果 abc123 这个 commit 中还包含了其他文件的修改
# （比如根目录的配置），也会一起被回滚
# 影响范围大，风险高
```

#### Submodule 的解决方案
```bash
# 1. 只在 base 子仓库操作
cd packages/base

# 2. 查看历史
git log
# commit abc123 - add: new button (有bug)
# commit def456 - update: old button

# 3. 回滚（只影响 base）
git revert abc123

# 4. 推送
git push origin main

# 5. 主仓库更新引用
cd ../..
git add packages/base
git commit -m "chore: rollback base button to previous version"
git push origin main
```

**结果**：
- ✅ 只有 base 被回滚
- ✅ user 和 sale 完全不受影响
- ✅ user 和 sale 团队甚至不需要知道这次回滚

---

## 权限控制

### GitHub 仓库权限设置

#### web-apps-base 仓库
```
Settings → Collaborators
- @base-team-lead (Admin)
- @base-developer-1 (Write)
- @base-developer-2 (Write)
```

#### web-apps-user 仓库
```
Settings → Collaborators
- @user-team-lead (Admin)
- @user-developer-1 (Write)
- @user-developer-2 (Write)
```

#### web-apps-sale 仓库
```
Settings → Collaborators
- @sale-team-lead (Admin)
- @sale-developer-1 (Write)
- @sale-developer-2 (Write)
```

#### web-apps 主仓库
```
Settings → Collaborators
- @tech-lead (Admin)
- 所有团队成员 (Read)
```

**结果**：
- ✅ Base 团队只能修改 base 仓库
- ✅ User 团队只能修改 user 仓库
- ✅ Sale 团队只能修改 sale 仓库
- ✅ 完全的权限隔离

---

## 日常操作

### 新成员加入团队

#### User 团队新成员
```bash
# 1. 克隆项目
git clone --recursive git@github-syk:sunyangkai/web-apps.git
cd web-apps

# 2. 只关注 user 子项目
cd packages/user

# 3. 创建功能分支
git checkout -b feature/my-feature

# 4. 开发...
```

---

### 更新 submodule

#### 更新所有 submodule 到最新
```bash
cd web-apps
git submodule update --remote --merge

# 如果有更新
git add packages/
git commit -m "chore: update all submodules"
git push
```

#### 只更新 base submodule
```bash
cd packages/base
git pull origin main

cd ../..
git add packages/base
git commit -m "chore: update base submodule"
git push
```

---

### 查看 submodule 状态

```bash
cd web-apps
git submodule status

# 输出示例：
# 1a2b3c4 packages/base (v1.2.0)
# 5d6e7f8 packages/user (v2.1.0)
# 9g0h1i2 packages/sale (v1.0.3)
```

---

## 构建和部署

### 本地开发

```bash
# 安装所有依赖
pnpm install

# 启动所有项目
pnpm dev

# 构建所有项目
pnpm build
```

**Turborepo 和 pnpm 配置无需修改**，继续正常工作。

---

### CI/CD 配置

#### GitHub Actions 示例

```yaml
# .github/workflows/build.yml
name: Build All Projects

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout with submodules
        uses: actions/checkout@v3
        with:
          submodules: recursive  # ← 关键：递归克隆 submodule

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build
```

---

## 对比总结

### 单仓库 Monorepo

| 场景 | 操作 | 影响范围 |
|------|------|----------|
| 修改 base | 1 个 commit | 整个仓库 |
| 回滚 base | git revert | 可能影响其他文件 |
| 发布 base | git tag | 所有包 |
| 权限控制 | CODEOWNERS | 仅 PR 审核 |
| git 历史 | git log | 所有包混在一起 |

---

### 多仓库 Submodule

| 场景 | 操作 | 影响范围 |
|------|------|----------|
| 修改 base | base 仓库 commit | 只有 base |
| 回滚 base | base 仓库 revert | 只有 base |
| 发布 base | base 仓库 tag | 只有 base |
| 权限控制 | 仓库级别 | 完全隔离 |
| git 历史 | base 仓库 log | 干净的 base 历史 |

---

## 优缺点分析

### 优点 ✅

1. **完全独立的 git 历史**
   - 每个包有自己的 commit 历史
   - 清晰、干净、不混杂

2. **独立回滚**
   - 回滚 base 不影响 user 和 sale
   - 风险隔离

3. **独立权限控制**
   - 团队只能访问自己的仓库
   - 真正的权限隔离

4. **独立分支策略**
   - base 可以用 gitflow
   - user 可以用 trunk-based
   - 各自灵活

5. **独立发布**
   - 各自打标签
   - 互不干扰

6. **Module Federation 架构无影响**
   - base、user、sale 独立部署
   - 运行时动态加载
   - 完美配合

---

### 缺点 ❌

1. **管理稍复杂**
   - 需要管理 4 个仓库
   - clone 需要 `--recursive`

2. **跨包修改麻烦**
   - 需要创建多个 PR
   - 需要协调合并顺序

3. **学习成本**
   - 团队需要学习 submodule 命令
   - 需要理解 submodule 概念

---

## 迁移风险评估

### 低风险 ✅

- 代码结构不变（packages 目录结构保持）
- 构建工具不变（Turborepo、pnpm 继续用）
- 开发流程基本不变（只是 git 操作稍有不同）
- 可以回滚（保留了 backup 分支）

### 注意事项 ⚠️

1. **首次迁移后，所有团队成员需要重新 clone**
   ```bash
   git clone --recursive git@github-syk:sunyangkai/web-apps.git
   ```

2. **CI/CD 需要更新**
   - 添加 `submodules: recursive`

3. **文档需要更新**
   - 团队培训 submodule 用法

---

## 推荐执行时间

### 选择合适的时间点

✅ **推荐**：
- 周五下班前执行
- 周末执行
- 迭代结束时执行

❌ **不推荐**：
- 正在开发新功能时
- 即将发布时
- 团队成员休假时

---

## 回退方案

如果迁移后发现问题，可以快速回退：

```bash
# 1. 切换到备份分支
git checkout backup-before-submodule

# 2. 强制推送回 main
git push origin backup-before-submodule:main --force

# 3. 团队成员重新 pull
git pull origin main --force
```

---

## 下一步行动

### 准备阶段（1 天）

1. ✅ 在 GitHub 创建 3 个空仓库
   - web-apps-base
   - web-apps-user
   - web-apps-sale

2. ✅ 安装 git-filter-repo
   ```bash
   pip install git-filter-repo
   ```

3. ✅ 通知团队准备迁移

---

### 执行阶段（2 小时）

1. ✅ 执行提取脚本
   ```bash
   bash scripts/split-to-submodules.sh
   ```

2. ✅ 推送到独立仓库
   ```bash
   bash scripts/push-submodules.sh
   ```

3. ✅ 转换主仓库
   ```bash
   bash scripts/convert-to-submodules.sh
   ```

4. ✅ 验证
   ```bash
   git submodule status
   ```

---

### 验收阶段（1 小时）

1. ✅ 团队成员重新 clone
2. ✅ 测试 pnpm dev
3. ✅ 测试 pnpm build
4. ✅ 确认 CI/CD 正常

---

## 总结

**这个方案完全满足你的需求**：
- ✅ 每个子项目分给不同团队独立维护
- ✅ 回滚不影响其他团队
- ✅ 完全的权限隔离
- ✅ Module Federation 架构无影响

**现在决定**：
- 是否要执行这个方案？
- 需要我修改哪些细节？
