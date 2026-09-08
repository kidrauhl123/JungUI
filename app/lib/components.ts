import catalog from "./catalog.generated.json";
import type { CatalogItem, Category } from "./catalog-types";
export const components = catalog as CatalogItem[];
export const categories: { id: Category; label: string }[] = [
  { id: "display", label: "展示与布局" },
  { id: "text", label: "文字动效" },
  { id: "backgrounds", label: "氛围背景" },
  { id: "inputs", label: "按钮与输入" },
  { id: "feedback", label: "交互反馈" },
];
export function getComponent(name: string) {
  return components.find((item) => item.name === name);
}
export function componentHref(name: string) {
  return `/components/${name}/`;
}
