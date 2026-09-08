"use client";
import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { graphicAssets } from "./scroll-card-assets";
export type ScrollCardArtProps = ComponentProps<"svg"> & {
  name: keyof typeof graphicAssets;
  label?: string;
};
export function ScrollCardArt({
  name,
  label,
  className,
  ...props
}: ScrollCardArtProps) {
  const id = useId().replace(/:/g, "");
  const asset = graphicAssets[name];
  const body = asset.body
    .replace(/\bid="([^"]+)"/g, (_, value) => `id="${id}-${value}"`)
    .replace(/url\(#([^)]+)\)/g, (_, value) => `url(#${id}-${value})`)
    .replace(/href="#([^"]+)"/g, (_, value) => `href="#${id}-${value}"`);
  return (
    <svg
      {...props}
      data-slot="scroll-card-art"
      className={cn(className)}
      viewBox={asset.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
