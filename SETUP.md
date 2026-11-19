# Bulcha International Hotel — Digital Menu Setup Guide

## Quick Start

```bash
# 1. Install dependencies (already done if node_modules exists)
npm install

# 2. Start development server
npm run dev
# → http://localhost:8080
```

---

## Step 1 — Initialize Database Schema

Open your **Supabase SQL Editor**:
1. Go to https://app.supabase.com
2. Select your project (`ocissjwjidyimzsbzsxk`)
3. Click **SQL Editor** → **New query**
4. Open `supabase/00_init_schema.sql` from this repository
5. Paste the entire contents and click **Run**

This creates all tables, policies, and functions.

## Step 2 — Seed the Menu Database

Still in the **Supabase SQL Editor**:
1. Click **New query**
2. Open `supabase/seed.sql` from this repository
3. Paste the entire contents and click **Run**

This seeds:
- **14 categories** (Breakfast, Ethiopian, Starters, Soups, Fish, Pizza, Burgers, Italian, Juices, Coffee, Cold Drinks, Desserts, Wine & Bar, Packages)
- **165 menu items** with real prices from the Excel database, Unsplash food photos, and trilingual names (English / Amharic / Oromo)
- **29 tables + rooms** for QR code generation
- **Hotel settings** (VAT 15%, ETB currency, multilingual)

---

## Step 3 — Create Admin User

```sql
-- In Supabase SQL Editor, after seeding:
-- 1. Create a user via Supabase Auth (Authentication → Users → Add user)
-- 2. Then assign admin role:
INSERT INTO user_roles (user_id, role)
VALUES ('<paste-user-uuid-here>', 'admin');
```

Then log in at: http://localhost:8080/admin/login

---

## Application Structure

| URL | Description |
|-----|-------------|
| `/` | Hotel homepage — hero, featured dishes, today's special, QR CTA, contact |
| `/menu` | Guest digital menu — search, filter, cart, ordering |
| `/menu?table=5` | QR scan landing for Table 5 |
| `/menu?room=204` | QR scan landing for Room 204 |
| `/order/:id` | Live order tracking with real-time status |
| `/pay/:id` | Payment page (Chapa, Telebirr, CBE, Cash) |
| `/admin` | Admin dashboard overview |
| `/admin/meals` | Add/edit/hide food items |
| `/admin/drinks` | Add/edit/hide drink items |
| `/admin/categories` | Manage categories |
| `/admin/availability` | Toggle item availability |
| `/admin/media` | Photo library |
| `/admin/settings` | Hotel settings (name, logo, VAT, hours) |
| `/qr-codes` | Generate & print QR codes for all tables/rooms |
| `/dashboard` | Live orders kitchen display |
| `/payments` | Payment approvals |

---

## 5 Core Features

### 1. Digital Menu Website
- Responsive mobile-first design (mobile, tablet, desktop)
- Full 14-category menu with 165 real items from Excel
- ETB pricing with 15% VAT display
- Trilingual: English / Amharic / Oromo
- Dark/light mode toggle

### 2. QR Menu System
- Every table and room gets a unique QR code
- QR encodes the URL: `https://your-domain.com/menu?table=5`
- Generated via the `qrcode` library — no external service needed
- Print-ready A4 QR sheet from `/qr-codes` admin page
- Download individual PNGs for each table

### 3. Ordering Interface
- Add items to cart with quantity + per-item notes
- Adjust quantities or remove items in the cart sheet
- Enter table number or room number
- Order note field for kitchen instructions
- VAT-inclusive total calculation
- Order submitted to Supabase → real-time kitchen display
- Order confirmation screen with order number

### 4. Admin Dashboard
- **Menu management**: Add, edit, hide or delete any item
- **Photo upload**: Upload dish photos to Supabase storage
- **Price management**: Change prices with full audit trail in `price_history`
- **Availability toggle**: Mark items out-of-stock instantly
- **Category management**: Reorder, rename, show/hide categories
- **Activity log**: Full audit trail of every admin action
- **Settings**: Hotel name, logo, VAT, currency, opening hours, Wi-Fi info

### 5. Excel Data
All 165 active menu items from the Excel file are seeded exactly:
- Original article codes preserved as item IDs
- Original prices preserved to the cent
- Excluded: test records, inactive items, non-food items (clothing, fuel, etc.)
- Price review records flagged (Tea with coffee — ETB 0, needs confirmation)

---

## Production Deployment

```bash
# Build for production
npm run build

# The built output is in .output/
# Deploy to any Node.js host (Vercel, Railway, Render, etc.)
```

After deploying, update the QR codes to point to your production URL.
The QR code generator uses `window.location.origin` automatically.

---

## Environment Variables

Already set in `.env`:
```
SUPABASE_URL=https://ocissjwjidyimzsbzsxk.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```
