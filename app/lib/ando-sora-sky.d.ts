export type SkySettings = {
  warmth?: number;
  clouds?: number;
  softness?: number;
  drift?: number;
  grain?: number;
  wind?: [number, number];
};
export const ANDO_SORA_DEFAULTS: Required<Omit<SkySettings, "wind">>;
export type SkyRenderer = {
  update(settings?: SkySettings): void;
  renderOnce(): void;
  dispose(): void;
};
export function createAndoSoraSkyRenderer(
  canvas: HTMLCanvasElement,
  settings?: SkySettings,
  onReady?: () => void,
): SkyRenderer | null;
