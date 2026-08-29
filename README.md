# 王祥辉｜互联网招聘与 AI 工具实践作品集

个人作品集以纸质 Sketchbook 的翻页交互为内容载体，并使用 Sylva Living Green 的本地 Three.js 森林作为动态背景。

- 方向：纸质作品集 + 动态森林
- 定位：游戏、AI、产品设计与技术人才招聘
- 差异化：招聘行业研究、数据分析与 Vibe Coding 招聘工具
- 个人形象：`public/landing-pages/inner-green-assets/wang-and-cat-transparent.png`

当前包含四个作品档案入口：

- 个人简历：工作时间线、教育背景与招聘成果
- 关于我：个人经历、兴趣与工作方式
- AI 应用：社招、校招与硬件探索中的六个可展开工具案例
- 联系我：公开电话与邮箱

作品集保留纸张翻页、键盘切页、缩放、拖动与放大镜交互；详情页采用统一的自然滚动、展开和返回逻辑。Sylva 的 Three.js 场景继续在底层实时渲染。构建前会验证本地运行时、图片、字体和页面哈希。

## Public repository boundary

仓库只包含运行当前作品集所需的页面、组件和资源。旧实验、构建产物、依赖目录、未使用的原始图片以及招聘工具后端源码不会进入版本库。案例内容只描述实现方法和通用能力，不包含候选人数据、招聘系统地址、接口凭证或内部业务数据。

电话和邮箱是作品集页面主动公开的联系方式。如果将仓库设为公开，这些信息也会出现在源码历史中。

## Third-party work

Sylva/ThreeUI Community、Three.js 和本地字体的许可及署名见 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。个人履历、文字和插画不因本仓库公开而获得额外授权。

## Run

```bash
pnpm install
pnpm dev
```

Production verification:

```bash
pnpm run verify:source
pnpm run build
pnpm preview
```
