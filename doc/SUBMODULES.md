# Submodule 架构说明

## 仓库结构

```
web-apps/ (主仓库)
├── packages/
│   ├── base/  → git@github-syk:sunyangkai/web-apps-base.git
│   ├── user/  → git@github-syk:sunyangkai/web-apps-user.git
│   └── sale/  → git@github-syk:sunyangkai/web-apps-sale.git
```

## 克隆项目

```bash
git clone --recursive git@github-syk:sunyangkai/web-apps.git
```

## 更新 submodule

```bash
git submodule update --remote --merge
```

## 团队工作

```bash
cd packages/base
git checkout -b feature/xxx
# 修改提交推送
```
