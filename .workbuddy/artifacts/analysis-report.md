# NhàXinh.vn 项目审计报告

> 基于《NhàXinh 项目计划书》与当前代码实现的逐项比对分析

---

## 🖼️ 图片本地不显示 — 根因诊断

**现象**：本地 `next dev` 启动后，页面图片全部不显示。

**三个根因叠加导致**：

| # | 原因 | 具体位置 | 解释 |
|---|------|---------|------|
| 1 | **缺少 basePath** | `next.config.mjs` | 没有 `basePath: '/nhaxinh-vn'`，但所有组件图片路径都以 `/nhaxinh-vn/` 开头。本地 dev 中 `/nhaxinh-vn/images/...` 找不到文件，因为 public 目录挂载在 `/` |
| 2 | **preload 用了 .jpg** | `src/app/[locale]/layout.tsx:66` | `<link rel="preload" href="/images/hero/hero-1.jpg">` — 实际文件是 `.webp`，预加载链接失效 |
| 3 | **OG 图片也是 .jpg** | `src/lib/seo.ts:20,95` | og:image 路径指向 `${SITE_URL}/images/hero/hero-1.jpg`，实际文件是 `.webp` |

**修复方案**：在 `next.config.mjs` 中加入 `basePath: '/nhaxinh-vn'`，同时把 layout.tsx 和 seo.ts 中的 `.jpg` 改为 `.webp`。

> ⚠️ 注意：加入 basePath 后，`next dev` 的访问地址也会变为 `http://localhost:3000/nhaxinh-vn/vi/`，这是预期行为。

---

## 一、计划与页面匹配度

### 1.1 项目基本信息

| 计划项 | 实现状态 | 详情 |
|--------|---------|------|
| 名称 NhàXinh.vn | ✅ 完全覆盖 | 网站标题、域名一致 |
| 越南家装分享平台定位 | ✅ 完全覆盖 | 25篇文章全部围绕家装设计 |
| 双语言（越/中） | ✅ 覆盖 + 超出 | 实际支持越/中/英三语 |
| 极低成本启动 | ✅ 覆盖 | Vercel 免费托管，静态导出 |

### 1.2 核心功能逐项比对

#### ✅ 已实现

| 功能 | 计划要求 | 实际实现 | 匹配度 |
|------|---------|---------|--------|
| 文章展示 | 8篇起步 | **25篇文章**，含图片轮播、TOC目录 | ✅ 超出预期 |
| 两大风格体系 | 东南亚现代风 + 法式殖民风 | 文章按 `se-asia` / `french` 分风格，RoomNavigator 按8个房间分类 | ✅ 完全匹配 |
| 文章结构五段式 | 风格介绍→设计元素→本地实现→避坑→总结 | 文章content字段含完整Markdown结构 | ✅ 完全匹配 |
| 房间分类导览 | 按房间筛选 | RoomNavigator 8个房间分类，点击筛选 | ✅ 完全匹配 |
| Facebook社群运营 | 越南伙伴经营FB Page | 社交链接存在（Footer），但无实际API对接 | ⚠️ 仅占位 |
| 图片案例展示 | 授权图片+免费素材 | 119张文章配图 + 轮播展示 | ✅ 完全匹配 |
| Shopee联盟链接 | 初期变现主渠道 | AffiliateProducts 12个产品卡片，但链接全指向 `shopee.vn` 首页 | ⚠️ 功能存在但链接未替换为联盟链接 |
| 越南伙伴分工 | 文案+社交+客服 | AuthProvider 预留了用户系统，但无实际后台 | ⚠️ 仅界面 |

#### ❌ 缺失

| 计划要求 | 缺失情况 | 影响 |
|---------|---------|------|
| **TikTok短视频嵌入** | 计划书要求"每周3条TikTok短视频"，页面有 VideoShowcase 但使用的是占位图 `video-1/2/3.webp`，无实际视频 | 社交流量入口缺失 |
| **Zalo社群维护** | 计划书要求 Zalo 社群运营，页面完全无 Zalo 相关入口 | 越南最重要的社交渠道缺失 |
| **1688自营选品** | 计划书后期核心变现方向，当前仅12个 Shopee 通用链接 | 后期变现路径未铺垫 |
| **Google AdSense** | 计划中期变现方向，页面无广告位（AdSlot 组件写了但隐藏） | 中期收入来源暂未启用 |
| **设计工作室合作** | 计划中期变现方向，Partnerships 有3个假数据占位，无真实联系方式整合 | 合作变现入口缺失 |
| **Facebook Page实际运营** | 计划要求越南伙伴运营，代码中社交链接均为通用域名 | 流量获取渠道未对接 |
| **用户投稿审核流程** | 有 `SubmitContent` 页面但无后端审核逻辑 | 用户产生内容不可用 |
| **Canva设计公式图卡** | 计划要求的原创视觉内容 | 无相关实现 |
| **AI工具辅助（Claude Pro）** | 计划书提到使用AI生成内容 | 无 AI 内容生成集成 |

#### ⚠️ 计划与实现偏差

| 偏差项 | 计划 | 实际 | 建议 |
|--------|------|------|------|
| **文章数量** | 首批8篇 | 已上线25篇 | 内容超额完成，但计划中的"8篇文章后开始TikTok"节奏被打乱 |
| **网站平台** | Framer | Next.js static export | Next.js 更灵活，但团队能力匹配需确认 |
| **域名注册** | 计划第1周 | 未见 `nhaxinh.vn` 实际注册 | 需要确认域名状态 |
| **内容免费策略** | "绝不收费会员" | 当前无会员系统 | ✅ 符合计划 |
| **图片授权** | 要求取得授权或免费用 | 119张文章图，未确认授权状态 | ⚠️ 法律风险 |

### 1.3 页面功能完成度热力图

```
HeroSection(轮播)     ████████████ 100%
RoomNavigator(导航)    ████████████ 100%
ContentCards(文章)     ████████████ 100%
ArticleDetail(详情)    ████████████ 100%
SearchOverlay(搜索)    ████████████ 100%
AffiliateProducts(产品) ████████░░░░  70%  (链接非联盟链接)
VideoShowcase(视频)    ████░░░░░░░░  30%  (纯占位)
Partnerships(合作)     ████░░░░░░░░  30%  (假数据)
Newsletter(订阅)       ██░░░░░░░░░░  10%  (装饰性)
AdSense广告位          ░░░░░░░░░░░░   0%  (隐藏)
TikTok集成             ░░░░░░░░░░░░   0%
Zalo集成               ░░░░░░░░░░░░   0%
```

---

## 二、变现路径

### 2.1 计划书中的变现路径评估

| 阶段 | 变现方式 | 计划时间 | 现状 | 实施难度 |
|------|---------|---------|------|---------|
| 初期 | Shopee越南联盟 | 第1-3月 | 12个产品卡片但链接为通用域名 | 🟢 低 |
| 中期 | Google AdSense | 第3-6月 | 广告位代码已有但隐藏 | 🟢 低 |
| 中期 | 设计工作室合作 | 第4-6月 | 仅3个假数据占位 | 🟡 中 |
| 后期 | 1688自营选品 | 第6月+ | 无实现 | 🔴 高 |

### 2.2 建议的5种变现路径

#### 路径 1：Shopee越南联盟链接（立即启动）

| 维度 | 说明 |
|------|------|
| **当前状态** | AffiliateProducts 有12个产品卡片，但 `link` 字段全部指向 `https://shopee.vn` 首页，没有带联盟参数 |
| **修复成本** | 极低 — 仅需替换 `products.json` 中的 `link` 为真实的 Shopee 联盟链接 |
| **收益模式** | CPS（按成交佣金），越南家装品类佣金约 3%-10% |
| **启动条件** | 注册 Shopee Vietnam Affiliate Program，获取联盟链接 |
| **预期效果** | 月流量 > 5000 时，预计 $100-300/月 |

#### 路径 2：Google AdSense（1个月后启动）

| 维度 | 说明 |
|------|------|
| **当前状态** | `src/components/shared/AdSlot.tsx` 已实现但通过 CSS `hidden` 隐藏 |
| **修复成本** | 低 — 移除 `hidden` class，填入 AdSense 广告单元代码 |
| **收益模式** | CPM/CPC，越南流量 CPM 约 $0.5-2 |
| **启动条件** | 月流量 > 10,000，网站内容合规（越南语政策允许） |
| **预期效果** | 月流量 10,000 → $50-200/月 |

#### 路径 3：设计工作室付费展示（3个月后启动）

| 维度 | 说明 |
|------|------|
| **当前状态** | Partnerships 组件有3个假数据卡片，布局优雅可直接复用 |
| **修复成本** | 中 — 需谈合作 + 后台管理系统 |
| **收益模式** | 固定月费或按点击付费。越南中小设计工作室月推广预算约 200-500万越南盾（$80-200） |
| **启动条件** | 月流量 > 20,000，有3-5个真实合作案例 |
| **预期效果** | 3个工作室 × $100/月 = $300/月 |

#### 路径 4：1688 跨境选品代购（6个月后启动）

| 维度 | 说明 |
|------|------|
| **当前状态** | 无实现。需要新增选品页面和导购内容 |
| **修复成本** | 高 — 需要对接1688货源、物流方案、支付流程 |
| **收益模式** | 商品差价。中国1688拿货价 × 3-5倍 = 越南零售价 |
| **启动条件** | 月流量 > 30,000，有5-10篇导购文章，越南伙伴负责物流履约 |
| **预期效果** | 单品利润率 200-400%，月均 $500-2000 |
| **风险** | 跨境物流时效（7-15天）、退换货困难、汇率波动 |

#### 路径 5：内容赞助 + 原生广告（2个月后启动）

| 维度 | 说明 |
|------|------|
| **当前状态** | 无实现。需要在文章中嵌入"推荐产品"模块 |
| **修复成本** | 低 — 在 ArticleDetail 的 TOC 侧边栏或文章底部插入赞助产品卡片 |
| **收益模式** | 按文章赞助费，单篇 $50-200 |
| **启动条件** | 内容质量获认可，有品牌方主动联系 |
| **预期效果** | 2-3篇/月 × $100 = $200-300/月 |

### 2.3 变现路径时间线建议

```
Month 1       Month 3       Month 5       Month 7
   │             │             │             │
   ▼             ▼             ▼             ▼
 ┌─────┐    ┌─────────┐  ┌─────────┐  ┌──────────┐
 │Shopee│───▶│ Google  │─▶│ 设计合作 │─▶│  1688    │
 │联盟  │    │ AdSense │  │ 付费展示 │  │ 跨境选品  │
 └─────┘    └─────────┘  └─────────┘  └──────────┘
   │             │             │             │
   └─────────────┴──────┬──────┴─────────────┘
                        ▼
                  ┌──────────┐
                  │ 内容赞助  │ (持续运营)
                  │ 原生广告  │
                  └──────────┘
```

---

## 三、多语言投稿显示方案

### 3.1 当前问题分析

当前 `submissions.json` 仅有越南语，`src/data/allContent.ts` 中投稿未按语言分流：

```typescript
// 现状：投稿忽略 locale
const submissions = submissionsData; // 永远是越南语
```

我们的修改已新增 `submissions.zh.json` 和 `submissions.en.json`，但未来若增加阿拉伯语（RTL）、日语（竖排可能）等，需要更完整的技术方案。

### 3.2 技术方案架构

#### 3.2.1 字体适配策略

| 语言 | 推荐字体 | 加载策略 | CDN 大小 |
|------|---------|---------|---------|
| 越南语 (vi) | Noto Sans (已有) + Noto Serif | 已有 Noto Sans，补 Noto Serif | +50KB |
| 中文 (zh) | Noto Sans SC | `@next/font/google` 子集化 | ~80KB |
| 英文 (en) | Noto Sans (已有) | 复用现有 | 0KB |
| 日文 (ja) | Noto Sans JP | 与 SC 类似，单独子集 | ~70KB |
| 阿拉伯语 (ar) | Noto Naskh Arabic | **必须**，支持 RTL 连字 | ~120KB |
| 韩文 (ko) | Noto Sans KR | 单独子集 | ~60KB |
| 泰文 (th) | Noto Sans Thai | 单独子集 | ~30KB |

**实现方案** — 在 `layout.tsx` 中按 locale 条件加载：

```tsx
// src/app/[locale]/layout.tsx
import { Noto_Sans, Noto_Sans_SC, Noto_Naskh_Arabic } from 'next/font/google';

const fonts: Record<string, ReturnType<typeof Noto_Sans>> = {
  vi: Noto_Sans({ subsets: ['vietnamese', 'latin'], variable: '--font-body' }),
  zh: Noto_Sans_SC({ subsets: ['latin'], variable: '--font-body' }),
  en: Noto_Sans({ subsets: ['latin'], variable: '--font-body' }),
  ar: Noto_Naskh_Arabic({ subsets: ['arabic'], variable: '--font-body' }),
};

// 使用时按 locale 选择
const fontClass = fonts[locale]?.variable || fonts.vi.variable;
```

#### 3.2.2 文字方向 (LTR/RTL)

| 语言 | 方向 | HTML 属性 | CSS |
|------|------|----------|-----|
| 越/中/英/日/韩 | LTR | `dir="ltr"` | 默认 |
| 阿拉伯语 | RTL | `dir="rtl"` | `direction: rtl` |
| 波斯语/希伯来语 | RTL | `dir="rtl"` | `direction: rtl` |

**实现方案** — 在 `layout.tsx` 已有 `<html lang={locale}>` 基础上增加 `dir` 属性：

```tsx
// src/app/[locale]/layout.tsx
const RTL_LOCALES = ['ar', 'fa', 'he'];

export default function LocaleLayout({ children, params: { locale } }) {
  return (
    <html lang={locale} dir={RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'}>
      ...
    </html>
  );
}
```

**投稿内容卡片内 RTL 处理**：

```tsx
// 投稿卡片组件
function SubmissionCard({ item, locale }: { item: SubmissionItem; locale: string }) {
  const isRTL = ['ar', 'fa', 'he'].includes(locale);

  return (
    <div
      className={clsx(
        'submission-card',
        isRTL && 'text-right' // 阿拉伯语文字右对齐
      )}
      style={isRTL ? { direction: 'rtl' } : undefined}
    >
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  );
}
```

#### 3.2.3 字符编码

| 风险点 | 方案 |
|--------|------|
| 数据库存储 | 所有投稿内容使用 **UTF-8mb4** 存储（支持 emoji、阿拉伯语连字、CJK 扩展字符） |
| API 传输 | `Content-Type: application/json; charset=utf-8` |
| 静态导出 | Next.js static export 默认 UTF-8，无需额外配置 |
| JSON 文件 | 确保投稿 JSON 文件保存为 UTF-8（VS Code 右下角确认编码） |

#### 3.2.4 特殊排版处理

**日文竖排（可选）**：

```css
.jp-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
```

**阿拉伯语连字（Ligature）**：

```css
.arabic-text {
  font-feature-settings: "liga", "calt";
  letter-spacing: 0; /* RTL 文字不需要字母间距 */
}
```

**中文字间距**：

```css
.zh-text {
  letter-spacing: 0.05em; /* 中文适当加间距 */
  line-height: 1.8;       /* 中文需要更大的行高 */
}
```

**投稿摘要截断** — 不同语言的"N字"不等价：

```typescript
// 不要用字符数截断阿拉伯语/中文投稿
function truncateByLanguage(text: string, locale: string, maxLength: number): string {
  if (['zh', 'ja', 'ko'].includes(locale)) {
    // CJK 按字符数
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }
  // 拉丁/阿拉伯语按单词数
  const words = text.split(/\s+/);
  return words.length > maxLength ? words.slice(0, maxLength).join(' ') + '…' : text;
}
```

#### 3.2.5 多语言投稿数据结构建议

```typescript
// 投稿数据模型
interface LocalizedSubmission {
  id: string;
  date: string;
  author: {
    name: string;
    locale: string;      // 投稿者的母语
  };
  locales: Record<string, {  // 多语言版本
    title: string;
    description: string;
    content: string;
  }>;
  images: string[];
  likes: number;
  direction: 'ltr' | 'rtl'; // 默认 LTR，阿拉伯语投稿为 RTL
}
```

### 3.3 实施优先级

| 优先级 | 任务 | 工作量 | 前置条件 |
|--------|------|--------|---------|
| 🔴 P0 | 修复当前中文/英文投稿越南语问题 | 已完成 | — |
| 🟡 P1 | 补全 `submissions.zh.json` / `submissions.en.json` 翻译 | 1小时 | 待翻译 |
| 🟡 P1 | `layout.tsx` 增加 `dir` 属性支持 RTL | 15分钟 | — |
| 🟢 P2 | 按 locale 加载不同字体 | 1小时 | 确认支持的语言 |
| 🟢 P2 | 投稿摘要多语言截断函数 | 30分钟 | — |
| 🔵 P3 | 阿拉伯语/日语投稿字体 | 按需 | 实际需求确认 |

---

## 📋 综合建议优先级

| 序号 | 建议 | 类型 | 影响 |
|------|------|------|------|
| 1 | 修复 `next.config.mjs` 添加 `basePath` | 图片显示 | 🔴 阻塞本地预览 |
| 2 | 修复 layout.tsx preload + seo.ts 的 .jpg→.webp | 图片显示 | 🔴 SEO og:image 失效 |
| 3 | 替换 products.json 中的 `link` 为真实 Shopee 联盟链接 | 变现 | 🔴 核心变现路径失效 |
| 4 | 启用 AdSlot 广告位 | 变现 | 🟡 中期收入 |
| 5 | 实现 RTL 支持 + 字体按需加载 | 多语言 | 🟡 国际化质量 |
| 6 | 对接真实视频内容替代 VideoShowcase 占位 | 功能 | 🟡 计划要求未满足 |
| 7 | 加入 Zalo 社交入口 | 功能 | 🟡 越南核心渠道缺失 |
| 8 | 确认文章图片授权状态 | 合规 | 🟡 法律风险 |
