# Execution Plan — AI Financial Clarity Engine
### Decisions Locked ✅ | Phase 1 Build Brief

---

## Confirmed Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Model** | B2C | Fastest learning loop; user behavior informs Phase 2 |
| **AA Provider** | Setu | Best developer experience in India; sandbox-ready |
| **Platform** | Web (Next.js) | No app store delays; fast iteration; works on mobile browser |
| **Beta Size** | 20 → 50 | 20 for directional signal; 50 for statistical confidence |

---

## What We're Building — Phase 1 in One Sentence

> A web app where a user connects their bank accounts via Setu AA (or uploads a statement), sees an AI-categorized spend dashboard, and receives a monthly AI-written narrative of their financial month.

---

## The Core User Loop

```
Connect Banks → See Transactions → Understand Spending → Read Your Story
     ↑                                                          |
     └──────────────── Come back next month ───────────────────┘
```

---

## 12-Week Sprint Plan

### 📦 SPRINT 1 (Weeks 1–2): Foundation + Setu Integration
**Goal:** Working data pipeline — from Setu consent to stored transactions in DB

#### What to Build
- [ ] Next.js project setup (App Router, TypeScript, Supabase client)
- [ ] Supabase schema: `users`, `accounts`, `transactions`, `consents`
- [ ] Setu AA integration — full consent + data fetch flow:
  - `POST /consents` → get `consentId` + redirect URL
  - Redirect user to Setu-hosted consent UI
  - Webhook listener at `/api/setu/webhook` → receive `ACTIVE` status
  - `POST /sessions` with `consentId` → get `sessionId`
  - `GET /sessions/{sessionId}/data` → raw transaction JSON
- [ ] Store raw Setu transactions in Supabase
- [ ] CSV/PDF upload fallback (LlamaParse or pdf-parse for PDF → JSON)
- [ ] Basic auth: Supabase Auth (email OTP)

#### Setu Integration — Technical Steps
```
1. Register on bridge.setu.co → create FIU product
2. Set webhook URL: https://yourapp.com/api/setu/webhook
3. Generate RSA key pair → upload public key to Setu
4. Store aa_api_key + client_api_key in environment vars
5. Use Setu Sandbox for testing (mock FIP accounts provided)

API flow:
POST /consents
  body: { consentDuration, fetchType: "PERIODIC", dataRange: "6M", fiTypes: ["DEPOSIT"] }
  → returns: { consentId, url }

Webhook receives:
  { type: "CONSENT_STATUS_UPDATE", consentId, status: "ACTIVE" }

POST /sessions
  body: { consentId, dataRange: { from, to } }
  → returns: { sessionId }

GET /sessions/{sessionId}/data
  → returns: { accounts: [{ transactions: [...] }] }
```

#### Milestone ✅
- Setu sandbox: consent flow works end-to-end
- Transactions land in Supabase `transactions` table
- CSV upload parses and stores transactions in same format

---

### 📦 SPRINT 2 (Weeks 3–4): AI Categorization Engine
**Goal:** Every transaction gets a category with >85% accuracy

#### What to Build
- [ ] Transaction normalization pipeline:
  - Clean merchant names ("AMZN*MKT8472" → "Amazon")
  - Detect transaction type (debit/credit/refund)
  - Extract amount, date, merchant
- [ ] AI categorization pipeline (Gemini 1.5 Flash — cost-efficient):
  - Batch process transactions in groups of 50
  - Prompt: returns `category`, `subcategory`, `confidence_score`
  - Fallback: rule-based keyword matching for common merchants
- [ ] Category taxonomy (16 categories):
  ```
  Food & Dining, Groceries, Transportation, Entertainment,
  Shopping, Healthcare, Utilities, Rent/Housing, Education,
  Travel, Subscriptions, Insurance, Investments, EMI/Loans,
  Transfers, Other
  ```
- [ ] User correction UI — "Is this category right? → Fix it"
- [ ] Correction stored in `user_category_overrides` table → retrains rules

#### AI Prompt Structure
```
System: You are a financial transaction categorizer for Indian users.
        Be specific. Use the provided taxonomy. Return JSON only.

User: Categorize this transaction:
  Merchant: {normalized_merchant_name}
  Amount: ₹{amount}
  Date: {date}
  Bank: {bank_name}
  Description: {raw_description}

Return: {
  "category": "Food & Dining",
  "subcategory": "Food Delivery",
  "merchant_clean": "Swiggy",
  "confidence": 0.95,
  "is_recurring": false
}
```

#### Milestone ✅
- All transactions in DB have `category`, `subcategory`, `merchant_clean`
- User can click any transaction → correct category → saved
- Categorization accuracy manually validated at >80% on test set

---

### 📦 SPRINT 3 (Weeks 5–6): Dashboard UI
**Goal:** A beautiful, information-dense spend dashboard that users actually want to look at

#### Screens to Build

**Screen 1: Onboarding (3 steps)**
```
Step 1: "Connect your accounts"
  → [Connect via Setu AA] or [Upload bank statement]

Step 2: "We're building your picture..." (AI processing state)
  → Progress animation, 30–90 second wait
  → "Analyzed 284 transactions across 2 accounts"

Step 3: First Insight Pop
  → 3 auto-surfaced insights (subscription alert, top merchant, fixed/variable split)
  → [See full dashboard →]
```

**Screen 2: Dashboard (Main)**
```
┌─────────────────────────────────────────┐
│  This Month: ₹24,300 spent              │
│  vs last month: ▲ ₹2,100 (+9.5%)       │
├────────────┬────────────────────────────┤
│ Donut Chart│  Top Categories            │
│ (category  │  🍕 Food & Dining  ₹6,200 │
│  split)    │  🛒 Groceries      ₹3,100 │
│            │  🚗 Transport      ₹2,800 │
│            │  📺 Subscriptions  ₹1,840 │
├────────────┴────────────────────────────┤
│  Monthly Trend (bar chart: 6 months)    │
├─────────────────────────────────────────┤
│  ⚠️ 4 subscriptions detected → ₹1,840/mo│
├─────────────────────────────────────────┤
│  Recent Transactions (with categories) │
└─────────────────────────────────────────┘
```

**Screen 3: Category Drill-down**
```
← Food & Dining: ₹6,200 this month
[Merchant breakdown] [Timeline] [Transactions]
Swiggy       ₹3,100  ████████
Zomato       ₹1,800  █████
Restaurants  ₹1,300  ████
```

**Screen 4: My Story (Monthly Narrative)**
```
📖 Your April Story
─────────────────────────────────────
April was your most expensive month in 6 months.
You spent ₹24,300 — ₹2,100 more than March.

Here's what drove it:
→ Travel spike: Goa trip cost ₹6,400 in one weekend
→ Food delivery crept up 23% — Swiggy led at ₹3,100
→ Good news: your fixed costs stayed flat at ₹8,200

🔍 One thing to watch:
You have 4 subscriptions totalling ₹1,840/mo.
Hotstar + Headspace = ₹450/mo you haven't used in 60 days.
─────────────────────────────────────
[See your spending breakdown]  [Share this story]
```

#### Tech Stack for UI
- **Charts:** Recharts (React-native, lightweight)
- **UI Components:** shadcn/ui (clean, accessible, fast to implement)
- **Animations:** Framer Motion (entry animations on dashboard load)
- **Fonts:** Inter from Google Fonts
- **Color system:** Indigo/violet primary + semantic colors for categories

#### Milestone ✅
- Onboarding → Dashboard → Category drill-down navigable
- Charts render correctly with real Supabase data
- Story screen renders a static mock narrative (AI pipeline comes next sprint)

---

### 📦 SPRINT 4 (Weeks 7–8): Narrative Generation Pipeline
**Goal:** AI generates a personalized, specific, non-generic monthly story for each user

#### Pipeline Steps
```
1. Aggregate user's transactions for the month:
   - Total spend
   - Spend by category (this month vs last month)
   - Top 5 merchants by amount
   - Recurring/subscription transactions
   - Single largest transaction
   - Fixed vs variable expense ratio
   - Days with highest spend

2. Build structured data context (JSON → prompt input)

3. LLM prompt → story generation (Gemini 1.5 Pro)

4. Post-processing:
   - Validate: story mentions at least 5 real numbers
   - Validate: length is 150–300 words
   - Validate: no financial advice given (mirror, not advisor)

5. Store in `stories` table with user_id + month_year

6. Trigger: cron job runs on 1st of each month per user
```

#### Narrative Prompt Contract
```
System:
  You are a personal financial storyteller for Indian users.
  Rules:
  - Non-judgmental: never say "overspent" or "wasted"
  - Specific: always cite real numbers and merchant names
  - Human: write like a smart friend explaining their month, not a finance textbook
  - Length: 150-250 words
  - Structure: What happened → What drove it → One thing to notice
  - End with 1 concrete, specific observation (not advice)
  - Never give investment or savings advice

User data context:
  {
    "month": "April 2025",
    "total_spend": 24300,
    "vs_last_month": +2100,
    "top_categories": [...],
    "top_merchants": [...],
    "subscriptions": [...],
    "largest_single_txn": {...},
    "fixed_vs_variable": { "fixed": 8200, "variable": 16100 }
  }

Generate the monthly financial story.
```

#### Milestone ✅
- Narrative auto-generates for any user with 30+ days of data
- Story quality manually reviewed by team: passes specificity + tone check
- Stories stored in DB and visible in "My Story" screen

---

### 📦 SPRINT 5 (Week 9): Subscription Detection + Smart Insights
**Goal:** Automatically surface 3 insights every user sees without asking

#### Subscription Detection Logic
```
For each merchant:
  1. Count transaction frequency per merchant
  2. Check: same amount (±5%) within 28–35 day interval
  3. Flag as "subscription" if 2+ occurrences match
  4. Surface: name, amount, last_used_date, total_spent_ytd
  5. Inactive flag: if no activity from this merchant in 45+ days
```

#### Auto-Surfaced Insights (3 per user, always visible)
| Insight Type | Example |
|---|---|
| Subscription audit | "4 active subscriptions → ₹1,840/mo. 2 unused for 45+ days" |
| Top merchant | "You've spent ₹3,100 on Swiggy this month — your biggest single vendor" |
| Fixed/variable split | "62% of your spending is variable — you have flexibility to adjust" |
| MoM spike | "Food spend jumped 34% vs last month. What changed?" |
| Biggest single transaction | "Your largest purchase: IndiGo flight — ₹6,200" |

#### Milestone ✅
- Each user sees 3 auto-generated insights on dashboard load
- Subscription list visible with "last used" date and monthly cost
- Insights refresh with each new data sync

---

### 📦 SPRINT 6 (Weeks 10–12): Beta Testing + Iteration
**Goal:** Ship to 20 beta users, collect feedback, iterate on top 3 issues

#### Beta Onboarding Process
```
Week 10: Recruit 20 beta users
  - Personal network first (control quality of feedback)
  - Target: 15 salaried professionals (Persona A), 5 couples (Persona B)
  - Screener: Must have 2+ active bank accounts

Week 11: Onboard + observe
  - 1:1 onboarding call (15 min) — watch them connect accounts
  - Leave them to explore for 1 week
  - Day 3 check-in: "Did you see anything surprising?"
  - Day 7: Full feedback survey + NPS

Week 12: Synthesize + fix
  - Categorize feedback by severity (Critical / Major / Minor)
  - Fix top 3 issues
  - Prepare for 50-user MVP expansion
```

#### Beta Feedback Survey (Key Questions)
1. On a scale of 1–10, how clearly do you now understand your spending? (pre vs post)
2. Did the monthly story tell you something you didn't already know? (Yes/No/Somewhat)
3. What was the most valuable part of the app?
4. What confused you most?
5. Would you pay ₹199/month for this? (Yes / Maybe / No)
6. NPS: How likely are you to recommend this to a friend? (0–10)

#### Success Metrics — Beta Exit Gate
| Metric | Target to pass |
|---|---|
| Story open rate | > 55% |
| "Learned something new" | > 70% of users say Yes/Somewhat |
| Categorization accuracy | > 85% (user-validated) |
| D7 retention | > 50% |
| NPS | > 35 |
| Willingness to pay ₹199 | > 40% say Yes/Maybe |

---

## Database Schema

```sql
-- Users
users (id, email, phone, created_at, plan)

-- Bank accounts connected
accounts (
  id, user_id, account_number_masked,
  bank_name, account_type, -- SAVINGS / CREDIT_CARD / etc
  setu_consent_id, setu_fi_type,
  last_synced_at, is_active
)

-- All transactions (normalized)
transactions (
  id, user_id, account_id,
  amount, type,            -- DEBIT / CREDIT
  date, merchant_raw,      -- original description
  merchant_clean,          -- normalized name
  category, subcategory,
  is_recurring, confidence_score,
  source                   -- setu / csv / manual
)

-- User-corrected categories (training signal)
user_category_overrides (
  id, transaction_id, user_id,
  original_category, corrected_category, corrected_at
)

-- Detected subscriptions
subscriptions (
  id, user_id, merchant_clean,
  amount, frequency_days,
  first_seen, last_seen, is_active, is_used
)

-- AI-generated monthly stories
stories (
  id, user_id, month_year,   -- "2025-04"
  narrative_text, generated_at,
  open_count, last_opened_at
)

-- Auto-surfaced insights
insights (
  id, user_id, type, title, body,
  data_json, created_at, dismissed_at
)
```

---

## API Contract (Backend → Frontend)

```
GET  /api/dashboard/summary         → total spend, MoM change, top categories
GET  /api/dashboard/transactions    → paginated transaction list with filters
GET  /api/dashboard/categories      → category breakdown with drill-down
GET  /api/dashboard/subscriptions   → detected subscriptions
GET  /api/dashboard/insights        → 3 auto-surfaced insights
GET  /api/story/current             → this month's narrative
GET  /api/story/history             → past 6 months of stories

POST /api/accounts/connect          → initiate Setu AA consent flow
POST /api/accounts/upload           → handle CSV/PDF upload
POST /api/transactions/correct      → user corrects a category
POST /api/accounts/sync             → trigger manual data refresh

Webhook:
POST /api/setu/webhook              → Setu status updates (consent, data ready)
```

---

## Tech Stack — Finalized

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Web-first, fast iteration, SSR for performance |
| **UI components** | shadcn/ui + Tailwind | Beautiful, accessible components fast |
| **Charts** | Recharts | Lightweight, React-native, customizable |
| **Animations** | Framer Motion | Entry animations, smooth transitions |
| **Auth** | Supabase Auth (email OTP) | No password friction for Indian users |
| **Database** | Supabase (Postgres) | Real-time, auth, storage in one |
| **AA Integration** | Setu AA API | Best DX, sandbox ready, India-native |
| **PDF Parsing** | pdf-parse + LLM extraction | For CSV/PDF fallback upload |
| **AI / LLM** | Gemini 1.5 Flash (categorization) + Gemini 1.5 Pro (narrative) | Cost-efficient + high quality |
| **Email** | Resend | Monthly story email delivery |
| **Hosting** | Vercel | Zero-config Next.js deployment |
| **Cron jobs** | Vercel Cron or Supabase Functions | Monthly story generation trigger |

---

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Setu AA
SETU_AA_API_KEY=
SETU_CLIENT_API_KEY=
SETU_PRIVATE_KEY=          # RSA private key for request signing
SETU_WEBHOOK_SECRET=       # For webhook verification
SETU_BASE_URL=             # Sandbox: https://aa-sandbox.setu.co

# Google AI
GEMINI_API_KEY=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Phase 2 Preview — What Gets Built Next

Once Phase 1 exits beta with passing metrics:

| Phase 2 Feature | Depends on Phase 1 |
|---|---|
| Behavioral pattern analysis | Needs 3+ months of transaction history |
| Impulse spend detection | Needs time-of-day + day-of-week metadata (captured in Phase 1) |
| Mood × spending correlation | Add mood check-in widget to Phase 1 app |
| Conversational Q&A | Vector embeddings of transaction data (add column in Phase 1) |
| Peer benchmarking | Needs 50+ users with verified data (from Phase 1 MVP) |
| Richer narrative | LLM prompt evolution — same pipeline, richer context |

> **Design principle:** Phase 1 data model is built to support Phase 2. Category + time + merchant metadata captured now becomes training data for behavioral intelligence later.

---

## Pre-Sprint Checklist (Do Before Week 1)

- [ ] Register on [bridge.setu.co](https://bridge.setu.co) → create FIU product instance
- [ ] Set up Supabase project → get API keys
- [ ] Create Gemini API key (Google AI Studio)
- [ ] Create Resend account → get API key
- [ ] Set up GitHub repo + Vercel project
- [ ] Generate RSA key pair for Setu request signing
- [ ] Download Setu's Postman collection → test consent flow manually first
