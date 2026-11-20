export function latinDigits(text) {
  return text.replace(/[०-९౦-౯]/gu, (digit) => {
    const point = digit.codePointAt(0);
    return String(point - (point >= 0x0c66 ? 0x0c66 : 0x0966));
  });
}
