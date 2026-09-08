# JungUI 组织原则

## 产品边界

JungUI 的交付物是可直接接入项目的组件。完成一次复刻只是组件开发的输入；完成安装、参数设计和独立使用才是交付。

- 保留交互的精度与审美，允许使用者替换内容、尺寸、颜色和业务状态。
- 统一开发和分发方式，不强制所有组件长得一样。
- 基底改造保留原演示的设计意图、默认状态、对比标签与视觉呈现。例如 Nudge Instead 必须保留 Bad／Good 对比，不能改成普通参数开关；紧凑预览也不能删掉核心对比。Nudge Instead 的当前约定：方框与文字垂直居中，Good 模式让两者作为整行一起轻晃。
- 多框架原始样本不是组件库的正式交付物。正式组件使用 React + TypeScript。
- Next.js、Tailwind 用于站点；组件不得依赖 Next.js 路由、展示页面或全局环境。

## 组件、演示与文档

- `components/ui/<name>.tsx`：命名导出，导出 Props 类型，承载可复用交互。
- 组件支持 `className` 合并、合理的原生属性透传，根元素标注 `data-slot`。
- 业务状态需要外部接入时，提供受控值和回调；必要时提供非受控初始值。
- `components/demos/<name>.tsx`：默认导出，演示文字、背景、参数控制、重播和比较模式都放这里。
- demo 接收 `compact?: boolean`，紧凑预览和完整体验使用相同的正式组件。重型效果可使用轻量预览。
- 站点自动提供详情页、Install、全屏预览、源码查看、参数表。
- 展示站首次打开默认深色，之后记住用户选择。每页只在右侧保留一个太阳／月亮主题图标，侧栏不重复放置，按钮不附带可见模式文字。
- 侧栏分类标题与子组件用缩进区分层级，子组件比分类标题向右缩进 16px；导航仅用文字高亮，不加悬停底色；整栏支持收起展开，分类支持手风琴动画，减少动态效果偏好下关闭过渡。
- 需要完整页面滚动的组件可设置 `previewMode: "page"`。iframe 只服务于这种预览，不承担代码复用。

## 样式与依赖

- 样式写在相邻的 `<name>.css` 并由组件导入，或使用 Tailwind 类。
- 不在组件样式中设置 `body`、`:root` 或全局 `*`；选择器与动画名限定在组件内。
- 不引用展示站的全局 tokens。必要的 CSS 变量在组件上定义默认值。
- 不使用根路径图片、字体或隐式全局插件。资源通过组件显式参数、内联或可打包的辅助文件提供。
- 本地导入必须闭合：只允许 `components/ui`、可分发 `lib` 或 `hooks`。
- npm 运行时依赖登记在 `app/package.json` 的 `dependencies`。构建从源码导入自动计算每件组件的依赖。
- 同一安装包内的 JS/TS 文件必须使用不同的文件主名，避免 shadcn 的导入重写发生歧义。辅助算法使用 `*-engine` 等清晰名称。
- 多实例的 SVG、label、aria ID 使用 `useId()`，不能写死。
- 浏览器 API 只在事件或 effect 中访问；保证服务端渲染和 hydration 一致。
- 动画清理 RAF、计时器、监听器、GSAP context 和 WebGL 资源；尊重减少动态效果的偏好。
- 鼠标交互提供合理的键盘或触屏使用方式。

## 唯一登记入口

人工维护 `registry/items/<name>.json`：名称、分类、介绍、交互说明、usage、props、credits、entry。

- description 只描述是什么；interaction 描述怎样操作和看到什么。
- props 写参数含义和实际默认值，usage 是可以编译的最小示例。
- credits 保留准确来源；未知来源不编造。
- 不手工修改 `registry.json`、`public/r/*.json`、`lib/catalog.generated.json` 或 `components/demos/index.generated.ts`。
- 修改正式组件、依赖或元数据后运行 `npm run registry:build`。

## 完成标准

1. 参数能替换演示内容，交互能够连接使用者自己的状态。
2. 安装包包含全部必要源文件、局部样式、辅助类型和 npm 依赖。
3. 预览、文档、安装内容由同一份登记数据生成。
4. `npm run check`、`npm run build` 通过。
5. 涉及分发或依赖变化时，`npm run test:install` 通过；该测试在独立 Vite 项目运行真实 CLI 并编译所有公开 usage。
6. 浏览器检查桌面、窄屏、主要交互和无障碍基本行为。
