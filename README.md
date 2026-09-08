# JungUI

把喜欢的界面细节和交互，整理成能直接用于自己项目的组件库。

JungUI 采用与 Rare UI 相同的产品组织原则：**可复用组件 + 独立演示 + 参数文档 + shadcn 源码分发**。组件保留自己的视觉特点，站点负责发现、预览和安装。

## 开发

```sh
cd app
npm ci
npm run dev
```

打开 http://localhost:3000。Node.js 22 或更新版本。

```sh
npm run check         # lint、类型、行为与打包测试、生成文件同步检查
npm run build         # 重新生成 registry，然后静态导出到 dist/
npm run preview       # http://localhost:4173
npm run test:install  # 在临时 Vite 项目中用真实 shadcn CLI 安装全部组件并构建
```

## 安装意味着什么

详情页的 Install 提供如下形式的命令：

```sh
npx shadcn@latest add https://jungui-cle.pages.dev/r/telegraph-text.json
```

该命令适用于**包含新版 registry 的部署**。本地预览会自动提供本地站点地址。

CLI 读取组件 JSON，把 TSX、CSS 和辅助文件写入使用者项目，安装所需的 npm 依赖。组件由使用者拥有，不需要依赖一个 JungUI npm 包。目标项目先运行 `npx shadcn@latest init`，配置 `components.json`。

组件不导入 Next.js API，可在 Vite 或 Next.js React 项目使用。CSS 随组件安装并由组件导入，无须携带展示站的全局 CSS。已有天空渲染核心保留 JavaScript，并附带公开类型声明。

## 新增组件

```sh
npm run component:new -- kinetic-label --title "动态标签" --category text
```

生成组件、局部样式、独立 demo 和元数据，并更新目录与 registry。详见 [贡献指南](CONTRIBUTING.md)。

## 目录

```text
app/
  app/                       Next.js 路由、站点样式
  components/ui/             安装给使用者的组件与局部 CSS
  components/demos/          演示场景、演示文案、调参面板
  components/catalog/        目录、导航、工具栏、源码弹窗
  lib/                       组件辅助代码与站点数据访问
  registry/items/            每个组件唯一的人工维护元数据
  registry.json              自动生成的 shadcn 清单
  public/r/                  自动生成的安装包 JSON
  scripts/                   登记、校验、新增与真实安装验证
  tests/                     分发边界与行为测试
```

阅读 [组织原则](CONVENTIONS.md) 和 [架构说明](docs/architecture.md)。

## 部署

保持现有 Cloudflare Pages 配置：项目 `jungui`，构建目录 `app`，命令 `npm run build`，输出目录 `dist`。Next.js 使用静态导出，无需服务器或 Workers 适配器。

推送生产分支 `main` 会触发生产部署。当前改造分支需完成审阅后再合并。旧的 `/specimens/` 和 `/patterns/` 链接由 `public/_redirects` 指向新页面。安装 JSON 与网站一同发布，不依赖私有 GitHub 仓库的访问权限。

## 来源

项目结构参考 [Rare UI](https://github.com/swamimalode07/rare-ui)，站点界面独立实现。既有收藏的来源保存在各组件元数据中。来源记录区分源代码采集与视觉参考，不把参考效果描述为原创。
