import { SiteTheme } from "@/components/catalog/site-theme";
export const metadata = { title: "使用指南" };
export default function Guide() {
  return (
    <article className="guide-page">
      <div className="page-theme">
        <SiteTheme />
      </div>
      <h1>把喜欢的细节带走。</h1>
      <p className="guide-lead">
        每个组件都以源码交付，放进项目后，你可以自由调整它。
      </p>
      <section>
        <h2>选择一个组件</h2>
        <p>
          在组件目录查看效果，进入详情页调整参数。较长的滚动交互可以在全屏预览中体验。
        </p>
      </section>
      <section>
        <h2>点击 Install</h2>
        <p>
          先准备一个已初始化 shadcn 的 React
          项目。选择包管理器，复制命令，在项目根目录运行。CLI
          会写入组件、样式和辅助文件，并安装依赖。
        </p>
        <pre>
          <code>npx shadcn@latest init</code>
        </pre>
        <p>
          安装地址使用当前站点的 /r/组件名.json，不需要访问私有 GitHub
          仓库。部分组件使用 Motion 或 GSAP，安装时会自动带上。
        </p>
      </section>
      <section>
        <h2>接入自己的内容</h2>
        <p>
          复制详情页中的使用示例，替换文字与内容。需要连接业务状态时，使用组件提供的
          value、checked 或回调属性。
        </p>
      </section>
      <section>
        <h2>查看与修改源码</h2>
        <p>
          工具栏的代码按钮列出安装包中的每个文件。CSS
          会与组件一起安装并由组件引入；你不需要复制展示站的全局样式。支持
          TypeScript 的 Vite 和 Next.js 项目都可以使用。
        </p>
      </section>
    </article>
  );
}
