#!/bin/bash

echo "================================"
echo "验证微前端依赖共享配置"
echo "================================"
echo ""

# 检查 base 模块的 React 依赖
echo "✓ 检查 Base 模块的 React 依赖..."
if grep -q '"react"' packages/base/package.json; then
    echo "  ✅ Base 模块包含 React 依赖"
else
    echo "  ❌ Base 模块缺少 React 依赖"
fi

# 检查 user 模块不应该有 React 依赖
echo ""
echo "✓ 检查 User 模块是否移除了 React 依赖..."
if grep -q '"react":' packages/user/package.json; then
    echo "  ❌ User 模块仍然包含 React 依赖（应该移除）"
else
    echo "  ✅ User 模块已移除 React 依赖"
fi

# 检查 sale 模块不应该有 React 依赖
echo ""
echo "✓ 检查 Sale 模块是否移除了 React 依赖..."
if grep -q '"react":' packages/sale/package.json; then
    echo "  ❌ Sale 模块仍然包含 React 依赖（应该移除）"
else
    echo "  ✅ Sale 模块已移除 React 依赖"
fi

# 检查 base 是否暴露 react
echo ""
echo "✓ 检查 Base 模块是否暴露 React..."
if grep -q "'./react'" packages/base/webpack.config.js; then
    echo "  ✅ Base 模块已配置暴露 React"
else
    echo "  ❌ Base 模块未配置暴露 React"
fi

# 检查 user 源码是否从 base/react 导入
echo ""
echo "✓ 检查 User 模块是否从 base/react 导入..."
if grep -q "from 'base/react'" packages/user/src/index.js; then
    echo "  ✅ User 模块已配置从 base/react 导入"
else
    echo "  ❌ User 模块仍从 'react' 导入（应该改为 base/react）"
fi

# 检查 sale 源码是否从 base/react 导入
echo ""
echo "✓ 检查 Sale 模块是否从 base/react 导入..."
if grep -q "from 'base/react'" packages/sale/src/index.js; then
    echo "  ✅ Sale 模块已配置从 base/react 导入"
else
    echo "  ❌ Sale 模块仍从 'react' 导入（应该改为 base/react）"
fi

# 检查 webpack shared 配置
echo ""
echo "✓ 检查 User 模块的 shared 配置..."
if grep -q "import: false" packages/user/webpack.config.js; then
    echo "  ✅ User 模块已配置 import: false"
else
    echo "  ❌ User 模块未配置 import: false"
fi

echo ""
echo "================================"
echo "验证完成"
echo "================================"
echo ""
echo "💡 提示："
echo "  - 所有检查通过后，运行 npm run dev 启动项目"
echo "  - 必须先启动 Base 模块（端口 3000）"
echo "  - 详细文档见 DEPENDENCY_SHARING.md"
echo ""
