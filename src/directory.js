import { schemes } from './catalog.js';

const classification = {
  agriculture: /agricultur|\bfarmer|fisher|crop|horticulture|livestock|irrigation/i,
  education: /scholarship|education|student|fellowship|school|college/i,
  health: /health|hospital|medical|treatment|nutrition|maternity/i,
  business: /loan|enterprise|entrepreneur|business|startup|artisan|employment|livelihood|skill/i,
  marriage: /marriage|wedding|bride/i,
  insurance: /insurance|bima|\bpension\b/i,
  savings: /saving|deposit|\bpension\b|provident/i,
  utilities: /water|electricity|energy|\blpg\b|solar|sanitation|cooking/i,
};
const supportedIds = new Set(schemes.map(({ id }) => id));
const sourceDuplicates = new Set(['pm-kisan', 'pmsby', 'pmjjby', 'pmmy', 'nmmss', 'klp', 'ssy', 'pmuy2', 'apy', 'pm-vishwakarma']);
const tidy = (value) => value.normalize('NFKC').toLowerCase().trim();
let directoryRequest;

export function loadDirectory() {
  directoryRequest ??= fetch('/data/myscheme-index.json').then(async (response) => {
    if (!response.ok) throw new Error('Directory unavailable');
    return (await response.json()).map(([slug, title, level, region, tags]) => {
      const categories = Object.entries(classification).filter(([, pattern]) => pattern.test(title + ' ' + tags)).map(([key]) => key);
      return { slug, title, level, region, tags, categories, source: 'https://www.myscheme.gov.in/schemes/' + slug };
    });
  }).catch((error) => {
    directoryRequest = undefined;
    throw error;
  });
  return directoryRequest;
}

export function directoryOnly(item) {
  return !supportedIds.has(item.slug) && !sourceDuplicates.has(item.slug)
    && !schemes.some((scheme) => tidy(scheme.name.en) === tidy(item.title) || scheme.source === item.source);
}

const fillers = new Set('i am need want looking for find look check about explain eligibility scheme schemes tell me please how do can get the my is an a in of and help show any government what which'.split(' '));
export function catalogueTerms(query) {
  return tidy(query).split(/[^\p{L}\p{M}\p{N}-]+/u).filter((token) => token.length > 1 && !fillers.has(token));
}

export function findDirectory(directory, { query = '', category = '', region = '' } = {}) {
  const terms = catalogueTerms(query);
  return directory.flatMap((item) => {
    if (category && !item.categories.includes(category)) return [];
    if (region && (region === 'central' ? item.level !== 'C' : item.level !== 'S' || item.region !== region)) return [];
    const title = tidy(item.title + ' ' + item.slug);
    const keywords = tidy(item.tags + ' ' + item.region);
    if (!terms.every((word) => title.includes(word) || keywords.includes(word))) return [];
    return [{ item, weight: terms.reduce((total, word) => total + (title.includes(word) ? 3 : 1), 0) }];
  }).sort((a, b) => b.weight - a.weight || a.item.title.localeCompare(b.item.title)).map(({ item }) => item);
}
