import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen, ChevronDown, CircleHelp, FileCheck2, Globe2, GraduationCap,
  HeartHandshake, HeartPulse, Menu, PiggyBank, Search, ShieldCheck, Sparkles, Sprout, Wallet, X,
} from 'lucide-react';
import { categories, schemes } from './catalog.js';
import { copy, languageNames, local } from './languages.js';
import { Assistant, SchemeDetails } from './Assistant.jsx';
import { Workspace } from './Workspace.jsx';
import { Landing } from './Landing.jsx';
import { useAccount } from './backend.js';
import './style.css';

const pages = ['home', 'assistant', 'schemes', 'workspace'];
const pageFromLocation = () => {
  const hash = window.location.hash.slice(1);
  return pages.includes(hash) ? hash : 'home';
};
const nav = {
  home: copy('Home', 'होम', 'హోమ్', 'मुख्यपृष्ठ'),
  assistant: copy('Voice assistant', 'वॉइस सहायक', 'వాయిస్ సహాయకుడు', 'आवाज सहाय्यक'),
  schemes: copy('Explore schemes', 'योजनाएँ देखें', 'పథకాలు చూడండి', 'योजना पहा'),
  workspace: copy('My workspace', 'मेरा कार्यक्षेत्र', 'నా వర్క్‌స్పేస్', 'माझे कार्यक्षेत्र'),
};
const categoryIcons = { agriculture: Sprout, education: GraduationCap, health: HeartPulse, business: Wallet, marriage: HeartHandshake, insurance: ShieldCheck, savings: PiggyBank };
const featuredCategories = ['agriculture', 'education', 'health', 'business', 'marriage', 'insurance', 'savings'];

function Brand({ onClick }) {
  return <a href="#home" className="brand" onClick={onClick}><img src="/mark.svg" alt="" /><span>ARCEUS<span>.</span></span></a>;
}

function LanguageSelect({ lang, setLang }) {
  return <label className="language-select"><Globe2 size={17} /><select aria-label="Language / भाषा" value={lang} onChange={(event) => setLang(event.target.value)}>{Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select><ChevronDown size={13} /></label>;
}

function Catalog({ lang, category, setCategory, start, openScheme }) {
  const [query, setQuery] = useState('');
  const t = (...text) => local(copy(...text), lang);
  const filtered = schemes.filter((scheme) => (!category || scheme.category === category)
    && (!query.trim() || [scheme.id, ...Object.values(scheme.name), ...Object.values(scheme.summary), ...Object.values(categories[scheme.category])].join(' ').toLowerCase().includes(query.trim().toLowerCase()) || scheme.aliases.test(query.trim())));
  return <section className="wrap page-section">
    <div className="eyebrow"><span />{t('SCHEME DIRECTORY', 'योजना निर्देशिका', 'పథకాల జాబితా', 'योजना निर्देशिका')}</div><h1 className="page-title">{local(nav.schemes, lang)}</h1>
    <p className="page-lead">{t('Search the curated catalogue or narrow it down by category.', 'योजनाएँ खोजें या श्रेणी चुनें।', 'పథకాలను వెతకండి లేదా వర్గాన్ని ఎంచుకోండి.', 'योजना शोधा किंवा श्रेणीनुसार निवडा.')}</p>
    <label className="search-field"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Search schemes', 'योजनाएँ खोजें', 'పథకాలు వెతకండి', 'योजना शोधा')} aria-label={t('Search schemes', 'योजनाएँ खोजें', 'పథకాలు వెతకండి', 'योजना शोधा')} /></label>
    <div className="filters" aria-label={t('Category', 'श्रेणी', 'వర్గం', 'श्रेणी')}><button className={'chip ' + (!category ? 'selected' : '')} onClick={() => setCategory('')}>{t('All schemes', 'सभी योजनाएँ', 'అన్ని పథకాలు', 'सर्व योजना')}</button>{featuredCategories.map((key) => <button key={key} className={'chip ' + (key === category ? 'selected' : '')} onClick={() => setCategory(key)}>{local(categories[key], lang)}</button>)}</div>
    <div className="catalog-grid">{filtered.map((scheme) => {
      const Icon = categoryIcons[scheme.category];
      return <article className={'scheme-card tint-' + scheme.category} key={scheme.id}><div className="tile-icon"><Icon size={24} /></div><span className="scheme-category">{local(categories[scheme.category], lang)}</span><h2>{local(scheme.name, lang)}</h2><p>{local(scheme.summary, lang)}</p><strong>{local(scheme.benefit, lang)}</strong><div className="actions"><button className="button outline compact" onClick={() => openScheme(scheme)}><BookOpen size={16} />{t('Details', 'विवरण', 'వివరాలు', 'तपशील')}</button><button className="button subtle compact" onClick={() => start([scheme.id])}>{t('Check eligibility', 'पात्रता जाँचें', 'అర్హత చూడండి', 'पात्रता तपासा')}</button></div></article>;
    })}</div>
    {!filtered.length && <div className="empty"><Search /><p>{t('No matching schemes in this catalogue.', 'इस सूची में कोई योजना नहीं मिली।', 'ఈ జాబితాలో సరిపడే పథకాలు లేవు.', 'या यादीत जुळणारी योजना नाही.')}</p></div>}
  </section>;
}

function App() {
  const [page, setPage] = useState(pageFromLocation);
  const [lang, setLang] = useState(() => Object.hasOwn(languageNames, localStorage.getItem('arceus-language')) ? localStorage.getItem('arceus-language') : 'en');
  const [category, setCategory] = useState('');
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
  function go(target) { setPage(target); window.location.hash = target; setMenu(false); }
  function start(scope, member, voice = false) {
    if (scope || member || voice) setRequest({ scope, member, voice });
    setScheme(null);
    go('assistant');
  }
  function browse(key = '') { setCategory(key); go('schemes'); }
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
      <div hidden={page !== 'assistant'}><Assistant active={page === 'assistant'} lang={lang} request={request} openScheme={setScheme} saveApplication={saveApplication} /></div>
      {page === 'schemes' && <Catalog lang={lang} category={category} setCategory={setCategory} start={start} openScheme={setScheme} />}
      {page === 'workspace' && <Workspace lang={lang} account={account} request={workspaceRequest} start={start} openScheme={setScheme} />}
    </main>
    {scheme && <SchemeDetails key={scheme.id} scheme={scheme} lang={lang} close={() => setScheme(null)} check={() => start([scheme.id])} save={() => saveApplication(scheme)} />}
    <footer className="site-footer"><div className="wrap footer-inner"><Brand onClick={() => go('home')} /><p>{t('Independent scheme guidance for citizens.', 'नागरिकों के लिए स्वतंत्र योजना मार्गदर्शन।', 'పౌరులకు స్వతంత్ర పథకాల మార్గదర్శనం.', 'नागरिकांसाठी स्वतंत्र योजना मार्गदर्शन.')}</p><a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer"><CircleHelp size={16} />{t('Visit myScheme', 'myScheme देखें', 'myScheme చూడండి', 'myScheme पहा')}</a></div></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
