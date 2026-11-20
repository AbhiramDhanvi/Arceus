import React, { useEffect, useRef, useState } from 'react';
import { AudioLines, Check, ChevronRight, ExternalLink, FileText, Mic, Play, RotateCcw, Send, Sparkles, Square, Volume2, X } from 'lucide-react';
import { categories, fields, schemes } from './catalog.js';
import { advance, detectScope, initialConversation, normalize } from './eligibility.js';
import { questionText, spokenReply, words } from './assistant-copy.js';
import { copy, languageNames, local } from './languages.js';
import { useSpeech } from './use-speech.js';
import { catalogueTerms, directoryOnly, findDirectory, loadDirectory } from './directory.js';

export function SchemeDetails({ scheme, lang, close, check, save }) {
  const dialog = useRef(null);
  const t = (...text) => local(copy(...text), lang);
  useEffect(() => { dialog.current.showModal(); }, []);
  return <dialog className="scheme-dialog" ref={dialog} onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === dialog.current) close(); }}>
    <article>
      <button className="icon-button dismiss" onClick={close} aria-label={t('Close', 'बंद करें', 'మూసివేయండి', 'बंद करा')}><X size={20} /></button>
      <span className="scheme-category">{local(categories[scheme.category], lang)}</span>
      <h2>{local(scheme.name, lang)}</h2>
      <p>{local(scheme.summary, lang)}</p>
      <strong className="benefit">{local(scheme.benefit, lang)}</strong>
      <h3>{t('Eligibility criteria', 'पात्रता की शर्तें', 'అర్హత ప్రమాణాలు', 'पात्रता निकष')}</h3>
      <ul>{scheme.rules.map((rule) => <li key={rule.key}>{local(rule.label, lang)}</li>)}</ul>
      <h3>{local(words.docs, lang)}</h3><ul>{scheme.docs.map((doc) => <li key={doc.en}>{local(doc, lang)}</li>)}</ul>
      <h3>{local(words.steps, lang)}</h3><ol>{scheme.steps.map((step) => <li key={step.en}>{local(step, lang)}</li>)}</ol>
      <div className="actions"><a className="button primary" href={scheme.portal} target="_blank" rel="noreferrer"><ExternalLink size={17} />{local(words.portal, lang)}</a><button className="button outline" onClick={check}>{t('Check eligibility', 'पात्रता जाँचें', 'అర్హత చూడండి', 'पात्रता तपासा')}</button><button className="button outline" onClick={save}><FileText size={17} />{t('Track application', 'आवेदन ट्रैक करें', 'దరఖాస్తు ట్రాక్ చేయండి', 'अर्जाचा मागोवा घ्या')}</button></div>
      <p className="muted">{local(words.confirmPortal, lang)} <a href={scheme.source} target="_blank" rel="noreferrer">{local(words.source, lang)}</a></p>
    </article>
  </dialog>;
}

const samples = [
  ['pm-kisan', copy('I’m a farmer', 'मैं एक किसान हूँ', 'నేను రైతును', 'मी शेतकरी आहे')],
  ['nmmss', copy('I need a scholarship', 'मुझे छात्रवृत्ति चाहिए', 'నాకు స్కాలర్‌షిప్ కావాలి', 'मला शिष्यवृत्ती हवी आहे')],
  ['vay-vandana', copy('Healthcare for a parent', 'माता-पिता के लिए स्वास्थ्य सहायता', 'తల్లిదండ్రులకు వైద్య సహాయం', 'पालकांसाठी आरोग्य सहाय्य')],
  ['mudra', copy('I need a business loan', 'मुझे व्यवसाय ऋण चाहिए', 'నాకు వ్యాపార రుణం కావాలి', 'मला व्यवसाय कर्ज हवे आहे')],
];

const welcomeMessage = { kind: 'welcome' };

function Result({ result, lang, openScheme, saveApplication }) {
  const { scheme, state, evidence } = result;
  const t = (...text) => local(copy(...text), lang);
  return <article className="result-card">
    <div className="result-head"><b>{local(scheme.name, lang)}</b><span className={'state ' + state}>{local(words[state], lang)}</span></div>
    {state === 'eligible' && <div className="benefit">{local(scheme.benefit, lang)}</div>}
    <ul className="evidence">{evidence.map(({ rule, state: outcome }) => <li key={rule.key} className={outcome}>{outcome === 'pass' ? <Check size={15} /> : outcome === 'fail' ? <X size={15} /> : <span>?</span>}{local(rule.label, lang)}</li>)}</ul>
    <div className="actions"><button className="button subtle compact" onClick={() => openScheme(scheme)}>{local(words.steps, lang)}</button><button className="button outline compact" onClick={() => saveApplication(scheme)}>{t('Track', 'ट्रैक करें', 'ట్రాక్ చేయండి', 'मागोवा घ्या')}</button><a href={scheme.source} target="_blank" rel="noreferrer">{local(words.source, lang)} <ExternalLink size={13} /></a></div>
  </article>;
}

function Reply({ reply, lang, openScheme, saveApplication, browse }) {
  const t = (...text) => local(copy(...text), lang);
  if (reply.kind === 'question') {
    const { scope, preface, values, prompt, advice } = questionText(reply, lang);
    return <>{scope && <span className="chat-scope">{scope}</span>}{preface && <p className="clarification">{preface} {values}</p>}<p>{prompt}</p>{advice && <small>{advice}</small>}
      {reply.key === 'kisanExcluded' && <small><a className="question-source" href="https://pmkisan.gov.in/" target="_blank" rel="noreferrer">{local(words.source, lang)} <ExternalLink size={13} /></a></small>}
    </>;
  }
  if (reply.kind === 'result') {
    return <><p className="results-title">{t('Your eligibility check', 'आपकी पात्रता जाँच', 'మీ అర్హత తనిఖీ', 'तुमची पात्रता तपासणी')}</p>{reply.results.map((result) => <Result key={result.scheme.id} result={result} lang={lang} openScheme={openScheme} saveApplication={saveApplication} />)}<small>{local(words.confirmPortal, lang)} {t('Questions asked', 'पूछे गए प्रश्न', 'అడిగిన ప్రశ్నలు', 'विचारलेले प्रश्न')} · {reply.questions}</small></>;
  }
  if (reply.kind === 'guide') {
    return <>{schemes.filter(({ id }) => reply.schemeIds.includes(id)).map((scheme) => <article key={scheme.id} className="result-card"><b>{local(scheme.name, lang)}</b><ol>{scheme.steps.map((step) => <li key={step.en}>{local(step, lang)}</li>)}</ol><small>{local(words.docs, lang)}</small><p>{scheme.docs.map((doc) => local(doc, lang)).join(', ')}</p><a href={scheme.portal} target="_blank" rel="noreferrer">{local(words.portal, lang)} <ExternalLink size={13} /></a></article>)}</>;
  }
  if (reply.kind === 'directory') return <>
    <p>{local(words.directory, lang)}</p>
    {reply.items.map((item) => <article className="result-card" key={item.slug}><b>{item.title}</b><small>{item.region}</small><a href={item.source} target="_blank" rel="noreferrer">myScheme <ExternalLink size={13} /></a></article>)}
    <button className="button subtle compact" onClick={() => browse('', reply.query)}>{t('Show all directory matches', 'निर्देशिका के सभी परिणाम देखें', 'జాబితాలోని అన్ని ఫలితాలు చూపించండి', 'निर्देशिकेतील सर्व निकाल पहा')}</button>
  </>;
  return <p>{local(words[reply.kind], lang)}</p>;
}

export function Assistant({ lang, active, request, openScheme, saveApplication, signedIn, signIn, browse }) {
  const [thread, setThread] = useState(initialConversation);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [member, setMember] = useState(null);
  const [draft, setDraft] = useState('');
  const [partial, setPartial] = useState('');
  const [error, setError] = useState('');
  const [voiceMode, setVoiceMode] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const list = useRef(null);
  const requestSeen = useRef(null);
  const composer = useRef(null);
  const turnId = useRef(0);
  const isActive = useRef(active);
  isActive.current = active;
  const t = (...text) => local(copy(...text), lang);
  const speech = useSpeech(lang, (text) => send(text, { fromVoice: true }), (key) => { setError(key); setPartial(''); }, setPartial, { signedIn, handsFree });
  useEffect(() => {
    if (!active) speech.stop();
  }, [active, speech.stop]);
  useEffect(() => {
    if (!active || !request || requestSeen.current === request) return;
    turnId.current++;
    requestSeen.current = request;
    const fresh = { ...initialConversation(), facts: request.member?.facts ?? {} };
    setError('');
    setDraft('');
    setPartial('');
    if (request.voice) {
      speech.start();
      return;
    }
    setMember(request.member ?? null);
    const outcome = advance(fresh, { selectedScope: request.scope });
    setMessages([welcomeMessage, outcome.reply]);
    setThread(outcome.thread);
  }, [active, request, speech.start]);
  useEffect(() => {
    if (messages.length > 1 && list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [messages, active]);

  async function send(text, { selectedScope, selectValue, fromVoice = false } = {}) {
    const value = text.trim().slice(0, 500);
    if (!value && !selectedScope) return;
    const id = ++turnId.current;
    const outcome = advance(thread, { text: value, selectedScope, selectValue });
    setThread(outcome.thread);
    setMessages((previous) => [...previous, ...(value ? [{ kind: 'user', text: value }] : []), outcome.reply]);
    setError('');
    setPartial('');
    setDraft('');
    let reply = outcome.reply;
    const lookup = !selectedScope && !thread.pending && !detectScope(normalize(value)).length
      && catalogueTerms(value).length > 0 && (reply.kind === 'discover' || /\b(?:check|show|find|about|scheme|yojana)\b/i.test(value));
    if (lookup) {
      try {
        const items = findDirectory(await loadDirectory(), { query: value }).filter(directoryOnly).slice(0, 4);
        if (turnId.current !== id) return;
        if (items.length) {
          reply = { kind: 'directory', items, query: value };
          setMessages((previous) => previous.map((entry) => entry === outcome.reply ? reply : entry));
        }
      } catch { /* The structured interview works without the directory. */ }
    }
    if (fromVoice && voiceMode && isActive.current && turnId.current === id) {
      const nextTurn = handsFree && ['question', 'discover'].includes(reply.kind)
        ? () => { if (isActive.current && turnId.current === id) speech.start(); } : undefined;
      speech.speak(spokenReply(reply, lang), nextTurn);
    } else if (turnId.current === id) speech.stop();
  }

  function restart() {
    turnId.current++;
    speech.stop();
    setMessages([welcomeMessage]);
    setThread(initialConversation());
    setMember(null);
    setDraft('');
    setPartial('');
    setError('');
    composer.current?.focus();
  }

  function mic() {
    setPartial('');
    setError('');
    if (speech.status === 'playback-ready') speech.resume();
    else if (speech.status === 'listening' && speech.providerReady) speech.finish();
    else if (speech.status !== 'idle') speech.stop();
    else speech.start();
  }

  const last = messages.at(-1);
  const activeField = last.kind === 'question' ? fields[last.key] : null;
  const quickOptions = activeField?.type === 'boolean' ? [[true, words.yes], [false, words.no]]
    : Object.entries(activeField?.options ?? {});
  const accessibleMic = speech.status === 'idle' ? t('Start microphone', 'माइक्रोफ़ोन शुरू करें', 'మైక్రోఫోన్ ప్రారంభించండి', 'मायक्रोफोन सुरू करा')
    : speech.status === 'playback-ready' ? t('Play reply', 'जवाब सुनें', 'జవాబు వినండి', 'उत्तर ऐका')
    : speech.status === 'listening' && speech.providerReady ? t('Send recording', 'रिकॉर्डिंग भेजें', 'రికార్డింగ్ పంపండి', 'रेकॉर्डिंग पाठवा')
    : t('Stop audio', 'ऑडियो रोकें', 'ఆడియో ఆపండి', 'ऑडिओ थांबवा');
  const voiceState = {
    idle: t('Ready to listen', 'सुनने के लिए तैयार', 'వినడానికి సిద్ధంగా ఉంది', 'ऐकण्यास तयार'),
    connecting: t('Connecting microphone…', 'माइक्रोफ़ोन जुड़ रहा है…', 'మైక్రోఫోన్ కనెక్ట్ అవుతోంది…', 'मायक्रोफोन जोडत आहे…'),
    listening: t('Listening…', 'सुन रहा है…', 'వింటోంది…', 'ऐकत आहे…'),
    processing: t('Transcribing…', 'लिख रहा है…', 'లిప్యంతరీకరిస్తోంది…', 'लिप्यंतरण सुरू आहे…'),
    speaking: t('Speaking…', 'बोल रहा है…', 'మాట్లాడుతోంది…', 'बोलत आहे…'),
    'playback-ready': accessibleMic,
  };
  const AudioControl = speech.status === 'idle' ? Mic : speech.status === 'playback-ready' ? Play : Square;
  return <section className="wrap page-section assistant-page">
    <div className="eyebrow"><span />{t('YOUR SCHEME ASSISTANT', 'आपका योजना सहायक', 'మీ పథక సహాయకుడు', 'तुमचा योजना सहाय्यक')}</div><h1 className="page-title">{t('Talk to ARCEUS', 'ARCEUS से बात करें', 'ARCEUS తో మాట్లాడండి', 'ARCEUS शी बोला')}</h1>
    <p className="page-lead">{t('Ask in your own words. ARCEUS will ask only for the details it still needs.', 'अपने शब्दों में पूछें। ARCEUS केवल बाकी ज़रूरी जानकारी पूछेगा।', 'మీ మాటల్లో అడగండి. అవసరమైన వివరాలనే ARCEUS అడుగుతుంది.', 'तुमच्या शब्दांत विचारा. ARCEUS फक्त उरलेली आवश्यक माहिती विचारेल.')}</p>
    <div className="assistant-layout">
      <aside className="assistant-sidebar">
        <div className={'sidebar-orb ' + speech.status}><div><AudioLines size={48} strokeWidth={1.5} /></div></div>
        <h2>{languageNames[lang]}</h2>
        <p>{voiceState[speech.status]}</p>
        <button className="button primary" onClick={mic}><AudioControl size={18} />{accessibleMic}</button>
        <label className="read-toggle"><input type="checkbox" checked={voiceMode} onChange={(event) => { setVoiceMode(event.target.checked); if (!event.target.checked && speech.status === 'speaking') speech.stop(); }} />{t('Read voice replies aloud', 'आवाज़ के जवाब बोलें', 'వాయిస్ జవాబులు చదవండి', 'आवाजाची उत्तरे वाचा')}</label>
        <label className="read-toggle"><input type="checkbox" checked={handsFree} onChange={(event) => { setHandsFree(event.target.checked); if (!event.target.checked) speech.stop(); }} />{t('Hands-free follow-up questions', 'बिना बटन दबाए आगे के सवाल', 'బటన్ నొక్కకుండా తదుపరి ప్రశ్నలు', 'बटण न दाबता पुढील प्रश्न')}</label>
        {speech.signInRequired && <button className="text-button" onClick={signIn}>{t('Sign in for Sarvam voice', 'Sarvam आवाज़ के लिए साइन इन करें', 'Sarvam వాయిస్ కోసం సైన్ ఇన్ చేయండి', 'Sarvam आवाजासाठी साइन इन करा')}</button>}
        <small>{speech.providerReady
          ? t('Sarvam processes voice recordings and spoken replies. Keep ID and bank numbers out of the chat.', 'Sarvam आवाज़ की रिकॉर्डिंग और बोले गए जवाब संसाधित करता है। चैट में पहचान या बैंक नंबर न दें।', 'Sarvam వాయిస్ రికార్డింగ్‌లు, మాట జవాబులను నిర్వహిస్తుంది. గుర్తింపు, బ్యాంకు సంఖ్యలు చాట్‌లో ఇవ్వకండి.', 'Sarvam आवाजाच्या रेकॉर्डिंगवर आणि उत्तरांवर प्रक्रिया करते. चॅटमध्ये ओळख व बँक क्रमांक देऊ नका.')
          : t('Your browser handles speech. Its speech service may process audio online. Keep ID and bank numbers out of the chat.', 'आवाज़ आपका ब्राउज़र संभालता है। उसकी सेवा ऑडियो ऑनलाइन संसाधित कर सकती है। चैट में पहचान या बैंक नंबर न लिखें।', 'మాటలను బ్రౌజర్ నిర్వహిస్తుంది. ఆడియో ఆన్‌లైన్‌లో ప్రాసెస్ కావచ్చు. గుర్తింపు, బ్యాంకు సంఖ్యలు చాట్‌లో ఇవ్వకండి.', 'तुमचा ब्राउझर आवाज हाताळतो. त्याची सेवा ऑडिओ ऑनलाइन प्रक्रिया करू शकते. ओळख व बँक क्रमांक चॅटमध्ये देऊ नका.')}</small>
      </aside>
      <div className="chat-shell">
        <div className="chat-header"><div className="chat-icon"><Sparkles size={20} /></div><div><b>ARCEUS</b><small>{member ? member.name : t('Eligibility conversation', 'पात्रता बातचीत', 'అర్హత సంభాషణ', 'पात्रता संवाद')}</small></div><button className="icon-button" onClick={restart} title={t('Restart conversation', 'नई बातचीत', 'కొత్త సంభాషణ', 'नवीन संवाद')} aria-label={t('Restart conversation', 'नई बातचीत', 'కొత్త సంభाषण', 'नवीन संवाद')}><RotateCcw size={18} /></button></div>
        <div className="transcript" ref={list} role="log" aria-live="polite" tabIndex={0}>
          {messages.map((reply, index) => <div key={index} className={'message ' + (reply.kind === 'user' ? 'user-message' : 'agent-message')}>
            {reply.kind === 'user' ? <p>{reply.text}</p> : <><Reply reply={reply} lang={lang} openScheme={openScheme} saveApplication={(scheme) => saveApplication(scheme, member)} browse={browse} /><button className="listen-button" aria-label={t('Read this reply aloud', 'जवाब सुनें', 'ఈ జవాబు వినండి', 'हे उत्तर ऐका')} onClick={() => speech.speak(spokenReply(reply, lang))}><Volume2 size={15} /></button></>}
          </div>)}
          {(last.kind === 'welcome' || last.kind === 'discover') && <div className="quick-choices">{samples.map(([id, label]) => <button className="chip" key={id} onClick={() => send(local(label, lang), { selectedScope: [id] })}>{local(label, lang)} <ChevronRight size={15} /></button>)}</div>}
          {activeField && <div className="quick-choices">{quickOptions.map(([value, label]) => <button className="chip" key={String(value)} onClick={() => send(local(label, lang), { selectValue: value })}>{local(label, lang)}</button>)}<button className="chip skip-chip" onClick={() => send(local(words.skip, lang))}>{local(words.skip, lang)}</button></div>}
        </div>
        <div className="chat-input-area">
          {error && <p role="status" className="form-alert">{error === 'noSpeech' ? t('No speech detected. Try again or type below.', 'आवाज़ नहीं मिली। फिर कोशिश करें या लिखें।', 'మాట వినిపించలేదు. మళ్లీ ప్రయత్నించండి లేదా టైప్ చేయండి.', 'आवाज ऐकू आला नाही. पुन्हा प्रयत्न करा किंवा लिहा.') : local(words[error], lang)}</p>}
          {(partial || speech.status !== 'idle') && <div role="status" className="partial"><AudioLines size={18} />{partial || voiceState[speech.status]}{speech.status === 'listening' && speech.providerReady && ' · ' + accessibleMic}</div>}
          <form className="composer" onSubmit={(event) => { event.preventDefault(); send(draft); }}><button className={'icon-button mic-button ' + (speech.status === 'listening' ? 'live' : '')} type="button" onClick={mic} aria-label={accessibleMic}><AudioControl size={21} /></button><input ref={composer} maxLength={500} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label={t('Your message', 'आपका संदेश', 'మీ సందేశం', 'तुमचा संदेश')} placeholder={t('Ask a question or type your answer…', 'सवाल पूछें या जवाब लिखें…', 'ప్రశ్న అడగండి లేదా జవాబు టైప్ చేయండి…', 'प्रश्न विचारा किंवा उत्तर लिहा…')} /><button type="submit" className="icon-button send-button" disabled={!draft.trim()} aria-label={t('Send message', 'संदेश भेजें', 'సందేశం పంపండి', 'संदेश पाठवा')}><Send size={19} /></button></form>
        </div>
      </div>
    </div>
  </section>;
}
