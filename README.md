# ARCEUS

ARCEUS helps citizens check eligibility for Indian government schemes by voice or text in English, Hindi, Telugu, and Marathi. The catalogue combines 11 structured interviews with a searchable myScheme directory drawn from 2,066 central and state listings. Entries outside the interviews link to myScheme for current eligibility rules and application instructions.

## Run locally

Use Node.js 22.12 or newer and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5174
```

Open [the local site](http://127.0.0.1:5174/). The scheme directory, text assistant, and supported browser speech work as a guest.

### Supabase workspace

Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project’s Connect dialog. These two values are intended for the browser. Keep server-side Supabase credentials out of Vite and Git.

The dedicated [ARCEUS Supabase project](https://supabase.com/dashboard/project/agempdqjszsczykzaiuv) already has the migrations applied. For a fresh project or local stack, apply `supabase/migrations` in filename order. For public sign-up enable [GitHub OAuth](https://supabase.com/docs/guides/auth/social-sign-in/auth-github), with the OAuth app calling the Supabase project’s `/auth/v1/callback`. Set Supabase Site URL to the hosted ARCEUS origin and allow `https://YOUR-HOST/auth/callback` plus `https://YOUR-HOST/auth/callback?intent=recovery` in [Auth URL Configuration](https://supabase.com/docs/guides/auth/redirect-urls). Add equivalent localhost URLs for development. Email confirmation and password recovery use [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), which currently restricts delivery to team members until custom SMTP is configured.

### Sarvam speech

Add `SARVAM_API_KEY=<your key>` to `.env.local` and restart Vite. Use `SARVAM_API_KEY` without a `VITE_` prefix. The local server calls Saaras for transcription and Bulbul for speech synthesis. Click the microphone to record and click **Send recording** to transcribe. The assistant uses the same eligibility logic for transcripts and typed answers. Voice replies are read aloud by default, and every assistant message has a replay button. If the key is absent, Chrome or Edge can use browser recognition and installed voices, depending on the device and selected language. [Sarvam speech-to-text](https://docs.sarvam.ai/api/api-guides-tutorials/speech-to-text/rest-api) · [Sarvam text-to-speech](https://docs.sarvam.ai/api/api-guides-tutorials/text-to-speech/rest-api)

Managed speech is available on loopback in development. On Render, ARCEUS verifies a Supabase session before processing speech and limits requests per account and instance. Guests can use text and browser speech where supported. Turn on hands-free follow-ups to detect a pause, speak the reply, and reopen the microphone for the next question. Voice clips and chat transcripts are transient in ARCEUS. The speech provider processes recordings and replies on its servers.

## Render

The production Node server serves `dist`, `/healthz`, OAuth callbacks, and the same-origin speech API. Use Node 24, build with `pnpm install --frozen-lockfile && pnpm build`, then run `pnpm start`. Configure the two `VITE_SUPABASE_*` variables at build and runtime, and set the server-only `SARVAM_API_KEY` in Render. Render supplies `PORT` and `RENDER_EXTERNAL_URL`.

## myScheme directory source

The directory includes names, slugs, jurisdictions and index tags from the [published Gov MyScheme snapshot](https://github.com/Aryan-Pardeshi/gov-myscheme-dataset/tree/4ddfa18d7aa3e630cc4ae3374731e5819d7875e7), attributed there to [shrijayan/gov_myscheme](https://huggingface.co/datasets/shrijayan/gov_myscheme) under Apache-2.0. ARCEUS links to official listings and does not perform automated extraction from the official portal. The snapshot can lag the live directory. The structured interviews are maintained separately against official rules.

## Eligibility and records

- **Eligibility.** The conversational engine recognizes scheme and category requests, reuses known facts, asks only for unresolved facts, and stops on decisive criteria. It asks for confirmation when facts conflict and preserves unknowns. `src/catalog.js` contains the auditable rules. `src/eligibility.js` handles fact extraction, questions, and evaluation. The engine requires no language-model key or speech-model training.
- **Applications.** Schemes link to official rules and registration portals. Citizens submit directly on government websites and maintain their own application status and reference in ARCEUS. PM-KISAN has a direct official status lookup.
- **Documents.** Tesseract reads labelled JPEG, PNG, and WebP images in the browser. Reviewed names, dates of birth, and postal codes populate an ARCEUS preparation form. Name and birth-date discrepancies are flagged against the selected family record. The optional saved original belongs to the signed-in user's Storage folder.
- **Family and life events.** Family records surface likely or incomplete matches. Potential cash estimates group annual and one-time amounts, count household-scoped PM-KISAN once, and use recorded approvals. The workspace shows upcoming age milestones and exports calendar reminders for alerts outside ARCEUS.

Sources include [myScheme and PM-KISAN](https://www.myscheme.gov.in/schemes/pm-kisan), [NHA healthcare guidance](https://nha.gov.in/img/resources/English_FAQs_related_to_the_benefits_for_senior_citizens.pdf), [Jan Suraksha summaries](https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=158322&lang=1&reg=22), [MUDRA programme rules](https://www.financialservices.gov.in/pradhan-mantri-mudra-yojana-pmmy), [education ministry guidance](https://www.education.gov.in/sites/upload_files/mhrd/files/document-reports/MoE_AR_En.pdf), [Telangana marriage assistance](https://yadadri.telangana.gov.in/scheme/kalyana-lakshmi-shaadi-mubarak/), and [Sukanya account rules](https://www.nsiindia.gov.in/writereaddata/SchemeRules/SukanyaSamriddhiAccountSchemeRule.pdf). The scholarship rule screens for the Class 8 selection test. The award depends on selection and the current state application window.

## Verify

```bash
pnpm test
pnpm build
```

For the live demo, try “Check PMSBY,” then “I’m 17 or 19.” Confirm “19” and answer “Yes” to the savings account question. ARCEUS clarifies the contradiction before evaluating the rule. Try “I need insurance. I am 52 and I have a savings account” to evaluate both insurance schemes without a follow-up question. Use synthetic records during demonstrations.

The public BharatLink and Govt Compass repositories were workflow references. ARCEUS uses its own code, interface, art, and rules.
