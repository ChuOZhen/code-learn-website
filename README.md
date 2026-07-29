# 编程自学平台 🚀

基于 **Next.js** 构建的多语言交互式编程自学平台，支持 C++、Python、Java 三大语言，包含结构化教程、AI 生成练习题和智能助教。

## ✨ 功能特性

- 📚 **多语言教程** — 支持 C++、Python、Java 三种编程语言
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

1. 启动后访问 `http://localhost:3000/code-learn-website`
2. 在首页选择一门编程语言（C++ / Python / Java）
3. 首次使用需要创建本地账号（数据存储在浏览器中）
4. 在设置中配置 DeepSeek API Key 以启用 AI 功能
5. 按左侧目录顺序学习，每章底部有练习题
6. 遇到问题可点击右下角 AI 助教提问

## 🌐 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages：

```bash
git push origin main
```

访问：`https://chuozhen.github.io/code-learn-website/`

##  内容来源

- C++ 内容基于 [菜鸟教程 C++ 教程](https://www.runoob.com/cplusplus/cpp-tutorial.html)
- Python 内容基于 [菜鸟教程 Python 教程](https://www.runoob.com/python/python-tutorial.html)
- Java 内容基于 [菜鸟教程 Java 教程](https://www.runoob.com/java/java-tutorial.html)

感谢原作者的优质内容。
