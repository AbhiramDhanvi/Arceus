import React, { useEffect, useRef, useState } from 'react';
import {
  Bell, CalendarDays, Check, ClipboardList, Download, ExternalLink, FileText, FolderLock,
  Github, LogOut, Plus, Save, ScanLine, ShieldCheck, Trash2, Upload, Users,
} from 'lucide-react';
import { schemes, fields } from './catalog.js';
import { copy, locales, local } from './languages.js';
import { evaluate } from './eligibility.js';
import { words } from './assistant-copy.js';
import { asDateInput, authCallback, dataOrThrow, documentBucket, memberFacts, memberMilestones, supabase } from './backend.js';
import { documentMismatches, extractDocument, imageLimit, imageMime, ocrLanguages } from './documents.js';

const labels = {
  applications: copy('Applications', 'आवेदन', 'దరఖాస్తులు', 'अर्ज'),
  family: copy('Family', 'परिवार', 'కుటుంబం', 'कुटुंब'),
  reminders: copy('Reminders', 'रिमाइंडर', 'గుర్తుచేయింపులు', 'स्मरणपत्रे'),
  documents: copy('Document vault', 'दस्तावेज़ तिजोरी', 'పత్రాల భాండాగారం', 'कागदपत्रे तिजोरी'),
  name: copy('Applicant name', 'आवेदक का नाम', 'దరఖాస్తుదారు పేరు', 'अर्जदाराचे नाव'),
  birthDate: copy('Date of birth', 'जन्मतिथि', 'పుట్టిన తేదీ', 'जन्मतारीख'),
  postalCode: copy('Postal code', 'पिन कोड', 'పిన్ కోడ్', 'पिन कोड'),
  scheme: copy('Scheme', 'योजना', 'పథకం', 'योजना'),
  save: copy('Save', 'सहेजें', 'సేవ్ చేయండి', 'जतन करा'),
  delete: copy('Delete', 'हटाएँ', 'తొలగించండి', 'काढा'),
  other: copy('Other / unknown', 'अन्य / पता नहीं', 'ఇతర / తెలియదు', 'इतर / माहीत नाही'),
  member: copy('Family member', 'परिवार का सदस्य', 'కుటుంబ సభ్యుడు', 'कुटुंबातील सदस्य'),
};
const statusLabels = {
  planned: copy('Planned', 'योजना बनाई', 'ప్రణాళిక', 'नियोजित'),
  submitted: copy('Submitted', 'जमा किया', 'సమర్పించారు', 'सादर'),
  under_review: copy('Under review', 'समीक्षा में', 'సమీక్షలో', 'तपासणीत'),
  approved: copy('Approved', 'मंज़ूर', 'ఆమోదం', 'मंजूर'),
  rejected: copy('Rejected', 'अस्वीकृत', 'తిరస్కరించారు', 'नामंजूर'),
};
const tabs = { applications: ClipboardList, family: Users, reminders: Bell, documents: FolderLock };
const schemeById = (id) => schemes.find((scheme) => scheme.id === id);
const errorText = (error) => typeof error?.message === 'string' ? error.message : String(error);
const today = () => asDateInput();

function SchemeSelect({ lang, empty, ...props }) {
  return <select {...props}>{empty && <option value="">{local(labels.other, lang)}</option>}{schemes.map((scheme) => <option key={scheme.id} value={scheme.id}>{local(scheme.name, lang)}</option>)}</select>;
}

function MemberSelect({ lang, members, ...props }) {
  return <select {...props}><option value="">—</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>;
}

function ConfirmDelete({ lang, onDelete }) {
  const [armed, setArmed] = useState(false);
  const t = (...text) => local(copy(...text), lang);
  return armed ? <div className="delete-confirm"><button type="button" className="button danger compact" onClick={() => { setArmed(false); onDelete(); }}>{t('Confirm deletion', 'हटाने की पुष्टि', 'తొలగింపు నిర్ధారించండి', 'काढण्याची खात्री करा')}</button><button type="button" className="button outline compact" onClick={() => setArmed(false)}>{t('Cancel', 'रद्द करें', 'రద్దు', 'रद्द करा')}</button></div> : <button type="button" className="icon-button delete-button" aria-label={local(labels.delete, lang)} onClick={() => setArmed(true)}><Trash2 size={17} /></button>;
}

function AuthPanel({ lang, recovery, account, onRecovered }) {
  const [mode, setMode] = useState('signin');
  const create = mode === 'signup';
  const forgot = mode === 'forgot';
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const t = (...text) => local(copy(...text), lang);
  const invalidCallback = account.callbackError || (recovery && !account.user);
  const [linkError, setLinkError] = useState(Boolean(invalidCallback));

  function changeMode(next) {
    setMode(next);
    setFeedback(null);
    setLinkError(false);
  }
  async function github() {
    setFeedback(null);
    setBusy(true);
    try {
      dataOrThrow(await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: authCallback() } }));
    } catch {
      setFeedback({ message: t('GitHub sign-in is unavailable. Try again later.', 'GitHub साइन-इन उपलब्ध नहीं है। बाद में कोशिश करें।', 'GitHub సైన్ ఇన్ అందుబాటులో లేదు. తర్వాత ప్రయత్నించండి.', 'GitHub साइन इन उपलब्ध नाही. नंतर प्रयत्न करा.'), error: true });
      setBusy(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const credentials = { email: String(form.get('email')).trim(), password: form.get('password') };
    setBusy(true);
    setFeedback(null);
    try {
      if (recovery && account.user) {
        if (credentials.password !== form.get('confirmPassword')) {
          setFeedback({ message: t('The passwords do not match.', 'पासवर्ड मेल नहीं खाते।', 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు.', 'पासवर्ड जुळत नाहीत.'), error: true });
          return;
        }
        dataOrThrow(await supabase.auth.updateUser({ password: credentials.password }));
        onRecovered();
      } else if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(credentials.email, { redirectTo: authCallback(true) });
        if (error?.code === 'over_email_send_rate_limit') throw error;
        setFeedback({ message: t('If the account supports email recovery, a reset link will arrive shortly.', 'ईमेल से रिकवरी उपलब्ध होने पर रीसेट लिंक भेजा जाएगा।', 'ఈమెయిల్ రికవరీ ఉంటే రీసెట్ లింక్ వస్తుంది.', 'ईमेल पुनर्प्राप्ती उपलब्ध असल्यास रीसेट दुवा येईल.') });
      } else if (create) {
        const data = dataOrThrow(await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: authCallback() } }));
        if (!data.session) setFeedback({ message: t('Open the confirmation email in this browser to finish signing up.', 'साइन-अप पूरा करने के लिए पुष्टि ईमेल इसी ब्राउज़र में खोलें।', 'సైన్ అప్ పూర్తి చేయడానికి నిర్ధారణ ఈమెయిల్‌ని ఈ బ్రౌజర్‌లో తెరవండి.', 'नोंदणी पूर्ण करण्यासाठी पुष्टी ईमेल याच ब्राउझरमध्ये उघडा.') });
      } else {
        dataOrThrow(await supabase.auth.signInWithPassword(credentials));
      }
    } catch (error) {
      const message = error?.code === 'email_address_not_authorized'
        ? t('Email verification is currently available to project team members. Please use GitHub to sign up.', 'ईमेल पुष्टि अभी प्रोजेक्ट टीम के लिए है। साइन-अप के लिए GitHub इस्तेमाल करें।', 'ఈమెయిల్ నిర్ధారణ ప్రస్తుతం ప్రాజెక్ట్ బృందానికి అందుబాటులో ఉంది. సైన్ అప్ కోసం GitHub వాడండి.', 'ईमेल पुष्टी सध्या प्रकल्प टीमसाठी आहे. नोंदणीसाठी GitHub वापरा.')
        : error?.code === 'invalid_credentials'
          ? t('Check your email and password and try again.', 'ईमेल और पासवर्ड जाँचकर फिर कोशिश करें।', 'ఈమెయిల్, పాస్‌వర్డ్ చూసి మళ్లీ ప్రయత్నించండి.', 'ईमेल व पासवर्ड तपासून पुन्हा प्रयत्न करा.')
          : errorText(error);
      setFeedback({ message, error: true });
    } finally {
      setBusy(false);
    }
  }
  const resetting = recovery && Boolean(account.user);
  return <div className="workspace-auth panel">
    <div className="tile-icon"><ShieldCheck size={24} /></div>
    <h2>{resetting || forgot ? t('Reset your password', 'पासवर्ड रीसेट करें', 'పాస్‌వర్డ్ రీసెట్ చేయండి', 'पासवर्ड रीसेट करा') : create ? t('Create your account', 'अपना खाता बनाएँ', 'మీ ఖాతాను సృష్టించండి', 'तुमचे खाते तयार करा') : t('Sign in to your workspace', 'कार्यक्षेत्र में साइन इन करें', 'వర్క్‌స్పేస్‌లో సైన్ ఇన్ చేయండి', 'कार्यक्षेत्रात साइन इन करा')}</h2>
    <p>{t('Save applications, organise family checks, and keep your documents in a private workspace.', 'आवेदन सहेजें, परिवार की जाँच व्यवस्थित करें और दस्तावेज़ निजी कार्यक्षेत्र में रखें।', 'దరఖాస్తులు, కుటుంబ తనిఖీలు, పత్రాలను ప్రైవేట్ వర్క్‌స్పేస్‌లో ఉంచండి.', 'अर्ज, कुटुंब तपासण्या आणि कागदपत्रे खासगी कार्यक्षेत्रात जतन करा.')}</p>
    {linkError && <p role="alert" className="form-alert">{t('The sign-in link could not be used. Try again in the same browser.', 'साइन-इन लिंक काम नहीं किया। इसी ब्राउज़र में दोबारा कोशिश करें।', 'సైన్ ఇన్ లింక్ పనిచేయలేదు. అదే బ్రౌజర్‌లో మళ్లీ ప్రయత్నించండి.', 'साइन इन दुवा वापरता आला नाही. याच ब्राउझरमध्ये पुन्हा प्रयत्न करा.')}</p>}
    <form className="form-grid single" onSubmit={submit}>
      {!resetting && !forgot && <button className="button outline" type="button" disabled={busy} onClick={github}><Github size={18} />{t('Continue with GitHub', 'GitHub से जारी रखें', 'GitHub తో కొనసాగించండి', 'GitHub सोबत सुरू ठेवा')}</button>}
      {!resetting && <label>{t('Email address', 'ईमेल पता', 'ఈమెయిల్ చిరునామా', 'ईमेल पत्ता')}<input type="email" name="email" required autoComplete="email" /></label>}
      {!forgot && <label>{t('Password', 'पासवर्ड', 'పాస్‌వర్డ్', 'पासवर्ड')}<input type="password" name="password" required minLength={create || resetting ? 8 : 1} autoComplete={create || resetting ? 'new-password' : 'current-password'} /></label>}
      {resetting && <label>{t('Confirm password', 'पासवर्ड की पुष्टि करें', 'పాస్‌వర్డ్ నిర్ధారించండి', 'पासवर्डची पुष्टी करा')}<input type="password" name="confirmPassword" required minLength={8} autoComplete="new-password" /></label>}
      {feedback && <div role="status" className={feedback.error ? 'form-alert' : 'form-success'}>{feedback.message}</div>}
      <button className="button primary" disabled={busy}>{resetting ? local(labels.save, lang) : forgot ? t('Send reset link', 'रीसेट लिंक भेजें', 'రీసెట్ లింక్ పంపండి', 'रीसेट दुवा पाठवा') : create ? t('Create account', 'खाता बनाएँ', 'ఖాతా సృష్టించండి', 'खाते तयार करा') : t('Sign in', 'साइन इन', 'సైన్ ఇన్', 'साइन इन')}</button>
      {!resetting && <button className="text-button" type="button" onClick={() => changeMode(mode === 'signin' ? 'signup' : 'signin')}>{mode !== 'signin' ? t('Back to sign in', 'साइन-इन पर लौटें', 'సైన్ ఇన్‌కు తిరిగి వెళ్ళండి', 'साइन इनकडे परत जा') : t('Create an account', 'खाता बनाएँ', 'ఖాతా సృష్టించండి', 'खाते तयार करा')}</button>}
      {!resetting && mode === 'signin' && <button className="text-button" type="button" onClick={() => changeMode('forgot')}>{t('Forgot your password?', 'पासवर्ड भूल गए?', 'పాస్‌వర్డ్ మర్చిపోయారా?', 'पासवर्ड विसरलात?')}</button>}
    </form>
  </div>;
}

function ApplicationForm({ row, members, lang, save, cancel }) {
  const [selectedMember, setSelectedMember] = useState(row.member_id ?? '');
  const [name, setName] = useState(row.applicant ?? '');
  const t = (...text) => local(copy(...text), lang);
  return <form className="form-grid" onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save({ scheme_id: form.get('scheme'), applicant: name.trim(), member_id: selectedMember || null, reference: form.get('reference').trim(), status: form.get('status') });
  }}>
    <label>{local(labels.scheme, lang)}<SchemeSelect lang={lang} name="scheme" defaultValue={row.scheme_id ?? schemes[0].id} /></label>
    <label>{local(labels.member, lang)}<MemberSelect lang={lang} members={members} value={selectedMember} onChange={(event) => {
      setSelectedMember(event.target.value);
      const member = members.find(({ id }) => id === event.target.value);
      if (member) setName(member.name);
    }} /></label>
    <label>{local(labels.name, lang)}<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label>
    <label>{t('Portal reference (optional)', 'पोर्टल संदर्भ (वैकल्पिक)', 'పోర్టల్ సూచిక (ఐచ్ఛికం)', 'पोर्टल संदर्भ (ऐच्छिक)')}<input name="reference" maxLength={120} defaultValue={row.reference ?? ''} /></label>
    <label>{t('Status', 'स्थिति', 'స్థితి', 'स्थिती')}<select name="status" defaultValue={row.status ?? 'planned'}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{local(label, lang)}</option>)}</select></label>
    <div className="actions form-span"><button className="button primary"><Save size={17} />{local(labels.save, lang)}</button><button type="button" className="button outline" onClick={cancel}>{t('Cancel', 'रद्द करें', 'రద్దు', 'रद्द करा')}</button></div>
  </form>;
}

function Applications({ lang, rows, members, request, mutate, openScheme }) {
  const [editing, setEditing] = useState(() => request?.scheme ? { scheme_id: request.scheme, member_id: request.member?.id, applicant: request.member?.name } : null);
  const t = (...text) => local(copy(...text), lang);
  return <div className="workspace-stack">
    <div className="panel"><div className="panel-heading"><div><h2>{local(labels.applications, lang)}</h2><p>{t('Keep scheme-wise records using status and reference from the official portal.', 'आधिकारिक पोर्टल की स्थिति और संदर्भ से योजना-वार रिकॉर्ड रखें।', 'అధికారిక పోర్టల్ స్థితి, సూచికతో పథకం వారీ రికార్డులు ఉంచండి.', 'अधिकृत पोर्टलची स्थिती व संदर्भ वापरून योजनेनुसार नोंदी ठेवा.')}</p></div><button className="button primary" onClick={() => setEditing({})}><Plus size={18} />{t('Add application', 'आवेदन जोड़ें', 'దరఖాస్తు జోడించండి', 'अर्ज जोडा')}</button></div>
      {editing && <ApplicationForm key={editing.id ?? editing.scheme_id ?? 'new'} row={editing} members={members} lang={lang} cancel={() => setEditing(null)} save={(value) => mutate(async () => {
        const base = supabase.from('applications');
        dataOrThrow(await (editing.id ? base.update({ ...value, updated_at: new Date().toISOString() }).eq('id', editing.id) : base.insert(value)));
        setEditing(null);
      })} />}
    </div>
    {rows.length ? <div className="panel record-list">{rows.map((row) => {
      const scheme = schemeById(row.scheme_id);
      return <article className="record" key={row.id}><div><h3>{local(scheme?.name, lang) || row.scheme_id}</h3><p>{row.applicant}{row.reference && ' · ' + row.reference}</p><span className="state pending">{local(statusLabels[row.status], lang)}</span></div><div className="actions">
        {scheme && <><a className="button outline compact" href={scheme.tracking ?? scheme.portal} target="_blank" rel="noreferrer"><ExternalLink size={15} />{scheme.tracking ? t('Official status', 'आधिकारिक स्थिति', 'అధికారిక స్థితి', 'अधिकृत स्थिती') : local(words.portal, lang)}</a><button className="button outline compact" onClick={() => openScheme(scheme)}>{local(words.steps, lang)}</button></>}
        <button className="button subtle compact" onClick={() => setEditing(row)}>{t('Edit', 'बदलें', 'మార్చండి', 'संपादित करा')}</button><ConfirmDelete lang={lang} onDelete={() => mutate(async () => dataOrThrow(await supabase.from('applications').delete().eq('id', row.id)))} />
      </div></article>;
    })}</div> : <div className="empty"><ClipboardList /><p>{t('Your tracked applications will appear here.', 'आपके ट्रैक किए आवेदन यहाँ दिखेंगे।', 'ట్రాక్ చేసిన దరఖాస్తులు ఇక్కడ కనిపిస్తాయి.', 'मागोवा घेतलेले अर्ज इथे दिसतील.')}</p></div>}
  </div>;
}

function FamilyForm({ lang, member, save, cancel }) {
  const [extra, setExtra] = useState(Boolean(Object.keys(member.facts ?? {}).length));
  const t = (...text) => local(copy(...text), lang);
  return <form className="form-grid" onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const facts = { ...member.facts };
    for (const [key, value] of form.entries()) {
      if (!key.startsWith('fact-')) continue;
      const fact = key.slice(5);
      if (value === '') delete facts[fact];
      else facts[fact] = value === 'true' ? true : value === 'false' ? false : ['money', 'percent'].includes(fields[fact]?.type) ? Number(value) : value;
    }
    save({ name: form.get('name').trim(), relation: form.get('relation').trim(), birth_date: form.get('birth_date') || null, facts });
  }}>
    <label>{local(labels.name, lang)}<input name="name" required maxLength={100} defaultValue={member.name ?? ''} /></label>
    <label>{t('Relationship', 'रिश्ता', 'బంధం', 'नाते')}<input name="relation" required maxLength={40} defaultValue={member.relation ?? ''} placeholder={t('For example, self or parent', 'जैसे स्वयं या माता-पिता', 'ఉదాహరణకు, నేను లేదా తల్లిదండ్రులు', 'उदाहरणार्थ, स्वतः किंवा पालक')} /></label>
    <label>{local(labels.birthDate, lang)}<input name="birth_date" type="date" min="1900-01-01" max={today()} defaultValue={member.birth_date ?? ''} /></label>
    <label className="form-span check-row"><input type="checkbox" checked={extra} onChange={(event) => setExtra(event.target.checked)} />{t('Add optional eligibility facts', 'वैकल्पिक पात्रता विवरण जोड़ें', 'ఐచ్ఛిక అర్హత వివరాలు జోడించండి', 'ऐच्छिक पात्रता माहिती जोडा')}</label>
    {extra && Object.entries(fields).filter(([key]) => key !== 'age').map(([key, field]) => {
      const value = member.facts?.[key];
      const name = 'fact-' + key;
      return <label key={key}>{key === 'aadhaarAge' ? t('Does the birth date match Aadhaar?', 'क्या जन्मतिथि आधार से मेल खाती है?', 'పుట్టిన తేదీ ఆధార్‌కు సరిపోతుందా?', 'जन्मतारीख आधारशी जुळते का?') : local(field.question, lang)}
        {['money', 'percent'].includes(field.type) ? <input name={name} type="number" min="0" max={field.type === 'percent' ? 100 : 1000000000} step={field.type === 'percent' ? 'any' : '1'} defaultValue={value ?? ''} /> :
          <select name={name} defaultValue={value === undefined ? '' : String(value)}><option value="">—</option>{Object.entries(field.options ?? { true: words.yes, false: words.no }).map(([value, label]) => <option key={value} value={value}>{local(label, lang)}</option>)}</select>}
      </label>;
    })}
    <div className="actions form-span"><button className="button primary"><Save size={17} />{local(labels.save, lang)}</button><button type="button" className="button outline" onClick={cancel}>{t('Cancel', 'रद्द करें', 'రద్దు', 'रद्द करा')}</button></div>
  </form>;
}

function Family({ lang, members, applications, mutate, start }) {
  const [editing, setEditing] = useState(null);
  const t = (...text) => local(copy(...text), lang);
  const shownHousehold = new Set();
  const amounts = { annual: 0, once: 0 };
  // Show household-scoped cash only once. Approved entries consume their respective opportunity.
  if (applications.some((row) => row.scheme_id === 'pm-kisan' && row.status === 'approved')) shownHousehold.add('pm-kisan');
  const matches = members.map((member) => {
    const checked = schemes.map((scheme) => evaluate(scheme, memberFacts(member)));
    const eligible = checked.filter(({ state }) => state === 'eligible');
    for (const { scheme } of eligible) {
      if (!scheme.cash || shownHousehold.has(scheme.id) || applications.some((row) => row.member_id === member.id && row.scheme_id === scheme.id && row.status === 'approved')) continue;
      amounts[scheme.cash.cadence] += scheme.cash.amount;
      if (scheme.cash.household) shownHousehold.add(scheme.id);
    }
    return { member, eligible, pending: checked.filter(({ state }) => state === 'pending') };
  });
  const format = (amount) => new Intl.NumberFormat(locales[lang], { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  return <div className="workspace-stack">
    <div className="panel"><div className="panel-heading"><div><h2>{local(labels.family, lang)}</h2><p>{t('Add family members to check likely matches and track upcoming milestones.', 'संभावित योजनाएँ और आगामी पड़ाव देखने के लिए परिवार के सदस्य जोड़ें।', 'సరిపడే పథకాలు, రాబోయే మైలురాళ్ల కోసం కుటుంబ సభ్యులను జోడించండి.', 'संभाव्य योजना व आगामी टप्प्यांसाठी कुटुंब सदस्य जोडा.')}</p></div><button className="button primary" onClick={() => setEditing({})}><Plus size={18} />{t('Add member', 'सदस्य जोड़ें', 'సభ్యుడిని జోడించండి', 'सदस्य जोडा')}</button></div>
      {editing && <FamilyForm key={editing.id ?? 'new'} lang={lang} member={editing} cancel={() => setEditing(null)} save={(value) => mutate(async () => {
        const base = supabase.from('family_members');
        dataOrThrow(await (editing.id ? base.update({ ...value, updated_at: new Date().toISOString() }).eq('id', editing.id) : base.insert(value)));
        setEditing(null);
      })} />}
    </div>
    {members.length > 0 && <div className="estimate"><div><span>{t('Potential annual cash benefits', 'संभावित वार्षिक नकद लाभ', 'సంభావ్య వార్షిక నగదు ప్రయోజనం', 'संभाव्य वार्षिक रोख लाभ')}</span><strong>{format(amounts.annual)}</strong></div><div><span>{t('Potential one-time assistance', 'संभावित एकमुश्त सहायता', 'సంభావ్య ఒకసారి సహాయం', 'संभाव्य एकरकमी सहाय्य')}</span><strong>{format(amounts.once)}</strong></div><p>{t('Estimates use confirmed answers and recorded approvals. Insurance cover, scholarships subject to selection, loans and savings are excluded.', 'अनुमान पुष्ट उत्तरों और दर्ज मंज़ूरी पर आधारित हैं। बीमा, चयन आधारित छात्रवृत्ति, ऋण और बचत शामिल नहीं हैं।', 'అంచనాలు నిర్ధారించిన జవాబులు, ఆమోదాలపై ఆధారితం. బీమా, ఎంపిక ఆధారిత స్కాలర్‌షిప్‌లు, రుణాలు, పొదుపు మినహాయించారు.', 'अंदाज निश्चित उत्तरे व नोंदवलेल्या मंजुरीवर आधारित आहेत. विमा, निवडाधीन शिष्यवृत्ती, कर्ज व बचत वगळली आहेत.')}</p></div>}
    {matches.map(({ member, eligible, pending }) => <div className="panel" key={member.id}><div className="panel-heading"><div><h3>{member.name}</h3><p>{member.relation}{member.birth_date ? ' · ' + member.birth_date : ''}</p></div><div className="actions"><button className="button outline compact" onClick={() => setEditing(member)}>{t('Edit details', 'विवरण बदलें', 'వివరాలు మార్చండి', 'तपशील बदला')}</button><ConfirmDelete lang={lang} onDelete={() => mutate(async () => dataOrThrow(await supabase.from('family_members').delete().eq('id', member.id)))} /></div></div>
      <div className="match-list">{[...eligible, ...pending].map(({ scheme, state }) => <button key={scheme.id} className={'chip ' + (state === 'eligible' ? 'selected' : '')} onClick={() => start([scheme.id], { ...member, facts: memberFacts(member) })}>{local(scheme.name, lang)} <span>{state === 'eligible' ? <Check size={15} /> : '?'}</span></button>)}</div>
      {!eligible.length && <p>{t('No confirmed matches yet. Select a scheme to answer the missing questions.', 'अभी पुष्ट मेल नहीं हैं। बाकी सवालों के लिए योजना चुनें।', 'ఇంకా నిర్ధారించిన పథకాలు లేవు. మిగిలిన ప్రశ్నలకు పథకం ఎంచుకోండి.', 'अद्याप निश्चित जुळणी नाही. उर्वरित प्रश्नांसाठी योजना निवडा.')}</p>}
    </div>)}
  </div>;
}

function exportReminder(reminder) {
  const title = reminder.title.replace(/\\/g, '\\\\').replace(/[\r\n]+/g, ' ').replace(/[;,]/g, '\\$&');
  const day = reminder.due_date.replaceAll('-', '');
  const stamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '');
  const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ARCEUS//Reminder//EN', 'BEGIN:VEVENT', 'UID:' + reminder.id + '@arceus.local', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + day, 'SUMMARY:' + title, 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + title, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
  download(new Blob([calendar], { type: 'text/calendar' }), 'arceus-reminder.ics');
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Reminders({ lang, rows, members, mutate }) {
  const t = (...text) => local(copy(...text), lang);
  const formRef = useRef(null);
  const add = (row, reset = false) => mutate(async () => {
    dataOrThrow(await supabase.from('reminders').insert(row));
    if (reset) formRef.current?.reset();
  });
  const milestones = members.flatMap((member) => memberMilestones(member)).filter((item) => !rows.some((row) => row.member_id === item.member.id && row.scheme_id === item.scheme && row.due_date === item.date));
  return <div className="workspace-stack">
    <div className="panel"><h2>{local(labels.reminders, lang)}</h2><p>{t('Review milestones here or export a calendar reminder for alerts while ARCEUS is closed.', 'यहाँ पड़ाव देखें या ARCEUS बंद होने पर अलर्ट के लिए कैलेंडर रिमाइंडर निर्यात करें।', 'ఇక్కడ మైలురాళ్లు చూడండి లేదా ARCEUS మూసివేసినప్పుడు హెచ్చరికలకు క్యాలెండర్‌కు ఎగుమతి చేయండి.', 'इथे टप्पे पहा किंवा ARCEUS बंद असताना सूचनेसाठी दिनदर्शिकेत निर्यात करा.')}</p>
      <form ref={formRef} className="form-grid" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        add({ title: form.get('title').trim(), due_date: form.get('date'), scheme_id: form.get('scheme') || null, member_id: form.get('member') || null }, true);
      }}><label>{t('Reminder title', 'रिमाइंडर का नाम', 'గుర్తుచేయింపు పేరు', 'स्मरणपत्र शीर्षक')}<input name="title" required maxLength={120} /></label>
        <label>{t('Date', 'तारीख', 'తేదీ', 'तारीख')}<input name="date" type="date" min={today()} required /></label>
        <label>{local(labels.scheme, lang)}<SchemeSelect name="scheme" lang={lang} empty /></label><label>{local(labels.member, lang)}<MemberSelect name="member" members={members} lang={lang} /></label>
        <div className="form-span"><button className="button primary"><Plus size={17} />{t('Add reminder', 'रिमाइंडर जोड़ें', 'గుర్తుచేయింపు జోడించండి', 'स्मरणपत्र जोडा')}</button></div>
      </form>
    </div>
    {milestones.length > 0 && <div className="panel"><h3>{t('Upcoming age milestones', 'आगामी उम्र के पड़ाव', 'రాబోయే వయసు మైలురాళ్లు', 'आगामी वयाचे टप्पे')}</h3>{milestones.map((item) => {
      const scheme = schemeById(item.scheme);
      const title = item.member.name + ' · ' + local(scheme.name, lang);
      return <article className="record" key={item.member.id + item.scheme}><div><b>{title}</b><p>{item.date}</p></div><button className="button outline compact" onClick={() => add({ title: title.slice(0, 120), due_date: item.date, scheme_id: item.scheme, member_id: item.member.id })}>{t('Create reminder', 'रिमाइंडर बनाएँ', 'గుర్తుచేయింపు సృష్టించండి', 'स्मरणपत्र तयार करा')}</button></article>;
    })}</div>}
    {rows.length > 0 && <div className="panel record-list">{rows.map((row) => <article className="record" key={row.id}>
      <div><b>{row.title}</b><p><CalendarDays size={15} /> {row.due_date}</p>{!row.done && row.due_date <= today() && <span className="state pending">{t('Due', 'देय', 'గడువు', 'देय')}</span>}</div>
      <div className="actions"><button className="button outline compact" onClick={() => exportReminder(row)}><Download size={15} />{t('Calendar reminder', 'कैलेंडर रिमाइंडर', 'క్యాలెండర్ గుర్తుచేయింపు', 'दिनदर्शिका स्मरणपत्र')}</button>
        <button className="button subtle compact" onClick={() => mutate(async () => dataOrThrow(await supabase.from('reminders').update({ done: !row.done }).eq('id', row.id)))}>{row.done ? t('Reopen', 'फिर खोलें', 'మళ్లీ తెరవండి', 'पुन्हा उघडा') : t('Mark done', 'पूरा करें', 'పూర్తయింది', 'पूर्ण झाले')}</button><ConfirmDelete lang={lang} onDelete={() => mutate(async () => dataOrThrow(await supabase.from('reminders').delete().eq('id', row.id)))} /></div>
    </article>)}</div>}
  </div>;
}

const blankReview = { name: '', birthDate: '', postalCode: '' };
function Documents({ user, lang, files, drafts, members, mutate }) {
  const [file, setFile] = useState(null);
  const [memberId, setMemberId] = useState('');
  const [review, setReview] = useState(blankReview);
  const [schemeId, setSchemeId] = useState(schemes[0].id);
  const [scanState, setScanState] = useState(null);
  const [scanRunning, setScanRunning] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const fileInput = useRef(null);
  const member = members.find(({ id }) => id === memberId);
  const mismatch = documentMismatches(review, member);
  const t = (...text) => local(copy(...text), lang);

  function selectFile(event) {
    const selected = event.target.files[0];
    setScanState(null);
    if (selected && (!imageMime.includes(selected.type) || selected.size > imageLimit)) {
      setScanState({ error: true, text: t('Choose a JPEG, PNG or WebP image up to 8 MB.', '8 MB तक की JPEG, PNG या WebP छवि चुनें।', '8 MB లోపు JPEG, PNG లేదా WebP ఎంచుకోండి.', '8 MB पर्यंतची JPEG, PNG किंवा WebP प्रतिमा निवडा.') });
      event.target.value = '';
      setFile(null);
      return;
    }
    setFile(selected ?? null);
    setReview(blankReview);
  }

  async function scan() {
    if (!file || scanRunning) return;
    setScanRunning(true);
    setScanState({ text: t('Reading the image on this device…', 'इस डिवाइस पर छवि पढ़ रहे हैं…', 'ఈ పరికరంలో చిత్రాన్ని చదువుతున్నాం…', 'या उपकरणावर प्रतिमा वाचत आहोत…') });
    let worker;
    try {
      const [{ createWorker }, { default: workerPath }] = await Promise.all([
        import('tesseract.js'),
        import('tesseract.js/dist/worker.min.js?url'),
      ]);
      const languages = lang === 'en' ? ['eng'] : [ocrLanguages[lang], 'eng'];
      worker = await createWorker(languages, 1, { workerPath, workerBlobURL: false, cacheMethod: 'none' });
      const { data } = await worker.recognize(file);
      const extracted = extractDocument(data.text);
      setReview(extracted);
      setScanState({ text: Object.values(extracted).some(Boolean)
        ? t('Review the extracted details below before saving.', 'सहेजने से पहले निकाले गए विवरण जाँचें।', 'సేవ్ చేయడానికి ముందు గుర్తించిన వివరాలు తనిఖీ చేయండి.', 'जतन करण्यापूर्वी काढलेले तपशील तपासा.')
        : t('No labelled fields were found. You can enter the details below.', 'लेबल वाले फ़ील्ड नहीं मिले। नीचे विवरण भरें।', 'లేబుల్ ఉన్న వివరాలు దొరకలేదు. కింద నమోదు చేయండి.', 'लेबल असलेली माहिती सापडली नाही. खाली तपशील भरा.') });
    } catch {
      setScanState({ error: true, text: t('Image reading failed. Check your connection for the language model download, or enter details manually.', 'छवि पढ़ी नहीं गई। भाषा मॉडल के लिए कनेक्शन जाँचें या विवरण भरें।', 'చిత్రాన్ని చదవలేకపోయాం. భాషా మోడల్ డౌన్‌లోడ్‌కు కనెక్షన్ చూడండి లేదా వివరాలు నమోదు చేయండి.', 'प्रतिमा वाचता आली नाही. भाषा मॉडेल डाउनलोडसाठी कनेक्शन तपासा किंवा तपशील स्वतः भरा.') });
    } finally {
      if (worker) await worker.terminate();
      setScanRunning(false);
    }
  }

  function upload() {
    if (!file || !documentName.trim()) return;
    const label = new TextEncoder().encode(documentName.trim().replace(/[^\p{L}\p{M}\p{N} ._-]/gu, '-').slice(0, 80)).toBase64({ alphabet: 'base64url', omitPadding: true });
    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
    const path = user.id + '/' + crypto.randomUUID() + '--' + label + '.' + ext;
    mutate(async () => {
      dataOrThrow(await supabase.storage.from(documentBucket).upload(path, file, { contentType: file.type, upsert: false }));
      setFile(null);
      setDocumentName('');
      if (fileInput.current) fileInput.current.value = '';
    });
  }

  return <div className="workspace-stack">
    <div className="panel"><h2>{local(labels.documents, lang)}</h2><p>{t('Extract name, birth date and postal code from a labelled image. You decide whether to save the original privately.', 'लेबल वाली छवि से नाम, जन्मतिथि और पिन कोड निकालें। मूल छवि निजी तौर पर सहेजना आपके हाथ में है।', 'లేబుల్ ఉన్న చిత్రం నుంచి పేరు, పుట్టిన తేదీ, పిన్ కోడ్ తీసుకోండి. అసలు చిత్రాన్ని ప్రైవేట్‌గా సేవ్ చేయాలో మీరు నిర్ణయించండి.', 'लेबल असलेल्या प्रतिमेतून नाव, जन्मतारीख व पिन कोड काढा. मूळ प्रतिमा खासगीरीत्या जतन करायची का ते तुम्ही ठरवा.')}</p>
      <div className="upload-box"><Upload size={23} /><label>{t('Document image', 'दस्तावेज़ की छवि', 'పత్రం చిత్రం', 'कागदपत्राची प्रतिमा')} <small>JPEG / PNG / WebP · 8 MB</small><input ref={fileInput} type="file" accept={imageMime.join(',')} onChange={selectFile} disabled={scanRunning} /></label><button className="button primary" onClick={scan} disabled={!file || scanRunning}><ScanLine size={17} />{t('Extract details', 'विवरण निकालें', 'వివరాలు తీయండి', 'तपशील काढा')}</button></div>
      {file && <form className="form-grid" onSubmit={(event) => { event.preventDefault(); upload(); }}>
        <label>{t('Private file label', 'निजी फ़ाइल लेबल', 'ప్రైవేట్ ఫైల్ లేబుల్', 'खासगी फाइल लेबल')}<input required maxLength={80} value={documentName} onChange={(event) => setDocumentName(event.target.value)} /></label>
        <div className="field-end"><button className="button outline" disabled={scanRunning}><FolderLock size={17} />{t('Save original privately', 'मूल छवि निजी तौर पर सहेजें', 'అసలు చిత్రాన్ని ప్రైవేట్‌గా సేవ్ చేయండి', 'मूळ प्रतिमा खासगीरीत्या जतन करा')}</button></div>
      </form>}
      {scanState && <p role="status" className={scanState.error ? 'form-alert' : 'form-success'}>{scanState.text}</p>}
    </div>
    <div className="panel"><h3>{t('Application preparation form', 'आवेदन तैयारी प्रपत्र', 'దరఖాస్తు సన్నాహక ఫారం', 'अर्ज तयारी फॉर्म')}</h3><p>{t('Review the fields before saving. You can download the draft and copy the details into the official form.', 'सहेजने से पहले फ़ील्ड जाँचें। ड्राफ्ट डाउनलोड करके विवरण आधिकारिक प्रपत्र में भरें।', 'సేవ్ ముందు వివరాలు చూడండి. డ్రాఫ్ట్ డౌన్‌లోడ్ చేసి అధికారిక ఫారంలో వివరాలు నమోదు చేయండి.', 'जतन करण्यापूर्वी माहिती तपासा. मसुदा डाउनलोड करून तपशील अधिकृत फॉर्ममध्ये भरा.')}</p>
      <form className="form-grid" onSubmit={(event) => {
        event.preventDefault();
        mutate(async () => {
          dataOrThrow(await supabase.from('application_drafts').upsert({
            applicant: review.name.trim(), birth_date: review.birthDate || null, postal_code: review.postalCode.trim(), scheme_id: schemeId, updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,scheme_id,applicant' }));
        });
      }}>
        <label>{local(labels.scheme, lang)}<SchemeSelect lang={lang} value={schemeId} onChange={(event) => setSchemeId(event.target.value)} /></label>
        <label>{t('Compare with family member', 'परिवार के सदस्य से मिलाएँ', 'కుటుంబ సభ్యుడితో పోల్చండి', 'कुटुंब सदस्याशी तुलना करा')}<MemberSelect lang={lang} members={members} value={memberId} onChange={(event) => setMemberId(event.target.value)} /></label>
        <label>{local(labels.name, lang)}<input required maxLength={100} value={review.name} onChange={(event) => setReview({ ...review, name: event.target.value })} /></label>
        <label>{local(labels.birthDate, lang)}<input type="date" min="1900-01-01" max={today()} value={review.birthDate} onChange={(event) => setReview({ ...review, birthDate: event.target.value })} /></label>
        <label>{local(labels.postalCode, lang)}<input inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} value={review.postalCode} onChange={(event) => setReview({ ...review, postalCode: event.target.value })} /></label>
        {mismatch.length > 0 && <div className="form-alert form-span" role="status">{t('These fields differ from the saved family profile. Check the original before relying on the eligibility result.', 'ये फ़ील्ड सहेजे गए पारिवारिक प्रोफ़ाइल से अलग हैं। पात्रता परिणाम पर भरोसा करने से पहले मूल दस्तावेज़ जाँचें।', 'ఈ ఫీల్డ్‌లు కుటుంబ ప్రొఫైల్‌తో సరిపోలడం లేదు. అర్హత ఫలితానికి ముందు అసలు పత్రం చూడండి.', 'हे तपशील जतन केलेल्या कुटुंब नोंदीशी जुळत नाहीत. पात्रता निकाल वापरण्याआधी मूळ दस्तऐवज तपासा.')} <strong>{mismatch.map((key) => local(labels[key], lang)).join(', ')}</strong></div>}
        <div className="form-span"><button className="button primary"><Save size={17} />{t('Save draft', 'ड्राफ्ट सहेजें', 'డ్రాఫ్ట్ సేవ్ చేయండి', 'मसुदा जतन करा')}</button></div>
      </form>
    </div>
    {drafts.length > 0 && <div className="panel"><h3>{t('Saved drafts', 'सहेजे गए ड्राफ्ट', 'సేవ్ చేసిన డ్రాఫ్ట్‌లు', 'जतन केलेले मसुदे')}</h3>{drafts.map((row) => {
      const scheme = schemeById(row.scheme_id);
      return <article className="record" key={row.id}><div><b>{row.applicant}</b><p>{local(scheme?.name, lang)}</p></div><div className="actions"><button className="button outline compact" onClick={() => {
        setReview({ name: row.applicant, birthDate: row.birth_date ?? '', postalCode: row.postal_code }); setSchemeId(row.scheme_id);
      }}>{t('Load draft', 'ड्राफ्ट खोलें', 'డ్రాఫ్ట్ తెరవండి', 'मसुदा उघडा')}</button><button className="button outline compact" onClick={() => {
        const content = [local(scheme?.name, lang), row.applicant, row.birth_date, row.postal_code, scheme?.portal].filter(Boolean).join('\n');
        download(new Blob([content], { type: 'text/plain;charset=utf-8' }), 'arceus-application-draft.txt');
      }}><Download size={15} />{t('Download', 'डाउनलोड', 'డౌన్‌లోడ్', 'डाउनलोड')}</button><ConfirmDelete lang={lang} onDelete={() => mutate(async () => dataOrThrow(await supabase.from('application_drafts').delete().eq('id', row.id)))} /></div></article>;
    })}</div>}
    {files.length > 0 && <div className="panel"><h3>{t('Saved originals', 'सहेजे गए मूल दस्तावेज़', 'సేవ్ చేసిన అసలు పత్రాలు', 'जतन केलेली मूळ कागदपत्रे')}</h3>{files.map((row) => {
      const encoded = row.name.match(/^[a-f0-9-]+--([A-Za-z0-9_-]+)\.(jpg|png|webp)$/i);
      let filename = row.name;
      if (encoded) {
        try {
          filename = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.fromBase64(encoded[1], { alphabet: 'base64url' })) + '.' + encoded[2];
        } catch { /* Use the stored name if the label cannot be decoded. */ }
      }
      const path = user.id + '/' + row.name;
      return <article className="record" key={row.id}><div className="record-file"><FileText size={19} /><b>{filename}</b></div><div className="actions"><button className="button outline compact" onClick={() => mutate(async () => {
        const blob = dataOrThrow(await supabase.storage.from(documentBucket).download(path));
        download(blob, filename);
      }, false)}><Download size={15} />{t('Download', 'डाउनलोड', 'డౌన్‌లోడ్', 'डाउनलोड')}</button><ConfirmDelete lang={lang} onDelete={() => mutate(async () => dataOrThrow(await supabase.storage.from(documentBucket).remove([path])))} /></div></article>;
    })}</div>}
  </div>;
}

const emptyData = { applications: [], family: [], reminders: [], drafts: [], files: [] };

function SignedWorkspace({ lang, user, request, start, openScheme }) {
  const [tab, setTab] = useState(request?.tab ?? 'applications');
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const running = useRef(false);
  const t = (...text) => local(copy(...text), lang);

  async function fetchData() {
    const result = await Promise.all([
      supabase.from('applications').select('*').order('updated_at', { ascending: false }),
      supabase.from('family_members').select('*').order('updated_at', { ascending: false }),
      supabase.from('reminders').select('*').order('due_date'),
      supabase.from('application_drafts').select('*').order('updated_at', { ascending: false }),
      listDocuments(),
    ]);
    const [applications, family, reminders, drafts, files] = result.map(dataOrThrow);
    return { applications, family, reminders, drafts, files };
  }
  async function listDocuments() {
    const files = [];
    const bucket = supabase.storage.from(documentBucket);
    while (true) {
      const { data: batch, error } = await bucket.list(user.id, { limit: 100, offset: files.length, sortBy: { column: 'name', order: 'asc' } });
      if (error) return { error };
      files.push(...batch);
      if (batch.length < 100) return { data: files, error: null };
    }
  }
  useEffect(() => {
    let mounted = true;
    fetchData().then((result) => { if (mounted) setData(result); })
      .catch((error) => { if (mounted) setStatus({ error: errorText(error) }); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => { if (request?.tab) setTab(request.tab); }, [request]);

  async function mutate(operation, refresh = true) {
    if (running.current) return;
    running.current = true;
    setStatus({ busy: true });
    let completed = false;
    try {
      await operation();
      completed = true;
      if (refresh) setData(await fetchData());
      setStatus({ success: true });
    } catch (error) {
      setStatus({ error: errorText(error), refreshFailed: completed });
    } finally {
      running.current = false;
    }
  }

  const due = data.reminders.filter((row) => !row.done && row.due_date <= today()).length;
  return <>
    <div className="workspace-toolbar"><div className="filters">{Object.entries(tabs).map(([key, Icon]) => <button className={'chip ' + (tab === key ? 'selected' : '')} key={key} onClick={() => { setTab(key); if (!running.current) setStatus(null); }}><Icon size={17} />{local(labels[key], lang)}{key === 'reminders' && due > 0 && <span className="count">{due}</span>}</button>)}</div><button className="button outline compact" onClick={async () => {
      try { dataOrThrow(await supabase.auth.signOut()); } catch (error) { setStatus({ error: errorText(error) }); }
    }}><LogOut size={16} />{t('Sign out', 'साइन आउट', 'సైన్ అవుట్', 'साइन आउट')}</button></div>
    {status && <div role="status" className={status.error ? 'form-alert' : 'form-success'}>{status.error ? (status.refreshFailed ? t('The change was saved, but the list could not refresh. ', 'बदलाव सहेजा गया, लेकिन सूची रीफ़्रेश नहीं हुई। ', 'మార్పు సేవ్ అయింది, జాబితా రిఫ్రెష్ కాలేదు. ', 'बदल जतन झाला, पण यादी अद्ययावत झाली नाही. ') : '') + status.error
      : status.busy ? t('Working…', 'काम जारी…', 'పని జరుగుతోంది…', 'काम सुरू आहे…') : t('Done.', 'पूरा हुआ।', 'పూర్తయింది.', 'पूर्ण झाले.')}
      {status.error && <button className="text-button" onClick={() => mutate(async () => {}, true)}>{t('Refresh records', 'रिकॉर्ड रीफ़्रेश करें', 'రికార్డులు రిఫ్రెష్ చేయండి', 'नोंदी अद्ययावत करा')}</button>}
    </div>}
    {loading ? <div className="empty" role="status">{t('Loading your workspace…', 'कार्यक्षेत्र लोड हो रहा है…', 'వర్క్‌స్పేస్ లోడ్ అవుతోంది…', 'कार्यक्षेत्र उघडत आहे…')}</div>
      : <fieldset className="workspace-content" disabled={status?.busy}>
        {tab === 'applications' && <Applications lang={lang} request={request} rows={data.applications} members={data.family} mutate={mutate} openScheme={openScheme} />}
        {tab === 'family' && <Family lang={lang} members={data.family} applications={data.applications} mutate={mutate} start={start} />}
        {tab === 'reminders' && <Reminders lang={lang} rows={data.reminders} members={data.family} mutate={mutate} />}
        {tab === 'documents' && <Documents lang={lang} user={user} files={data.files} drafts={data.drafts} members={data.family} mutate={mutate} />}
      </fieldset>}
  </>;
}

export function Workspace({ lang, account, request, start, openScheme }) {
  const [recovered, setRecovered] = useState(false);
  const t = (...text) => local(copy(...text), lang);
  return <section className="wrap page-section workspace-page">
    <div className="eyebrow"><span />{t('YOUR PRIVATE RECORDS', 'आपके निजी रिकॉर्ड', 'మీ ప్రైవేట్ రికార్డులు', 'तुमच्या खासगी नोंदी')}</div>
    <h1 className="page-title">{t('My workspace', 'मेरा कार्यक्षेत्र', 'నా వర్క్‌స్పేస్', 'माझे कार्यक्षेत्र')}</h1>
    {account.loading ? <div className="empty" role="status">{t('Checking your account…', 'खाता जाँच रहे हैं…', 'ఖాతా తనిఖీ జరుగుతోంది…', 'खाते तपासत आहोत…')}</div>
      : !account.configured ? <div className="empty"><FolderLock /><p>{t('Connect Supabase to enable private records.', 'निजी रिकॉर्ड के लिए Supabase कनेक्ट करें।', 'ప్రైవేట్ రికార్డులకు Supabase కనెక్ట్ చేయండి.', 'खासगी नोंदींसाठी Supabase जोडा.')}</p></div>
      : !account.user || (account.recovery && !recovered) ? <AuthPanel lang={lang} account={account} recovery={account.recovery && !recovered} onRecovered={() => {
        window.history.replaceState(null, '', '/#workspace');
        setRecovered(true);
      }} /> : <SignedWorkspace key={account.user.id} lang={lang} user={account.user} request={request} start={start} openScheme={openScheme} />}
  </section>;
}
