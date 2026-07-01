 # C++ 自学平台

  一个基于 Next.js + React 开发的 C++ 在线学习网站，课程内容整理自菜鸟教程，共 40 章。支持 AI 驱动的练习题生成、AI 助教答疑、学习进度跟踪等功能。

  所有用户数据（账号、密码、学习进度、API Key）均存储在浏览器本地，不上传到任何服务器。

  ## 在线访问

  https://chuozhen.github.io/cpp-learn-website/

  ## 功能特性

  - 📚 **40 章 C++ 课程**：从基础语法到高级主题，循序渐进
  - 🤖 **AI 练习题生成**：根据每章知识点生成不同难度的练习题
  - 💬 **AI 助教**：基于当前章节内容进行答疑辅导
  - ✅ **学习进度跟踪**：标记章节完成状态
  - 🔐 **本地账号系统**：多账号隔离，数据加密存储在浏览器
  - 🌐 **纯静态部署**：可直接部署到 GitHub Pages，无需服务器

  ## 技术栈

  - Next.js 16
  - React 19
  - TypeScript
  - Tailwind CSS
  - DeepSeek API
  - IndexedDB + Web Crypto API

  ## 本地运行

  ```bash
  # 克隆项目
  git clone https://github.com/ChuOZhen/cpp-learn-website.git
  cd cpp-learn-website

  # 安装依赖
  npm install

  # 启动开发服务器
  npm run dev

  访问 http://localhost:3000。

  部署到 GitHub Pages

  项目已配置 GitHub Actions 自动部署。推送到 main 分支后，Actions 会自动构建并部署到 GitHub Pages。

  部署步骤

  1. Fork 或克隆本仓库
  2. 进入仓库 Settings → Pages
  3. Source 选择 GitHub Actions
  4. 推送代码到 main 分支
  5. 等待 Actions 运行完成
  6. 访问 https://你的用户名.github.io/仓库名/

  使用说明

  首次使用

  1. 打开网站后，创建本地账号
  2. 输入用户名和密码
  3. 密码用于加密你的学习进度和 API Key

  配置 DeepSeek API Key

  1. 点击右下角 设置 按钮
  2. 输入你的 DeepSeek API Key
  3. 点击保存

  API Key 仅保存在当前账号的浏览器本地，不会上传到任何服务器。

  ▌ 获取 DeepSeek API Key：https://platform.deepseek.com/api_keys

  多账号

  • 同一台设备可以创建多个账号
  • 每个账号的学习进度和 API Key 独立存储
  • 切换账号后数据自动隔离

  数据安全与隐私

  • 所有数据存储在浏览器的 IndexedDB 中
  • 学习进度和 API Key 使用 AES-GCM 加密
  • 密码通过 PBKDF2 派生密钥
  • 不收集任何用户数据
  • 不依赖任何后端服务器

  注意事项

  • 清除浏览器数据会导致所有本地账号和进度丢失
  • 忘记密码后无法恢复数据
  • 建议定期备份重要学习进度
  • API Key 在前端网络请求中可见，请妥善保管

  浏览器兼容性

  • Chrome / Edge（推荐）
  • Firefox
  • Safari

  需要浏览器支持：

  • IndexedDB
  • Web Crypto API
  • ES2020+

  项目结构

  .
  ├── .github/workflows/     # GitHub Actions 部署配置
  ├── data/chapters/           # 40 章 C++ 课程内容 JSON
  ├── src/
  │   ├── app/                 # Next.js 页面
  │   ├── components/            # React 组件
  │   ├── lib/                 # 工具函数和本地数据层
  │   └── ...
  ├── next.config.ts           # Next.js 配置
  └── package.json

  开源协议

  本项目仅供学习交流使用。
