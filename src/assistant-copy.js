import { copy, local } from './languages.js';
import { fields, schemes } from './catalog.js';
import { scopeName } from './eligibility.js';

export const words = {
  yes: copy('Yes', 'हाँ', 'అవును', 'होय'),
  no: copy('No', 'नहीं', 'కాదు', 'नाही'),
  skip: copy('Skip', 'छोड़ें', 'దాటవేయండి', 'वगळा'),
  eligible: copy('Likely eligible', 'संभावित पात्र', 'అర్హత ఉండవచ్చు', 'बहुधा पात्र'),
  ineligible: copy('Criteria not met', 'मानदंड पूरे नहीं', 'ప్రమాణాలు నెరవేరలేదు', 'निकष पूर्ण नाहीत'),
  pending: copy('More details needed', 'और जानकारी चाहिए', 'మరిన్ని వివరాలు కావాలి', 'आणखी माहिती हवी'),
  welcome: copy('Namaste! Tell me which scheme you want to check, or what kind of help you need. You can speak or type.', 'नमस्ते! आप कौन-सी योजना जाँचना चाहते हैं या किस तरह की मदद चाहिए? बोलें या लिखें।', 'నమస్తే! ఏ పథకం చూడాలి లేదా ఎలాంటి సహాయం కావాలో చెప్పండి. మాట్లాడవచ్చు లేదా టైప్ చేయవచ్చు.', 'नमस्कार! कोणती योजना तपासायची आहे किंवा कोणती मदत हवी ते सांगा. तुम्ही बोलू किंवा लिहू शकता.'),
  discover: copy('Which type of help are you looking for? Try farming, education, healthcare, insurance, business loans, marriage or savings.', 'किस तरह की मदद चाहिए? कृषि, शिक्षा, स्वास्थ्य, बीमा, व्यवसाय ऋण, विवाह या बचत में से चुनें।', 'ఏ సహాయం కావాలి? వ్యవసాయం, విద్య, ఆరోగ్యం, బీమా, వ్యాపార రుణం, వివాహం లేదా పొదుపు ఎంచుకోండి.', 'कोणती मदत हवी आहे? शेती, शिक्षण, आरोग्य, विमा, व्यवसाय कर्ज, लग्न किंवा बचत निवडा.'),
  unclear: copy('I need a clearer answer.', 'कृपया थोड़ा स्पष्ट जवाब दें।', 'దయచేసి మరింత స్పష్టంగా చెప్పండి.', 'कृपया थोडे स्पष्ट उत्तर द्या.'),
  conflict: copy('I heard conflicting answers. Please confirm one answer.', 'आपके जवाब अलग-अलग हैं। कृपया एक सही जवाब बताएँ।', 'పరస్పర విరుద్ధమైన సమాధానాలు వచ్చాయి. దయచేసి ఒక్క సమాధానం నిర్ధారించండి.', 'परस्परविरोधी उत्तरे मिळाली. कृपया एक उत्तर निश्चित करा.'),
  steps: copy('Application steps', 'आवेदन के चरण', 'దరఖాస్తు దశలు', 'अर्जाच्या पायऱ्या'),
  docs: copy('Documents to prepare', 'ज़रूरी दस्तावेज़', 'సిద్ధం చేయాల్సిన పత్రాలు', 'तयार ठेवायची कागदपत्रे'),
  source: copy('Official rules', 'आधिकारिक नियम', 'అధికారిక నియమాలు', 'अधिकृत नियम'),
  portal: copy('Open official portal', 'आधिकारिक पोर्टल खोलें', 'అధికారిక పోర్టల్ తెరవండి', 'अधिकृत पोर्टल उघडा'),
  confirmPortal: copy('Confirm the current requirements with the official portal before applying.', 'आवेदन से पहले पोर्टल पर वर्तमान शर्तें जाँचें।', 'దరఖాస్తుకు ముందు పోర్టల్‌లో ప్రస్తుత నిబంధనలు చూడండి.', 'अर्जापूर्वी पोर्टलवरील सध्याच्या अटी तपासा.'),
  single: copy('Reply yes or no, or skip if unsure.', 'हाँ या नहीं कहें। पता न हो तो छोड़ें।', 'అవును లేదా కాదు చెప్పండి. తెలియకపోతే దాటవేయండి.', 'होय किंवा नाही सांगा. माहीत नसल्यास वगळा.'),
  sayNumber: copy('Give one exact number, or skip if unsure.', 'एक सही संख्या बताएँ। पता न हो तो छोड़ें।', 'ఒక్క ఖచ్చితమైన సంఖ్య చెప్పండి. తెలియకపోతే దాటవేయండి.', 'एक अचूक संख्या सांगा. माहीत नसल्यास वगळा.'),
  speakError: copy('Read-aloud is unavailable for this language on this device. You can keep chatting here.', 'इस डिवाइस पर इस भाषा में आवाज़ उपलब्ध नहीं है। आप यहाँ लिखकर बात कर सकते हैं।', 'ఈ పరికరంలో ఈ భాషకు మాట అందుబాటులో లేదు. ఇక్కడ టైప్ చేసి కొనసాగించండి.', 'या उपकरणावर या भाषेतील आवाज उपलब्ध नाही. इथे लिहून संवाद सुरू ठेवा.'),
  micError: copy('The microphone or speech service is unavailable. Check permission or type your reply.', 'माइक्रोफ़ोन या बोलने की सेवा उपलब्ध नहीं है। अनुमति जाँचें या जवाब लिखें।', 'మైక్ లేదా మాట గుర్తింపు అందుబాటులో లేదు. అనుమతి చూడండి లేదా టైప్ చేయండి.', 'मायक्रोफोन किंवा वाणी सेवा उपलब्ध नाही. परवानगी तपासा किंवा उत्तर लिहा.'),
  micUnsupported: copy('This browser does not offer speech recognition. Try Chrome or Edge, or type below.', 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। Chrome या Edge आज़माएँ या नीचे लिखें।', 'ఈ బ్రౌజర్‌లో మాట గుర్తింపు లేదు. Chrome లేదా Edge ప్రయత్నించండి లేదా టైప్ చేయండి.', 'या ब्राउझरमध्ये वाणी ओळख उपलब्ध नाही. Chrome किंवा Edge वापरा किंवा खाली लिहा.'),
};

export function questionText(reply, lang) {
  const field = fields[reply.key];
  const scope = scopeName(reply.schemeIds, lang);
  const preface = reply.issue ? local(words[reply.issue], lang) : '';
  const options = field.options ? Object.values(field.options).map((option) => local(option, lang)).join(' / ') : '';
  const advice = field.type === 'boolean' ? local(words.single, lang) : options || (reply.issue && local(words.sayNumber, lang)) || '';
  const values = reply.values?.length ? '(' + reply.values.map((value) => typeof value === 'boolean' ? local(words[value ? 'yes' : 'no'], lang) : field.options ? local(field.options[value], lang) : value).join(' / ') + ')' : '';
  return { scope, preface, values, prompt: local(field.question, lang), advice };
}

export function spokenReply(reply, lang) {
  if (reply.kind === 'question') {
    const { scope, preface, prompt, advice } = questionText(reply, lang);
    return [scope, preface, prompt, advice].filter(Boolean).join(' ');
  }
  if (reply.kind === 'result') {
    return reply.results.map(({ scheme, state, evidence }) => {
      const reasons = evidence.filter((item) => item.state === (state === 'eligible' ? 'pass' : state === 'ineligible' ? 'fail' : 'unknown'));
      return [local(scheme.name, lang), local(words[state], lang), ...reasons.map(({ rule }) => local(rule.label, lang))].join('. ');
    }).join('. ') + '. ' + local(words.confirmPortal, lang);
  }
  if (reply.kind === 'guide') {
    return schemes.filter(({ id }) => reply.schemeIds.includes(id)).map((scheme) =>
      [local(scheme.name, lang), local(words.steps, lang), ...scheme.steps.map((step) => local(step, lang)), local(words.docs, lang), ...scheme.docs.map((doc) => local(doc, lang))].join('. ')).join('. ');
  }
  return local(words[reply.kind], lang);
}
