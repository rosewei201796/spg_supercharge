# 部署指南 / Deployment Guide

## 📦 部署选项

### 方案 1: Railway（推荐）

Railway 提供免费额度，支持自动部署，非常适合全栈应用。

#### 步骤：

1. **准备代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **访问 Railway**
   - 前往 [railway.app](https://railway.app)
   - 使用 GitHub 账号登录

3. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

4. **配置环境变量**
   - 在项目设置中添加以下环境变量：
     - `NODE_ENV`: `production`
     - `PORT`: `3001`
     - `OPENAI_API_KEY`: `sk-PZwjoX0QGseFOHjVh3SFBQ`
     - `OPENAI_BASE_URL`: `https://llm.jp.one2x.ai`

5. **部署**
   - Railway 会自动检测 `railway.json` 配置
   - 自动构建和部署

---

### 方案 2: Render

Render 也提供免费额度，配置简单。

#### 步骤：

1. **准备代码并推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **访问 Render**
   - 前往 [render.com](https://render.com)
   - 使用 GitHub 账号登录

3. **创建新 Web Service**
   - 点击 "New +"
   - 选择 "Web Service"
   - 连接你的 GitHub 仓库

4. **配置**
   - Name: `channel-cold-start-generator`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **添加环境变量**
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
   - `OPENAI_API_KEY`: `sk-PZwjoX0QGseFOHjVh3SFBQ`
   - `OPENAI_BASE_URL`: `https://llm.jp.one2x.ai`

---

### 方案 3: Docker 部署

如果你有自己的服务器或想使用其他云服务。

#### 步骤：

1. **构建 Docker 镜像**
   ```bash
   docker build -t channel-generator .
   ```

2. **运行容器**
   ```bash
   docker run -d \
     -p 3001:3001 \
     -e NODE_ENV=production \
     -e OPENAI_API_KEY=sk-PZwjoX0QGseFOHjVh3SFBQ \
     -e OPENAI_BASE_URL=https://llm.jp.one2x.ai \
     --name channel-generator \
     channel-generator
   ```

3. **访问应用**
   - 打开浏览器访问 `http://your-server-ip:3001`

---

## 🔧 本地测试生产构建

在部署前，你可以本地测试生产构建：

```bash
# 1. 构建项目
npm run build

# 2. 设置生产环境
export NODE_ENV=production

# 3. 启动服务器
npm start

# 4. 访问 http://localhost:3001
```

---

## 📝 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NODE_ENV` | 环境模式 | `production` |
| `PORT` | 服务器端口 | `3001` |
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-xxx...` |
| `OPENAI_BASE_URL` | API 端点 | `https://llm.jp.one2x.ai` |

---

## ⚠️ 重要提示

1. **不要提交 `.env` 文件** - 它包含敏感信息
2. **在部署平台配置环境变量** - 不要硬编码在代码中
3. **定期更新依赖** - 运行 `npm update` 保持依赖最新
4. **监控 API 使用** - 确保不超过配额限制

---

## 🚀 快速开始（Railway）

最快的部署方式：

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 添加环境变量
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=sk-PZwjoX0QGseFOHjVh3SFBQ
railway variables set OPENAI_BASE_URL=https://llm.jp.one2x.ai

# 5. 部署
railway up
```

---

## 🆘 常见问题

### Q: 构建失败
A: 检查 Node.js 版本（建议 18+），确保所有依赖都已安装

### Q: 环境变量未生效
A: 确保在部署平台的设置中正确配置了所有环境变量

### Q: 页面空白
A: 检查浏览器控制台，可能是 API 连接问题，确认环境变量配置正确

### Q: API 调用失败
A: 检查 API 密钥是否正确，端点是否可访问

---

## 📞 获取帮助

如遇到问题，可以：
1. 查看部署平台的日志
2. 检查浏览器控制台错误
3. 确认所有环境变量都已正确设置

