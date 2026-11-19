import React, { useState } from "react";
import { ArrowRight, ShieldCheck, Search, Check } from "lucide-react";
import { Link, navigate } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { Breadcrumbs, EmptyState, Field, SafeImage } from "../components/ui.jsx";
import { addDays, firstError, fmtDay, money, nightsBetween, plural, priceBreakdown, today, validateGuest, validateSearch } from "../lib/utils.js";
import { MAX_GUESTS } from "../config.js";

export const Stepper = ({ step }) => (
  <ol className="stepper" aria-label="Booking progress">
    {["Choose room", "Guest details", "Confirmation"].map((s, i) => (
      <li key={s} className={i < step ? "done" : i === step ? "current" : ""}><span>{i < step ? <Check size={14} /> : i + 1}</span>{s}</li>
    ))}
  </ol>
);

export default function Booking({ id }) {
  const { rooms, search, setSearch, profile, setProfile, availability, createBooking, notify } = useStore();
  const room = rooms.find((r) => String(r.id) === String(id));
  const [trip, setTrip] = useState({ checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests });
  const [form, setForm] = useState({ name: profile.name, email: profile.email, phone: profile.phone, special: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (!room) return <div className="container page"><EmptyState icon={Search} title="Room not found" text="Please pick a room to continue."><Link to="/search" className="btn btn-primary">Browse rooms</Link></EmptyState></div>;

  const nights = nightsBetween(trip.checkIn, trip.checkOut);
  const { subtotal, taxes, total } = priceBreakdown(room.price, nights);
  const setT = (p) => { const n = { ...trip, ...p }; if (p.checkIn && n.checkOut <= p.checkIn) n.checkOut = addDays(1, new Date(p.checkIn + "T00:00:00")); setTrip(n); setErrors({}); };
  const setF = (p) => { setForm({ ...form, ...p }); setErrors({}); };

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    const errs = { ...validateSearch(trip), ...validateGuest(form) };
    if (!errs.guests && Number(trip.guests) > room.guests) errs.guests = `This room sleeps up to ${room.guests} guests.`;
    if (!agree) errs.agree = "Please accept the cancellation policy.";
    setErrors(errs);
    if (Object.keys(errs).length) return notify(firstError(errs), "error");
    if (availability(room, trip.checkIn, trip.checkOut) === 0) return notify("This room was just booked for your dates. Please choose other dates.", "error");
    setBusy(true);
    const b = createBooking(room, form, trip);
    setSearch(trip); setProfile({ ...profile, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    notify("Booking confirmed! Reference " + b.id);
    navigate(`/confirmation/${b.id}`);
  };

  return (
    <div className="container page">
      <Breadcrumbs items={[["Home", "/"], ["Rooms", "/search"], [room.name, `/rooms/${room.id}`], ["Guest details"]]} />
      <Stepper step={1} />
      <form className="booking-layout" onSubmit={submit} noValidate>
        <div className="stack">
          <section className="card">
            <h2>Your trip</h2>
            <div className="form-grid cols-3">
              <Field label="Check-in" error={errors.checkIn}><input type="date" min={today()} value={trip.checkIn} onChange={(e) => setT({ checkIn: e.target.value })} /></Field>
              <Field label="Check-out" error={errors.checkOut}><input type="date" min={trip.checkIn} value={trip.checkOut} onChange={(e) => setT({ checkOut: e.target.value })} /></Field>
              <Field label="Guests" error={errors.guests}><select value={trip.guests} onChange={(e) => setT({ guests: Number(e.target.value) })}>{Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{plural(n, "guest")}</option>)}</select></Field>
            </div>
          </section>
          <section className="card">
            <h2>Guest information</h2><p className="muted">Fields marked * are required.</p>
            <div className="form-grid">
              <Field label="Full name *" error={errors.name} full><input autoComplete="name" value={form.name} onChange={(e) => setF({ name: e.target.value })} placeholder="e.g. Priya Sharma" /></Field>
              <Field label="Email address *" error={errors.email}><input type="email" autoComplete="email" value={form.email} onChange={(e) => setF({ email: e.target.value })} placeholder="you@example.com" /></Field>
              <Field label="Phone number *" error={errors.phone}><input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setF({ phone: e.target.value })} placeholder="+91 98765 43210" /></Field>
              <Field label="Special requests" full hint="Optional — e.g. late check-in, extra bed, quiet room"><textarea rows="3" maxLength={300} value={form.special} onChange={(e) => setF({ special: e.target.value })} /></Field>
            </div>
            <label className={"check agree" + (errors.agree ? " has-error" : "")}><input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErrors({}); }} /> I agree to the cancellation policy: free cancellation up to 48 hours before check-in.</label>
            {errors.agree && <span className="field-error" role="alert">{errors.agree}</span>}
            <div className="alert alert-info"><ShieldCheck size={18} /> This is a frontend demo — no payment is collected.</div>
            <div className="form-actions"><Link to={`/rooms/${room.id}`} className="btn btn-outline">Back to room</Link><button className="btn btn-primary" type="submit" disabled={busy}>Confirm booking <ArrowRight size={17} /></button></div>
          </section>
        </div>
        <aside className="summary-card">
          <SafeImage src={room.image} alt={room.name} />
          <div className="summary-body">
            <p className="eyebrow">{room.hotel} · {room.city}</p><h3>{room.name}</h3>
            <div className="price-lines">
              <div><span>Check-in</span><b>{fmtDay(trip.checkIn)}</b></div>
              <div><span>Check-out</span><b>{fmtDay(trip.checkOut)}</b></div>
              <div><span>Duration</span><b>{nights > 0 ? plural(nights, "night") : "—"}</b></div>
              <div><span>Guests</span><b>{trip.guests}</b></div>
              <hr />
              <div><span>{money(room.price)} × {Math.max(nights, 0)}</span><b>{money(subtotal)}</b></div>
              <div><span>Taxes & fees (12%)</span><b>{money(taxes)}</b></div>
              <div className="total"><span>Total (sample)</span><b>{money(total)}</b></div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
