import assert from 'node:assert/strict';
import test from 'node:test';
import { advance, evaluate, initialConversation, parseAnswer } from '../src/eligibility.js';
import { schemes } from '../src/catalog.js';
import { spokenReply } from '../src/assistant-copy.js';
import { documentMismatches, extractDocument } from '../src/documents.js';

const start = (text) => advance(initialConversation(), { text });
const turn = (previous, text) => advance(previous.thread, { text });
const get = (id) => schemes.find((scheme) => scheme.id === id);

test('insurance reuses facts and resolves two schemes without asking a question', () => {
  const { reply } = start('I need insurance. I am 52 and I have a savings account.');
  assert.equal(reply.kind, 'result');
  assert.equal(reply.questions, 0);
  assert.deepEqual(reply.results.map(({ scheme, state }) => [scheme.id, state]), [['pmsby', 'eligible'], ['pmjjby', 'ineligible']]);
});

test('vague age and conflicting answers trigger clarification before eligibility', () => {
  let step = start('Check PMSBY');
  assert.equal(step.reply.key, 'age');
  step = turn(step, 'Maybe 17');
  assert.equal(step.reply.issue, 'unclear');
  step = turn(step, 'I am 17 or 19');
  assert.equal(step.reply.issue, 'conflict');
  assert.equal(step.thread.facts.age, undefined);
  step = turn(step, '19');
  assert.equal(step.reply.key, 'bank');
  step = turn(step, 'yes, no');
  assert.equal(step.reply.issue, 'conflict');
  step = turn(step, 'Yes, I do not have a savings account');
  assert.equal(step.reply.issue, 'conflict');
  step = turn(step, 'yes');
  assert.equal(step.reply.results[0].state, 'eligible');
});

test('contradictions across turns do not reuse an old value', () => {
  let step = start('PMSBY; I am 25');
  assert.equal(step.reply.key, 'bank');
  step = turn(step, 'I am 71');
  assert.equal(step.reply.issue, 'conflict');
  assert.equal(step.reply.key, 'age');
  assert.deepEqual(step.reply.values, [25, 71]);
  step = turn(step, '71');
  assert.equal(step.reply.kind, 'result');
  assert.equal(step.reply.results[0].state, 'ineligible');
});

test('explicit corrections apply and preserve distinct age sources', () => {
  let step = start('PMSBY. I am 17. Actually I am 23.');
  assert.equal(step.thread.facts.age, 23);
  assert.equal(step.reply.key, 'bank');
  step = start('Ayushman for my mother. She is 68.');
  assert.equal(step.reply.key, 'aadhaarAge');
  step = turn(step, 'I am 72');
  assert.equal(step.thread.facts.age, 68);
  assert.equal(step.thread.facts.aadhaarAge, 72);
  step = turn(step, 'skip');
  assert.equal(step.reply.results[0].state, 'pending');
});

test('language switches preserve the facts and support native scripts', () => {
  let step = start('ఆయుష్మాన్ చూడండి');
  assert.equal(step.reply.key, 'aadhaarAge');
  assert.match(spokenReply(step.reply, 'te'), /ఆధార్/);
  step = turn(step, '७२');
  assert.equal(step.reply.key, 'inIndia');
  assert.match(spokenReply(step.reply, 'mr'), /भारतात/);
  step = turn(step, 'हाँ');
  assert.equal(step.reply.results[0].state, 'eligible');
  assert.match(spokenReply(step.reply, 'te'), /అర్హత/);
});

test('a recorded Telugu age and confirmation complete the insurance interview', () => {
  const aged = turn(start('PMSBY'), 'నా వయస్సు 19 సంవత్సరాలు.');
  assert.equal(aged.reply.key, 'bank');
  const result = turn(aged, 'అవును.');
  assert.equal(result.reply.results[0].state, 'eligible');
});

test('thresholds and conditional rules are evaluated independently', () => {
  const marriage = { state: 'telangana', bride: true, age: 18, group: 'bcebc', income: 150001 };
  assert.equal(evaluate(get('telangana-marriage'), { ...marriage, rural: true }).state, 'ineligible');
  assert.equal(evaluate(get('telangana-marriage'), { ...marriage, rural: false }).state, 'eligible');
  assert.equal(evaluate(get('telangana-marriage'), { ...marriage, income: 150000 }).state, 'eligible');
  assert.equal(evaluate(get('telangana-marriage'), { ...marriage, group: 'scst' }).state, 'eligible');
  assert.equal(evaluate(get('mudra'), { micro: true, loan: 1000000 }).state, 'eligible');
  assert.equal(evaluate(get('mudra'), { micro: true, loan: 1000001 }).state, 'pending');
  assert.equal(evaluate(get('mudra'), { micro: true, loan: 2000000, repaidTarun: true }).state, 'eligible');
  assert.equal(evaluate(get('mudra'), { micro: true, loan: 2000001, repaidTarun: true }).state, 'ineligible');
  const school = { eight: true, school: true, income: 350000, marks: 53 };
  assert.equal(evaluate(get('nmmss'), { ...school, scst: true }).state, 'eligible');
  assert.equal(evaluate(get('nmmss'), { ...school, scst: false }).state, 'ineligible');
  assert.equal(evaluate(get('nmmss'), { ...school, marks: 55 }).state, 'eligible');
  assert.equal(evaluate(get('sukanya'), { girl: true, age: 10, inIndia: true, newSukanya: true }).state, 'ineligible');
});

test('new pension and LPG interviews respect age and household restrictions', () => {
  const apy = { age: 39, indian: true, bank: true, taxpayer: false, newApy: true };
  assert.equal(evaluate(get('apy'), apy).state, 'eligible');
  assert.equal(evaluate(get('apy'), { ...apy, age: 40 }).state, 'ineligible');
  assert.equal(evaluate(get('apy'), { ...apy, taxpayer: true }).state, 'ineligible');
  const ujjwala = { age: 18, woman: true, lpg: false, deprivation: true };
  assert.equal(evaluate(get('pmuy2'), ujjwala).state, 'eligible');
  assert.equal(evaluate(get('pmuy2'), { ...ujjwala, lpg: true }).state, 'ineligible');
  assert.match(spokenReply(start('పీఎం విశ్వకర్మ').reply, 'te'), /సంప్రదాయ/);
});

test('application guidance leaves the interview question intact', () => {
  const state = start('PM-KISAN');
  const guide = turn(state, 'How do I apply?');
  assert.equal(guide.reply.kind, 'guide');
  assert.equal(guide.thread.pending, state.thread.pending);
  assert.match(spokenReply(guide.reply, 'hi'), /ई-केवाईसी/);
  assert.equal(turn(guide, 'No').reply.results[0].state, 'ineligible');
});

test('multilingual amounts and contradictory number ranges', () => {
  assert.deepEqual(parseAnswer('income', '३.५ लाख'), { value: 350000 });
  assert.deepEqual(parseAnswer('loan', '౧౨ లక్షలు'), { value: 1200000 });
  assert.deepEqual(parseAnswer('age', 'seventy-two'), { value: 72 });
  assert.deepEqual(parseAnswer('age', '17–19'), { conflict: true });
  assert.deepEqual(parseAnswer('income', '-2 lakh'), { unclear: true });
  assert.deepEqual(parseAnswer('income', '₹30,000 a month'), { value: 360000 });
  assert.deepEqual(parseAnswer('bank', 'Yes, I do not have one'), { conflict: true });
});

test('unconfirmed everyday age cannot override the Aadhaar age for healthcare', () => {
  const { reply, thread } = start('Check Ayushman. My father is 72 and Aadhaar says 69.');
  assert.equal(thread.facts.age, 72);
  assert.equal(thread.facts.aadhaarAge, 69);
  assert.equal(reply.results[0].state, 'ineligible');
});

test('document OCR extracts only supported labelled fields and flags mismatches', () => {
  const document = extractDocument('Name: Demo Citizen\nDOB: २९/०२/२०००\nPIN Code: ५००००१\nID 0000 1234 5678');
  assert.deepEqual(document, { name: 'Demo Citizen', birthDate: '2000-02-29', postalCode: '500001' });
  assert.deepEqual(documentMismatches(document, { name: ' demo  citizen ', birth_date: '2001-02-28' }), ['birthDate']);
  assert.equal(extractDocument('DOB: 30/02/2000').birthDate, '');
});
