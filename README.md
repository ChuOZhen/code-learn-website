# C++ 自学平台 🚀

基于 **Next.js** 构建的 C++ 交互式自学平台，包含结构化教程、AI 生成练习题和智能助教。

## ✨ 功能特性

- 📚 **40 个系统章节** — 从基础语法到高级特性，循序渐进
- 🤖 **AI 练习题** — 基于 DeepSeek API 自动生成不同难度的练习题
- 💬 **AI 助教** — 随时提问，获得引导式解答（不是直接给答案）
- ✅ **答案检查** — AI 自动评价你的代码答案
- 📊 **学习进度** — 自动保存进度，支持多账号
- 🌙 **深色主题** — 专为长时间学习设计的护眼界面
- 📱 **响应式设计** — 桌面和移动端均可使用
- 🔒 **数据本地存储** — 学习进度和 API Key 仅保存在本地

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 | 框架 |
| TypeScript | 类型安全 |
| Tailwind CSS 4 | UI 样式 |
| DeepSeek API | AI 功能 |
| highlight.js | 代码高亮 |
| GitHub Actions | CI/CD 部署 |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建静态站点
npm run build

# 预览构建结果
npx serve@latest dist
```

## 📖 使用说明

1. 启动后访问 `http://localhost:3000`
2. 首次使用需要创建本地账号（数据存储在浏览器中）
3. 在设置中配置 DeepSeek API Key 以启用 AI 功能
4. 按左侧目录顺序学习，每章底部有练习题
5. 遇到问题可点击右下角 AI 助教提问

## 🌐 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages：

```bash
git push origin main
```

访问：`https://chuozhen.github.io/cpp-learn-website/`

## 📄 内容来源

章节内容基于 [菜鸟教程 C++ 教程](https://www.runoob.com/cplusplus/cpp-tutorial.html)，感谢原作者的优质内容。
