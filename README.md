# 编程自学平台 🚀

基于 **Next.js 16** 构建的多语言交互式编程自学平台，支持 **C++、Python、Java** 三大主流语言。平台提供结构化教程、AI 生成练习题、AI 助教辅导和个性化学习进度追踪，帮助你从零开始系统学习编程。

## 📸 项目预览

访问在线演示：https://chuozhen.github.io/code-learn-website/

## ✨ 功能特性

### 📚 多语言结构化教程
- 支持 **C++、Python、Java** 三种编程语言
- 每种语言包含完整的章节体系，循序渐进
- 章节内容包含文字讲解和代码示例
- 代码高亮显示，支持一键复制

### 🤖 AI 驱动的学习体验
- **AI 练习题**：基于 DeepSeek API 和当前章节知识点，自动生成不同难度的练习题
- **AI 助教**：随时提问，获得引导式解答，培养独立思考能力
- **答案检查**：AI 自动评价你的代码答案，指出问题并给出改进方向

### 📊 个性化学习管理
- **学习进度追踪**：自动记录每章学习状态
- **多账号支持**：支持创建多个本地账号，数据隔离
- **本地数据加密**：学习进度和 API Key 使用 AES-GCM 加密后存储在浏览器中

### 🎨 优质的用户体验
- **深色主题**：专为长时间学习设计的护眼界面
- **响应式设计**：完美适配桌面和移动端
- **流畅动画**：精心设计的过渡动画和交互反馈
- **骨架屏加载**：章节加载时显示骨架屏，减少等待焦虑

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 | React 框架，支持 App Router 和静态导出 |
| React 19 | 用户界面构建 |
| TypeScript | 类型安全 |
| Tailwind CSS 4 | 原子化 UI 样式 |
| DeepSeek API | AI 练习题、AI 助教、答案检查 |
| highlight.js | 代码语法高亮 |
| IndexedDB + idb | 浏览器本地数据持久化 |
| GitHub Actions | CI/CD 自动部署 |

## ️ 项目结构

```
code-learn/
├── .github/workflows/     # GitHub Actions 工作流
├── data/                  # 教程数据（C++ / Python / Java）
│   ├── cpp/               # C++ 教程 JSON
│   ├── java/              # Java 教程 JSON
│   └── python/            # Python 教程 JSON
├── public/                # 静态资源
├── scripts/               # 抓取脚本（Python / Java）
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── chapters/[language]/[slug]/  # 章节详情页
│   │   ├── loading.tsx    # 全局加载页
│   │   └── page.tsx       # 首页
│   ├── components/        # React 组件
│   │   ├── AITutorChat.tsx
│   │   ├── ExercisePanel.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   └── lib/               # 工具库
│       ├── chapters.ts    # 章节索引
│       ├── db.ts          # 数据访问层
│       ├── deepseek-client.ts  # DeepSeek API 客户端
│       ├── localUser.ts   # 用户数据加密存储
│       └── slugs.ts       # slug 映射
├── README.md
├── next.config.ts
└── package.json
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

访问：http://localhost:3000/code-learn-website

### 构建静态站点

```bash
npm run build
```

### 预览构建结果

```bash
npx serve@latest dist
```

### 运行测试

```bash
npm run test
```

## 📖 使用说明

1. 打开首页 https://chuozhen.github.io/code-learn-website/
2. 选择一门编程语言：**C++**、**Python** 或 **Java**
3. 首次使用需要创建本地账号（数据加密后存储在浏览器中）
4. 在设置中配置 DeepSeek API Key 以启用 AI 功能
5. 按左侧目录顺序学习，每章底部有练习题
6. 遇到问题可点击右下角 AI 助教提问

## 🌐 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages：

```bash
git push origin main
```

部署地址：https://chuozhen.github.io/code-learn-website/

### 手动部署

如果你想部署到自己的 GitHub Pages：

1. Fork 本仓库
2. 在仓库 Settings → Pages 中，Source 选择 **GitHub Actions**
3. 修改 `next.config.ts` 中的 `basePath` 为你的仓库名
4. Push 到 main 分支，等待 Actions 运行完成

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的分支：`git checkout -b feature/xxx`
3. 提交改动：`git commit -m 'feat: xxx'`
4. 推送到远程：`git push origin feature/xxx`
5. 创建 Pull Request

## 📄 内容来源

- C++ 内容基于 [菜鸟教程 C++ 教程](https://www.runoob.com/cplusplus/cpp-tutorial.html)
- Python 内容基于 [菜鸟教程 Python 教程](https://www.runoob.com/python/python-tutorial.html)
- Java 内容基于 [菜鸟教程 Java 教程](https://www.runoob.com/java/java-tutorial.html)

感谢原作者的优质内容。本仓库内容仅供个人学习使用。

## 📜 许可证

本项目仅供个人学习使用，未经授权不得用于商业用途。
