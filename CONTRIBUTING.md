# 新增一个 UI

先读 [CONVENTIONS.md](CONVENTIONS.md)。所有命令在 `app/` 执行。

## 生成骨架

```sh
npm run component:new -- kinetic-label --title "动态标签" --category text
```

分类为 `display`、`text`、`backgrounds`、`inputs`、`feedback`。添加 `--dry-run` 只显示将生成的文件。已有文件不会被覆盖。

生成：

- `components/ui/kinetic-label.tsx`
- `components/ui/kinetic-label.css`
- `components/demos/kinetic-label.tsx`
- `registry/items/kinetic-label.json`

路由、导航、源码弹窗与安装命令自动就绪，不需要修改站点组件。

## 实现

把正式 UI 写入组件，demo 负责示例文案与参数控制。需要辅助逻辑时放在 `lib/` 或 `hooks/`，由组件显式导入。registry 构建会递归收集这些依赖。

交互组件包含 `"use client"`。只支持 React 的组件不应导入 `next/link` 等展示框架 API。组件样式必须能够与其他组件同时使用。

例如：

```tsx
export type KineticLabelProps = ComponentProps<"button"> & {
  active?: boolean
}
```

让使用者传入内容和业务回调，保持演示壳、解释文案与重播按钮在 demo 层。

## 补充元数据

更新 description、interaction、usage、props 和 credits。`usage` 必须导出名为 `Demo` 的示例函数，真实安装测试会编译它。`entry` 指向主要组件文件。`order` 控制目录顺序。

`previewMode: "page"` 适用于依赖页面滚动的交互；详情页会嵌入独立预览，全屏入口指向同一份 demo。

## 校验

```sh
npm run registry:build
npm run check
npm run build
npm run test:install
```

`check` 会阻止缺失 demo、未声明依赖、漏掉本地导入、组件依赖展示站、同名文件歧义和生成文件过期。

浏览器打开目录、组件详情、源码与全屏预览，检查手机宽度和键盘操作。把自己的内容传入组件再使用一次。

## 变更提交

提交源文件、元数据、生成后的 registry 和锁文件。说明交互变化以及验证结果。
