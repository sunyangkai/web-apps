#!/bin/bash

# 一键更新主仓库和所有子仓库

echo "========================================"
echo "更新主仓库和所有子仓库"
echo "========================================"
echo ""

# 1. 更新主仓库
echo "[1/2] 更新主仓库..."
git pull origin main
echo ""

# 2. 更新所有子仓库
echo "[2/2] 更新所有子仓库..."
git submodule update --remote --merge

# 3. 检查是否有变化
echo ""
if git diff --quiet HEAD; then
    echo "✓ 所有模块都是最新的"
else
    echo "检测到子仓库有更新："
    git status --short
    echo ""

    read -p "是否提交这些更新到主仓库? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add packages/
        git commit -m "chore: update submodules to latest"
        git push origin main
        echo "✓ 已提交并推送"
    else
        echo "跳过提交"
    fi
fi

echo ""
echo "========================================"
echo "更新完成"
echo "========================================"
