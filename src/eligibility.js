import { categories, fields, schemes } from './catalog.js';
import { local } from './languages.js';
import { latinDigits } from './digits.js';

export function normalize(text) {
  return latinDigits(String(text).normalize('NFKC').toLowerCase())
    .replace(/(?<=\d),(?=\d)/g, '').replace(/[’‘]/g, "'").trim();
}

const intent = {
  agriculture: /farm|agricultur|crop|कृषि|किसान|खेती|రైతు|వ్యవసాయ|शेत|पीक/iu,
  education: /scholarship|student|school|education|छात्र|स्कूल|पढ़|शिक्षा|చదువు|విద్య|ఉపకార|विद्यार्थी|शिष्यवृत्ती|शाळा|शिक्षण/iu,
  health: /health|hospital|medical|senior|स्वास्थ्य|इलाज|अस्पताल|ఆరోగ్య|ఆసుపత్రి|आरोग्य|रुग्णालय|ज्येष्ठ/iu,
  business: /business|loan|startup|enterprise|व्यवसाय|ऋण|लोन|दुकान|వ్యాపార|రుణ|कर्ज|उद्योग/iu,
  marriage: /marriage|wedding|bride|शादी|विवाह|దుల్హన్|పెళ్లి|వివాహ|लग्न|वधू/iu,
  insurance: /insurance|cover|बीमा|బీమా|विमा/iu,
  savings: /\bsavings?\b(?!\s+(?:bank\s+)?account)|daughter|girl child|बचत(?!\s+खाता)|बेटी|बालिका|పొదుపు(?!\s+ఖాతా)|బాలిక|కుమార్తె|मुलगी/iu,
};
const nativeAlias = {
  'pm-kisan': /పీఎం\s*కిసాన్|पीएम[\s-]*किसान/iu,
  'vay-vandana': /ఆయుష్మాన్|आयुष्मान|वय वंदना/iu,
  pmsby: /సురక్ష.*బీమా|सुरक्षा विमा/iu,
  pmjjby: /జీవన్.*జ్యోతి|जीवन ज्योती/iu,
  mudra: /ముద్ర|मुद्रा/iu,
  nmmss: /ఆదాయ[\s-]*ప్రతిభ|दुर्बल घटक शिष्यवृत्ती/iu,
  'telangana-marriage': /కల్యాణ లక్ష్మి|షాదీ ముబారక్|कल्याण लक्ष्मी|शादी मुबारक/iu,
  sukanya: /సుకన్య|सुकन्या/iu,
};
export function detectScope(text) {
  const exact = schemes.filter((scheme) => scheme.aliases.test(text) || nativeAlias[scheme.id].test(text));
  if (exact.length) return exact.map(({ id }) => id);
  const matched = Object.keys(intent).filter((key) => intent[key].test(text));
  return schemes.filter(({ category }) => matched.includes(category)).map(({ id }) => id);
}

const unsure = /not sure|don'?t know|maybe|i think|roughly|around\s+\d|about\s+\d|approximately|पता नहीं|शायद|लगभग|తెలియదు|అనుకుంటా|సుమారు|माहीत नाही|खात्री नाही|कदाचित|साधारण/iu;
const skip = /^(?:skip|pass|छोड़ें|आगे बढ़ें|దాటవేయండి|వదిలేయండి|वगळा)[.!\s]*$/iu;
const yesWords = /(?:^|[\s,!.?])(?:yes|yep|yeah|true|हाँ|हां|जी हाँ|अवును|ఔను|हो|होय)(?=$|[\s,!.?।])/iu;
const noWords = /(?:^|[\s,!.?])(?:no|nope|false|नहीं|नही|లేదు|కాదు|नाही|नको)(?=$|[\s,!.?।])/iu;
const correction = /(?:\b(?:actually|correction|i meant|rather|sorry|instead)\b|असल में|सही उम्र|दरअसल|నిజానికి|సవరణ|खरं तर|दुरुस्ती)/iu;
const howTo = /how (?:can|do|to) (?:i )?(?:apply|register)|application (?:steps|process)|कैसे (?:करें|भरें|आवेदन)|आवेदन कैसे|ఎలా (?:దరఖాస్తు|నమోదు)|अर्ज कसा|नोंदणी कशी/iu;
const docsIntent = /(?:what|which|required|need).*(?:documents|paperwork)|दस्तावेज़|कागज़|పత్రాలు|కागदपत्रे/iu;
const switchIntent = /check|show|find|instead|switch|tell me about|जाँच|बताओ|दिखाओ|చూడండి|చెప్పండి|तपासा|दाखवा/iu;

const spokenNumbers = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
  fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, पाँच: 5, छह: 6, सात: 7, आठ: 8, नौ: 9, दस: 10, अठारह: 18, बीस: 20, पचास: 50, साठ: 60, सत्तर: 70,
  ఒకటి: 1, రెండు: 2, మూడు: 3, నాలుగు: 4, ఐదు: 5, ఆరు: 6, ఏడు: 7, ఎనిమిది: 8, తొమ్మిది: 9, పది: 10, పద్దెనిమిది: 18, పందొమ్మిది: 19, ఇరవై: 20, యాభై: 50, అరవై: 60, డెబ్బై: 70,
  दोन: 2, पाच: 5, सहा: 6, नऊ: 9, दहा: 10, अठरा: 18, वीस: 20, पन्नास: 50, सत्तर: 70,
};
const unit = /^(?:lakhs?|lacs?|लाख|लाखों|లక్ష(?:లు|ల)?|thousands?|हज़ार|हजार|వేలు|हजारांचा|crores?|करोड़|कोटी|కోట్లు)$/iu;
function multiplier(word) {
  if (/^(?:crore|करोड़|कोटी|కోట్)/iu.test(word)) return 10000000;
  return /^(?:thousand|हज़ार|हजार|వేలు)/iu.test(word) ? 1000 : 100000;
}

function numbers(text, money = false) {
  const tokens = text.match(/\d+(?:\.\d+)?|[\p{L}\p{M}]+/gu) ?? [];
  const found = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let value = /^\d/.test(token) ? Number(token) : Object.hasOwn(spokenNumbers, token) ? spokenNumbers[token] : undefined;
    if (value === undefined) continue;
    const next = spokenNumbers[tokens[i + 1]];
    if (value >= 20 && value <= 90 && value % 10 === 0 && /^[a-z]+$/.test(token) && next > 0 && next < 10) {
      value += next;
      i++;
    }
    if (money && unit.test(tokens[i + 1] ?? '')) value *= multiplier(tokens[++i]);
    found.push(value);
  }
  return [...new Set(found)];
}

const choicePatterns = {
  state: {
    telangana: /telangana|तेलंगाना|तेलंगणा|తెలంగాణ/iu,
    other: /other|another|andhra|delhi|maharashtra|karnataka|kerala|punjab|gujarat|bihar|odisha|tamil nadu|uttar pradesh|rajasthan|west bengal|अन्‍य|अन्य|आंध्र|दिल्ली|महाराष्ट्र|ఇతర|ఆంధ్ర|ఢిల్లీ|మహారాష్ట్ర|इतर/iu,
  },
  group: {
    scst: /\b(?:sc|st)\b|scheduled (?:caste|tribe)|एससी|एसटी|ఎస్సీ|ఎస్టీ|अनुसूचित/iu,
    bcebc: /\b(?:bc|ebc|obc)\b|बीसी|ईबीसी|ओबीसी|బీసీ|ఈబీసీ/iu,
    minority: /minority|muslim|अल्पसंख्यक|अल्पसंख्याक|मुस्लिम|మైనారిటీ|ముస్లిం/iu,
    other: /other|general|अन्य|सामान्य|ఇతర|ఇतर/iu,
  },
};

export function parseAnswer(key, raw, { explicitCorrection = false } = {}) {
  const text = normalize(raw);
  if (unsure.test(text)) return { unclear: true };
  const field = fields[key];
  if (field.type === 'boolean') {
    const affirmativeStatement = /^(?:i|we|they) (?:do|am|are|have)(?: (?:one|it))?[.!\s]*$/iu.test(text);
    const negativeStatement = /\b(?:i|we|they|he|she) (?:don'?t|doesn'?t|do not|does not|am not|are not|is not)\b/iu.test(text);
    const positive = yesWords.test(text) || affirmativeStatement;
    const negative = noWords.test(text) || negativeStatement;
    if (positive && negative) {
      if (explicitCorrection) {
        const tail = text.split(correction).at(-1);
        if (tail !== text) return parseAnswer(key, tail);
      }
      return { conflict: true };
    }
    if (positive || negative) return { value: positive };
    if (key === 'rural' && /^(?:urban|city|शहरी|పట్టణం|शहरी भाग)[.!\s]*$/iu.test(text)) return { value: false };
    if (key === 'rural' && /^(?:rural|village|ग्रामीण|गाँव|గ్రామం|खेडे)[.!\s]*$/iu.test(text)) return { value: true };
    if (/^(?:i (?:do|am|have)|we (?:do|have)|it is|we own it)[.!\s]*$/iu.test(text)) return { value: true };
    if (/^(?:(?:i|we) (?:don'?t|do not|am not)|not applicable|it isn't)(?: have (?:one|it))?[.!\s]*$/iu.test(text)) return { value: false };
    return { unclear: true };
  }
  if (field.type === 'choice') {
    const matches = Object.entries(choicePatterns[key]).filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
    return matches.length === 1 ? { value: matches[0] } : matches.length > 1 ? { conflict: true } : { unclear: true };
  }
  const values = numbers(text, field.type === 'money');
  if (/^\s*[-−]\s*\d/.test(text)) return { unclear: true };
  if (values.length > 1 && explicitCorrection) {
    const tail = text.split(correction).at(-1);
    if (tail !== text) return parseAnswer(key, tail);
  }
  if (values.length > 1) return { conflict: true };
  const monthly = key === 'income' && /per month|a month|monthly|मासिक|प्रति माह|महीने|నెలకు|दरमहा/iu.test(text);
  if (key === 'income' && /per day|daily|weekly|per week|दैनिक|साप्ताहिक|రోజుకు|दररोज/iu.test(text)) return { unclear: true };
  const value = monthly ? values[0] * 12 : values[0];
  const valid = field.type === 'age' ? Number.isInteger(value) && value >= 0 && value <= 120
    : field.type === 'percent' ? value >= 0 && value <= 100 : Number.isSafeInteger(value) && value >= 0 && value <= 1000000000;
  return valid ? { value } : { unclear: true };
}

function compare(rule, facts) {
  const value = facts[rule.key];
  if (value === undefined) return undefined;
  switch (rule.op) {
    case 'eq': return value === rule.value;
    case 'lt': return value < rule.value;
    case 'gt': return value > rule.value;
    case 'lte': return value <= rule.value;
    case 'gte': return value >= rule.value;
    case 'between': return value >= rule.value[0] && value <= rule.value[1];
    case 'oneOf': return rule.value.includes(value);
    default: throw new Error('Unknown eligibility operator');
  }
}

export function evaluate(scheme, facts) {
  const evidence = scheme.rules.flatMap((rule) => {
    const condition = rule.when ? [rule.when].flat().map((item) => ({ ...item, result: compare(item, facts) })) : [];
    if (condition.some(({ result }) => result === false)) return [];
    const missing = condition.filter(({ result }) => result === undefined).map(({ key }) => key);
    const result = missing.length ? undefined : compare(rule, facts);
    return [{ rule, state: result === undefined ? 'unknown' : result ? 'pass' : 'fail', needed: missing.length ? missing : [rule.key] }];
  });
  const state = evidence.some(({ state }) => state === 'fail') ? 'ineligible'
    : evidence.some(({ state }) => state === 'unknown') ? 'pending' : 'eligible';
  return { scheme, state, evidence };
}

// Capture only facts with explicit context from free-form sentences. The active question
// may accept a short answer, but unrelated numbers are never attached to it.
function extract(raw, scope) {
  const text = normalize(raw);
  const candidates = {};
  const add = (key, value) => { (candidates[key] ??= new Set()).add(value); };
  const clauses = text.split(/[;!\n।]|(?<=\D)\.(?!\d)|,\s+|\bbut\b|\band\s+(?:(?:my|his|her)\s+)?(?=aadhaar|aadhar)/iu);
  for (const part of clauses) {
    if (unsure.test(part)) continue;
    const hasAadhaarAge = /aadhaar|aadhar|आधार|ఆధార్/iu.test(part);
    const ageExpression = /(?:\b(?:age(?:\s+is)?|aged|i am|i'm|is|am)(?:\s+a)?\s+(\d{1,3})(?!\d)|(?<!\d)(\d{1,3})(?:\s*-\s*|\s*)(?:years?(?:\s+old)?|yrs?\b|साल|वर्ष|ఏళ్లు|సంవత్సరాలు|वर्षे))/giu;
    for (const match of part.matchAll(ageExpression)) {
      const value = Number(match[1] ?? match[2]);
      if (value <= 120) add(hasAadhaarAge ? 'aadhaarAge' : 'age', value);
    }
    const aadhaarRecord = part.match(/(?:aadhaar|aadhar)\s+(?:says|shows|reads|has)\s+(\d{1,3})(?!\d)/iu);
    if (aadhaarRecord && Number(aadhaarRecord[1]) <= 120) add('aadhaarAge', Number(aadhaarRecord[1]));
    const explicit = [
      ['income', /(?:parental income|parents.{0,15}income|income(?:\s+is|\s+of|:)|वार्षिक आय|ఆదాయం|उत्पन्न)\s*(?:is|है|:)?\s*([₹\d\p{L}][\s\p{L}\p{M}\d.₹-]*)/iu],
      ['loan', /(?:loan(?:\s+of|\s+amount|\s+for)|borrow|ऋण|लोन|రుణం|कर्ज)\s*(?:is|of|:|₹)?\s*((?:\d[\d.]*|one|two|three|four|five|ten|दस|पाँच|पది)\s*(?:lakhs?|lacs?|thousands?|crores?|लाख|हजार|లక్షలు|వేలు)?)/iu],
      ['marks', /(\d+(?:\.\d+)?)\s*(?:%|percent|प्रतिशत|శాతం|टक्के)/iu],
    ];
    for (const [key, pattern] of explicit) {
      const match = part.match(pattern);
      if (match) {
        const parsed = parseAnswer(key, match[1]);
        if (parsed.value !== undefined) add(key, parsed.value);
      }
    }
    if (scope.includes('telangana-marriage')) {
      const home = part.match(/(?:live in|resident of|from|निवासी|रहता|रहती|నివాసం|राहतो|राहते)\s+(.+)|^(.+?)\s+(?:resident|निवासी)/iu);
      if (home) {
        const place = parseAnswer('state', home[1] ?? home[2]);
        if (place.value !== undefined) add('state', place.value);
      }
    }
    const negative = /\b(?:no|not|without|don't|doesn't|never)\b|नहीं|లేదు|కాదు|नाही/iu.test(part);
    if (/(?:\b(?:own|have|owns|has|registered|recorded|without)\b|मेरे नाम|నమోదు|नावावर).{0,34}(?:cultivable land|farm(?:land| land)|खेती की जमीन|సాగుభూమి|शेतजमीन)|\bno (?:cultivable |farm )?land\b/iu.test(part) && !/rent|lease|tenant/iu.test(part)) add('land', !negative);
    if (/\b(?:have|has|with|no|without|don't have)\b.{0,25}(?:savings (?:bank )?account|post office account)|बचत खाता|పొదుపు ఖాతా|बचत खाते/iu.test(part)) add('bank', !negative);
    if (/indian citizen|भारतीय नागरिक|భారత పౌర/iu.test(part)) add('indian', !negative);
    if (/live in india|resident of india|भारत में रहता|భారతదేశంలో నివసి|भारतात राह/iu.test(part)) add('inIndia', !negative);
    if (/class 8|class eight|8th (?:class|grade)|आठवीं|ఎనిమిదో తరగతి|आठवी/iu.test(part) && !/test|परीक्षा/iu.test(part)) add('eight', !negative);
  }
  return candidates;
}

export const initialConversation = () => ({ scope: [], facts: {}, skipped: [], conflicts: {}, pending: null, questions: 0 });

function nextQuestion(results, thread) {
  const counts = new Map();
  for (const result of results) {
    if (result.state !== 'pending') continue;
    const first = result.evidence.find(({ state, needed }) => state === 'unknown' && needed.some((key) => !thread.skipped.includes(key)));
    for (const key of first?.needed ?? []) {
      if (!thread.skipped.includes(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const required = results.filter(({ state }) => state === 'pending').flatMap(({ evidence }) => evidence.filter(({ state }) => state === 'unknown').flatMap(({ needed }) => needed));
  const contradiction = Object.keys(thread.conflicts).find((key) => required.includes(key));
  return contradiction ?? [...counts].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

export function advance(thread, { text = '', selectedScope, selectValue, reset = false } = {}) {
  if (reset) return { thread: initialConversation(), reply: { kind: 'welcome' } };
  const raw = normalize(text);
  const detected = detectScope(raw);
  const explicitCorrection = correction.test(raw);
  const isGuide = howTo.test(raw) || docsIntent.test(raw);
  const explicitSwitch = Boolean(selectedScope || (detected.length && switchIntent.test(raw) && !explicitCorrection));
  const scope = selectedScope ?? (explicitSwitch || !thread.scope.length ? detected.length ? detected : thread.scope : thread.scope);
  const next = { ...thread, scope, facts: { ...thread.facts }, skipped: [...thread.skipped], conflicts: { ...thread.conflicts } };
  if (isGuide) {
    const guideScope = detected.length ? detected : next.scope;
    if (guideScope.length) return { thread, reply: { kind: 'guide', schemeIds: guideScope } };
  }

  const correctionText = explicitCorrection ? raw.split(correction).at(-1).trim() : raw;
  const extracted = extract(correctionText, next.scope);
  const wasPending = explicitSwitch ? null : thread.pending;
  if (wasPending) {
    const booleanAnswer = fields[wasPending].type === 'boolean' && selectValue === undefined
      ? parseAnswer(wasPending, raw, { explicitCorrection }) : null;
    if (skip.test(raw)) {
      next.skipped.push(wasPending);
      delete next.conflicts[wasPending];
    } else if (selectValue !== undefined) {
      extracted[wasPending] = new Set([selectValue]);
    } else if (booleanAnswer?.conflict || (extracted[wasPending] && booleanAnswer?.value !== undefined
      && !extracted[wasPending].has(booleanAnswer.value))) {
      delete extracted[wasPending];
      delete next.facts[wasPending];
      next.conflicts[wasPending] = [true, false];
    } else if (wasPending === 'aadhaarAge' && extracted.age && !extracted.aadhaarAge && !/but|compared|different|document|not on|अलग|వేరు|वेगळे/iu.test(raw)) {
      extracted.aadhaarAge = extracted.age;
      delete extracted.age;
    } else if (extracted[wasPending] && ['age', 'aadhaarAge'].includes(wasPending) && /\d\s*(?:or|या|లేదా|किंवा)\s*\d/iu.test(correctionText)) {
      delete extracted[wasPending];
      delete next.facts[wasPending];
      next.conflicts[wasPending] = numbers(correctionText);
    } else if (!extracted[wasPending]) {
      const answered = Object.keys(extracted).length ? {} : parseAnswer(wasPending, raw, { explicitCorrection });
      if (answered.value !== undefined) extracted[wasPending] = new Set([answered.value]);
      if (answered.conflict) next.conflicts[wasPending] = [];
    }
  }
  for (const [key, values] of Object.entries(extracted)) {
    const [value] = values;
    const prior = next.facts[key];
    if (values.size > 1 || (prior !== undefined && prior !== value && !explicitCorrection && !next.conflicts[key])) {
      delete next.facts[key];
      next.conflicts[key] = [...new Set([prior, ...values].filter((entry) => entry !== undefined))];
    } else {
      next.facts[key] = value;
      delete next.conflicts[key];
      next.skipped = next.skipped.filter((field) => field !== key);
    }
  }
  if (!next.scope.length) return { thread: next, reply: { kind: 'discover' } };
  const results = schemes.filter(({ id }) => next.scope.includes(id)).map((scheme) => evaluate(scheme, next.facts));
  next.pending = nextQuestion(results, next);
  if (next.pending) {
    next.questions++;
    return {
      thread: next,
      reply: {
        kind: 'question',
        key: next.pending,
        schemeIds: results.filter(({ state }) => state === 'pending').map(({ scheme }) => scheme.id),
        issue: next.conflicts[next.pending] ? 'conflict' : next.pending === wasPending && !extracted[wasPending] ? 'unclear' : undefined,
        values: next.conflicts[next.pending],
      },
    };
  }
  return { thread: next, reply: { kind: 'result', results, questions: next.questions } };
}

export const scopeName = (ids, lang) => {
  const relevant = schemes.filter(({ id }) => ids.includes(id));
  if (relevant.length === 1) return local(relevant[0].name, lang);
  const grouping = new Set(relevant.map(({ category }) => category));
  return grouping.size === 1 ? local(categories[[...grouping][0]], lang) : '';
};
