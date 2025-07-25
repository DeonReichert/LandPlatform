# GitHub Pages 部署指南

## ✅ 已完成的修复

### 1. Vite 配置修复
- **文件**: `vite.config.ts`
- **修改**: `base: '/LandPlatform/'`
- 这样所有资源都会使用正确的 GitHub Pages 路径

### 2. GitHub Actions Workflow
- **位置**: `.github/workflows/deploy.yml`
- **功能**: 自动构建和部署到 GitHub Pages
- **触发**: 推送到 main 分支时自动运行

### 3. 必需文件
- ✅ `public/.nojekyll` - 告诉 GitHub Pages 不要使用 Jekyll
- ✅ `public/404.html` - SPA 路由支持
- ✅ `public/favicon.svg` - 网站图标

### 4. TypeScript 错误修复
所有类型错误已修复，构建成功

## 📋 部署步骤

### 步骤 1: 推送代码到 GitHub

```bash
cd D:\

# 添加所有修改
git add .

# 提交修改
git commit -m "Fix GitHub Pages deployment

- Update vite base path to /LandPlatform/
- Add .github/workflows/deploy.yml
- Fix TypeScript type errors
- Add .nojekyll and 404.html for proper deployment"

# 推送到 GitHub
git push origin main
```

### 步骤 2: 配置 GitHub Pages

1. 访问你的 GitHub 仓库: `https://github.com/DeonReichert/LandPlatform`

2. 点击 **Settings** (设置)

3. 在左侧菜单中找到 **Pages**

4. 在 **Source** (来源) 下:
   - 选择 **GitHub Actions**
   - （不要选择 Deploy from a branch）

5. 保存设置

### 步骤 3: 检查 GitHub Actions

1. 访问仓库的 **Actions** 标签页

2. 查看 "Deploy to GitHub Pages" workflow

3. 等待构建完成（通常需要 2-5 分钟）

4. 如果构建失败，查看错误日志并修复

### 步骤 4: 访问网站

构建成功后，访问:
```
https://deonreichert.github.io/LandPlatform/
```

## 🔍 故障排查

### 问题 1: 页面显示空白

**可能原因**:
- GitHub Pages 源设置不正确
- Workflow 还没有运行
- JavaScript 加载失败

**解决方法**:
1. 检查 GitHub Pages 设置是否选择了 "GitHub Actions"
2. 检查 Actions 标签页确认 workflow 成功运行
3. 打开浏览器开发者工具 (F12) 查看控制台错误
4. 检查 Network 标签，确认所有资源都正确加载

### 问题 2: 404 错误

**可能原因**:
- 仓库名称不匹配
- base 路径配置错误

**解决方法**:
1. 确认 `vite.config.ts` 中的 `base: '/LandPlatform/'` 与仓库名称一致
2. 如果仓库名称不同，修改 base 路径

### 问题 3: CSS/JS 文件 404

**可能原因**:
- `.nojekyll` 文件缺失
- 资源路径不正确

**解决方法**:
1. 确认 `dist/.nojekyll` 文件存在
2. 检查构建后的 `dist/index.html` 中所有资源路径都包含 `/LandPlatform/`

## 📝 重要配置文件

### vite.config.ts
```typescript
export default defineConfig({
  base: '/LandPlatform/', // 必须匹配 GitHub 仓库名称
  // ...
})
```

### .github/workflows/deploy.yml
```yaml
- name: Build
  run: NODE_ENV=production npm run build

- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./dist
```

## ✨ 验证部署成功

部署成功后，你应该能看到:
1. ✅ 页面正常加载，显示 "Confidential Land Platform" 标题
2. ✅ 所有样式正确应用（紫色渐变主题）
3. ✅ Connect Wallet 按钮可见
4. ✅ 所有标签页（Register Zone, Submit Project等）可以切换
5. ✅ 浏览器控制台没有 404 错误

## 🚀 下次更新

当你修改代码后，只需要:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

GitHub Actions 会自动重新构建和部署！

## 📞 需要帮助?

如果遇到问题:
1. 检查 GitHub Actions 日志
2. 查看浏览器开发者工具控制台
3. 确认所有配置文件正确
