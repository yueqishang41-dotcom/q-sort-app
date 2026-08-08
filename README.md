# Q-Sort 在线实验平台

**研究课题：引导语框架效应对自我认知评价的影响（1×2 被试间设计）**

一个基于 Web 的在线 Q 分类（Q-Sort）实验平台。前端为 Next.js / React，后端为 Django + SQLite。被试在网页完成 Q 分类排序，数据真实收集并写入后端数据库，供主试端查看与分析。

**课程作业交付物：** 需求文档（`实验项目需求文档.md`）· 高保真原型（`public/prototype.html`）· 本代码仓库 · 演示视频（脚本见 `演示视频脚本.md`）

---

## 🧪 实验设计

| 要素 | 内容 |
|---|---|
| 设计类型 | 1×2 被试间设计 |
| 自变量 | 引导语类型：对照组（中性）vs 实验组（社会赞许性暗示） |
| 因变量 | ① 积极描述词平均位置　② 排序完成时间　③ 调整/移动次数 |
| 随机分配 | `startSession` 时 `Math.random()`，两组各 50%，全程固定、被试不可见 |
| 研究假设 | H1 实验组积极词位置更高 / H2 用时更长 / H3 调整更多 |

## ✨ 功能

- **随机条件分配**：进入实验时随机分到 control / experimental
- **两版引导语**：页面布局完全一致，仅文字不同（社会赞许性暗示句）
- **完整 Q-sort 流程**：预分堆 → 强制分布排序（-4 ~ +4，36 张）→ 结果报告
- **真实数据收集**：提交时经 `POST /api/submit/` 写入后端数据库
- **主试端**：Django Dashboard 统计、CSV 导出、admin 管理
- **数据记录**：条件 / 每张卡片最终位置 / 用时（秒）/ 移动次数 / 积极词平均位置
- **健壮性**：提交 loading、防重复提交、成功/失败弹窗、重试

## 📁 项目结构

```
q-sort-app/                  # 前端（被试端，Next.js）
├── src/app/                 # 页面
│   ├── page.tsx             # 首页（知情同意）
│   ├── instruction/         # 引导语页（两版文字）
│   ├── presort/             # 预分堆
│   ├── sorting/             # 强制分布排序
│   ├── submit/              # 提交结果页（POST 到后端）
│   ├── result/              # 结果页（含复制实验 JSON）
│   ├── history/  settings/  methodology/
├── src/lib/experiment.ts    # 条件分配 / 引导语文案 / 数据打包 / 后端提交
├── src/store/index.ts       # Zustand 状态（记录条件/时间戳/移动次数）
├── src/data/themes.ts       # 36 张卡片（含 polarity 极性）
└── public/prototype.html    # 高保真原型（10 屏可切换）

qsort_backend/               # 后端（主试端，Django + SQLite）
├── experiment/models.py     # QSortResult 模型（被试编号/条件/排序/用时）
├── experiment/views.py      # submit_result API / dashboard / CSV 导出
├── experiment/admin.py      # Django admin 注册
└── requirements.txt
```

## 🚀 启动（本地开发）

```bash
# 1. 后端（Django + SQLite）— 先启动，前端提交依赖它
cd qsort_backend
venv\Scripts\python manage.py migrate
venv\Scripts\python manage.py createsuperuser   # 首次，建主试账号
venv\Scripts\python manage.py runserver          # http://127.0.0.1:8000

# 2. 前端（Next.js）
cd q-sort-app
npm install
npm run dev                                      # http://localhost:3000
```

浏览器打开 `http://localhost:3000`，完整走一遍流程并点「提交结果」，数据即写入后端数据库。

## 🖥 主试端查看数据

| 方式 | 地址 | 说明 |
|---|---|---|
| Dashboard 统计 | `http://127.0.0.1:8000/dashboard/` | 被试数、组间平均用时对比、条件筛选 |
| Django admin | `http://127.0.0.1:8000/admin/` | 每一条原始记录 |
| JSON 接口 | `http://127.0.0.1:8000/api/results/` | 原始数据（程序用） |
| CSV 导出 | `http://127.0.0.1:8000/api/export/` | Excel 可打开，供统计分析 |

> 主试账号信息与详细步骤见 [`主试端使用说明.md`](主试端使用说明.md)。

## 🌍 线上部署

- **前端**：已部署于 Netlify（`q-sort-app.netlify.app`），`netlify.toml` 配置 `npm run build` + `.next`。
- **后端 API 地址**：见 [`src/lib/experiment.ts`](q-sort-app/src/lib/experiment.ts) 的 `API_ENDPOINT`，本地默认 `http://127.0.0.1:8000/api/submit/`；部署后端后改为公网地址。

## 🧪 测试

```bash
cd q-sort-app
npm run test        # Vitest 单元测试
```

## 🧾 课程作业文档

| 文档 | 内容 |
|---|---|
| `实验项目需求文档.md` | 研究背景/设计/流程/架构/变量表/伦理/交付物对照 |
| `public/prototype.html` | 高保真原型（10 屏） |
| `主试端使用说明.md` | 数据从哪来、怎么看、账号信息 |
| `演示视频脚本.md` | 1 分钟演示视频分镜表 |

---

**重要声明**：本测评仅供自我反思与科普参考，不构成任何临床诊断或医疗建议。实验数据仅用于课程研究用途。
