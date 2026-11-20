export const bi = (en, hi) => ({ en, hi });
const four = (en, hi, te, mr) => ({ en, hi, te, mr });

export const categories = {
  agriculture: bi('Agriculture', 'कृषि'),
  education: bi('Education', 'शिक्षा'),
  health: bi('Healthcare', 'स्वास्थ्य'),
  business: bi('Business & loans', 'व्यवसाय और ऋण'),
  marriage: bi('Marriage', 'विवाह'),
  insurance: bi('Insurance', 'बीमा'),
  savings: bi('Savings', 'बचत'),
  utilities: four('Utilities', 'उपयोगिता सेवाएँ', 'ప్రాథమిక సేవలు', 'मूलभूत सेवा'),
};

const field = (en, hi, type = 'boolean', options) => ({ question: bi(en, hi), type, options });
const yesNo = (en, hi, te, mr) => ({ type: 'boolean', question: four(en, hi, te, mr) });
export const fields = {
  age: field('How old is the person applying, in completed years?', 'आवेदक की पूरी उम्र कितने साल है?', 'age'),
  indian: field('Is the applicant an Indian citizen?', 'क्या आवेदक भारतीय नागरिक है?'),
  land: field('Does the farmer family have eligible cultivable land recorded in its name, or qualifying community land certification in the Northeast?', 'क्या किसान परिवार के नाम खेती योग्य ज़मीन दर्ज है, या पूर्वोत्तर में मान्य सामुदायिक भूमि प्रमाणपत्र है?'),
  kisanExcluded: field('Does any PM-KISAN exclusion apply to the family, such as income tax paid last assessment year, a covered public post, government job, pension, or practising registered profession? Check the official exclusions if unsure.', 'क्या परिवार पर पीएम-किसान का कोई अपवर्जन लागू है, जैसे पिछले आकलन वर्ष में आयकर, निर्धारित सार्वजनिक पद, सरकारी नौकरी, पेंशन या पंजीकृत पेशा? संदेह हो तो आधिकारिक सूची देखें।'),
  bank: field('Does the applicant have an eligible savings bank or post office account?', 'क्या आवेदक के पास पात्र बैंक या डाकघर बचत खाता है?'),
  aadhaarAge: field('How old is the applicant according to Aadhaar?', 'आधार के अनुसार आवेदक की उम्र कितनी है?', 'age'),
  inIndia: field('Does the applicant live in India?', 'क्या आवेदक भारत में रहता है?'),
  micro: field('Is the loan for an income-generating microenterprise, including allied activities like dairy or poultry?', 'क्या ऋण आय कमाने वाले सूक्ष्म उद्यम के लिए है, जैसे डेयरी या पोल्ट्री?'),
  loan: field('How much do you need to borrow, in rupees?', 'आपको कितने रुपये का ऋण चाहिए?', 'money'),
  repaidTarun: field('Have you successfully repaid a previous MUDRA Tarun loan?', 'क्या आपने पिछला मुद्रा तरुण ऋण पूरा चुका दिया है?'),
  state: field('Which state does the applicant live in? For this scheme, say Telangana or another state.', 'आवेदक किस राज्य में रहता है? इस योजना के लिए तेलंगाना या अन्य राज्य कहें।', 'choice', { telangana: bi('Telangana', 'तेलंगाना'), other: bi('Another state', 'अन्य राज्य') }),
  bride: field('Is this for an unmarried bride preparing for marriage?', 'क्या यह विवाह की तैयारी कर रही अविवाहित दुल्हन के लिए है?'),
  group: field('Which group applies to the bride?', 'दुल्हन किस वर्ग से है?', 'choice', { scst: bi('SC or ST', 'एससी या एसटी'), bcebc: bi('BC or EBC', 'बीसी या ईबीसी'), minority: bi('Minority / Shaadi Mubarak', 'अल्पसंख्यक / शादी मुबारक'), other: bi('Other', 'अन्य') }),
  rural: field('Does the applicant live in a rural area?', 'क्या आवेदक ग्रामीण क्षेत्र में रहता है?'),
  income: field('What is the combined annual parental income in rupees?', 'माता-पिता की कुल वार्षिक आय कितने रुपये है?', 'money'),
  eight: field('Is the student in Class 8 and applying for fresh selection?', 'क्या छात्र आठवीं कक्षा में है और पहली बार चयन के लिए आवेदन कर रहा है?'),
  school: field('Is the student in an eligible government, government-aided, or local-body school, outside the excluded residential, KVS and NVS schools?', 'क्या छात्र पात्र सरकारी, सहायता प्राप्त या स्थानीय निकाय के स्कूल में है, और अपवर्जित आवासीय, केवीएस या एनवीएस स्कूल में नहीं है?'),
  marks: field('What percentage did the student get in Class 7?', 'सातवीं कक्षा में छात्र के कितने प्रतिशत अंक थे?', 'percent'),
  scst: field('Does the student belong to SC or ST?', 'क्या छात्र अनुसूचित जाति या अनुसूचित जनजाति से है?'),
  girl: field('Are you opening this account as the parent or legal guardian of a girl?', 'क्या आप किसी लड़की के माता-पिता या कानूनी अभिभावक के रूप में खाता खोल रहे हैं?'),
  newSukanya: field('Does the girl have no existing Sukanya account, and is she within the family account limit including any multiple-birth exception?', 'क्या लड़की का पहले से सुकन्या खाता नहीं है और परिवार की खाता सीमा पूरी होती है, जुड़वाँ या एक साथ कई जन्म के अपवाद सहित?'),
  taxpayer: yesNo('Does or did the applicant pay Indian income tax?', 'क्या आवेदक ने कभी भारतीय आयकर चुकाया है?', 'దరఖాస్తుదారు ఎప్పుడైనా భారత ఆదాయ పన్ను చెల్లించారా?', 'अर्जदाराने कधी भारतीय आयकर भरला आहे का?'),
  newApy: yesNo('Is this a new Atal Pension account, with no existing APY account?', 'क्या यह नया अटल पेंशन खाता है और पहले से APY खाता नहीं है?', 'ఇది కొత్త అటల్ పెన్షన్ ఖాతానా, ఇప్పటికే APY ఖాతా లేదా?', 'हे नवीन अटल पेन्शन खाते आहे का आणि आधी APY खाते नाही ना?'),
  woman: yesNo('Is the applicant a woman?', 'क्या आवेदक महिला है?', 'దరఖాస్తుదారు మహిళా?', 'अर्जदार महिला आहे का?'),
  deprivation: yesNo('Does the household qualify under the Ujjwala deprivation declaration?', 'क्या परिवार उज्ज्वला वंचना घोषणा के अनुसार पात्र है?', 'ఉజ్వల దారిద్ర్య ప్రకటన ప్రకారం కుటుంబం అర్హమా?', 'उज्ज्वला वंचितता घोषणेनुसार कुटुंब पात्र आहे का?'),
  lpg: yesNo('Does anyone in the same household already have an LPG connection?', 'क्या उसी परिवार में किसी के पास पहले से LPG कनेक्शन है?', 'అదే కుటుంబంలో ఎవరికైనా ఇప్పటికే LPG కనెక్షన్ ఉందా?', 'त्याच कुटुंबातील कोणाकडे आधीपासून LPG जोडणी आहे का?'),
  artisan: yesNo('Does the applicant currently work independently in an eligible traditional trade, using hands and tools in the unorganised sector?', 'क्या आवेदक अभी असंगठित क्षेत्र में हाथ और औज़ार से पात्र पारंपरिक काम स्वरोज़गार में करता है?', 'అసంఘటిత రంగంలో చేతులు, పరికరాలతో అర్హమైన సంప్రదాయ వృత్తి స్వయం ఉపాధిగా చేస్తున్నారా?', 'अर्जदार असंघटित क्षेत्रात हात आणि साधनांनी पात्र पारंपरिक व्यवसाय स्वयंरोजगाराने करतो का?'),
  vishFamily: yesNo('Is the applicant the only person in the family applying, with no family member in government service?', 'क्या परिवार में केवल आवेदक आवेदन कर रहा है और कोई सरकारी सेवा में नहीं है?', 'కుటుంబంలో ఒక్కరే దరఖాస్తు చేస్తున్నారా, ఎవరూ ప్రభుత్వ ఉద్యోగంలో లేరా?', 'कुटुंबातील एकच व्यक्ती अर्ज करत आहे आणि कोणी सरकारी सेवेत नाही का?'),
  vishCredit: yesNo('In the last five years, did the applicant receive a similar business or self-employment loan other than fully repaid MUDRA or PM SVANidhi?', 'क्या पिछले पाँच साल में पूरी तरह चुकाए गए मुद्रा या पीएम स्वनिधि के अलावा समान ऋण लिया है?', 'గత ఐదేళ్లలో పూర్తిగా చెల్లించిన ముద్ర లేదా పీఎం స్వనిధి మినహా ఇలాంటి రుణం తీసుకున్నారా?', 'मागील पाच वर्षांत पूर्ण फेडलेल्या मुद्रा किंवा पीएम स्वनिधीखेरीज अशा प्रकारचे कर्ज घेतले का?'),
};

const rule = (key, op, value, en, hi) => ({ key, op, value, label: bi(en, hi) });
const yes = (key, en, hi) => rule(key, 'eq', true, en, hi);
const no = (key, en, hi) => rule(key, 'eq', false, en, hi);
const scheme = (id, category, name, summary, benefit, source, portal, aliases, rules, docs, steps, cash) =>
  ({ id, category, name, summary, benefit, source, portal, aliases, rules, docs, steps, cash,
    tracking: id === 'pm-kisan' ? 'https://www.pmkisan.gov.in/BeneficiaryStatus_New.aspx' : undefined });

export const schemes = [
  scheme('pm-kisan', 'agriculture', bi('PM-KISAN', 'पीएम-किसान'), bi('Income support for landholding farmer families.', 'भूमिधारक किसान परिवारों के लिए आय सहायता।'), bi('₹6,000 per family per year', '₹6,000 प्रति परिवार प्रति वर्ष'),
    'https://www.myscheme.gov.in/schemes/pm-kisan', 'https://pmkisan.gov.in/', /pm[\s-]*kisan|kisan samman|किसान सम्मान|पीएम[\s-]*किसान/iu,
    [yes('land', 'Eligible cultivable land or community land certification', 'पात्र कृषि भूमि या सामुदायिक भूमि प्रमाणपत्र'), yes('indian', 'Indian citizenship', 'भारतीय नागरिकता'), no('kisanExcluded', 'No official exclusions apply', 'कोई आधिकारिक अपवर्जन लागू नहीं')],
    [bi('Aadhaar, bank details and land record or accepted certification', 'आधार, बैंक विवरण और भूमि रिकॉर्ड या मान्य प्रमाणपत्र')],
    [bi('Open Farmers Corner and select New Farmer Registration.', 'फार्मर्स कॉर्नर में नया किसान पंजीकरण चुनें।'), bi('Enter the requested details, submit, and complete e-KYC. Use Know Your Status to track it.', 'माँगा गया विवरण भरें, जमा करें और ई-केवाईसी पूरी करें। स्थिति के लिए Know Your Status खोलें।')], { amount: 6000, cadence: 'annual', household: true }),

  scheme('vay-vandana', 'health', bi('Ayushman Vay Vandana', 'आयुष्मान वय वंदना'), bi('Hospitalisation cover under Ayushman Bharat for senior citizens.', 'वरिष्ठ नागरिकों के लिए आयुष्मान भारत में अस्पताल उपचार कवर।'), bi('Up to ₹5 lakh health cover', '₹5 लाख तक स्वास्थ्य कवर'),
    'https://nha.gov.in/img/resources/English_FAQs_related_to_the_benefits_for_senior_citizens.pdf', 'https://beneficiary.nha.gov.in/', /vay vandana|ayushman|pm[\s-]*jay|आयुष्मान|वय वंदना/iu,
    [rule('aadhaarAge', 'gte', 70, 'Age 70 or older as recorded in Aadhaar', 'आधार में उम्र 70 वर्ष या अधिक'), yes('inIndia', 'Resident of India', 'भारत का निवासी')],
    [bi('Aadhaar for e-KYC', 'ई-केवाईसी के लिए आधार')],
    [bi('Open the NHA beneficiary portal or visit an empanelled hospital.', 'एनएचए लाभार्थी पोर्टल खोलें या सूचीबद्ध अस्पताल जाएँ।'), bi('Complete Aadhaar e-KYC and follow the instructions to get the senior citizen card.', 'आधार ई-केवाईसी पूरी करके वरिष्ठ नागरिक कार्ड के निर्देशों का पालन करें।')]),

  scheme('pmsby', 'insurance', bi('PM Suraksha Bima Yojana', 'प्रधानमंत्री सुरक्षा बीमा योजना'), bi('Low-cost accidental death and disability insurance.', 'कम लागत का दुर्घटना मृत्यु और दिव्यांगता बीमा।'), bi('Up to ₹2 lakh accident cover', '₹2 लाख तक दुर्घटना कवर'),
    'https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=158322&lang=1&reg=22', 'https://jansuraksha.gov.in/', /pmsby|suraksha|accident insurance|सुरक्षा बीमा|दुर्घटना बीमा/iu,
    [rule('age', 'between', [18, 70], 'Age 18 through 70 at enrolment', 'नामांकन के समय उम्र 18 से 70 वर्ष'), yes('bank', 'Eligible savings account for auto-debit', 'ऑटो-डेबिट के लिए पात्र बचत खाता')],
    [bi('Savings account and enrolment / auto-debit consent', 'बचत खाता और नामांकन / ऑटो-डेबिट सहमति')],
    [bi('Ask your participating bank or post office for PMSBY enrolment.', 'भाग लेने वाले बैंक या डाकघर से पीएमएसबीवाई नामांकन का अनुरोध करें।'), bi('Submit the consent form and confirm the premium and cover dates.', 'सहमति प्रपत्र जमा करें और प्रीमियम तथा कवर की तारीखें जाँचें।')]),

  scheme('pmjjby', 'insurance', bi('PM Jeevan Jyoti Bima Yojana', 'प्रधानमंत्री जीवन ज्योति बीमा योजना'), bi('Renewable term life insurance through a savings account.', 'बचत खाते के माध्यम से नवीकरणीय जीवन बीमा।'), bi('₹2 lakh life cover', '₹2 लाख जीवन बीमा कवर'),
    'https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=158322&lang=1&reg=22', 'https://jansuraksha.gov.in/', /pmjjby|jeevan jyoti|life insurance|जीवन (ज्योति|बीमा)/iu,
    [rule('age', 'between', [18, 50], 'Age 18 through 50 for new enrolment', 'नए नामांकन के लिए उम्र 18 से 50 वर्ष'), yes('bank', 'Eligible savings account for auto-debit', 'ऑटो-डेबिट के लिए पात्र बचत खाता')],
    [bi('Savings account, nominee details and auto-debit consent', 'बचत खाता, नामांकित व्यक्ति का विवरण और ऑटो-डेबिट सहमति')],
    [bi('Request PMJJBY enrolment at a participating bank or post office.', 'भाग लेने वाले बैंक या डाकघर में पीएमजेजेबीवाई नामांकन का अनुरोध करें।'), bi('Provide nomination and auto-debit consent, then confirm the policy start date.', 'नामांकन और ऑटो-डेबिट की सहमति दें, फिर पॉलिसी शुरू होने की तारीख जाँचें।')]),

  scheme('mudra', 'business', bi('Pradhan Mantri MUDRA Yojana', 'प्रधानमंत्री मुद्रा योजना'), bi('Collateral-free credit for eligible microenterprises.', 'पात्र सूक्ष्म उद्यमों के लिए बिना गिरवी का ऋण।'), bi('Up to ₹20 lakh, subject to tier and lender approval', 'श्रेणी और ऋणदाता की मंज़ूरी के अनुसार ₹20 लाख तक'),
    'https://www.financialservices.gov.in/pradhan-mantri-mudra-yojana-pmmy', 'https://www.jansamarth.in/', /mudra|pmmy|मुद्रा/iu,
    [yes('micro', 'Income-generating microenterprise purpose', 'आय कमाने वाले सूक्ष्म उद्यम का उद्देश्य'), rule('loan', 'between', [1, 2000000], 'Loan request within the scheme limit', 'ऋण राशि योजना की सीमा में'), { ...yes('repaidTarun', 'Tarun Plus requires a repaid Tarun loan', 'तरुण प्लस के लिए पूर्व तरुण ऋण का भुगतान ज़रूरी है'), when: rule('loan', 'gt', 1000000) }],
    [bi('Identity, business plan and lender-specific paperwork', 'पहचान, व्यवसाय योजना और ऋणदाता के दस्तावेज़')],
    [bi('Compare the loan tiers and use JanSamarth or approach a participating lender.', 'ऋण श्रेणियाँ देखें और जन समर्थ या भाग लेने वाले ऋणदाता से संपर्क करें।'), bi('Submit your business and financial information for lender assessment.', 'ऋणदाता के आकलन के लिए व्यवसाय और वित्तीय जानकारी जमा करें।')]),

  scheme('nmmss', 'education', bi('National Means-cum-Merit Scholarship', 'राष्ट्रीय साधन-सह-मेधा छात्रवृत्ति'), bi('Screening for the Class 8 selection test. Check your state for the current application window.', 'आठवीं कक्षा की चयन परीक्षा की प्राथमिक जाँच। वर्तमान आवेदन अवधि के लिए अपने राज्य से संपर्क करें।'), bi('₹12,000 per year if selected', 'चयन होने पर ₹12,000 प्रति वर्ष'),
    'https://www.education.gov.in/sites/upload_files/mhrd/files/document-reports/MoE_AR_En.pdf', 'https://scholarships.gov.in/', /nmmss?|means[\s-]*cum[\s-]*merit|साधन.*मेधा/iu,
    [yes('eight', 'Fresh Class 8 selection stage', 'आठवीं कक्षा में नया चयन'), yes('school', 'Eligible school type', 'पात्र स्कूल प्रकार'), rule('income', 'lte', 350000, 'Parental income up to ₹3.5 lakh per year', 'माता-पिता की आय ₹3.5 लाख प्रति वर्ष तक'), rule('marks', 'gte', 50, 'At least 50% in Class 7', 'सातवीं कक्षा में कम से कम 50%'), { ...yes('scst', 'SC/ST relaxation for marks below 55%', '55% से कम अंकों पर एससी/एसटी की छूट'), when: rule('marks', 'between', [50, 54.999999]) }],
    [bi('Class 7 marksheet, income proof and category certificate if applicable', 'सातवीं की अंकतालिका, आय प्रमाण और लागू होने पर वर्ग प्रमाणपत्र')],
    [bi('Ask your school or state education department about the NMMS exam and its application window.', 'स्कूल या राज्य शिक्षा विभाग से एनएमएमएस परीक्षा और आवेदन अवधि पूछें।'), bi('If selected, register on the National Scholarship Portal and complete verification.', 'चयन के बाद राष्ट्रीय छात्रवृत्ति पोर्टल पर पंजीकरण और सत्यापन करें।')]),

  scheme('telangana-marriage', 'marriage', bi('Kalyana Lakshmi / Shaadi Mubarak', 'कल्याण लक्ष्मी / शादी मुबारक'), bi('Marriage assistance for qualifying brides residing in Telangana.', 'तेलंगाना की पात्र दुल्हनों के लिए विवाह सहायता।'), bi('₹1,00,116 one-time assistance', '₹1,00,116 एकमुश्त सहायता'),
    'https://yadadri.telangana.gov.in/scheme/kalyana-lakshmi-shaadi-mubarak/', 'https://telanganaepass.cgg.gov.in/KalyanaLakshmiLinks.do', /kalyana|shaadi mubarak|शादी मुबारक|कल्याण लक्ष्मी/iu,
    [rule('state', 'eq', 'telangana', 'Telangana residency', 'तेलंगाना निवास'), yes('bride', 'Eligible bride preparing for marriage', 'विवाह की तैयारी कर रही पात्र दुल्हन'), rule('age', 'gte', 18, 'Bride has completed 18 years', 'दुल्हन ने 18 वर्ष पूरे किए हैं'), rule('group', 'oneOf', ['scst', 'bcebc', 'minority'], 'Covered community or category', 'पात्र समुदाय या वर्ग'), rule('income', 'lte', 200000, 'Parental income up to ₹2 lakh per year', 'माता-पिता की आय ₹2 लाख प्रति वर्ष तक'), { ...no('rural', 'Rural BC/EBC parental income limit is ₹1.5 lakh', 'ग्रामीण बीसी/ईबीसी के माता-पिता की आय सीमा ₹1.5 लाख है'), when: [rule('group', 'eq', 'bcebc'), rule('income', 'gt', 150000)] }],
    [bi('Age, residence, income and category evidence, plus marriage and bank details', 'आयु, निवास, आय और वर्ग प्रमाण के साथ विवाह और बैंक विवरण')],
    [bi('Select Kalyana Lakshmi or Shaadi Mubarak on Telangana ePASS.', 'तेलंगाना ईपास पर कल्याण लक्ष्मी या शादी मुबारक चुनें।'), bi('Complete registration, upload the required proof and retain the application reference.', 'पंजीकरण पूरा करें, प्रमाण अपलोड करें और आवेदन संख्या रखें।')], { amount: 100116, cadence: 'once' }),

  scheme('sukanya', 'savings', bi('Sukanya Samriddhi Account', 'सुकन्या समृद्धि खाता'), bi('A government-backed savings account for a girl child.', 'बालिका के लिए सरकार समर्थित बचत खाता।'), bi('Long-term savings for a girl child', 'बालिका के लिए दीर्घकालीन बचत'),
    'https://www.nsiindia.gov.in/writereaddata/SchemeRules/SukanyaSamriddhiAccountSchemeRule.pdf', 'https://www.indiapost.gov.in/', /sukanya|ssa\b|सुकन्या/iu,
    [yes('girl', 'Parent or legal guardian of a girl', 'बालिका के माता-पिता या कानूनी अभिभावक'), rule('age', 'lt', 10, 'Girl is under age 10 when the account opens', 'खाता खोलते समय बालिका की उम्र 10 वर्ष से कम'), yes('inIndia', 'Child is resident in India', 'बालिका भारत की निवासी है'), yes('newSukanya', 'Account and family limits are satisfied', 'खाता और परिवार की सीमा पूरी है')],
    [bi('Girl’s birth certificate and guardian KYC documents', 'बालिका का जन्म प्रमाणपत्र और अभिभावक के केवाईसी दस्तावेज़')],
    [bi('Take the documents to a post office or authorised bank.', 'दस्तावेज़ डाकघर या अधिकृत बैंक ले जाएँ।'), bi('Complete the account opening form and make the initial deposit.', 'खाता खोलने का प्रपत्र भरें और शुरुआती जमा करें।')]),
  scheme('apy', 'savings', four('Atal Pension Yojana', 'अटल पेंशन योजना', 'అటల్ పెన్షన్ యోజన', 'अटल पेन्शन योजना'),
    four('A contributory pension for retirement.', 'सेवानिवृत्ति के लिए अंशदायी पेंशन।', 'పదవీ విరమణ కోసం చందాతో పెన్షన్.', 'सेवानिवृत्तीसाठी अंशदायी पेन्शन.'),
    four('Monthly pension from age 60, based on contributions', 'अंशदान के अनुसार 60 वर्ष से मासिक पेंशन', 'చందాను బట్టి 60 ఏళ్ల నుండి నెలవారీ పెన్షన్', 'योगदानानुसार 60 वर्षांपासून मासिक पेन्शन'),
    'https://financialservices.gov.in/atal-pension-yojana', 'https://pfrda.org.in/web/pfrda/w/faqs/atal-pension-yojana', /\bapy\b|atal pension|अटल पेंशन|అటల్ పెన్షన్|अटल पेन्शन/iu,
    [
      { ...rule('age', 'between', [18, 39]), label: four('Completed age 18 through 39 for new enrolment', 'नए नामांकन के लिए पूरी उम्र 18 से 39', 'కొత్త నమోదుకు పూర్తి వయసు 18 నుంచి 39', 'नवीन नोंदणीसाठी पूर्ण वय 18 ते 39') },
      { ...yes('indian'), label: four('Indian citizenship', 'भारतीय नागरिकता', 'భారత పౌరసత్వం', 'भारतीय नागरिकत्व') },
      { ...yes('bank'), label: four('Participating savings account', 'भाग लेने वाला बचत खाता', 'పాల్గొనే పొదుపు ఖాతా', 'सहभागी बचत खाते') },
      { ...no('taxpayer'), label: four('Applicant has never been an income-tax payer', 'आवेदक आयकरदाता नहीं रहा है', 'దరఖాస్తుదారు ఆదాయ పన్ను చెల్లించలేదు', 'अर्जदाराने आयकर भरलेला नाही') },
      { ...yes('newApy'), label: four('New account only', 'केवल नया खाता', 'కొత్త ఖాతా మాత్రమే', 'फक्त नवीन खाते') },
    ],
    [four('Savings account details and bank identity requirements', 'बचत खाते के विवरण और बैंक के पहचान दस्तावेज़', 'పొదుపు ఖాతా వివరాలు, బ్యాంకు గుర్తింపు పత్రాలు', 'बचत खात्याचा तपशील व बँकेची ओळखपत्रे')],
    [four('Ask your participating bank or post office to enrol and choose a pension contribution.', 'भागीदार बैंक या डाकघर से नामांकन करें और पेंशन अंशदान चुनें।', 'పాల్గొనే బ్యాంకు లేదా పోస్టాఫీసులో నమోదు చేసి చందా ఎంచుకోండి.', 'सहभागी बँक किंवा पोस्टात नोंदणी करून योगदान निवडा.')]),
  scheme('pmuy2', 'utilities', four('Ujjwala 2.0', 'उज्ज्वला 2.0', 'ఉజ్వల 2.0', 'उज्ज्वला 2.0'),
    four('LPG connection assistance for eligible low-income households.', 'पात्र कम आय वाले परिवारों को LPG कनेक्शन सहायता।', 'అర్హమైన తక్కువ ఆదాయ కుటుంబాలకు LPG కనెక్షన్ సహాయం.', 'पात्र कमी उत्पन्नाच्या कुटुंबांसाठी LPG जोडणी मदत.'),
    four('Deposit-free LPG connection for qualifying households', 'पात्र परिवारों को जमा-मुक्त LPG कनेक्शन', 'అర్హ కుటుంబాలకు డిపాజిట్ లేని LPG కనెక్షన్', 'पात्र कुटुंबांना ठेवीशिवाय LPG जोडणी'),
    'https://www.myscheme.gov.in/schemes/pmuy2', 'https://pmuy.gov.in/Ujjwala2.html', /ujjwala|\bpmuy\b|उज्ज्वला|ఉజ్వల/iu,
    [
      { ...rule('age', 'gte', 18), label: four('Applicant has completed 18 years', 'आवेदक की उम्र कम से कम 18 वर्ष', 'దరఖాస్తుదారు వయసు కనీసం 18', 'अर्जदाराचे वय किमान 18 वर्षे') },
      { ...yes('woman'), label: four('Connection is for a woman', 'कनेक्शन महिला के नाम पर है', 'కనెక్షన్ మహిళ పేరుతో ఉంటుంది', 'जोडणी महिलेच्या नावाने आहे') },
      { ...no('lpg'), label: four('No existing household LPG connection', 'परिवार के पास पहले से LPG नहीं है', 'కుటుంబంలో ఇప్పటికే LPG కనెక్షన్ లేదు', 'कुटुंबात आधीपासून LPG जोडणी नाही') },
      { ...yes('deprivation'), label: four('Household meets the official deprivation criteria', 'परिवार आधिकारिक वंचना मानदंड पूरा करता है', 'కుటుంబం అధికారిక దారిద్ర్య ప్రమాణాన్ని తీరుస్తుంది', 'कुटुंब अधिकृत वंचितता निकष पूर्ण करते') },
    ],
    [four('KYC, family composition proof, bank details and deprivation declaration', 'केवाईसी, परिवार का प्रमाण, बैंक विवरण और वंचना घोषणा', 'KYC, కుటుంబ వివరాల రుజువు, బ్యాంకు వివరాలు, దారిద్ర్య ప్రకటన', 'केवायसी, कुटुंबाचा पुरावा, बँक तपशील व वंचितता घोषणा')],
    [four('Choose an LPG distributor on the official portal or visit a distributor or service centre.', 'पोर्टल पर LPG वितरक चुनें या वितरक अथवा सेवा केंद्र पर जाएँ।', 'పోర్టల్‌లో LPG పంపిణీదారుని ఎంచుకోండి లేదా పంపిణీ కేంద్రాన్ని సందర్శించండి.', 'पोर्टलवर LPG वितरक निवडा किंवा वितरक अथवा सेवा केंद्रात जा.')]),
  scheme('pm-vishwakarma', 'business', four('PM Vishwakarma', 'पीएम विश्वकर्मा', 'పీఎం విశ్వకర్మ', 'पीएम विश्वकर्मा'),
    four('Training, tools and credit support for eligible traditional artisans.', 'पात्र पारंपरिक कारीगरों के लिए प्रशिक्षण, औज़ार और ऋण सहायता।', 'అర్హ సంప్రదాయ కళాకారులకు శిక్షణ, పరికరాలు, రుణ సహాయం.', 'पात्र पारंपरिक कारागिरांना प्रशिक्षण, साधने व कर्ज सहाय्य.'),
    four('Skill training, toolkit incentive and phased credit', 'कौशल प्रशिक्षण, औज़ार प्रोत्साहन और चरणबद्ध ऋण', 'నైపుణ్య శిక్షణ, పరికరాల ప్రోత్సాహకం, దశలవారీ రుణం', 'कौशल्य प्रशिक्षण, साधन प्रोत्साहन व टप्प्याटप्प्याने कर्ज'),
    'https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=159998&id=159998&lang=1&reg=3', 'https://pmvishwakarma.gov.in/', /vishwakarma|विश्वकर्मा|విశ్వకర్మ/iu,
    [
      { ...yes('artisan'), label: four('Current self-employment in a notified traditional trade', 'अधिसूचित पारंपरिक काम में मौजूदा स्वरोज़गार', 'ప్రకటిత సంప్రదాయ వృత్తిలో ప్రస్తుత స్వయం ఉపాధి', 'अधिसूचित पारंपरिक व्यवसायात सध्याचा स्वयंरोजगार') },
      { ...rule('age', 'gte', 18), label: four('Age 18 or older', 'उम्र 18 वर्ष या अधिक', 'వయసు 18 లేదా ఎక్కువ', 'वय 18 वर्षे किंवा अधिक') },
      { ...yes('indian'), label: four('Indian citizenship', 'भारतीय नागरिकता', 'భారత పౌరసత్వం', 'भारतीय नागरिकत्व') },
      { ...yes('vishFamily'), label: four('Single eligible applicant per family, with no government service in the family', 'परिवार से एक आवेदक और कोई सरकारी सेवा में नहीं', 'కుటుంబం నుంచి ఒక్క దరఖాస్తుదారు, ప్రభుత్వ ఉద్యోగం లేదు', 'कुटुंबातून एक अर्जदार असून कोणी सरकारी सेवेत नाही') },
      { ...no('vishCredit'), label: four('Meets the previous credit restriction', 'पिछले ऋण की शर्त पूरी', 'మునుపటి రుణ నిబంధనను తీరుస్తుంది', 'मागील कर्जाची अट पूर्ण') },
    ],
    [four('Aadhaar, bank details and family information', 'आधार, बैंक और परिवार के विवरण', 'ఆధార్, బ్యాంకు, కుటుంబ వివరాలు', 'आधार, बँक आणि कुटुंब तपशील')],
    [four('Review the notified trades and register through a Common Service Centre for verification.', 'अधिसूचित काम की सूची देखकर सत्यापन के लिए कॉमन सर्विस सेंटर से पंजीकरण करें।', 'ప్రకటిత వృత్తుల జాబితా చూసి ధ్రువీకరణకు కామన్ సర్వీస్ సెంటర్ ద్వారా నమోదు చేయండి.', 'अधिसूचित व्यवसाय पाहून पडताळणीसाठी कॉमन सर्व्हिस सेंटरमधून नोंदणी करा.')]),
];

export const lifeEvents = [
  { title: bi('Starting a business', 'व्यवसाय शुरू करना'), detail: bi('Explore working capital and microenterprise loans.', 'कार्यशील पूँजी और सूक्ष्म उद्यम ऋण देखें।'), category: 'business' },
  { title: bi('Preparing for marriage', 'विवाह की तैयारी'), detail: bi('Check Telangana marriage assistance and the documents you need.', 'तेलंगाना विवाह सहायता और ज़रूरी दस्तावेज़ देखें।'), category: 'marriage' },
  { title: bi('Continuing school', 'पढ़ाई जारी रखना'), detail: bi('Check scholarship screening criteria and selection steps.', 'छात्रवृत्ति की पात्रता और चयन के चरण देखें।'), category: 'education' },
  { title: bi('Welcoming a daughter', 'बेटी का स्वागत'), detail: bi('Explore a savings account for your daughter’s future.', 'अपनी बेटी के भविष्य के लिए बचत खाता देखें।'), category: 'savings' },
  { title: bi('Turning 70', '70 वर्ष पूरे होना'), detail: bi('Check senior healthcare eligibility and enrolment steps.', 'वरिष्ठ स्वास्थ्य सेवा की पात्रता और नामांकन देखें।'), category: 'health' },
];
