import React, { useState } from "react";
import { BedDouble, Users, Maximize2, Star, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Clock, Share2, MapPin, Search } from "lucide-react";
import { Link, navigate } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { galleryFor, REVIEWS } from "../data/rooms.js";
import { Breadcrumbs, EmptyState, Field, Modal, Rating, SafeImage, SaveButton, amenityIcon } from "../components/ui.jsx";
import RoomCard from "../components/RoomCard.jsx";
import { addDays, firstError, fmtDate, money, nightsBetween, plural, priceBreakdown, today, validateSearch, initials } from "../lib/utils.js";
import { MAX_GUESTS } from "../config.js";

export default function RoomDetails({ id }) {
  const { rooms, search, setSearch, availability, notify } = useStore();
  const room = rooms.find((r) => String(r.id) === String(id));
  const [img, setImg] = useState(0);
  const [light, setLight] = useState(false);
  const [d, setD] = useState({ checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests });
  const [errors, setErrors] = useState({});

  if (!room) return <div className="container page"><EmptyState icon={Search} title="Room not found" text="This room may have been removed from the catalogue."><Link to="/search" className="btn btn-primary">Browse rooms</Link></EmptyState></div>;

  const gallery = galleryFor(room);
  const nights = nightsBetween(d.checkIn, d.checkOut);
  const { subtotal, taxes, total } = priceBreakdown(room.price, nights);
  const left = availability(room, d.checkIn, d.checkOut);
  const set = (p) => {
    const n = { ...d, ...p };
    if (p.checkIn && n.checkOut <= p.checkIn) n.checkOut = addDays(1, new Date(p.checkIn + "T00:00:00"));
    setD(n); setErrors({});
  };
  const similar = rooms.filter((r) => r.id !== room.id && r.active && (r.city === room.city || r.category === room.category)).slice(0, 3);

  const reserve = () => {
    const e = validateSearch(d);
    if (!e.guests && Number(d.guests) > room.guests) e.guests = `This room sleeps up to ${room.guests} guests.`;
    setErrors(e);
    if (Object.keys(e).length) return notify(firstError(e), "error");
    if (left === 0) return notify("Sorry, this room is sold out for the selected dates.", "error");
    setSearch(d);
    navigate(`/book/${room.id}`);
  };
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); notify("Room link copied to clipboard."); } catch { notify("Copy the link from your browser's address bar.", "error"); }
  };

  return (
    <div className="container page">
      <Breadcrumbs items={[["Home", "/"], ["Rooms", "/search"], [room.name]]} />
      <div className="detail-top">
        <div>
          <p className="eyebrow">{room.hotel} · {room.area}, {room.city}</p>
          <h1>{room.name}</h1>
          <div className="detail-sub"><Rating value={room.rating} count={`${room.reviews} reviews`} /><span><MapPin size={14} /> {room.area}, {room.city}</span></div>
        </div>
        <div className="detail-actions"><button className="btn btn-outline btn-small" onClick={share}><Share2 size={15} /> Share</button><SaveButton id={room.id} className="heart-inline" /></div>
      </div>

      <div className="gallery">
        <button className="gallery-main" onClick={() => setLight(true)} aria-label="Open photo viewer"><SafeImage src={gallery[img]} alt={`${room.name} photo ${img + 1}`} /><span className="zoom"><Maximize2 size={15} /> View photos</span></button>
        <div className="gallery-thumbs">{gallery.map((g, i) => <button key={i} className={i === img ? "on" : ""} onClick={() => setImg(i)} aria-label={`Show photo ${i + 1}`}><SafeImage src={g} alt="" /></button>)}</div>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="fact-row"><span><BedDouble size={18} /><b>{room.beds}</b>Bedding</span><span><Users size={18} /><b>Up to {room.guests}</b>Guests</span><span><Maximize2 size={18} /><b>{room.size}</b>Room size</span><span><Star size={18} /><b>{room.category}</b>Category</span></div>
          <h2>About this room</h2><p className="lead">{room.description}</p>
          <h2>Amenities</h2>
          <ul className="amenity-grid">{room.amenities.map((a) => <li key={a}>{amenityIcon(a, 18)}{a}</li>)}</ul>
          <h2>Good to know</h2>
          <div className="policy-grid">
            <div><Clock size={18} /><b>Check-in 2:00 PM · Check-out 11:00 AM</b><small>Early check-in on request, subject to availability.</small></div>
            <div><ShieldCheck size={18} /><b>Free cancellation</b><small>Cancel up to 48 hours before check-in at no cost.</small></div>
          </div>
          <h2>Guest reviews</h2>
          <div className="mini-reviews">{REVIEWS.slice(0, 2).map((r) => <figure key={r.name}><figcaption><span className="avatar">{initials(r.name)}</span><b>{r.name}</b><span className="rating"><Star size={12} fill="currentColor" /> 5.0</span></figcaption><blockquote>{r.text}</blockquote></figure>)}</div>
        </div>

        <aside className="book-card">
          <div className="book-price"><strong>{money(room.price)}</strong><span>/ night</span></div>
          <div className="form-grid">
            <Field label="Check-in" error={errors.checkIn}><input type="date" min={today()} value={d.checkIn} onChange={(e) => set({ checkIn: e.target.value })} /></Field>
            <Field label="Check-out" error={errors.checkOut}><input type="date" min={d.checkIn} value={d.checkOut} onChange={(e) => set({ checkOut: e.target.value })} /></Field>
            <Field label="Guests" error={errors.guests} full>
              <select value={d.guests} onChange={(e) => set({ guests: Number(e.target.value) })}>{Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{plural(n, "guest")}</option>)}</select>
            </Field>
          </div>
          {nights > 0 && (
            <div className="price-lines">
              <div><span>{money(room.price)} × {plural(nights, "night")}</span><b>{money(subtotal)}</b></div>
              <div><span>Taxes & fees (12%)</span><b>{money(taxes)}</b></div>
              <div className="total"><span>Total (sample)</span><b>{money(total)}</b></div>
            </div>
          )}
          {left === 0 ? <p className="stock-note out">Sold out for these dates — try different dates.</p> : left <= 2 && <p className="stock-note low">Only {left} {left === 1 ? "room" : "rooms"} left for these dates</p>}
          <button className="btn btn-primary btn-wide" onClick={reserve} disabled={left === 0}>Reserve this room <ArrowRight size={17} /></button>
          <p className="fine">No payment needed today. Free cancellation up to 48 hours before check-in.</p>
        </aside>
      </div>

      {similar.length > 0 && <section className="section"><div className="section-head"><div><p className="eyebrow">More to explore</p><h2>Similar stays</h2></div></div><div className="room-grid">{similar.map((r) => <RoomCard key={r.id} room={r} />)}</div></section>}

      {light && (
        <Modal title={`${room.name} — photo ${img + 1} of ${gallery.length}`} onClose={() => setLight(false)} wide>
          <div className="lightbox"><button className="icon-btn" onClick={() => setImg((img + gallery.length - 1) % gallery.length)} aria-label="Previous photo"><ChevronLeft /></button><SafeImage src={gallery[img]} alt={room.name} /><button className="icon-btn" onClick={() => setImg((img + 1) % gallery.length)} aria-label="Next photo"><ChevronRight /></button></div>
        </Modal>
      )}
    </div>
  );
}
