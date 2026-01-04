# Tomatis 训练管理控制台（前端原型）

在线预览: https://6943daf9536c1156259a0f17--velvety-valkyrie-af2a4f.netlify.app/

本项目是基于 Vite + React + Tailwind 的前端原型，模拟 Tomatis 训练场景下的日常工作流，包括设备监控、患者档案管理、训练方案管理和素材库管理。项目使用本地 mock 数据驱动，适合演示、产品讨论与快速迭代。

## 功能覆盖范围
1) 设备监控中心
   - 12 通道设备卡片状态展示
   - 单设备启动/暂停/恢复/停止
   - 批量启动/批量暂停
   - 训练进度计时与阶段信息
   - 气导/骨导音量控制
2) 登录与安全流程
   - 演示账户登录
   - 首次登录修改密码流程
   - 多次失败后的锁定倒计时
3) 患者档案
   - 新增/编辑/删除
   - 按姓名/住院号/手机号/拼音检索
   - 分页与日期筛选
   - 治疗记录勾选导出（PDF/Excel）
4) 方案管理
   - 预置与自定义方案
   - 复制/编辑/删除方案
   - 多阶段参数表编辑
   - 方案 JSON 导出
5) 素材库
   - 目录树与素材统计
   - 搜索、排序、多选与批量操作
   - 音频预览、详情侧栏
   - 录音/导入与“导出到 Audacity”演示
6) 系统设置
   - Audacity 路径配置（演示）

## 技术栈
- React 18 + Vite
- Tailwind CSS
- jsPDF + jspdf-autotable（PDF 导出）
- xlsx（Excel 导出）
- lucide-react（图标）

## 快速开始
```bash
npm install
npm run dev
```

构建与预览：
```bash
npm run build
npm run preview
```

## 脚本说明
- `npm run dev`：启动本地开发
- `npm run build`：构建生产包
- `npm run preview`：本地预览生产包

## 目录结构
```
.
├─ App.jsx
├─ index.html
├─ main.jsx
├─ index.css
├─ components/
│  ├─ common/
│  ├─ media/
│  ├─ modals/
│  ├─ patient/
│  └─ scheme/
├─ data/
│  └─ mockData.js
├─ utils/
│  ├─ helpers.js
│  ├─ helpers.jsx
│  └─ styles.js
└─ views/
   ├─ DashboardView.jsx
   ├─ LoginView.jsx
   ├─ MediaLibraryView.jsx
   ├─ PatientArchiveView.jsx
   ├─ PatientDetailsView.jsx
   ├─ SchemeManagementView.jsx
   └─ SettingsView.jsx
```

## 架构与数据流
应用为单页 React UI，主状态集中在 `App.jsx`：
- 全局状态包含：登录状态、当前视图、设备、患者、治疗记录、素材与弹窗。
- `data/mockData.js` 提供基础数据与默认方案配置。
- 视图组件主要负责展示与交互，数据和回调通过 props 注入。

### 关键状态对象
- 设备：状态、进度、音量、患者绑定信息
- 患者：档案信息、训练历史、最近方案
- 记录：治疗历史记录
- 素材：文件列表与文件夹树

## 页面与交互说明

### 监控中心
文件: `views/DashboardView.jsx`
- 4x3 设备卡片栅格布局
- 单卡片控制：开始/暂停/恢复/停止
- 批量控制：全部启动/全部暂停
- 训练进度计时与阶段展示

### 登录
文件: `views/LoginView.jsx`
- 模拟登录与锁定逻辑
- 首次登录触发修改密码弹窗

### 患者档案
文件: `views/PatientArchiveView.jsx`
- 支持姓名、MRN、手机号、拼音搜索
- 新增/编辑/删除患者
- 治疗记录分页与日期筛选
- 勾选记录导出 PDF/Excel

### 患者详情
文件: `views/PatientDetailsView.jsx`
- 展示当前设备与患者训练信息
- 快捷控制与状态显示

### 方案管理
文件: `views/SchemeManagementView.jsx`
- 预置/自定义方案筛选与列表
- 方案详情与多阶段参数表
- 复制/编辑/删除/导出方案

### 素材库
文件: `views/MediaLibraryView.jsx`
- 目录树 + 面包屑路径
- 列表搜索、排序、多选与批量操作
- 音频预览与文件详情侧栏
- “导出到 Audacity”为演示交互

### 系统设置
文件: `views/SettingsView.jsx`
- Audacity 路径配置（演示）

## Mock 数据说明
文件: `data/mockData.js`
- `SYSTEM_CONFIG`：系统版本与显示信息
- `MOCK_PATIENTS_DATA`：患者模拟数据
- `MOCK_TREATMENT_RECORDS`：治疗记录模拟数据
- `MOCK_MEDIA_FILES`：素材文件模拟数据
- `DEFAULT_STAGES`/`INITIAL_SCHEMES`：默认方案配置

## 导出功能
- 患者报告：
  - PDF: jsPDF + autoTable
  - Excel: xlsx
- 方案导出：
  - JSON 文件下载

## 原型限制
- 无后端与数据持久化，刷新即重置
- 录音、移动、导出为 UI 演示逻辑
- 未实现权限/角色管理

## 自定义建议
- 品牌与标题：`App.jsx` 头部区域
- 设备数量与布局：`views/DashboardView.jsx`
- 方案默认值：`data/mockData.js`
- 全局风格：`utils/styles.js` 与 Tailwind 样式

## 常见问题
- 启动失败：确认 Node.js 已安装并执行 `npm install`
- 导出失败：浏览器需允许文件下载
- PDF 字体异常：调整 jsPDF 字体配置

## 许可
未指定。如需开源请添加 `LICENSE` 文件。
