# Q-sort 测评工具 | 关系中的自我探索

一个研究级的 Q-methodology 互动测评产品，帮助用户通过卡片排序探索自己在关系中的边界感、讨好倾向和自我位置。

## ✨ 特色功能

- **完整 Q-sort 流程**：预分堆 → 强制分布排序 → 结果分析
- **移动端友好**：基于 dnd-kit 的流畅拖拽体验
- **结果可视化**：自动生成 3:4 竖版海报，适合小红书分享
- **数据透明**：完整的方法说明、数据导出、历史对比
- **隐私优先**：所有数据仅存储在本地浏览器，不上传服务器
- **合规风控**：明确免责声明，非诊断工具定位

## 🛠 技术栈

- **前端**：Next.js 14 + TypeScript + TailwindCSS
- **状态管理**：Zustand（带 persist）
- **拖拽交互**：@dnd-kit/core + @dnd-kit/sortable
- **海报生成**：html-to-image
- **测试**：Playwright (E2E) + Vitest (单元测试)

## 📦 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd q-sort-app

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## 🧪 测试

```bash
# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 测试 UI（调试用）
npm run test:watch
npm run test:e2e:ui
```

## 📁 项目结构

```
q-sort-app/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx            # 首页/介绍页
│   │   ├── presort/            # 预分堆页面
│   │   ├── sorting/            # 强制分布排序页面
│   │   ├── result/             # 结果页
│   │   ├── history/            # 历史记录页
│   │   ├── settings/           # 设置页
│   │   └── methodology/        # 方法说明页
│   ├── components/             # 公共组件
│   │   └── ThemeProvider.tsx   # 主题提供者
│   ├── lib/                    # 核心算法库
│   │   ├── analysis.ts         # 分析算法
│   │   └── analysis.test.ts    # 算法单元测试
│   ├── data/                   # 数据定义
│   │   └ themes.ts             # 主题卡片库
│   ├── store/                  # 状态管理
│   │   └ index.ts              # Zustand store
│   ├── types/                  # TypeScript 类型定义
│   │   └ index.ts              # 全局类型
│   └── app/
│       ├── globals.css         # 全局样式
│       └── layout.tsx          # 布局组件
├── tests/                      # Playwright E2E 测试
│   └ flow.spec.ts
├── public/                     # 静态资源
├── vitest.config.ts            # Vitest 配置
├── playwright.config.ts        # Playwright 配置
├── tailwind.config.ts          # Tailwind 配置
├── tsconfig.json               # TypeScript 配置
└── package.json
```

## 🎯 核心功能说明

### 1. 预分堆（Pre-sort）

用户首先将 36 张卡片分成三堆：
- **A 堆**：更像我
- **B 堆**：中性/不确定
- **C 堆**：更不像我

这一步帮助用户快速建立对卡片的整体印象，降低后续精细排序的认知负担。

### 2. 强制分布排序

采用 9 档分布（-4 到 +4）：
```
-4: 2张    最不像我
-3: 3张
-2: 4张
-1: 5张
 0: 8张    中性/不确定
+1: 5张
+2: 4张
+3: 3张
+4: 2张    最像我
```

用户需要将卡片拖拽到对应档位，每个档位的容量有限，必须取舍。

### 3. 结果分析

自动分析包括：
- **Top/Bottom 卡片**：高分端和低分端的卡片列表
- **标签分布**：各标签（如边界感、讨好、自主性）的平均分
- **冲突结构**：发现内心的张力对（如"独立与恐惧的拉扯"）
- **建议文案**：温和可操作的自我反思建议

### 4. 海报导出

生成 3:4 竖版图片（375×500px），包含：
- 主题名和日期
- 核心一句话发现
- Top 3 和 Bottom 3 卡片
- 张力对提示
- 免责声明

### 5. 历史对比

支持两次同主题测评的对比：
- 卡片位置变化
- 标签趋势变化
- 整体相似度计算

## 🔒 隐私与合规

- 所有数据存储在浏览器 localStorage
- 不上传任何个人数据到服务器
- 明确免责声明：仅供自我反思，非临床诊断
- 支持数据导出（JSON）和清除

## 🚀 部署

推荐部署到 Vercel：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

或使用 Docker：

```bash
# 构建
npm run build

# Docker 部署（需要自行配置）
```

## 📖 方法说明

详见 `/methodology` 页面，包含：
- Q-sort 的核心思想
- 为什么使用强制分布
- 这不是诊断的原因
- 如何正确使用
- 复测与情境影响

## 🔮 未来计划

- [ ] 添加更多主题（如"工作与生活平衡"）
- [ ] 云端存储选项（可选）
- [ ] 多人对比功能
- [ ] 英文国际化
- [ ] PWA 支持

## 📄 License

MIT

---

**重要声明**：本测评仅供自我反思与科普参考，不构成任何临床诊断或医疗建议。如有心理困扰，请寻求专业帮助。