# Blissful Hotels — Hotel Booking Management System

A responsive React + Vite frontend for searching rooms, booking stays and managing reservations.
(Formerly "StayEase" — the product name lives in one file: `src/config.js`.)

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build && npm run preview
```
Requires Node.js 18+. Room photos load from Unsplash (internet needed); a graceful placeholder shows offline.

## Pages (hash routes — back/forward buttons and deep links work)
| Route | Module |
|---|---|
| `#/` | 1. Landing page, destinations, room catalogue with category chips, keyword search and sorting |
| `#/search` | 3 & 4. Destination / check-in / check-out / guests search → availability results, sidebar filters (type, price, rating, amenities), sold-out / "only N left" states |
| `#/rooms/:id` | 2. Room details: photo gallery + lightbox, amenities, policies, live price breakdown, save & share |
| `#/book/:id` | 5. Trip + guest information form with inline validation |
| `#/confirmation/:ref` | 6. Confirmation with reference, add-to-calendar (.ics), print |
| `#/bookings` | 7. My Bookings: tabs, search, details modal, cancellation confirmation with refund note |
| `#/admin`, `/admin/rooms`, `/admin/bookings` | 8 & 9. Overview stats, room & pricing management (add / edit / inline price / list-unlist / delete), booking management (filter, view, cancel, reinstate, delete) |
| `#/profile`, `/profile/preferences`, `/profile/saved` | 10. Profile, persisted settings, saved stays |
| `#/help` | FAQ accordion and contact form |

## Functional requirements
- **Validation:** past dates, check-out ≤ check-in, > 30 nights, 1–6 guests, guests vs. room capacity, name / e-mail / phone formats.
- **Pricing:** nights are calculated from the dates; totals show room charge + 12 % sample tax.
- **Booking create / cancel:** creates a confirmed booking; cancel moves it to Cancelled (and frees the room units).
- **Persistence:** rooms, bookings, profile, preferences, saved stays and last search are stored in `localStorage` (`Blissful Hotels:v2:*`). Three sample bookings are seeded on first run; "Reset demo data" restores them.
- **Sample availability:** each room has a number of units; confirmed bookings overlapping the chosen dates reduce what is left. No real inventory service or payments.
- **UX:** responsive navigation with mobile menu, filter drawer on phones, stacked admin tables on small screens, toasts, empty states, 404 pages.

## Structure
```
src/config.js        brand name, tax rate, limits
src/data/rooms.js    sample rooms, destinations, FAQs, seed bookings
src/store.jsx        global state + localStorage persistence
src/lib/             router, validation / price helpers, filters
src/components/      header/footer, search bar, room card, modals, UI kit
src/pages/           one file per page
```
