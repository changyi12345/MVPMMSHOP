# MVPMMSHOP — UI/UX Design Document

> Game Top Up Platform — Web App & Mobile App  
> Version: 1.0 | Date: June 2026

---

## Table of Contents

1. [Design Overview](#1-design-overview)
2. [Design System (Shared)](#2-design-system-shared)
3. [Web App UI/UX Design](#3-web-app-uiux-design)
4. [Mobile App UI/UX Design](#4-mobile-app-uiux-design)
5. [Admin Dashboard UI/UX Design](#5-admin-dashboard-uiux-design)
6. [Accessibility & Localization](#6-accessibility--localization)
7. [Design Deliverables Checklist](#7-design-deliverables-checklist)

---

## 1. Design Overview

### 1.1 Product Vision

MVPMMSHOP သည် Mobile Game Top-Up နှင့် Voucher/Gift Card ဝယ်ယူနိုင်သော e-commerce platform ဖြစ်သည်။ Gamer များအတွက် **မြန်ဆန်၊ ယုံကြည်၊ လွယ်ကူ** စွာ game credits နှင့် voucher codes ဝယ်ယူနိုင်ရန် ရည်ရွယ်သည်။

### 1.2 Target Users (User Personas)

| Persona | Age | Behavior | Goals | Pain Points |
|---------|-----|----------|-------|-------------|
| **Casual Gamer (Ko Aung)** | 16–25 | Mobile Legends, PUBG Mobile ကစားသူ | UC/Diamonds ချက်ချင်း top-up | Player ID မှားခြင်း၊ payment confirm နှေးခြင်း |
| **Reseller (Ma Hnin)** | 20–35 | Voucher codes bulk ဝယ်ပြီး resell | Stock ရှိ/မရှိ၊ price competitive | Stock out, delivery delay |
| **Admin (Shop Owner)** | 25–40 | Orders verify, products manage | Sales track, fraud prevent | Manual payment verification workload |

### 1.3 Design Principles

1. **Speed First** — Top-up flow ကို 3 taps/clicks အတွင်း checkout အထိ ရောက်နိုင်ရမည်
2. **Trust & Transparency** — Order status, player validation, payment proof status ကို real-time ပြသရမည်
3. **Game-Centric** — Game icons, familiar terminology (UC, Diamonds, UID) သုံးရမည်
4. **Mobile-First Mindset** — Web မှာပါ mobile viewport ကို primary အဖြစ် design လုပ်ရမည်
5. **Error Prevention** — Player ID validate မလုပ်မချင်း order submit မလုပ်နိုင်ရ

### 1.4 Platform Scope

| Platform | Tech | Primary Use |
|----------|------|-------------|
| Web App (User) | Next.js | Browse, order, payment upload, order tracking |
| Web App (Admin) | Next.js | Dashboard, product/order/user management |
| Mobile App | React Native | Same as user web, optimized for mobile UX |

---

## 2. Design System (Shared)

### 2.1 Color Palette

```
Primary Colors
├── Red (Primary Action)     #FF4444  — CTA buttons, alerts, remove actions
├── Gold (Brand Accent)      #FFD700  — Logo, highlights, completed status, prices
├── Blue (Info/Processing)   #4A90E2  — Pending status, links, info badges
├── Black (Dark Background)  #1A1A1A  — Header, footer, admin sidebar
└── White (Surface)          #FFFFFF  — Cards, forms, content areas

Extended Palette
├── Gray (Page Background)   #F5F5F5  — Page bg, admin main area
├── Dark Gray (Secondary Text) #666666 — Labels, captions, placeholders
├── Light Gray (Borders)     #DDDDDD  — Input borders, dividers
├── Success Green            #22C55E  — Valid player, success toast
├── Warning Yellow           #F59E0B  — Processing status
└── Error Red (Dark)         #DC2626  — Form errors, failed orders
```

**Color Usage Rules:**
- Primary CTA (Buy Now, Checkout, Login) → Red `#FF4444`
- Secondary CTA (Browse, Cancel) → Gold `#FFD700` with black text
- Navigation active state → Gold text on black bg
- Status badges → Color-coded (see Section 2.5)

### 2.2 Typography

```
Font Family
├── Web:     "Inter", "Noto Sans Myanmar", sans-serif
└── Mobile:  System default (SF Pro / Roboto) + Noto Sans Myanmar fallback

Type Scale
├── Display/H1     32px / Bold / Line-height 1.2
├── H2             24px / Bold / Line-height 1.3
├── H3             18px / SemiBold / Line-height 1.4
├── Body           16px / Regular / Line-height 1.5
├── Body Small     14px / Regular / Line-height 1.5
├── Caption        12px / Medium / Line-height 1.4
└── Button         16px / SemiBold / Line-height 1

Myanmar Text
- Minimum body size: 16px (readability)
- Line-height: 1.6 for Myanmar paragraphs
```

### 2.3 Spacing & Layout Grid

```
Spacing Scale (8px base)
4px | 8px | 12px | 16px | 20px | 24px | 32px | 40px | 48px | 64px

Border Radius
├── Small (buttons, inputs)   8px
├── Medium (cards)            12px
├── Large (modals)            16px
└── Pill (badges, tags)       20px (full round)

Shadows
├── Card:     0 4px 6px rgba(0,0,0,0.05)
├── Elevated: 0 10px 25px rgba(0,0,0,0.15)
└── Header:   0 2px 4px rgba(0,0,0,0.1)

Web Grid
├── Max content width: 1200px
├── Admin max width:   1200px
├── Mobile breakpoint: 768px
└── Tablet breakpoint: 1024px
```

### 2.4 Component Library

#### Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| Primary | Red bg, white text, 14px padding | Buy Now, Login, Submit |
| Secondary | Gold bg, black text | Browse Games, Add to Cart |
| Outline | Transparent, red border | Cancel, Back |
| Ghost | Transparent, gold text | Nav links, text actions |
| Danger | Red outline | Remove, Delete |
| Disabled | Gray bg, 50% opacity | Unvalidated form |

**Button Sizes:** Large (48px height), Medium (44px), Small (36px)

#### Input Fields

```
Structure:
[Label — 14px, medium weight, 8px margin-bottom]
[Input — 12px padding, 8px radius, 1px #ddd border]
[Helper/Error text — 12px, 4px margin-top]

States:
- Default:   border #DDDDDD
- Focus:     border #FF4444, subtle red glow
- Error:     border #DC2626, red helper text
- Disabled:  bg #F5F5F5, cursor not-allowed
- Success:   border #22C55E (after player validation)
```

#### Cards

```
Product Card:
┌─────────────────────────┐
│  [Game Icon 64x64]      │
│  Game Name              │
│  From Rp 18,000         │  ← Gold price text
│  [Buy Now — Red btn]    │
└─────────────────────────┘
Background: white | Radius: 12px | Padding: 20px | Shadow: card
```

#### Status Badges

| Status | Background | Text Color |
|--------|------------|------------|
| PENDING | Blue `#4A90E2` | White |
| PROCESSING | Yellow `#F59E0B` | Black |
| COMPLETED | Gold `#FFD700` | Black |
| CANCELLED | Red `#FF4444` | White |
| REFUNDED | Gray `#666666` | White |
| PAYMENT_PENDING | Blue `#4A90E2` | White |
| PAYMENT_VERIFIED | Green `#22C55E` | White |

#### Toast Notifications

```
Position: Top-right (web) | Top-center (mobile)
Duration: 3–5 seconds
Types: Success (green), Error (red), Info (blue), Warning (yellow)
Animation: Slide in from top, fade out
```

#### Loading States

- **Skeleton screens** for product lists, order history
- **Spinner** for form submissions (inside button, replace text)
- **Progress bar** for order processing/polling status
- **Pull-to-refresh** on mobile lists

### 2.5 Icons

```
Icon Set: Lucide Icons (web) / React Native Vector Icons (mobile)
Size: 20px (nav), 24px (actions), 32px (empty states)

Key Icons:
🏠 Home | 🎮 Games | 🛒 Cart | 📦 Orders | 👤 Profile
🔍 Search | 📋 Copy | ✅ Valid | ❌ Invalid | 📤 Upload
💰 Wallet | 🎁 Referral | ⚙️ Settings | 🔔 Notifications
```

---

## 3. Web App UI/UX Design

### 3.1 Information Architecture

```
MVPMMSHOP Web (User)
│
├── Home (/)
├── Games (/games)
│   ├── Game List
│   ├── Game Detail (/games/[slug])
│   │   ├── Direct Top-Up Flow
│   │   └── Voucher Flow
│   └── Vouchers (/vouchers)
│
├── Cart (/cart)
├── Checkout (/checkout)
│   ├── Order Summary
│   ├── Payment Method Selection
│   └── Payment Upload
│
├── Orders (/orders)
│   └── Order Detail (/orders/[id])
│       ├── Status Timeline
│       ├── Voucher Codes (if applicable)
│       └── Payment Proof
│
├── Referral (/referral)
├── Profile (/profile)
│   ├── Account Settings
│   └── Change Password
│
└── Auth
    ├── Login (/auth/login)
    └── Register (/auth/register)
```

### 3.2 Global Layout — User Web

#### Header (Sticky)

```
┌──────────────────────────────────────────────────────────────┐
│  MVPMMSHOP (gold logo)    Home  Games  Vouchers  Cart(2)  👤 │
│  [Black background #1A1A1A, height 64px, shadow]             │
└──────────────────────────────────────────────────────────────┘

Mobile (<768px):
┌──────────────────────────────────────┐
│  ☰   MVPMMSHOP          🛒(2)  👤   │
└──────────────────────────────────────┘
Hamburger → Slide-out drawer menu
```

**Header Behavior:**
- Sticky on scroll
- Cart badge shows item count (red circle, white number)
- Logged-in: Avatar dropdown (Profile, Orders, Logout)
- Logged-out: Login button (ghost style)

#### Footer

```
┌──────────────────────────────────────────────────────────────┐
│  MVPMMSHOP                                                    │
│  About | FAQ | Contact | Terms | Privacy                     │
│  Facebook | Telegram | Viber                                  │
│  © 2026 MVPMMSHOP. All rights reserved.                      │
│  [Black bg, white text, 24px padding]                        │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Screen-by-Screen Design

---

#### 3.3.1 Home Page (/)

**Purpose:** First impression, quick access to popular games, promotions

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  HEADER                                          │
├─────────────────────────────────────────────────┤
│  HERO BANNER (full-width)                        │
│  "Game Top Up — Fast & Trusted"                  │
│  [Browse Games — Gold CTA]                       │
│  Background: gradient black → dark gray          │
│  Optional: carousel for promos                   │
├─────────────────────────────────────────────────┤
│  🔥 Popular Games (horizontal scroll cards)      │
│  [MLBB] [PUBG] [Free Fire] [HoK] [Genshin]     │
├─────────────────────────────────────────────────┤
│  🎁 Vouchers & Gift Cards (grid 4 cols)          │
├─────────────────────────────────────────────────┤
│  ✨ Why Choose MVPMMSHOP (3 feature cards)       │
│  ⚡ Instant Delivery | 🔒 Secure | 💬 24/7 Support│
├─────────────────────────────────────────────────┤
│  📢 Promo Banner / Referral CTA                  │
├─────────────────────────────────────────────────┤
│  FOOTER                                          │
└─────────────────────────────────────────────────┘
```

**UX Notes:**
- Hero CTA scrolls to games section or navigates to /games
- Popular games load from API (most ordered)
- Lazy load images with skeleton placeholders

---

#### 3.3.2 Games List (/games)

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Games & Top Up                                  │
│  [🔍 Search games...]                            │
│  Filter: [All] [Direct Top-Up] [Voucher]       │
├─────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ MLBB │ │ PUBG │ │ FF   │ │ HoK  │            │
│  │ icon │ │ icon │ │ icon │ │ icon │            │
│  │From  │ │From  │ │From  │ │From  │            │
│  │18,000│ │15,000│ │12,000│ │20,000│            │
│  │[Buy] │ │[Buy] │ │[Buy] │ │[Buy] │            │
│  └──────┘ └──────┘ └──────┘ └──────┘            │
│  (Responsive grid: 4→3→2→1 columns)              │
└─────────────────────────────────────────────────┘
```

**Interactions:**
- Search filters in real-time (debounced 300ms)
- Category tabs filter product type
- Card click OR Buy Now → Game Detail page
- Empty state: "No games found" + clear filters button

---

#### 3.3.3 Game Detail — Direct Top-Up (/games/[slug])

**Purpose:** Core conversion screen — player info + denomination selection

**Layout (Two-column on desktop, stacked on mobile):**

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Games                                             │
│  ┌──────────┐  Mobile Legends: Bang Bang                     │
│  │ Game Icon│  Direct Top-Up | Instant Delivery              │
│  │  120x120 │                                                │
│  └──────────┘                                                │
├─────────────────────────────────────────────────────────────┤
│  STEP 1: Enter Player Info                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ User ID *          [________________]                │    │
│  │ Server ID *        [▼ Select Server  ]               │    │
│  │                                                      │    │
│  │ [🔍 Validate Player]                                 │    │
│  │ ✅ Player: ProPlayer123 (shown after validation)     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  STEP 2: Select Package                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │ 50 💎  │ │100 💎  │ │250 💎  │ │500 💎  │               │
│  │18,000  │ │35,000  │ │85,000  │ │165,000 │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
│  (Selected package: gold border + checkmark)                   │
│                                                              │
│  STEP 3: Order Summary                                       │
│  Package: 100 Diamonds                                     │
│  Price: Rp 35,000                                            │
│  Player: ProPlayer123 (123456789)                            │
│                                                              │
│  [🛒 Add to Cart]  [Buy Now — Red Primary]                  │
└─────────────────────────────────────────────────────────────┘
```

**Dynamic Fields Logic:**
- Fields render based on game's `requiredFields` from API
- Server dropdown populated from `/games/servers` if `hasServers: true`
- Validate Player button disabled until required fields filled
- Buy Now disabled until player validated successfully
- Show inline error if validation fails: "Invalid Player ID"

**Validation UX Flow:**

```
User enters ID → Clicks Validate → Loading spinner on button
  → Success: Green checkmark + player name displayed
  → Fail: Red error message below input, shake animation
```

---

#### 3.3.4 Game Detail — Voucher (/vouchers/[id])

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  ← Back                                          │
│  PUBG Mobile 60 UC Voucher                       │
│  [Product Image]                                 │
│  Face Value: 60 UC                               │
│  Price: Rp 18,000                                │
│  Stock: ✅ In Stock (or ⚠️ Low Stock / ❌ Out)   │
│                                                  │
│  Quantity: [−] 1 [+]  (min 1, max stock)        │
│  Total: Rp 18,000                               │
│                                                  │
│  [🛒 Add to Cart]  [Buy Now]                    │
│                                                  │
│  ℹ️ How to Redeem:                              │
│  1. Open PUBG Mobile                             │
│  2. Go to Redeem Code section                    │
│  3. Enter voucher code                           │
└─────────────────────────────────────────────────┘
```

---

#### 3.3.5 Cart (/cart)

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Your Cart (2 items)                             │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │ MLBB 100 Diamonds                       │    │
│  │ Player: ProPlayer123 | Server: 2001     │    │
│  │ Rp 35,000          Qty: 1    [Remove]   │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │ PUBG 60 UC Voucher                      │    │
│  │ Rp 18,000          Qty: 2    [Remove]   │    │
│  └─────────────────────────────────────────┘    │
├─────────────────────────────────────────────────┤
│  Promo Code: [___________] [Apply]               │
│  ✅ SAVE10 applied — -Rp 5,300                   │
├─────────────────────────────────────────────────┤
│  Subtotal:    Rp 71,000                          │
│  Discount:   -Rp  5,300                          │
│  Total:       Rp 65,700                          │
│                                                  │
│  [Proceed to Checkout — Full width Red btn]      │
└─────────────────────────────────────────────────┘

Empty State:
  🛒 illustration
  "Your cart is empty"
  [Browse Games — Gold btn]
```

**UX Notes:**
- Top-up items show player info (non-editable in cart; edit → back to game page)
- Remove shows confirmation modal: "Remove this item?"
- Promo code inline validation with success/error feedback

---

#### 3.3.6 Checkout (/checkout)

**Multi-step checkout (3 steps with progress indicator):**

```
Step 1 — Review Order
Step 2 — Payment Method
Step 3 — Upload Payment Proof
```

**Step 1: Order Review**

```
┌─────────────────────────────────────────────────┐
│  ● Review  ○ Payment  ○ Confirm                  │
│  Order items summary (read-only)                 │
│  Total: Rp 65,700                                │
│  [Continue to Payment →]                         │
└─────────────────────────────────────────────────┘
```

**Step 2: Payment Method**

```
┌─────────────────────────────────────────────────┐
│  ○ Review  ● Payment  ○ Confirm                  │
│                                                  │
│  Select Payment Method:                          │
│  ┌─────────────────────────────────────────┐    │
│  │ ◉ KBZ Pay                               │    │
│  │   Account: 09xxxxxxxxx                  │    │
│  │   Name: MVPMMSHOP                       │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │ ○ Wave Pay                              │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │ ○ Bank Transfer (CB/MKB)                │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ⚠️ Transfer exact amount: Rp 65,700             │
│  [Copy Amount] [Copy Account Number]             │
│                                                  │
│  [Continue →]                                    │
└─────────────────────────────────────────────────┘
```

**Step 3: Upload Payment Proof**

```
┌─────────────────────────────────────────────────┐
│  ○ Review  ○ Payment  ● Confirm                  │
│                                                  │
│  Upload Payment Screenshot:                      │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│  │                                       │    │
│  │   📤 Drag & drop or click to upload   │    │
│  │   PNG, JPG (max 5MB)                  │    │
│  │                                       │    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                                  │
│  Transaction Reference (optional):             │
│  [________________________]                      │
│                                                  │
│  Note (optional):                                │
│  [________________________]                      │
│                                                  │
│  [Submit Order — Red Primary]                    │
└─────────────────────────────────────────────────┘
```

**Post-Submit:**
- Success page with order ID
- "Track your order" CTA → /orders/[id]
- Email/notification confirmation (future)

---

#### 3.3.7 Orders List (/orders)

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Your Orders                                     │
│  Filter: [All] [Pending] [Processing] [Done]   │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │ Order #ORD001          [COMPLETED 🟡]   │    │
│  │ Jun 20, 2026                            │    │
│  │ MLBB 100 Diamonds, PUBG 60 UC x2       │    │
│  │ Total: Rp 65,700                        │    │
│  │ [View Details →]                        │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │ Order #ORD002          [PENDING 🔵]     │    │
│  │ Jun 25, 2026                            │    │
│  │ Total: Rp 25,000                        │    │
│  │ [Upload Payment Proof]  [View Details]  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

#### 3.3.8 Order Detail (/orders/[id])

**Layout with Status Timeline:**

```
┌─────────────────────────────────────────────────┐
│  Order #ORD001                                   │
│  Status: [COMPLETED]                             │
├─────────────────────────────────────────────────┤
│  STATUS TIMELINE                                 │
│  ✅ Order Placed        Jun 20, 10:00 AM         │
│  ✅ Payment Verified    Jun 20, 10:15 AM         │
│  ✅ Processing          Jun 20, 10:16 AM         │
│  ✅ Completed           Jun 20, 10:18 AM         │
├─────────────────────────────────────────────────┤
│  ORDER ITEMS                                     │
│  MLBB 100 Diamonds                               │
│  Player: ProPlayer123 (123456789)                │
│  Server: 2001                                    │
│  Status: ✅ Delivered                            │
├─────────────────────────────────────────────────┤
│  VOUCHER CODES (if voucher order)                │
│  ┌─────────────────────────────────────────┐    │
│  │ ABCD-EFGH-IJKL-MNOP        [📋 Copy]    │    │
│  └─────────────────────────────────────────┘    │
│  ⚠️ Save your codes! Available for 30 days.      │
├─────────────────────────────────────────────────┤
│  PAYMENT                                         │
│  Method: KBZ Pay                                 │
│  Amount: Rp 65,700                               │
│  [View Payment Proof thumbnail]                  │
├─────────────────────────────────────────────────┤
│  Total: Rp 65,700                                │
│  [Need Help? Contact Support]                    │
└─────────────────────────────────────────────────┘
```

**Processing State UX:**
- Show animated progress bar while polling G2Bulk status
- Auto-refresh every 5 seconds
- Push notification when completed (mobile)

---

#### 3.3.9 Referral (/referral)

```
┌─────────────────────────────────────────────────┐
│  🎁 Refer & Earn                                 │
│  Invite friends and earn rewards!                │
│                                                  │
│  Your Referral Code:                             │
│  ┌─────────────────────────────────────────┐    │
│  │  MVPMM-KO1234              [📋 Copy]    │    │
│  └─────────────────────────────────────────┘    │
│  [Share via Telegram] [Share via Facebook]       │
│                                                  │
│  Stats:                                          │
│  Referrals: 5  |  Earnings: Rp 25,000            │
│                                                  │
│  Referral History table                          │
└─────────────────────────────────────────────────┘
```

---

#### 3.3.10 Auth — Login (/auth/login)

**Layout (Centered card on gradient bg):**

```
┌─────────────────────────────────────────────────┐
│           (gradient black → #333 bg)             │
│                                                  │
│     ┌───────────────────────────────┐            │
│     │       MVPMMSHOP (gold)        │            │
│     │         Login                 │            │
│     │                               │            │
│     │  Username                     │            │
│     │  [________________]           │            │
│     │  Password                     │            │
│     │  [________________] 👁        │            │
│     │                               │            │
│     │  [Login — Red full width]     │            │
│     │                               │            │
│     │  Don't have account? Register │            │
│     └───────────────────────────────┘            │
│     (white card, 400px max-width, 12px radius)    │
└─────────────────────────────────────────────────┘
```

**Register (/auth/register):** Same layout + Email field + Confirm Password + Terms checkbox

**Form Validation:**
- Inline errors on blur
- Password strength indicator on register
- Loading state on submit button

---

### 3.4 Web Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | <768px | Single column, hamburger nav, full-width buttons |
| Tablet | 768–1024px | 2-column product grid, condensed header |
| Desktop | >1024px | Full nav, 4-column grid, two-column game detail |

### 3.5 Web User Flows

#### Flow 1: Direct Top-Up Purchase

```
Home → Games → Select Game → Enter Player ID → Validate
  → Select Package → Buy Now → Checkout (Review → Payment → Upload)
  → Order Confirmation → Track Order → Completed
```

#### Flow 2: Voucher Purchase

```
Home → Vouchers → Select Product → Set Quantity → Buy Now
  → Checkout → Upload Payment → Admin Verifies → Codes Delivered
  → View Codes on Order Detail → Copy Code
```

#### Flow 3: Cart Multi-Item Checkout

```
Add multiple items to cart → Cart → Apply Promo → Checkout
  → Single payment upload for total → Multiple items processed
```

---

## 4. Mobile App UI/UX Design

### 4.1 Mobile Design Philosophy

Mobile app သည် web user features အားလုံးကို **native mobile patterns** ဖြင့် optimize လုပ်ထားသည်:
- Bottom tab navigation (thumb-friendly)
- Swipe gestures
- Push notifications for order updates
- Camera integration for payment proof upload
- Biometric login (future)
- Offline cart persistence

### 4.2 Navigation Structure

```
Bottom Tab Bar (5 tabs):
┌────────┬────────┬────────┬────────┬────────┐
│  🏠    │  🎮    │  🛒    │  📦    │  👤    │
│  Home  │ Games  │  Cart  │ Orders │ Profile│
└────────┴────────┴────────┴────────┴────────┘

Cart tab shows badge count
Active tab: Gold icon + label
Inactive: Gray icon
Background: Black #1A1A1A
Height: 56px + safe area inset
```

**Stack Navigation (within tabs):**
- Games Tab → Game List → Game Detail → Checkout
- Orders Tab → Order List → Order Detail
- Profile Tab → Settings, Referral, Auth

### 4.3 Screen-by-Screen — Mobile

---

#### 4.3.1 Splash Screen

```
┌─────────────────────┐
│                     │
│                     │
│    MVPMMSHOP        │  ← Gold text, bold
│    Game Top Up      │  ← White subtitle
│                     │
│    [Loading...]     │  ← Red spinner
│                     │
│  Background: #1A1A1A│
│  Duration: 2 sec    │
└─────────────────────┘
```

---

#### 4.3.2 Home Screen

```
┌─────────────────────┐
│ MVPMMSHOP      🔔   │  ← Header: logo + notification bell
├─────────────────────┤
│ ┌─────────────────┐ │
│ │  HERO BANNER    │ │  ← Swipeable promo carousel
│ │  "Top Up Now!"  │ │     Full-width, 180px height
│ └─────────────────┘ │
│                     │
│ 🔥 Popular Games    │
│ ┌────┐┌────┐┌────┐ │  ← Horizontal scroll
│ │MLBB││PUBG││ FF │ │     100x120 cards
│ └────┘└────┘└────┘ │
│                     │
│ 🎁 Vouchers         │
│ ┌─────────────────┐ │
│ │ PUBG 60 UC      │ │  ← Vertical list cards
│ │ Rp 18,000  [Buy]│ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ PSN $10         │ │
│ │ Rp 45,000  [Buy]│ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ 🏠  🎮  🛒  📦  👤 │  ← Bottom tabs
└─────────────────────┘
```

**Pull-to-refresh** on home screen to reload products.

---

#### 4.3.3 Games List Screen

```
┌─────────────────────┐
│ ← Games             │  ← Stack header with back (if nested)
├─────────────────────┤
│ 🔍 Search games...  │  ← Sticky search bar
│ [All][Top-Up][Voucher]│ ← Horizontal chip filters
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ 🎮 MLBB         │ │
│ │ Direct Top-Up   │ │
│ │ From Rp 18,000  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 🎮 PUBG Mobile  │ │
│ │ Direct Top-Up   │ │
│ │ From Rp 15,000  │ │
│ └─────────────────┘ │
│ (infinite scroll)   │
├─────────────────────┤
│ Bottom Tabs         │
└─────────────────────┘
```

**Mobile-specific:**
- List view (not grid) for better readability on small screens
- Tap card → navigate to Game Detail
- Haptic feedback on chip filter selection

---

#### 4.3.4 Game Detail — Direct Top-Up (Mobile)

```
┌─────────────────────┐
│ ← MLBB              │
├─────────────────────┤
│ ┌────┐              │
│ │icon│ MLBB         │  ← Game header compact
│ └────┘ Direct Top-Up│
├─────────────────────┤
│ 1. Player Info      │
│ User ID *           │
│ [____________]      │  ← Numeric keyboard
│ Server ID *         │
│ [▼ Select Server ]  │  ← Native picker modal
│                     │
│ [Validate Player]   │  ← Full width, disabled until filled
│ ✅ ProPlayer123     │
├─────────────────────┤
│ 2. Select Package   │
│ ┌───────┐┌───────┐ │
│ │ 50 💎 ││100 💎 │ │  ← 2-column grid
│ │18,000 ││35,000 │ │     Selected: gold border
│ └───────┘└───────┘ │
│ ┌───────┐┌───────┐ │
│ │250 💎 ││500 💎 │ │
│ │85,000 ││165,000│ │
│ └───────┘└───────┘ │
├─────────────────────┤
│ ░░░ STICKY FOOTER ░░│
│ Total: Rp 35,000    │
│ [Buy Now — Red]     │  ← Fixed bottom bar
└─────────────────────┘
```

**Mobile UX Enhancements:**
- Numeric keyboard for Player ID
- Server picker uses native bottom sheet modal
- Sticky footer with price + CTA always visible
- Swipe down to dismiss keyboard
- Player validation result shown as green banner below inputs

---

#### 4.3.5 Game Detail — Voucher (Mobile)

```
┌─────────────────────┐
│ ← PUBG 60 UC        │
├─────────────────────┤
│ [Product Image]     │
│ Face Value: 60 UC   │
│ Price: Rp 18,000    │
│ ✅ In Stock         │
│                     │
│ Quantity            │
│ [ − ]  1  [ + ]    │  ← Large tap targets (44px)
│                     │
│ How to Redeem ▼     │  ← Accordion/expandable
├─────────────────────┤
│ Total: Rp 18,000    │
│ [Buy Now]           │
└─────────────────────┘
```

---

#### 4.3.6 Cart Screen (Mobile)

```
┌─────────────────────┐
│ Cart (2)            │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ MLBB 100 Diamonds│ │
│ │ Player: Pro123  │ │
│ │ Rp 35,000       │ │
│ │        [🗑 Remove]│ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ PUBG 60 UC x2   │ │
│ │ Rp 36,000       │ │
│ │        [🗑 Remove]│ │
│ └─────────────────┘ │
│                     │
│ Promo: [____] Apply │
├─────────────────────┤
│ Subtotal  Rp 71,000 │
│ Discount -Rp  5,300 │
│ Total     Rp 65,700 │
│ [Checkout — Red]    │
├─────────────────────┤
│ Bottom Tabs         │
└─────────────────────┘
```

**Swipe-to-delete** on cart items (alternative to remove button).

---

#### 4.3.7 Checkout Screen (Mobile)

**Single scrollable page (not multi-step tabs — better for mobile):**

```
┌─────────────────────┐
│ ← Checkout          │
├─────────────────────┤
│ ORDER SUMMARY       │
│ (collapsible items) │
│                     │
│ PAYMENT METHOD      │
│ ◉ KBZ Pay           │
│ ○ Wave Pay          │
│ ○ Bank Transfer     │
│                     │
│ [Copy Account]      │
│ [Copy Amount]       │
│                     │
│ UPLOAD PROOF        │
│ ┌─────────────────┐ │
│ │ 📷 Take Photo   │ │  ← Camera + Gallery options
│ │ or Choose File  │ │
│ └─────────────────┘ │
│                     │
│ Reference (optional)│
│ [____________]      │
├─────────────────────┤
│ [Submit Order]      │
└─────────────────────┘
```

**Mobile-specific payment upload:**
- "Take Photo" opens camera directly
- "Choose from Gallery" opens photo picker
- Image preview with crop/retake option
- Compress image before upload (max 5MB)

---

#### 4.3.8 Orders Screen (Mobile)

```
┌─────────────────────┐
│ Orders              │
│ [All][Pending][Done]│  ← Chip filters
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ #ORD001  COMPLETED│ │
│ │ Jun 20 | Rp 65,700│ │
│ │ MLBB 100 Diamonds│ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ #ORD002  PENDING  │ │
│ │ Jun 25 | Rp 25,000│ │
│ │ [Upload Proof]    │ │
│ └─────────────────┘ │
├─────────────────────┤
│ Bottom Tabs         │
└─────────────────────┘
```

**Pull-to-refresh** to update order statuses.

---

#### 4.3.9 Order Detail (Mobile)

```
┌─────────────────────┐
│ ← Order #ORD001     │
├─────────────────────┤
│ STATUS              │
│ ●───●───●───●      │  ← Horizontal progress stepper
│ Placed Verified Processing Done
│                     │
│ ITEMS               │
│ MLBB 100 Diamonds   │
│ Player: ProPlayer123│
│ ✅ Delivered        │
│                     │
│ VOUCHER CODE        │
│ ┌─────────────────┐ │
│ │ ABCD-EFGH-...   │ │
│ │     [📋 Copy]   │ │  ← Copy + haptic + toast "Copied!"
│ └─────────────────┘ │
│                     │
│ PAYMENT             │
│ KBZ Pay | Rp 65,700 │
│ [View Screenshot]   │
└─────────────────────┘
```

---

#### 4.3.10 Profile Screen (Mobile)

```
┌─────────────────────┐
│ Profile             │
├─────────────────────┤
│ ┌────┐              │
│ │ 👤 │ Ko Aung       │
│ └────┘ aung@mail.com │
├─────────────────────┤
│ 🎁 Referral Program →│
│ ⚙️ Settings          →│
│ 🔒 Change Password   →│
│ ❓ Help & FAQ         →│
│ 📞 Contact Support   →│
│ 🚪 Logout              │
├─────────────────────┤
│ Bottom Tabs         │
└─────────────────────┘
```

---

#### 4.3.11 Auth Screens (Mobile)

**Login & Register:** Full-screen forms (not card overlay like web)

```
┌─────────────────────┐
│                     │
│    MVPMMSHOP        │  ← Gold logo centered
│                     │
│ Username            │
│ [____________]      │
│ Password            │
│ [____________] 👁   │
│                     │
│ [Login — Red]       │
│                     │
│ Forgot Password?    │
│ Register →          │
└─────────────────────┘
```

**Mobile Auth UX:**
- Auto-focus first field
- "Show/Hide password" toggle
- Biometric login option on return visits (Face ID / Fingerprint)
- Secure token storage (Keychain/Keystore)

---

### 4.4 Mobile-Specific Interactions

| Interaction | Implementation |
|-------------|----------------|
| Pull-to-refresh | Order list, Home, Games list |
| Swipe-to-delete | Cart items |
| Haptic feedback | Copy code, validate player, add to cart |
| Push notifications | Order status changes, payment verified |
| Deep linking | `mvpmms://orders/123` |
| Share sheet | Referral code sharing (native share) |
| Bottom sheet | Server picker, payment method, filters |
| Toast/Snackbar | Bottom toast (not top — thumb zone) |

### 4.5 Mobile Push Notification Design

```
┌─────────────────────────────────┐
│ MVPMMSHOP                   now │
│ ✅ Order #ORD001 Completed!     │
│ Your MLBB 100 Diamonds has been │
│ delivered to ProPlayer123.      │
└─────────────────────────────────┘

Types:
- Order Completed (green icon)
- Payment Verified (blue icon)
- Payment Rejected (red icon) — action: Re-upload
- Promo/Offer (gold icon)
```

### 4.6 Mobile User Flows

#### Flow 1: Quick Top-Up (Minimum taps)

```
Open App → Home → Tap MLBB → Enter ID → Validate → Tap Package
  → Buy Now → Select Payment → Take Photo → Submit
  = 8 taps total
```

#### Flow 2: Voucher with Copy

```
Games Tab → Vouchers filter → Select → Buy → Pay → Wait
  → Push notification → Orders → View Code → Copy
  = Code copied with haptic feedback
```

---

## 5. Admin Dashboard UI/UX Design

### 5.1 Layout Structure

```
┌──────────┬──────────────────────────────────────────────┐
│ SIDEBAR  │  MAIN CONTENT AREA                           │
│ 250px    │  (bg: #F5F5F5, padding: 32px)               │
│          │                                              │
│ MVPMMSHOP│  Page Title                                  │
│ Admin    │  Page Content                                │
│          │                                              │
│ Dashboard│                                              │
│ Products │                                              │
│ Orders   │                                              │
│ Users    │                                              │
│ Promos   │                                              │
│ Reports  │                                              │
│ Settings │                                              │
│          │                                              │
│ Logout   │                                              │
└──────────┴──────────────────────────────────────────────┘

Sidebar: Black bg, gold active link, white inactive links
Mobile Admin: Sidebar collapses to hamburger
```

### 5.2 Admin Screens

#### Dashboard (/admin/dashboard)

```
Stats Cards (4-col grid):
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 💰 Sales │ │ 📦 Orders│ │ 👥 Users │ │ ⏳ Pending│
│ 1.25M    │ │ 45       │ │ 120      │ │ 8        │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

Recent Orders Table + Quick Actions
Sales Chart (7-day line chart)
```

#### Products Management (/admin/products)

```
[+ Add Product] button (top-right, red)

Table columns:
| Image | Name | Type | Price | Stock | Status | Actions |
| Edit | Delete | Toggle Active |

Add/Edit Modal:
- Name, Type (dropdown), Price, Stock, Image upload
- G2Bulk Product ID / Game Code
- Category, Description
```

#### Orders Management (/admin/orders)

```
Filter bar: Status | Date Range | Search by Order ID/User

Table:
| Order ID | Customer | Items | Total | Status | Payment | Actions |

Actions per order:
- View Detail
- Verify Payment (if pending)
- Update Status
- Refund/Cancel

Order Detail Modal:
- Full order info
- Payment proof image (zoomable)
- Verify/Reject payment buttons
- Status update dropdown
- Voucher codes display
```

#### Payment Verification UX

```
┌─────────────────────────────────────────────────┐
│  Payment Verification — Order #ORD002            │
│                                                  │
│  Customer: Jane Smith                            │
│  Amount Expected: Rp 25,000                      │
│  Payment Method: KBZ Pay                         │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │  [Payment Screenshot — click to zoom]   │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  Reference: TXN123456                           │
│                                                  │
│  [✅ Verify Payment]  [❌ Reject — with reason]  │
└─────────────────────────────────────────────────┘
```

#### Users Management (/admin/users)

```
Table: | ID | Username | Email | Orders | Joined | Actions |
Actions: View orders, Disable account
```

#### Promo Codes (/admin/promos)

```
[+ Create Promo] 

Table: | Code | Discount | Type | Usage | Expiry | Status | Actions |

Create Modal:
- Code (auto-generate option)
- Discount type: Percentage / Fixed amount
- Min order amount
- Max uses
- Expiry date
```

#### Sales Report

```
Date range picker
Charts: Daily/Weekly/Monthly sales
Export CSV button
Top products table
```

### 5.3 Admin UX Principles

1. **Efficiency** — Bulk actions, keyboard shortcuts for power users
2. **Clear status** — Color-coded badges consistent with user-facing app
3. **Audit trail** — All admin actions logged with timestamp
4. **Confirmation modals** — For destructive actions (delete, reject payment)
5. **Real-time updates** — New orders appear without page refresh (WebSocket/polling)

---

## 6. Accessibility & Localization

### 6.1 Accessibility (WCAG 2.1 AA)

- Color contrast ratio minimum 4.5:1 for text
- All interactive elements min 44x44px tap target (mobile)
- Focus indicators visible on keyboard navigation
- Screen reader labels for icons (aria-label)
- Form errors announced to screen readers
- Alt text for all product/game images

### 6.2 Localization

**Primary Languages:** Myanmar (Burmese), English

```
Language Toggle: Header (web) | Profile Settings (mobile)

Myanmar considerations:
- Noto Sans Myanmar font
- Larger line-height (1.6)
- Number formatting: Rp / MMK based on market
- Date format: DD/MM/YYYY
```

### 6.3 Currency Display

- Primary: MMK (Myanmar Kyat) or Rp based on market
- Format: `Rp 35,000` or `35,000 MMK`
- Always show full amount in checkout (no rounding)

---

## 7. Design Deliverables Checklist

### For Designers (Figma)

- [ ] Design System / Component Library page
- [ ] User Web — All screens (desktop + mobile viewport)
- [ ] Admin Dashboard — All screens
- [ ] Mobile App — All screens (iOS + Android)
- [ ] Interactive prototype for main user flows
- [ ] Empty states, loading states, error states for each screen
- [ ] Dark mode variant (optional, future)

### For Developers

- [ ] CSS variables / theme tokens document
- [ ] Component specs (spacing, sizes, colors)
- [ ] Animation specs (duration, easing)
- [ ] Icon asset export (SVG)
- [ ] Image size guidelines (game icons: 128x128, banners: 1200x400)

### Screen Count Summary

| Area | Screens |
|------|---------|
| User Web | 15 screens |
| Admin Web | 10 screens |
| Mobile App | 18 screens |
| Shared Modals/States | 8 variants |
| **Total** | **~51 unique screens/states** |

---

## Appendix A: Order Status State Machine

```
PENDING → PAYMENT_PENDING → PAYMENT_VERIFIED → PROCESSING → COMPLETED
   ↓              ↓                                    ↓
CANCELLED    PAYMENT_REJECTED                    REFUNDED
```

## Appendix B: Error Messages (UX Copy)

| Scenario | Message (EN) | Message (MM) |
|----------|-------------|--------------|
| Invalid Player ID | "Player ID not found. Please check and try again." | "Player ID မတွေ့ပါ။ ပြန်စစ်ပါ။" |
| Out of Stock | "This product is currently out of stock." | "Stock ကုန်နေပါသည်။" |
| Payment Upload Fail | "Upload failed. Max 5MB, PNG/JPG only." | "Upload မအောင်မြင်ပါ။" |
| Network Error | "Connection lost. Please try again." | "Internet ပြတ်နေပါသည်။" |
| Session Expired | "Please login again." | "ပြန်� Login  вход�ါ။" |
| Promo Invalid | "Invalid or expired promo code." | "Promo code မမှန်ပါ။" |

## Appendix C: Animation Guidelines

| Animation | Duration | Easing |
|-----------|----------|--------|
| Page transition | 300ms | ease-in-out |
| Modal open/close | 250ms | ease-out |
| Button press | 100ms | scale(0.97) |
| Toast appear | 200ms | slide-down |
| Skeleton shimmer | 1.5s | infinite loop |
| Status badge pulse | 2s | (processing state) |

---

*Document maintained by MVPMMSHOP Team. Update when features change.*
