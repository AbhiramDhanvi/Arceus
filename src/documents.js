import { latinDigits } from './digits.js';

export const imageMime = ['image/jpeg', 'image/png', 'image/webp'];
export const imageLimit = 8 * 1024 * 1024;
export const ocrLanguages = { en: 'eng', hi: 'hin', te: 'tel', mr: 'mar' };

export function extractDocument(text) {
  const normalized = latinDigits(text.normalize('NFKC'));
  const name = normalized.match(/^\s*(?:full name|applicant(?:'s)? name|name|नाम|नाव|పేరు)\s*[:：-]\s*([\p{L}\p{M}][\p{L}\p{M} .'-]{1,98})$/imu)?.[1].trim() ?? '';
  const dateMatch = normalized.match(/(?:\bd\.?o\.?b\.?\b|date of birth|जन्म\s*(?:तिथि|तारीख)|जन्मदिनांक|పుట్టిన తేదీ)\s*[:：-]?\s*(\d{1,4})[/. -](\d{1,2})[/. -](\d{1,4})/iu);
  let birthDate = '';
  if (dateMatch) {
    const [, first, month, third] = dateMatch;
    const [year, day] = first.length === 4 ? [first, third] : [third, first];
    const proposed = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    const valid = new Date(proposed + 'T00:00:00Z');
    if (year.length === 4 && year >= '1900' && day.length <= 2 && !Number.isNaN(+valid) && valid.toISOString().slice(0, 10) === proposed) birthDate = proposed;
  }
  const postalCode = normalized.match(/(?:\b(?:pin(?:\s*code)?|postal code)\b|पिन(?:\s*कोड)?|పిన్(?:\s*కోడ్)?)\s*[:：-]?\s*([1-9]\d{5})\b/iu)?.[1] ?? '';
  return { name, birthDate, postalCode };
}

const foldedName = (name) => name.normalize('NFKC').toLowerCase().trim().replace(/\s+/g, ' ');
export function documentMismatches(review, member) {
  if (!member) return [];
  return [
    ...(review.name && member.name && foldedName(review.name) !== foldedName(member.name) ? ['name'] : []),
    ...(review.birthDate && member.birth_date && review.birthDate !== member.birth_date ? ['birthDate'] : []),
  ];
}
