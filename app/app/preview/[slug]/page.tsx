import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { components, getComponent, componentHref } from "@/lib/components";
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
  return { title: `${getComponent((await params).slug)?.title ?? "组件"}预览` };
}
export default async function Preview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = getComponent((await params).slug);
  if (!item) notFound();
  return (
    <main
      className={`full-preview ${item.previewMode === "page" ? "is-page" : ""}`}
    >
      <Link className="preview-back" href={componentHref(item.name)}>
        <ArrowLeft size={15} />
        {item.title}
      </Link>
      <DemoPreview name={item.name} />
    </main>
  );
}
