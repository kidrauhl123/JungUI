import { notFound } from "next/navigation";
import { components, getComponent } from "@/lib/components";
import { InstallToolbar } from "@/components/catalog/install-toolbar";
import { ComponentDocs } from "@/components/catalog/component-docs";
import { DemoPreview } from "@/components/catalog/demo-preview";
export function generateStaticParams() {
  return components.map((item) => ({ slug: item.name }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = getComponent((await params).slug);
  return { title: item?.title, description: item?.description };
}
export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = getComponent((await params).slug);
  if (!item) notFound();
  return (
    <article className="component-page">
      <div className="component-top">
        <span>{item.english}</span>
        <InstallToolbar item={item} />
      </div>
      <header className="component-heading">
        <h1>{item.title}</h1>
        <p>{item.description}</p>
      </header>
      <section
        className={`component-stage stage-${item.name}`}
        aria-label={`${item.title}预览`}
      >
        {item.previewMode === "page" ? (
          <iframe
            src={`/preview/${item.name}/`}
            title={`${item.title}滚动预览`}
            loading="lazy"
          />
        ) : (
          <DemoPreview name={item.name} />
        )}
      </section>
      {item.previewMode === "page" && (
        <p className="stage-note">在预览中滚动，或点击工具栏全屏体验。</p>
      )}
      <ComponentDocs item={item} />
    </article>
  );
}
