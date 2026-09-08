export type Category =
  "display" | "text" | "backgrounds" | "inputs" | "feedback";
export type PropDefinition = {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
};
export type ComponentDefinition = {
  name: string;
  title: string;
  english: string;
  description: string;
  category: Category;
  interaction: string;
  usage: string;
  props: PropDefinition[];
  credits: string[];
  entry: string;
  featured?: boolean;
  previewMode?: "inline" | "page";
  order: number;
};
export type CatalogItem = ComponentDefinition & {
  files: string[];
  dependencies: string[];
};
export type DemoProps = { compact?: boolean };
