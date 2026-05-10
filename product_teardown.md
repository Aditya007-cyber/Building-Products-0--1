# Product Requirements Document (PRD): Amazon AI Shopping Assistant

## 1. Product Overview & Vision
**Product Name**: Amazon AI Shopping Assistant
**Vision**: To transform the e-commerce search experience from keyword-based browsing to intent-driven conversation. The assistant acts as a personal digital stylist, understanding occasions, vibes, and complex queries to instantly curate and suggest complete, cohesive product bundles (e.g., "A relaxed outfit for my Goa trip" or "Formal attire for an office meeting").

## 2. Problem Statement
Modern e-commerce requires users to know exactly what they are looking for (e.g., "blue polo shirt men"). When shoppers need inspiration for an event, a gift, or a specific vibe, they are forced to manually browse multiple categories, evaluate matching items, and assemble looks themselves. This leads to decision fatigue and cart abandonment. 

## 3. Current State Teardown (Prototype)
The current vanilla JavaScript prototype successfully demonstrates the core user experience:
- **Chat Interface**: A WhatsApp-like chat UI where users can input natural language requests or select suggested chips.
- **Mock Intent Parser**: Uses keyword/regex matching (`goa`, `winter`, `gift`) to categorize intent into a specific "vibe" and target gender.
- **Bundle Generation**: Filters a static/dynamic catalog (partially populated by FakeStoreAPI) to present a cohesive bundle of items (e.g., ensuring a mix of different product types).
- **Cart & Quick View**: Users can view item details, select sizes, and add individual items or the *entire bundle* to their cart.
- **Mock Checkout & WhatsApp Hand-off**: A dummy secure checkout form that calculates totals and initiates a client-side WhatsApp URL redirect for order confirmation.

**Limitations of Prototype**:
- Logic is entirely client-side, making it insecure and non-scalable.
- Intent parsing is brittle (regex-based) and cannot handle nuanced or complex queries.
- No real database; cart and session state are lost on refresh.
- Fake checkout without actual payment processing.

---

## 4. Product Requirements for v1.0 (Production)

### 4.1. Core Features & Capabilities

#### A. True LLM Intent Engine
- **Requirement**: Replace regex parsing with a cloud-hosted LLM (e.g., OpenAI GPT-4o-mini).
- **Functionality**: The LLM must analyze user input to extract: `target_audience` (men/women/kids), `occasion/vibe` (casual, formal, beach), `budget` (if mentioned), and `specific_item_requests`.
- **Multi-turn Context**: The engine must remember the current conversation state. If a user says "add matching shoes," the system must know the context of the previously suggested outfit.

#### B. Intelligent Bundling System
- **Requirement**: A backend algorithm that takes the LLM's parsed parameters and queries the database to form a "Bundle."
- **Functionality**: A bundle should ideally consist of 2-4 complementary items (e.g., Top + Bottom + Accessory). The system must avoid suggesting conflicting items (e.g., two pairs of pants).

#### C. Full-Stack Web Application
- **Requirement**: Migrate the UI to a modern component-based framework.
- **Functionality**: Server-side rendering for performance, responsive design for mobile and desktop, and a sleek, premium UI utilizing modern CSS/Tailwind.

#### D. User Authentication & Persistence
- **Requirement**: Secure user accounts and database storage.
- **Functionality**: 
  - Anonymous sessions that can be upgraded to authenticated accounts (Email/Password or OAuth).
  - Persistent chat history and cart state across devices.

#### E. Secure Checkout & Payments
- **Requirement**: Real payment gateway integration.
- **Functionality**: Replace the mock checkout with Stripe Checkout or a custom Stripe Elements form. Support for credit cards and digital wallets (Apple Pay/Google Pay).

#### F. Automated Fulfillment Notifications
- **Requirement**: Server-side communication for order confirmation.
- **Functionality**: Instead of a client-side `window.open` for WhatsApp, integrate a backend service (like Twilio WhatsApp API or Resend for emails) to securely send order receipts upon successful payment webhooks.

---

## 5. User Flows

1. **Discovery & Onboarding**:
   - User lands on the app. The AI sends a welcoming message with suggested prompt chips.
2. **Intent Expression**:
   - User types a request (e.g., "I need an outfit for a summer wedding").
3. **Bundle Presentation**:
   - AI displays a conversational response followed by a visually rich product bundle.
4. **Refinement (Optional)**:
   - User asks for modifications (e.g., "Do you have a different color shirt?"). AI updates the bundle.
5. **Add to Cart**:
   - User opens the Quick View, selects a size, and adds to cart, OR clicks "Add Entire Bundle to Cart."
6. **Checkout**:
   - User proceeds to checkout, enters shipping details, and processes payment securely.
7. **Post-Purchase**:
   - Success screen displayed. Backend automatically triggers an email/WhatsApp receipt.

---

## 6. Technical Architecture & Stack

- **Frontend**: Next.js (React), standard CSS or TailwindCSS for styling.
- **Backend/API**: Next.js API Routes / Netlify Serverless Functions.
- **Database & Auth**: Supabase (PostgreSQL for catalog/orders/sessions, Supabase Auth for users).
- **AI Engine**: OpenAI API (function calling/structured outputs for intent parsing).
- **Payments**: Stripe API.
- **Hosting**: Netlify or Vercel.

## 7. Future Enhancements (Post v1.0)
- **Visual Search**: Allow users to upload a photo to find matching products.
- **User Profiling**: Save user sizes, color preferences, and past purchases to tailor future recommendations automatically.
- **Real Retailer Integration**: Connect to actual Amazon Affiliate API or Shopify storefront APIs to fetch live inventory and pricing.
