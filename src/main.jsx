import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen, ChevronDown, CircleHelp, ExternalLink, FileCheck2, Flame, Globe2, GraduationCap, Landmark,
  HeartHandshake, HeartPulse, Menu, PiggyBank, Search, ShieldCheck, Sparkles, Sprout, Wallet, X,
} from 'lucide-react';
import { categories, schemes } from './catalog.js';
import { copy, languageNames, local } from './languages.js';
import { Assistant, SchemeDetails } from './Assistant.jsx';
import { Workspace } from './Workspace.jsx';
import { Landing } from './Landing.jsx';
import { directoryOnly, findDirectory, loadDirectory } from './directory.js';
import { useAccount } from './backend.js';
import './style.css';

const pages = ['home', 'assistant', 'schemes', 'workspace'];
const pageFromLocation = () => {
  const hash = window.location.hash.slice(1);
  return pages.includes(hash) ? hash : window.location.pathname === '/auth/callback' ? 'workspace' : 'home';
};
const nav = {
  home: copy('Home', 'होम', 'హోమ్', 'मुख्यपृष्ठ'),
  assistant: copy('Voice assistant', 'वॉइस सहायक', 'వాయిస్ సహాయకుడు', 'आवाज सहाय्यक'),
  schemes: copy('Explore schemes', 'योजनाएँ देखें', 'పథకాలు చూడండి', 'योजना पहा'),
  workspace: copy('My workspace', 'मेरा कार्यक्षेत्र', 'నా వర్క్‌స్పేస్', 'माझे कार्यक्षेत्र'),
};
const categoryIcons = { agriculture: Sprout, education: GraduationCap, health: HeartPulse, business: Wallet, marriage: HeartHandshake, insurance: ShieldCheck, savings: PiggyBank, utilities: Flame };
const featuredCategories = Object.keys(categories);

function Brand({ onClick }) {
  return <a href="#home" className="brand" onClick={onClick}><img src="/mark.svg" alt="" /><span>ARCEUS<span>.</span></span></a>;
}

function LanguageSelect({ lang, setLang }) {
  return <label className="language-select"><Globe2 size={17} /><select aria-label="Language / भाषा" value={lang} onChange={(event) => setLang(event.target.value)}>{Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select><ChevronDown size={13} /></label>;
}

function Catalog({ lang, category, setCategory, initialQuery, start, openScheme }) {
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState('');
  const [onlyInterview, setOnlyInterview] = useState(false);
  const [limit, setLimit] = useState(15);
  const [index, setIndex] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    loadDirectory().then((rows) => { if (alive) setIndex(rows.filter(directoryOnly)); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);
  const t = (...text) => local(copy(...text), lang);
  const filtered = schemes.filter((scheme) => (!category || scheme.category === category)
    && (!region || (region === 'central' ? !scheme.region && scheme.id !== 'telangana-marriage' : (scheme.region ?? (scheme.id === 'telangana-marriage' ? 'Telangana' : '')) === region))
    && (!query.trim() || [scheme.id, ...Object.values(scheme.name), ...Object.values(scheme.summary), ...Object.values(categories[scheme.category])].join(' ').toLowerCase().includes(query.trim().toLowerCase()) || scheme.aliases.test(query.trim())));
  const listed = useMemo(() => onlyInterview || !index ? [] : findDirectory(index, { query, category, region }), [index, onlyInterview, query, category, region]);
  const regions = useMemo(() => [...new Set(index?.filter(({ level }) => level === 'S').map(({ region }) => region) ?? [])].sort(), [index]);
  const total = filtered.length + listed.length;
  function selectCategory(key) { setCategory(key); setLimit(15); }
  return <section className="wrap page-section">
    <div className="eyebrow"><span />{t('SCHEME DIRECTORY', 'योजना निर्देशिका', 'పథకాల జాబితా', 'योजना निर्देशिका')}</div><h1 className="page-title">{local(nav.schemes, lang)}</h1>
    <p className="page-lead">{t('Search central and state schemes from myScheme. Use the ARCEUS eligibility interview where available.', 'myScheme पर केंद्र और राज्य की योजनाएँ खोजें। उपलब्ध होने पर ARCEUS से पात्रता जाँचें।', 'myScheme లో కేంద్ర, రాష్ట్ర పథకాలు వెతకండి. అందుబాటులో ఉంటే ARCEUS తో అర్హత చూడండి.', 'myScheme वर केंद्र व राज्याच्या योजना शोधा. उपलब्ध असल्यास ARCEUS वर पात्रता तपासा.')}</p>
    <div className="directory-controls">
      <label className="search-field"><Search size={20} /><input value={query} maxLength={100} onChange={(event) => { setQuery(event.target.value); setLimit(15); }} placeholder={t('Search schemes', 'योजनाएँ खोजें', 'పథకాలు వెతకండి', 'योजना शोधा')} aria-label={t('Search schemes', 'योजनाएँ खोजें', 'పథకాలు వెతకండి', 'योजना शोधा')} /></label>
      <select aria-label={t('Scheme region', 'योजना क्षेत्र', 'పథకం ప్రాంతం', 'योजना प्रदेश')} value={region} onChange={(event) => { setRegion(event.target.value); setLimit(15); }}>
        <option value="">{t('All regions', 'सभी क्षेत्र', 'అన్ని ప్రాంతాలు', 'सर्व प्रदेश')}</option><option value="central">{t('Central government', 'केंद्र सरकार', 'కేంద్ర ప్రభుత్వం', 'केंद्र सरकार')}</option>
        {regions.map((name) => <option key={name}>{name}</option>)}
      </select>
    </div>
    <div className="filters" aria-label={t('Category', 'श्रेणी', 'వర్గం', 'श्रेणी')}><button className={'chip ' + (!category ? 'selected' : '')} aria-pressed={!category} onClick={() => selectCategory('')}>{t('All categories', 'सभी श्रेणियाँ', 'అన్ని వర్గాలు', 'सर्व श्रेणी')}</button>{featuredCategories.map((key) => <button key={key} className={'chip ' + (key === category ? 'selected' : '')} aria-pressed={key === category} onClick={() => selectCategory(key)}>{local(categories[key], lang)}</button>)}</div>
    <div className="directory-summary"><label><input type="checkbox" checked={onlyInterview} onChange={(event) => { setOnlyInterview(event.target.checked); setLimit(15); }} />{t('ARCEUS checks only', 'केवल ARCEUS की जाँच', 'ARCEUS తనిఖీలు మాత్రమే', 'फक्त ARCEUS तपासण्या')}</label><span aria-live="polite">{new Intl.NumberFormat(lang).format(total)} {t('results', 'परिणाम', 'ఫలితాలు', 'निकाल')}</span></div>
    <div className="catalog-grid">{filtered.slice(0, limit).map((scheme) => {
      const Icon = categoryIcons[scheme.category];
      return <article className={'scheme-card tint-' + scheme.category} key={scheme.id}><div className="tile-icon"><Icon size={24} /></div><span className="scheme-category">{local(categories[scheme.category], lang)}</span><h2>{local(scheme.name, lang)}</h2><p>{local(scheme.summary, lang)}</p><strong>{local(scheme.benefit, lang)}</strong><div className="actions"><button className="button outline compact" onClick={() => openScheme(scheme)}><BookOpen size={16} />{t('Details', 'विवरण', 'వివరాలు', 'तपशील')}</button><button className="button subtle compact" onClick={() => start([scheme.id])}>{t('Check eligibility', 'पात्रता जाँचें', 'అర్హత చూడండి', 'पात्रता तपासा')}</button></div></article>;
    })}
      {listed.slice(0, Math.max(0, limit - filtered.length)).map((item) => <article className="scheme-card directory-card" key={item.slug}>
        <div className="tile-icon"><Landmark size={23} /></div><span className="scheme-category">myScheme · {item.level === 'C' ? t('Central', 'केंद्र', 'కేంద్రం', 'केंद्र') : item.region}</span>
        <h2>{item.title}</h2><p className="directory-tags">{item.level === 'C' ? item.region : item.tags}</p>
        <a className="button outline compact" href={item.source} target="_blank" rel="noreferrer"><ExternalLink size={16} />{t('Check on myScheme', 'myScheme पर जाँचें', 'myScheme లో తనిఖీ చేయండి', 'myScheme वर तपासा')}</a>
      </article>)}</div>
    {!index && !onlyInterview && !failed && <p role="status" className="directory-footer">{t('Loading the myScheme directory…', 'myScheme निर्देशिका लोड हो रही है…', 'myScheme జాబితా లోడ్ అవుతోంది…', 'myScheme निर्देशिका उघडत आहे…')}</p>}
    {total > limit && <div className="directory-footer"><button className="button outline" onClick={() => setLimit(limit + 18)}>{t('Load more schemes', 'और योजनाएँ दिखाएँ', 'మరిన్ని పథకాలు చూపించండి', 'आणखी योजना दाखवा')}</button></div>}
    {total === 0 && (index || failed || onlyInterview) && <div className="empty"><Search /><p>{t('No schemes match these filters.', 'इन फ़िल्टरों से कोई योजना नहीं मिली।', 'ఈ ఫిల్టర్లకు పథకాలు దొరకలేదు.', 'या गाळण्यांशी कोणतीही योजना जुळली नाही.')}</p></div>}
    <div className="directory-footer"><a href="https://www.myscheme.gov.in/search" target="_blank" rel="noreferrer"><ExternalLink size={15} /> {t('Live directory on myScheme', 'myScheme पर लाइव निर्देशिका', 'myScheme లో ప్రత్యక్ష జాబితా', 'myScheme वरील अद्ययावत निर्देशिका')}</a></div>
  </section>;
}

function App() {
  const [page, setPage] = useState(pageFromLocation);
  const [lang, setLang] = useState(() => Object.hasOwn(languageNames, localStorage.getItem('arceus-language')) ? localStorage.getItem('arceus-language') : 'en');
  const [category, setCategory] = useState('');
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [scheme, setScheme] = useState(null);
  const [request, setRequest] = useState(null);
  const [workspaceRequest, setWorkspaceRequest] = useState(null);
  const [menu, setMenu] = useState(false);
  const account = useAccount();
  const t = (...text) => local(copy(...text), lang);
  useEffect(() => {
    function onHash() { setPage(pageFromLocation()); setMenu(false); }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('arceus-language', lang);
  }, [lang]);
  useEffect(() => { window.scrollTo(0, 0); }, [page]);
  function go(target) {
    setPage(target);
    if (window.location.pathname === '/auth/callback') window.history.replaceState(null, '', '/#' + target);
    else window.location.hash = target;
    setMenu(false);
  }
  function start(scope, member, voice = false) {
    if (scope || member || voice) setRequest({ scope, member, voice });
    setScheme(null);
    go('assistant');
  }
  function browse(key = '', query = '') { setCategory(key); setDirectoryQuery(query); go('schemes'); }
  function saveApplication(item, member) {
    setWorkspaceRequest({ tab: 'applications', scheme: item.id, member });
    setScheme(null);
    go('workspace');
  }
  return <div className={'app ' + (page === 'home' ? 'home-page' : '')}>
    <a className="skip-link" href="#content" onClick={(event) => { event.preventDefault(); document.getElementById('content').focus(); }}>{t('Skip to content', 'मुख्य सामग्री पर जाएँ', 'ప్రధాన విషయానికి వెళ్లండి', 'मुख्य मजकुराकडे जा')}</a>
    <header className="site-header"><div className="wrap header-inner"><Brand onClick={() => go('home')} />
      <nav className={menu ? 'navigation open' : 'navigation'} aria-label="Main">{Object.entries(nav).map(([key, label]) => <a key={key} href={'#' + key} onClick={() => key === 'schemes' ? browse() : go(key)} aria-current={page === key ? 'page' : undefined}>{local(label, lang)}</a>)}</nav>
      <div className="header-actions"><LanguageSelect lang={lang} setLang={setLang} /><button className="button header-cta" onClick={() => account.user ? go('workspace') : go('assistant')}>{account.user ? <FileCheck2 size={16} /> : <Sparkles size={16} />}{account.user ? t('Workspace', 'कार्यक्षेत्र', 'వర్క్‌స్పేస్', 'कार्यक्षेत्र') : t('Get started', 'शुरू करें', 'ప్రారంభించండి', 'सुरू करा')}</button><button className="icon-button menu-toggle" aria-label={t('Menu', 'मेनू', 'మెనూ', 'मेनू')} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></div>
    </div></header>
    <main id="content" tabIndex={-1}>
      {page === 'home' && <Landing lang={lang} start={start} browse={browse} go={go} categoryIcons={categoryIcons} />}
      <div hidden={page !== 'assistant'}><Assistant active={page === 'assistant'} lang={lang} request={request} openScheme={setScheme} saveApplication={saveApplication} signedIn={Boolean(account.user)} signIn={() => go('workspace')} browse={browse} /></div>
      {page === 'schemes' && <Catalog key={directoryQuery} initialQuery={directoryQuery} lang={lang} category={category} setCategory={setCategory} start={start} openScheme={setScheme} />}
      {page === 'workspace' && <Workspace lang={lang} account={account} request={workspaceRequest} start={start} openScheme={setScheme} />}
    </main>
    {scheme && <SchemeDetails key={scheme.id} scheme={scheme} lang={lang} close={() => setScheme(null)} check={() => start([scheme.id])} save={() => saveApplication(scheme)} />}
    <footer className="site-footer"><div className="wrap footer-inner"><Brand onClick={() => go('home')} /><p>{t('Independent scheme guidance for citizens.', 'नागरिकों के लिए स्वतंत्र योजना मार्गदर्शन।', 'పౌరులకు స్వతంత్ర పథకాల మార్గదర్శనం.', 'नागरिकांसाठी स्वतंत्र योजना मार्गदर्शन.')}</p><a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer"><CircleHelp size={16} />{t('Visit myScheme', 'myScheme देखें', 'myScheme చూడండి', 'myScheme पहा')}</a></div></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
