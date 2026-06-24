# GitHub Pages 部署指南

## 前提条件

1. GitHub 账号
2. 项目已推送到 GitHub 仓库（仓库名建议为 `nhaxinh`）

## 部署步骤

### 第一步：推送代码到 GitHub

```bash
cd /workspace/nhaxinh
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/nhaxinh.git
git push -u origin main
```

### 第二步：启用 GitHub Pages

1. 打开 GitHub 仓库页面
2. 点击 **Settings** → **Pages**
3. **Source** 选择 **GitHub Actions**

### 第三步：自动部署

推送代码后，GitHub Actions 会自动：
- 安装依赖
- 构建项目（`npm run build`）
- 部署到 GitHub Pages

每次推送到 `main` 分支都会自动触发部署。

## 访问地址

部署完成后，网站将可通过以下地址访问：

```
https://你的用户名.github.io/nhaxinh/
```

## 手动触发部署

在 GitHub 仓库页面：
1. 点击 **Actions** 标签
2. 选择 **Deploy to GitHub Pages** 工作流
3. 点击 **Run workflow** → **Run workflow**

## 常见问题

### 图片不显示

确保 `next.config.mjs` 中的 `basePath` 和 `assetPrefix` 配置正确。如果仓库名不是 `nhaxinh`，需要修改：

```js
basePath: '/你的仓库名',
assetPrefix: '/你的仓库名',
```

### 路由问题

GitHub Pages 使用 `trailingSlash: true` 配置，确保所有链接以 `/` 结尾。

### 构建失败

检查 Actions 日志，常见原因：
- Node.js 版本不兼容（本项目需要 Node.js 20+）
- 依赖安装失败（删除 `package-lock.json` 重新生成）

## 本地预览构建结果

```bash
cd /workspace/nhaxinh
npm run build
npx serve out
```

## 文件说明

- `.github/workflows/deploy.yml` - GitHub Actions 部署脚本
- `next.config.mjs` - Next.js 配置（包含 GitHub Pages 适配）
- `out/` - 构建输出目录（静态 HTML 文件）
