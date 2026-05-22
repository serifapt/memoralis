const NAME_BLOCK_WIDTH = 280;
const NAME_TOP = 90;
const MIN_AGE_TOP = 160;
const AGE_GAP = 18;

const FONT_CANDIDATES = [
  { fontSize: 40, lineHeight: 40, maxLines: 2 },
  { fontSize: 35, lineHeight: 36, maxLines: 3 },
  { fontSize: 31, lineHeight: 34, maxLines: 3 },
  { fontSize: 28, lineHeight: 31, maxLines: 4 },
  { fontSize: 26, lineHeight: 29, maxLines: 4 },
];

function charWidthFactor(char: string) {
  if (/[ilIÍÌÎÏíìîï\.,']/u.test(char)) return 0.28;
  if (/[jtfrJ]/u.test(char)) return 0.38;
  if (/[mwMW]/u.test(char)) return 0.82;
  if (/[A-ZÁÀÂÃÉÈÊÍÓÔÕÚÇ]/u.test(char)) return 0.62;
  return 0.52;
}

function estimateWordWidth(word: string, fontSize: number) {
  return Array.from(word).reduce((sum, char) => sum + charWidthFactor(char) * fontSize, 0);
}

function estimateLineCount(name: string, fontSize: number) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;

  const spaceWidth = fontSize * 0.28;
  let lines = 1;
  let currentLineWidth = 0;

  for (const word of words) {
    const wordWidth = estimateWordWidth(word, fontSize);
    const nextWidth = currentLineWidth === 0 ? wordWidth : currentLineWidth + spaceWidth + wordWidth;

    if (nextWidth <= NAME_BLOCK_WIDTH || currentLineWidth === 0) {
      currentLineWidth = nextWidth;
    } else {
      lines += 1;
      currentLineWidth = wordWidth;
    }
  }

  return lines;
}

export function getNameLayout(fullName: string) {
  const normalizedName = fullName.trim();
  const selected =
    FONT_CANDIDATES.find((candidate) => estimateLineCount(normalizedName, candidate.fontSize) <= candidate.maxLines) ??
    FONT_CANDIDATES[FONT_CANDIDATES.length - 1];
  const lineCount = estimateLineCount(normalizedName, selected.fontSize);
  const ageTop = Math.max(MIN_AGE_TOP, NAME_TOP + lineCount * selected.lineHeight + AGE_GAP);

  return {
    nameFontSize: `${selected.fontSize}px`,
    nameLineHeight: `${selected.lineHeight}px`,
    ageBlockTop: `${ageTop}px`,
  };
}
