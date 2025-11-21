# API 配置指南

## 概述

本项目使用统一的 OpenAI 兼容 API 端点来调用两个模型：
- **Gemini 3 Pro Preview**: 用于生成多样化的图像提示词
- **Gemini 2.5 Flash Image**: 用于根据提示词生成图像

## 环境配置

### 1. 创建 .env 文件

```bash
cp env.example .env
```

### 2. 配置环境变量

在 `.env` 文件中设置以下变量：

```env
# 服务器端口
PORT=3001

# OpenAI 兼容 API 配置
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://llm.jp.one2x.ai
```

## API 架构

### 文件结构

```
src/api/
├── client.ts          # 统一的 OpenAI 客户端配置
├── gemini.ts          # Gemini 3 Pro Preview API
└── nanoBanana.ts      # Gemini 2.5 Flash Image API
```

### client.ts - 统一客户端

所有 API 调用现在通过统一的客户端配置：

```typescript
import { openaiClient, API_CONFIG } from './api/client.js';
```

**特性：**
- ✅ 环境变量配置
- ✅ 自动回退到默认 URL
- ✅ API Key 安全遮蔽
- ✅ 配置验证和警告

### gemini.ts - 提示词生成

调用 `gemini/gemini-3-pro-preview` 模型生成图像提示词。

**使用示例：**
```typescript
import { generatePromptsWithGemini3 } from './api/gemini.js';

const prompts = await generatePromptsWithGemini3({
  systemPrompt: SYSTEM_PROMPT,
  userPrompt: "cyberpunk character",
  imageData: "data:image/jpeg;base64,..."
});
```

**返回：** `string[]` - 8-12 个图像生成提示词

### nanoBanana.ts - 图像生成

调用 `gemini/gemini-2.5-flash-image` 模型生成图像。

**使用示例：**
```typescript
import { generateImageWithNanoBanana } from './api/nanoBanana.js';

const imageUrl = await generateImageWithNanoBanana(
  "A cyberpunk character with neon aesthetics"
);
```

**返回：** `string` - 图像的 data URL 或占位图 URL

## API 端点

### POST /api/generate

主要的生成端点，完整流程：

**请求：**
```json
{
  "userPrompt": "频道主题描述",
  "imageData": "data:image/jpeg;base64,..."
}
```

**响应：**
```json
{
  "results": [
    {
      "prompt": "生成的提示词",
      "imageUrl": "data:image/..."
    }
  ]
}
```

### GET /api/health

健康检查端点。

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T..."
}
```

## 安全性改进

### 之前（不安全）❌
```typescript
const client = new OpenAI({
  apiKey: "sk-PZwjoX0QGseFOHjVh3SFBQ",  // 硬编码
  baseURL: "https://llm.jp.one2x.ai",
});
```

### 现在（安全）✅
```typescript
import { openaiClient } from './client.js';

// API Key 从环境变量读取
// 统一管理，易于维护
```

## 启动服务

```bash
# 安装依赖
npm install

# 开发模式（前端 + 后端）
npm run dev

# 仅启动后端
npm run dev:server

# 仅启动前端
npm run dev:client
```

## 故障排除

### API Key 未找到
如果看到警告：
```
[API Client] Warning: No API key found
```

**解决方案：**
1. 确认 `.env` 文件存在
2. 确认 `OPENAI_API_KEY` 已设置
3. 重启服务器

### CORS 错误
前端默认调用 `/api/generate`（相对路径），确保：
- 后端运行在 `http://localhost:3001`
- 前端通过 Vite 代理访问后端

### 模型调用失败
检查：
- API Key 是否有效
- `OPENAI_BASE_URL` 是否可访问
- 网络连接是否正常

## 最佳实践

1. ✅ 永远不要提交 `.env` 文件到版本控制
2. ✅ 使用环境变量管理敏感信息
3. ✅ 定期轮换 API Key
4. ✅ 在生产环境使用不同的 API Key
5. ✅ 监控 API 使用量和成本

## 更多信息

- OpenAI SDK 文档: https://github.com/openai/openai-node
- API 端点: https://llm.jp.one2x.ai

