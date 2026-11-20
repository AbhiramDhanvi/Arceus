import React, { useEffect, useRef, useState } from 'react';
import {
  AudioLines, BookOpen, Check, ChevronDown, Compass, ExternalLink, FileCheck2, Globe2, Landmark,
  MessageSquare, Mic, ShieldCheck, Users,
} from 'lucide-react';
import { categories, lifeEvents, schemes } from './catalog.js';
import { copy, languageNames, local } from './languages.js';

const bars = [7, 14, 23, 11, 31, 42, 18, 35, 54, 32, 16, 48, 64, 42, 28, 11, 24, 42, 28, 12, 29, 18, 8, 16, 9];
function Wave({ compact = false }) {
  return <div className={'voice-wave' + (compact ? ' compact-wave' : '')} aria-hidden="true">
    {bars.map((height, index) => <span key={index} style={{ '--height': height + 'px', '--bar': index }} />)}
  </div>;
}

function Hero({ lang, start, browse }) {
  const photo = useRef(null);
  const t = (...text) => local(copy(...text), lang);
  function setLight(event) {
    if (event.pointerType !== 'mouse') return;
    const card = photo.current;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--light-x', ((event.clientX - bounds.left) / bounds.width * 100) + '%');
    card.style.setProperty('--light-y', ((event.clientY - bounds.top) / bounds.height * 100) + '%');
  }
  return <div className="hero-ground">
    <section className="hero wrap home-hero">
      <div className="hero-copy">
        <div className="eyebrow"><span />{t('INDIAN GOVERNMENT SCHEMES', 'भारत की सरकारी योजनाएँ', 'భారత ప్రభుత్వ పథకాలు', 'भारत सरकारच्या योजना')}</div>
        <h1>{t('Your voice.', 'आपकी आवाज़।', 'మీ గొంతు.', 'तुमचा आवाज.')}<br /><em>{t('Your benefits.', 'आपके लाभ।', 'మీ ప్రయోజనాలు.', 'तुमचे लाभ.')}</em></h1>
        <p>{t('Find schemes for you and your family. Speak or type in English, Hindi, Telugu, or Marathi to check eligibility and learn how to apply.', 'अपने और परिवार के लिए योजनाएँ खोजें। पात्रता और आवेदन समझने के लिए अंग्रेज़ी, हिन्दी, तेलुगु या मराठी में बोलें या लिखें।', 'మీకు, మీ కుటుంబానికి పథకాలు కనుగొనండి. అర్హత, దరఖాస్తు గురించి ఇంగ్లీష్, హిందీ, తెలుగు లేదా మరాఠీలో అడగండి.', 'तुमच्यासाठी आणि कुटुंबासाठी योजना शोधा. पात्रता व अर्ज समजून घेण्यासाठी इंग्रजी, हिंदी, तेलुगू किंवा मराठीत बोला किंवा लिहा.')}</p>
        <div className="actions">
          <button className="button primary" onClick={() => start(undefined, undefined, true)}><Mic size={19} />{t('Talk to ARCEUS', 'ARCEUS से बात करें', 'ARCEUS తో మాట్లాడండి', 'ARCEUS शी बोला')}</button>
          <button className="button outline" onClick={() => browse()}><Compass size={18} />{t('Explore schemes', 'योजनाएँ देखें', 'పథకాలు చూడండి', 'योजना पहा')}</button>
        </div>
        <div className="source-line"><ShieldCheck size={18} />{t('Guidance based on official government sources', 'आधिकारिक सरकारी स्रोतों पर आधारित मार्गदर्शन', 'అధికారిక ప్రభుత్వ మూలాల ఆధారంగా మార్గదర్శనం', 'अधिकृत सरकारी स्रोतांवर आधारित मार्गदर्शन')}</div>
      </div>
      <div className="hero-picture" ref={photo} onPointerMove={setLight}>
        <picture><source media="(max-width: 650px)" srcSet="/images/voice-hero-mobile.webp" /><img src="/images/voice-hero.webp" alt="" width="1440" height="960" fetchPriority="high" /></picture>
        <div className="hero-wash" aria-hidden="true" />
        <div className="voice-card">
          <div className="voice-card-label"><div className="voice-card-icon"><AudioLines size={19} /></div><div><b>ARCEUS</b><small>{t('Scheme assistant', 'योजना सहायक', 'పథక సహాయకుడు', 'योजना सहाय्यक')}</small></div><span>{languageNames[lang]}</span></div>
          <Wave compact />
          <button className="voice-card-action" onClick={() => start()}><MessageSquare size={16} />{t('Ask about a scheme', 'किसी योजना के बारे में पूछें', 'పథకం గురించి అడగండి', 'योजनेविषयी विचारा')}</button>
        </div>
      </div>
      <button className="journey-link" onClick={() => {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
        document.getElementById('how-arceus-works')?.scrollIntoView({ behavior, block: 'start' });
        document.getElementById('how-arceus-works')?.focus({ preventScroll: true });
      }}><ChevronDown size={18} />{t('See how it works', 'देखें कैसे काम करता है', 'ఇది ఎలా పనిచేస్తుందో చూడండి', 'हे कसे काम करते ते पहा')}</button>
    </section>
  </div>;
}

const journey = [
  {
    icon: Mic,
    title: copy('Ask in your own words', 'अपने शब्दों में पूछें', 'మీ మాటల్లో అడగండి', 'तुमच्या शब्दांत विचारा'),
    description: copy('Tell ARCEUS what you need, such as healthcare for a parent. Speak or type in the language you prefer.', 'बताएँ कि आपको क्या चाहिए, जैसे माता-पिता के लिए स्वास्थ्य सहायता। अपनी भाषा में बोलें या लिखें।', 'తల్లిదండ్రులకు ఆరోగ్య సహాయం వంటి మీ అవసరాన్ని చెప్పండి. మీకు నచ్చిన భాషలో మాట్లాడండి లేదా టైప్ చేయండి.', 'पालकांसाठी आरोग्य मदतीसारखी तुमची गरज सांगा. आवडत्या भाषेत बोला किंवा लिहा.'),
  },
  {
    icon: ShieldCheck,
    title: copy('Check the rules that apply', 'लागू नियमों की जाँच करें', 'వర్తించే నియమాలను చూడండి', 'लागू नियम तपासा'),
    description: copy('Answer the few questions that affect your result. If two answers disagree, ARCEUS asks you to confirm before making a recommendation.', 'परिणाम के लिए ज़रूरी सवालों का जवाब दें। जवाब अलग हों तो ARCEUS सुझाव से पहले पुष्टि करता है।', 'ఫలితాన్ని ప్రభావితం చేసే ప్రశ్నలకు జవాబు ఇవ్వండి. మాటలు విరుద్ధంగా ఉంటే సూచనకు ముందు ARCEUS నిర్ధారిస్తుంది.', 'निकालावर परिणाम करणाऱ्या प्रश्नांची उत्तरे द्या. उत्तरांमध्ये फरक असल्यास ARCEUS शिफारस करण्याआधी विचारतो.'),
  },
  {
    icon: Landmark,
    title: copy('Apply through the official portal', 'आधिकारिक पोर्टल पर आवेदन करें', 'అధికారిక పోర్టల్‌లో దరఖాస్తు చేయండి', 'अधिकृत पोर्टलवर अर्ज करा'),
    description: copy('See why you may qualify, prepare your documents, and follow the steps to the official website. Save the reference in your workspace after applying.', 'पात्रता का कारण देखें, दस्तावेज़ तैयार करें और आधिकारिक वेबसाइट पर जाएँ। आवेदन के बाद संदर्भ सहेजें।', 'అర్హతకు కారణం తెలుసుకోండి, పత్రాలు సిద్ధం చేసి అధికారిక వెబ్‌సైట్‌కు వెళ్లండి. దరఖాస్తు తర్వాత సూచికను సేవ్ చేయండి.', 'पात्रतेचे कारण पहा, कागदपत्रे तयार करा आणि अधिकृत वेबसाइटवर जा. अर्जानंतर संदर्भ जतन करा.'),
  },
];

function Journey({ lang, start }) {
  const scrollArea = useRef(null);
  const [stage, setStage] = useState(0);
  const t = (...text) => local(copy(...text), lang);
  useEffect(() => {
    const area = scrollArea.current;
    const steps = [...area.querySelectorAll('.journey-step')];
    const reduction = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let current = -1;
    function measure() {
      frame = 0;
      const center = window.innerHeight * (window.innerWidth > 780 ? .49 : .73);
      if (reduction.matches) {
        area.style.removeProperty('--journey-progress');
        if (current !== 0) { current = 0; setStage(0); }
        return;
      }
      const positions = steps.map((item) => {
        const rect = item.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      const next = positions.reduce((best, value, index) => Math.abs(value - center) < Math.abs(positions[best] - center) ? index : best, 0);
      if (current !== next) { current = next; setStage(next); }
      const progress = Math.min(1, Math.max(0, (center - positions[0]) / (positions.at(-1) - positions[0] || 1)));
      area.style.setProperty('--journey-progress', progress.toFixed(3));
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    reduction.addEventListener('change', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduction.removeEventListener('change', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <section id="how-arceus-works" className="wrap journey" tabIndex={-1}>
    <div className="eyebrow"><span />{t('HOW IT WORKS', 'कैसे काम करता है', 'ఎలా పనిచేస్తుంది', 'हे कसे काम करते')}</div>
    <h2>{t('From a question to the next step', 'एक सवाल से अगले कदम तक', 'ఒక ప్రశ్న నుంచి తదుపరి దశ వరకు', 'एका प्रश्नापासून पुढच्या पायरीपर्यंत')}</h2>
    <div className="journey-grid" ref={scrollArea} data-stage={stage}>
      <div className="journey-visual" aria-hidden="true">
        <div className="journey-lens"><div /><div /><div /></div>
        <div className="journey-progress"><span /><span /><span /></div>
        <div className="journey-frames">
          <div className="journey-frame frame-ask"><div className="frame-icon"><Mic size={23} /></div><Wave /><div className="journey-quote">{t('“Can my father get health cover?”', '“क्या मेरे पिता को स्वास्थ्य कवर मिलेगा?”', '“మా నాన్నకు ఆరోగ్య రక్షణ దొరుకుతుందా?”', '“माझ्या वडिलांना आरोग्य संरक्षण मिळेल का?”')}</div></div>
          <div className="journey-frame frame-check"><div className="frame-icon"><ShieldCheck size={23} /></div><b>{t('Ayushman Vay Vandana', 'आयुष्मान वय वंदना', 'ఆయుష్మాన్ వయ వందన', 'आयुष्मान वय वंदना')}</b><span><Check size={17} />{t('Age 70 or above on Aadhaar', 'आधार पर उम्र 70 वर्ष या ज़्यादा', 'ఆధార్‌లో 70 ఏళ్లు లేదా ఎక్కువ', 'आधारवरील वय 70 किंवा अधिक')}</span><span><Check size={17} />{t('Lives in India', 'भारत में रहते हैं', 'భారతదేశంలో నివసిస్తున్నారు', 'भारतात राहतात')}</span></div>
          <div className="journey-frame frame-apply"><div className="frame-icon"><Landmark size={23} /></div><b>{t('Prepare to apply', 'आवेदन की तैयारी करें', 'దరఖాస్తుకు సిద్ధం అవ్వండి', 'अर्जाची तयारी करा')}</b><span><FileCheck2 size={17} />{t('Aadhaar for e-KYC', 'ई-केवाईसी के लिए आधार', 'ఈ-కేవైసీ కోసం ఆధార్', 'ई-केवायसीसाठी आधार')}</span><span><ExternalLink size={17} />{t('NHA beneficiary portal', 'एनएचए लाभार्थी पोर्टल', 'ఎన్‌హెచ్‌ఏ లబ్ధిదారు పోర్టల్', 'एनएचए लाभार्थी पोर्टल')}</span></div>
        </div>
      </div>
      <div className="journey-steps">{journey.map(({ icon: Icon, title, description }, index) => <article key={title.en} className={'journey-step' + (stage === index ? ' current' : '')}>
        <div className="step-icon"><Icon size={25} /></div><div><h3>{local(title, lang)}</h3><p>{local(description, lang)}</p></div>
      </article>)}</div>
    </div>
    <button className="button primary journey-cta" onClick={() => start()}><Mic size={18} />{t('Start an eligibility check', 'पात्रता जाँच शुरू करें', 'అర్హత తనిఖీ ప్రారంభించండి', 'पात्रता तपासणी सुरू करा')}</button>
  </section>;
}

export function Landing({ lang, start, browse, go, categoryIcons }) {
  const t = (...text) => local(copy(...text), lang);
  const keys = Object.keys(categories);
  return <>
    <Hero lang={lang} start={start} browse={browse} />
    <div className="value-band"><div className="wrap value-items">
      <div><Globe2 />{t('4 languages', '4 भाषाएँ', '4 భాషలు', '4 भाषा')}</div>
      <div><Landmark />{t('Official scheme sources', 'आधिकारिक योजना स्रोत', 'అధికారిక పథక మూలాలు', 'अधिकृत योजना स्रोत')}</div>
      <div><MessageSquare />{t('Voice and text', 'आवाज़ और टेक्स्ट', 'వాయిస్ మరియు టెక్స్ట్', 'आवाज आणि मजकूर')}</div>
      <div><Users />{t('Support for the whole family', 'पूरे परिवार के लिए सहायता', 'కుటుంబం మొత్తానికి సహాయం', 'संपूर्ण कुटुंबासाठी मदत')}</div>
    </div></div>
    <Journey lang={lang} start={start} />
    <div className="directory-ground"><section className="wrap landing-section">
      <div className="section-top"><div><div className="eyebrow"><span />{t('SCHEME DIRECTORY', 'योजना निर्देशिका', 'పథకాల జాబితా', 'योजना निर्देशिका')}</div><h2>{t('Explore by category', 'श्रेणी के अनुसार देखें', 'వర్గం ద్వారా చూడండి', 'श्रेणीनुसार पहा')}</h2></div><button className="button outline" onClick={() => browse()}><BookOpen size={18} />{t('View all schemes', 'सभी योजनाएँ', 'అన్ని పథకాలు', 'सर्व योजना')}</button></div>
      <div className="category-grid">{keys.map((key) => {
        const Icon = categoryIcons[key];
        const count = schemes.filter((scheme) => scheme.category === key).length;
        return <button className={'category-card tint-' + key} key={key} onClick={() => browse(key)}><div className="tile-icon"><Icon size={24} /></div><b>{local(categories[key], lang)}</b><span>{new Intl.NumberFormat(lang).format(count)} {t(count === 1 ? 'scheme' : 'schemes', 'योजना', 'పథకాలు', 'योजना')}</span></button>;
      })}</div>
    </section></div>
    <section className="wrap landing-section life-section">
      <div className="life-intro">
        <img src="/images/family-planning.webp" width="1080" height="720" loading="lazy" alt="" />
        <div><div className="eyebrow"><span />{t('FAMILY PLANNING', 'परिवार की योजनाएँ', 'కుటుంబ ప్రణాళిక', 'कुटुंब नियोजन')}</div><h2>{t('Planning a life event?', 'जीवन के किसी पड़ाव की तैयारी?', 'జీవిత సంఘటన కోసం ప్రణాళిక?', 'जीवनातील महत्त्वाच्या टप्प्याची तयारी?')}</h2>
          <p>{t('Check benefits for family members and keep their application records and reminders together.', 'परिवार के सदस्यों के लाभ जाँचें और उनके आवेदन रिकॉर्ड व रिमाइंडर एक जगह रखें।', 'కుటుంబ సభ్యుల ప్రయోజనాలు తనిఖీ చేసి, వారి దరఖాస్తులు, గుర్తుచేయింపులు ఒకేచోట ఉంచండి.', 'कुटुंब सदस्यांचे लाभ तपासा आणि अर्ज नोंदी व स्मरणपत्रे एकत्र ठेवा.')}</p>
          <button className="button primary" onClick={() => go('workspace')}><Users size={18} />{t('Open my workspace', 'मेरा कार्यक्षेत्र खोलें', 'నా వర్క్‌స్పేస్ తెరవండి', 'माझे कार्यक्षेत्र उघडा')}</button>
        </div>
      </div>
      <div className="life-grid">{lifeEvents.map((event) => {
        const Icon = categoryIcons[event.category];
        return <button className="life-card" key={event.category} onClick={() => browse(event.category)}><Icon size={22} /><b>{local(event.title, lang)}</b><span>{local(event.detail, lang)}</span></button>;
      })}</div>
    </section>
  </>;
}
