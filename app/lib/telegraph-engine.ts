export type TelegraphPlan = {
  char: string;
  from?: string;
  start: number;
  end: number;
  salt: number;
  static: boolean;
}[];
export const TELEGRAPH_GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/[]{}#+-=*";

function seededInt(seed: number, index: number, max: number) {
  const x = Math.sin((seed + 1) * 97.13 + (index + 1) * 43.71) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}

export function makeTelegraphPlan(text: string, { seed = 0 } = {}) {
  let cursor = 0;

  return [...String(text)].map((char, index) => {
    if (/\s/.test(char)) {
      return { char, start: 0, end: 0, salt: index + seed, static: true };
    }

    const start = cursor + seededInt(seed, index, 3);
    const hold = 8 + seededInt(seed + 17, index, 10);
    cursor = start + 2;

    return {
      char,
      start,
      end: start + hold,
      salt: seed * 31 + index * 17,
      static: false,
    };
  });
}

export function makeTelegraphTransitionPlan(
  from: string,
  to: string,
  { seed = 0 } = {},
) {
  const fromChars = [...String(from)];
  const toChars = [...String(to)];
  const length = Math.max(fromChars.length, toChars.length);
  let cursor = 0;

  return Array.from({ length }, (_, index) => {
    const fromChar = fromChars[index] ?? " ";
    const toChar = toChars[index] ?? "";
    if (fromChar === toChar) {
      return {
        char: toChar,
        from: fromChar,
        start: 0,
        end: 0,
        salt: index + seed,
        static: true,
      };
    }
    if (/\s/.test(fromChar) && /\s/.test(toChar || " ")) {
      return {
        char: toChar,
        from: fromChar,
        start: 0,
        end: 0,
        salt: index + seed,
        static: true,
      };
    }

    const start = cursor + seededInt(seed + 23, index, 3);
    const hold = 6 + seededInt(seed + 41, index, 8);
    cursor = start + 1;

    return {
      char: toChar,
      from: fromChar,
      start,
      end: start + hold,
      salt: seed * 31 + index * 17,
      static: false,
    };
  });
}

export function telegraphDuration(plan: TelegraphPlan) {
  return Math.max(0, ...plan.map((item) => item.end)) + 1;
}

export function renderTelegraphFrame(
  text: string,
  frame: number,
  plan = makeTelegraphPlan(text),
  glyphs = TELEGRAPH_GLYPHS,
) {
  return [...String(text)]
    .map((char, index) => {
      const item = plan[index];
      if (!item || item.static || /\s/.test(char)) return char;
      if (frame < item.start) return " ";
      if (frame >= item.end) return char;

      const glyphIndex = Math.abs(
        (frame * 13 + item.salt * 7 + index * 19) % glyphs.length,
      );
      return glyphs[glyphIndex];
    })
    .join("");
}

export function renderTelegraphTransitionFrame(
  from: string,
  to: string,
  frame: number,
  plan = makeTelegraphTransitionPlan(from, to),
  glyphs = TELEGRAPH_GLYPHS,
) {
  const duration = telegraphDuration(plan);
  if (frame >= duration) return String(to);

  return plan
    .map((item, index) => {
      if (item.static) return item.char;
      if (frame < item.start) return item.from;
      if (frame >= item.end) return item.char;

      const glyphIndex = Math.abs(
        (frame * 13 + item.salt * 7 + index * 19) % glyphs.length,
      );
      return glyphs[glyphIndex];
    })
    .join("")
    .trimEnd();
}
