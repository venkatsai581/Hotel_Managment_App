import { fmtLocal } from "../data/rooms.js";
import { MAX_GUESTS, MAX_NIGHTS, TAX_RATE } from "../config.js";

export const money = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
export const today = () => fmtLocal(new Date());
export const addDays = (n, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + n); return fmtLocal(d); };
const parse = (s) => new Date(s + "T00:00:00");
export const nightsBetween = (a, b) => (a && b ? Math.round((parse(b) - parse(a)) / 86400000) : 0);
export const fmtDate = (s) => (s ? parse(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
export const fmtDay = (s) => (s ? parse(s).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "—");
export const initials = (name) => (name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "G";
export const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

export function priceBreakdown(price, nights) {
  const subtotal = price * Math.max(0, nights);
  const taxes = Math.round(subtotal * TAX_RATE);
  return { subtotal, taxes, total: subtotal + taxes };
}

/** Validates search criteria. Returns an object of field -> message (empty when valid). */
export function validateSearch({ checkIn, checkOut, guests }) {
  const e = {};
  if (!checkIn) e.checkIn = "Choose a check-in date.";
  else if (checkIn < today()) e.checkIn = "Check-in cannot be in the past.";
  if (!checkOut) e.checkOut = "Choose a check-out date.";
  else if (checkIn && checkOut <= checkIn) e.checkOut = "Check-out must be after check-in.";
  else if (nightsBetween(checkIn, checkOut) > MAX_NIGHTS) e.checkOut = `Stays are limited to ${MAX_NIGHTS} nights.`;
  const g = Number(guests);
  if (!Number.isInteger(g) || g < 1) e.guests = "At least 1 guest is required.";
  else if (g > MAX_GUESTS) e.guests = `Maximum ${MAX_GUESTS} guests per booking.`;
  return e;
}

export function validateGuest({ name, email, phone }) {
  const e = {};
  if (!/^[A-Za-z][A-Za-z .'-]{1,59}$/.test((name || "").trim())) e.name = "Enter the guest's full name (letters only).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email || "").trim())) e.email = "Enter a valid email address.";
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) e.phone = "Enter a valid phone number (10–13 digits).";
  return e;
}

export const firstError = (e) => Object.values(e)[0];

/** Units free for the given nights = room.units minus overlapping confirmed bookings. */
export function unitsLeft(room, bookings, checkIn, checkOut) {
  if (!room.active) return 0;
  if (!checkIn || !checkOut || checkOut <= checkIn) return room.units;
  const used = bookings.filter((b) => b.roomId === room.id && b.status === "Confirmed" && b.checkIn < checkOut && b.checkOut > checkIn).length;
  return Math.max(0, room.units - used);
}

export function read(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
}
export function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

export function downloadICS(b) {
  const f = (s) => s.replace(/-/g, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bissful Hotels//EN", "BEGIN:VEVENT", `UID:${b.id}@bissfulhotels`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, `DTSTART;VALUE=DATE:${f(b.checkIn)}`, `DTEND;VALUE=DATE:${f(b.checkOut)}`, `SUMMARY:Stay at ${b.hotel}`, `LOCATION:${b.hotel}\\, ${b.city}`, `DESCRIPTION:${b.roomName} - Ref ${b.id}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = `${b.id}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
}
