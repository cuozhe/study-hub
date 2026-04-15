# StudyHub 学习助手 - 部署教程

## 📦 部署包内容

```
StudyHub_Deploy.tar.gz
├── study-hub/                    # 完整项目
│   ├── app/                      # Next.js 应用
│   ├── public/                   # 静态资源
│   ├── package.json              # 依赖配置
│   ├── tsconfig.json             # TypeScript 配置
│   ├── tailwind.config.ts        # Tailwind 配置
│   ├── next.config.js            # Next.js 配置
│   ├── vercel.json               # Vercel 配置
│   └── README.md                 # 项目说明
└── DEPLOY_GUIDE.md              # 本文档
```

---

## 🚀 方式一：Vercel 部署（推荐）

Vercel 是 Next.js 官方推荐的部署平台，免费且无需服务器配置。

### 步骤 1：解压项目

```bash
tar -xzf StudyHub_Deploy.tar.gz
cd study-hub
```

### 步骤 2：在 GitHub 创建仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角 **+** → **New repository**
3. 填写仓库名称（如 `study-hub`）
4. 选择 **Private**（私有）或 **Public**
5. 点击 **Create repository**

### 步骤 3：上传代码

在项目文件夹中执行：

```bash
cd study-hub
git init
git add .
git commit -m "Initial commit: StudyHub 学习助手"
git branch -M main
git remote add origin https://github.com/你的用户名/study-hub.git
git push -u origin main
```

### 步骤 4：连接到 Vercel

1. 访问 [vercel.com](https://vercel.com) 并用 GitHub 账号登录
2. 点击 **Add New** → **Project**
3. 选择你刚创建的 GitHub 仓库
4. Vercel 会自动检测到 Next.js 项目
5. 点击 **Deploy**

**恭喜！🎉 你的网站已上线！**

Vercel 会提供一个免费域名，格式为：`https://你的项目名.vercel.app`

### 自定义域名（可选）

1. 在 Vercel 项目设置 → **Domains** 中添加你的域名
2. 在你的域名服务商处配置 DNS 解析
3. 等待验证完成

---

## 🖥️ 方式二：本地运行

### Windows / macOS / Linux

```bash
# 1. 解压
tar -xzf StudyHub_Deploy.tar.gz
cd study-hub

# 2. 安装依赖
npm install

# 3. 本地预览
npm run dev

# 4. 打开浏览器访问
# http://localhost:3000
```

### 构建生产版本

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

---

## ⚙️ 方式三：Docker 部署

如果你有 Docker 环境：

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# 构建镜像
docker build -t study-hub .

# 运行容器
docker run -p 3000:3000 study-hub
```

---

## 🔧 项目结构说明

```
study-hub/
├── app/
│   ├── components/          # React 组件
│   │   ├── Navigation.tsx    # 导航栏
│   │   ├── PomodoroTimer.tsx # 番茄钟
│   │   ├── CornellNote.tsx   # 康奈尔笔记
│   │   ├── FeynmanOutput.tsx # 费曼输出
│   │   ├── MarkdownExport.tsx # Markdown导出
│   │   └── views/            # 6大视图
│   ├── hooks/                # 自定义 Hooks
│   │   └── useStudyStore.ts  # 数据存储
│   ├── types/                # TypeScript 类型
│   │   └── index.ts
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 主页面
├── public/                   # 静态资源
├── package.json              # 依赖配置
├── tailwind.config.ts        # Tailwind CSS 配置
└── vercel.json              # Vercel 配置
```

---

## 📱 功能一览

### 五大学习方法
- 🍅 **番茄工作法** - 25分钟专注计时
- 🎯 **西蒙学习法** - 连续学习天数追踪
- 📑 **康奈尔笔记法** - 三栏式笔记模板
- 🎓 **费曼技巧** - 强制输出检验理解
- 🔄 **艾宾浩斯复习法** - 科学复习间隔

### 六大视图
- 📅 日历视图 - 学习计划和复习安排
- 📊 统计视图 - 学习数据可视化
- ⏳ 时间线 - 学习历程回顾
- 🗺️ 知识地图 - 学习路径管理
- 📝 笔记墙 - 康奈尔笔记卡片流
- 📋 复习队列 - 艾宾浩斯复习任务

### 博客导出
一键复制 Markdown 格式学习记录到博客！

---

## ❓ 常见问题

### Q: 数据存储在哪里？
A: 所有数据存储在浏览器的 LocalStorage 中，更换浏览器会导致数据丢失。建议定期导出重要笔记。

### Q: 如何备份数据？
A: 目前版本没有导出功能。可以通过浏览器开发者工具手动导出 localStorage 内容。

### Q: 支持多设备同步吗？
A: 当前版本不支持。数据仅保存在本地。如需多设备同步，可以考虑接入云数据库（如 Firebase、Supabase）。

### Q: 如何自定义学习路径？
A: 在 `app/hooks/useStudyStore.ts` 中的 `DEFAULT_STUDY_PATH` 对象可以修改，或者实现 JSON 导入功能。

### Q: 忘记番茄钟了怎么办？
A: 番茄钟计时依赖页面运行。关闭页面会暂停计时。后续可以增加通知提醒功能。

---

## 🛠️ 后续开发建议

1. **云端同步** - 接入 Firebase/Supabase 实现多设备同步
2. **数据导出/导入** - JSON 格式备份和恢复
3. **通知提醒** - 浏览器通知或 PWA 推送
4. **暗色模式** - 增加深色主题支持
5. **移动端优化** - 更适合手机操作的设计
6. **社交功能** - 学习小组、成就分享

---

## 📄 许可证

MIT License - 可自由使用、修改和分发

---

## 🤝 技术支持

如有问题，欢迎提交 Issue 或联系开发者。

**祝你学习顺利！🎓**
