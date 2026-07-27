# Astha — Silver Idols E-Commerce

Full-stack e-commerce website for **Astha**, a premium silver idol brand (Ganesh, Lakshmi, Hanuman, Shiv, Krishna). React + Vite frontend, Express + JSON-file backend, JWT auth, cart, checkout, and order history.

## Quick Start

Run everything from the **root** folder:

```bash
npm run install:all
npm run dev
```

This installs both `server/` and `client/` dependencies, then starts:
- Backend API → http://localhost:5000
- Frontend → http://localhost:5173

Open **http://localhost:5173** in your browser. The frontend automatically proxies `/api/*` calls to the backend (see `client/vite.config.js`), so you don't need to configure anything else.

> If `npm run install:all` gives an issue, just run `npm install` inside `server/` and `client/` separately, then `npm run dev` from the root.

## What's Included

- **Signup / Login** — JWT-based auth, passwords hashed with bcrypt
- **Product catalog** — seeded with sample Ganesh/Lakshmi/Hanuman/Shiv/Krishna idols, organized by category
- **Cart** — persists in the browser (localStorage), add/update/remove
- **Checkout** — delivery details + payment method → saves a real order to the backend
- **My Account** — order history for the logged-in user
- **WhatsApp button** — floating button, opens a chat to **+91 88298 41467** with a pre-filled message
- **Instagram link** — in the navbar and footer (update the handle — see below)
- **Fully responsive** — mobile, tablet, desktop

## Things to Update Before Going Live

1. **Real product photos.** Right now each product shows an elegant gold-monogram placeholder (see `client/src/components/ProductMedallion.jsx`) since no product photography was provided. Swap these for real photos — the easiest approach is to add an `image` field to each product in `server/db.js` and render an `<img>` in `ProductCard.jsx` / `ProductDetail.jsx` instead of `<ProductMedallion />`.
2. **Instagram handle.** Currently set to a placeholder (`instagram.com/astha.silvers`) in `client/src/components/Navbar.jsx`, `Footer.jsx`, and `Contact.jsx`. Update to the real handle.
3. **JWT secret.** Copy `server/.env.example` to `server/.env` and set a real `JWT_SECRET` before deploying.
4. **Payment gateway.** Checkout currently supports Cash on Delivery / UPI / Card on Delivery as selectable options but doesn't process real payments — hook up Razorpay/Stripe when ready to accept online payments.
5. **Product catalog.** Edit the `seedProducts` array in `server/db.js` to add your real products, prices, and descriptions.

## Project Structure

```
astha-website/
├── server/              Express API (JWT auth, products, orders)
│   ├── data/db.json      JSON "database" — auto-created, resets are safe in dev
│   ├── routes/
│   └── index.js
├── client/              React + Vite frontend
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/       Auth + Cart state
│       └── styles/index.css   Design system (colors, type, layout)
└── package.json          Root scripts (npm run dev)
```

## Notes on the Database

This uses `lowdb` (a JSON file at `server/data/db.json`) instead of a full database server, so you can run the whole project with just `npm run dev` — no MongoDB/Postgres setup needed. It's fine for development and small-scale production. For a bigger catalog or high order volume, swap `db.js` for a real database (MongoDB/PostgreSQL) later — the route files won't need major changes since the query logic is isolated in `db.js`.
