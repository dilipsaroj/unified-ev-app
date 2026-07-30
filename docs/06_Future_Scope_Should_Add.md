# Future Scope — Should-Add Features

> Created 2026-07-30 after competitor analysis of One Bharat Charge and Bolt.Earth.
> Updated 2026-07-30: added Tier A/B/C markers after scope decision to pull Tier A into Layer 1.
> Purpose: features NOT in V1 scaffold that matter for credibility, not existential. These make you look serious to CPOs, investors, and enterprise B2B customers — but skipping any single one won't kill the pitch.
> Companion: `05_Future_Scope_Must_Add.md` (existential / addressable-market gaps).

## Tier legend

- **Tier A** — pulled into Layer 1 (Weeks 1–5 build). Ship with the V1 demo. Cursor prompts 02 / 03 handle these.
- **Tier B** — deferred to Layer 1.5 (post-demo iteration).
- **Tier C** — cannot be added to Layer 1 or 1.5. Hard dependency on Layer 2 or Layer 3 infrastructure.

---

## Reading this document

Same structure as `05_Future_Scope_Must_Add.md`:

- **What** — one line
- **Why it matters** — the specific credibility gap
- **Competitor precedent** — who does this
- **When to build** — Layer 1.5 / Layer 2 / Layer 3
- **Effort** — rough estimate
- **Dependencies / trigger** — when to start
- **Anti-goals** — what NOT to over-scope

Order below is roughly by cost-of-not-doing (top = highest cost of skipping).

---

## 1. WhatsApp Business support channel  **[Tier A — Layer 1]**

**What.** A WhatsApp Business number listed in-app (Profile → Help & Support) that connects to a real human on the ops side. Not a chatbot — an actual founder-answered WhatsApp for the first 100 users, then a first support hire once volume justifies.

**Why it matters.** Indian users expect WhatsApp for support. Email support in India is often ignored — even by professional users. Phone support is expected but expensive. WhatsApp splits the difference: async but personal, feels responsive, one-to-one, familiar. Bolt.Earth lists phone support prominently. Every serious Indian D2C app has WhatsApp support now — not having it looks amateur.

**Competitor precedent.** Bolt.Earth prominently displays phone numbers with "24/7 (Mon-Sun)" and separate sales / support lines. One Bharat Charge lists phone numbers in their contact page. Both are ahead of you here.

**When to build.** Layer 1.5 (Weeks 5–8, before first pilot). Ship with the demo — even if it's just Dilip's personal WhatsApp for the first 3 months.

**Effort.** 1 day:
- Register a WhatsApp Business account (free, uses your existing number or new one)
- Add "Get help on WhatsApp" link/button in Profile → Help & Support, with a pre-filled message ("Hi, I need help with...")
- Publish response-time expectation in the app ("Typical reply in 2 hours during business hours")

**Dependencies / trigger.** Nothing — do it before first pilot conversation.

**Anti-goals.**
- Do NOT build a chatbot for V1. Human WhatsApp is the entire value.
- Do NOT list "24/7" support unless you can actually deliver it. "9am–9pm" is honest and enough.

---

## 2. ONDC / UEI network membership  **[Tier C — Layer 2, cannot be in Layer 1]**

**Why Tier C:** requires (a) company incorporated and DPIIT-registered (paperwork alone is 4–6 weeks), (b) real Beckn BAP backend endpoints implemented (requires Layer 2 backend), (c) sandbox testing on Beckn network. None of this is possible with the V1 PWA-only, all-mocked scaffold.

**What.** Register Unified-EV as a BAP (Buyer App) on the UEI (Unified Energy Interface) / ONDC network. Consume BPP (seller-side) endpoints from CPOs who've registered on the network for cross-network discovery. Zero-cost technical membership — just paperwork and configuration.

**Why it matters.** Two reasons.

(1) **Regulatory alignment.** ONDC is Government of India–backed via DPIIT. Being an ONDC/UEI member signals to regulators and CPOs that you're part of the open-network vision, not a walled-garden competitor to it. Meaningful for any government tender, public-sector fleet contract, or discussion with BHEL.

(2) **Free CPO integrations later.** As more CPOs onboard to UEI (which is happening — see Kazam's July 2026 free integration program), consuming UEI gives you "one integration = many CPOs" leverage. Currently the UEI network is thin, but government momentum is on the side of expansion.

**Competitor precedent.** One Bharat Charge explicitly markets ONDC/Beckn/UEI membership. Kazam is running an active UEI onboarding program.

**When to build.** Layer 2 (once first pilot CPO conversation is real, and you want ONDC certifications to make your platform credible to CPO #2). Not needed in V1.

**Effort.** 2–3 weeks legal + technical:
- Week 1: DPIIT registration paperwork (company incorporation must be complete first)
- Week 2: UEI/Beckn BAP implementation — the `search`, `select`, `init`, `confirm` API endpoints per Beckn spec
- Week 3: Sandbox testing on Beckn sandbox environment, get certified

**Dependencies / trigger.** Company incorporated (LLP or Pvt Ltd). First pilot CPO conversation warm enough that ONDC membership is a talking point.

**Anti-goals.**
- Do NOT rebuild your app around Beckn/UEI. It's one adapter among many in your CPO adapter layer — most CPOs still use OCPI 2.2.1 or proprietary REST.
- Do NOT wait for UEI to be big before joining. Join early; be one of the recognized names when the ecosystem scales.

---

## 3. RuPay explicit mention alongside UPI + card + netbanking  **[Tier A — Layer 1]**

**What.** Wherever your payment method language appears (app copy, pitch deck, one-pager, landing page), name RuPay explicitly. Not just "cards" or "UPI" — "UPI, RuPay, credit/debit cards, netbanking."

**Why it matters.** RuPay is India's national card network (NPCI, same organization behind UPI). Adoption is growing rapidly — many public sector bank customers, most Jan Dhan account holders, and increasingly urban middle class. Saying "cards" without naming RuPay signals a Western-adapted product; naming RuPay signals India-first design. Zero-cost credibility signal.

**Competitor precedent.** One Bharat Charge lists "UPI · RuPay · credit/debit cards, net banking." Bolt.Earth accepts RuPay. Every Indian fintech names RuPay explicitly.

**When to build.** Layer 0. Update copy immediately. No code change required in V1 (mock payment sheet already covers all methods). Real Layer 2 Razorpay integration accepts RuPay by default — no extra work.

**Effort.** 0.5 days for copy updates across landing page, mock UPI popup design, pitch deck.

**Dependencies / trigger.** None.

**Anti-goals.**
- Do NOT try to build RuPay-specific flows. Razorpay Standard Checkout handles it as a card type. Just name it in the UI so users see the RuPay logo alongside Visa/Mastercard.

---

## 4. Charging Session Refund Policy — signed legal document  **[Tier A partial — Layer 1: draft only; Layer 2: legal review + auto-refund code]**

**Layer 1 scope:** draft the policy content, publish at `/policies/refund` route, link from Profile → Help. Content is honest ("this policy will be legally reviewed before real payments go live in production"). NO lawyer review yet — deferred until company is incorporated and Layer 2 is imminent.

**Layer 2 scope:** lawyer review + revisions (~₹25k), auto-refund code hooked to Razorpay refund API.

**What.** A publicly linked legal document (`/policies/refund`) covering: when a session is refundable (failed to start, terminated by charger, duration <2 mins), how refunds are processed (auto to source method, timeline), dispute escalation path, non-refundable cases (user-cancelled after 5 mins of successful charging). Reviewed and signed by a lawyer.

**Why it matters.** Both regulatory (RBI expects clear refund policies for payment services) and reputational (drivers who lose ₹500 on a failed session and can't find a policy churn immediately and complain publicly). Investors will ask for it in due diligence. CPOs will ask for it as part of the pilot MoU. Not having a documented policy is a red flag in every serious conversation.

**Competitor precedent.** Bolt.Earth has a dedicated "Charging Session Refund Policy" page linked from every screen footer.

**When to build.** Layer 2 (when real payments start flowing). Not before — you can't have a refund policy on mocked payments.

**Effort.** 3–5 days total:
- Day 1: Draft V1 policy yourself (2 pages, covers common cases). Look at Bolt.Earth's and 2 other Indian fintech refund policies as reference.
- Day 2: Lawyer review — ~₹15–25k for a Bangalore/Delhi-based fintech-friendly lawyer to review and fix legal wording. Do NOT skip this step.
- Day 3: Add `/policies/refund` route in Next.js. Link from Profile → Help & Support and app footer.
- Day 4: Build the actual refund automation on the backend (Razorpay refund API on session failure)
- Day 5: Test end-to-end — simulate a failed session, confirm auto-refund fires, confirm user sees refund receipt

**Dependencies / trigger.** Company incorporated. First pilot CPO signed. Real Razorpay Route integration live.

**Anti-goals.**
- Do NOT self-write and skip lawyer review. Refund policies have specific RBI requirements. ₹25k of legal fee prevents a ₹5 crore mistake later.
- Do NOT hide the policy behind Profile menus. Footer link on every screen, plus prominent link on the receipt.

---

## 5. ISO 27001 certification path  **[Tier C — Layer 3, cannot be in Layer 1]**

**Why Tier C:** requires stable production operations, real incident response history, documented access controls on real infra, and 3–6 months of external auditor engagement. Impossible in a Layer 1 PWA with no production backend. Also: ₹5–15L cost first year — wasteful before enterprise contracts are on the table.

**What.** Formal information security management certification. Not needed for consumer traction. Absolutely needed for any enterprise B2B contract (large fleet operators, corporate customers, government tenders). Takes 3–6 months of prep + external auditor + annual renewal.

**Why it matters.** Enterprise buyers (Bank of America, Bajaj — the companies Bolt.Earth has as case studies) require ISO 27001 before signing. Fleet operators managing 500+ vehicles will ask about it in RFP. Government tenders often mandate it. Being certified when the first enterprise contract is discussed is the difference between "yes, we're certified" and "we'd need 6 months to get certified" — the second answer kills deals.

**Competitor precedent.** Bolt.Earth prominently displays ISO 27001, ISO 9001, NABL, ARAI certifications in their footer. It's a competitive requirement in Indian B2B EV.

**When to build.** Layer 3 (Month 12+). Start prep 6 months before you expect to need it — i.e., when you have the first enterprise conversation warm. Do NOT start earlier — it's expensive (₹5–15L first year) and irrelevant for consumer/pilot phase.

**Effort.** 3–6 months elapsed, ~15–20 days of focused work (spread over 3–6 months):
- Month 1: Hire compliance consultant (~₹2–5L for the full engagement)
- Months 2–3: Documentation — risk assessment, policies, procedures, controls implementation
- Month 4: Internal audit + gap remediation
- Months 5–6: External audit (₹3–8L for accredited body), certification issued

Ongoing: annual surveillance audit (~₹2–3L/year), 3-year full recertification.

**Dependencies / trigger.** First enterprise or government B2B contract discussion is warm (not just theoretical). Company has stable engineering ops (deploy procedures, incident response, access controls actually implemented).

**Anti-goals.**
- Do NOT start pre-Series-A. Cost is high, benefit is zero for consumer traction phase.
- Do NOT try to self-certify. The whole value is the external auditor's signature.
- Do NOT pursue SOC 2 unless a US enterprise is asking. Different framework, different cost, only relevant for US customers.

---

## 6. OCPI CDR-compliant session records  **[Tier A — Layer 1: shape + toCDR() function]**

**Layer 1 scope:** ensure the `Session` type in `types.ts` includes every field needed to output a valid OCPI 2.2.1 CDR. Add `src/lib/data/cdr.ts` with a pure `toCDR(session: Session): CDR` function that returns OCPI CDR JSON. Works on mock data.

**Layer 2 scope:** expose an authenticated `GET /api/cpo/:cpoId/cdrs` endpoint with real CPO-role-scoped access.

**What.** Ensure Unified-EV's `sessions` table can output records in OCPI 2.2.1 CDR (Charge Detail Record) format on demand — for reconciliation with CPOs' billing systems, for regulator audit, and for interoperability with third-party analytics tools.

**Why it matters.** OCPI CDR is the standardized format for how CPOs and eMSPs (that's you) exchange billed session records. When a CPO's finance team reconciles their monthly settlement from you against their internal session log, they use CDRs. If your `sessions` table can produce OCPI CDRs, this reconciliation is ~1 hour of engineering. If it can't, every CPO wants a custom integration for their finance team — 40+ hours per CPO. This scales badly.

Also: any government reporting or FAME-II compliance audit expects OCPI CDRs. Not having them is a technical debt that grows every month.

**Competitor precedent.** One Bharat Charge explicitly markets "CDR reconciliation automated." Their pitch to CPOs is "we speak OCPI end-to-end." Bolt.Earth built their CMS around OCPI compliance.

**When to build.** Layer 2 (when Razorpay Route + first CPO adapter is live). Add a `cdr_export.ts` module that takes a session row and outputs OCPI 2.2.1 CDR JSON.

**Effort.** 2–3 days:
- Day 1: Read OCPI 2.2.1 CDR schema spec (open standard, ~30 pages)
- Day 2: Implement `toCDR(session: Session): CDR` — pure function, no side effects
- Day 3: Expose CDR export endpoint (`GET /api/cpo/:cpoId/cdrs?from=&to=` — CPO-role-scoped) + JSON download / CSV download

**Dependencies / trigger.** V2 Postgres schema live with real session records. First pilot CPO integrated.

**Anti-goals.**
- Do NOT try to implement full OCPI 2.2.1 spec (sessions push, tokens, tariffs, locations sync) in Layer 2. Only CDR export. The rest belongs to the CPO adapter files as they need it.
- Do NOT let CPOs propose "custom CDR formats." OCPI CDR is the standard for a reason — one format serves all CPOs.

---

## Cross-cutting decisions

- **All six of these features cost money or time but not both.** WhatsApp is free (5 minutes to add a link). Legal + certification cost real money but are quick to complete. None of them require weeks of engineering.
- **None of these should be added to V1 scaffold.** Every one is Layer 1.5 or later. Cursor should not build any of these in the current session sequence.
- **The scope table in `01_MVP_Overview.md` Section 12b** now includes rows for all six. Update it if any get built or deprioritized.
- **`05_Future_Scope_Must_Add.md`** covers the higher-priority features. Read that first if scope pressure forces a choice between the two docs.
