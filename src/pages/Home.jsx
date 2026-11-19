import React, { useMemo, useState } from "react";
import { ShieldCheck, Clock, Heart, Headphones, ArrowRight, Search, SlidersHorizontal, Quote, MousePointerClick, CalendarCheck, KeyRound } from "lucide-react";
import { Link, navigate } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { DESTINATIONS, HERO_IMAGE, REVIEWS, CATEGORIES } from "../data/rooms.js";
import SearchBar from "../components/SearchBar.jsx";
import RoomCard from "../components/RoomCard.jsx";
import { EmptyState, SafeImage } from "../components/ui.jsx";
import { applyFilters, DEFAULT_FILTERS } from "../lib/filter.js";
import { initials } from "../lib/utils.js";

export default function Home() {
  const { rooms, setSearch, availability, search } = useStore();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recommended");
  const list = useMemo(
    () => applyFilters(rooms, { destination: "", guests: 1 }, { ...DEFAULT_FILTERS, q, sort, categories: cat === "All" ? [] : [cat] }, availability, { useGuests: false }),
    [rooms, cat, q, sort, availability]);
  const cityCount = (c) => rooms.filter((r) => r.city === c && r.active).length;
  const goCity = (city) => { setSearch({ destination: city }); navigate("/search"); };

  return (
    <>
      <section className="hero" style={{ backgroundImage: `linear-gradient(105deg, rgba(8,34,40,.88) 0%, rgba(8,34,40,.55) 55%, rgba(8,34,40,.25) 100%), url(${HERO_IMAGE})` }}>
        <div className="container hero-inner">
          <span className="hero-kicker"><ShieldCheck size={15} aria-hidden /> Free cancellation on most stays</span>
          <h1>Find the right room,<br /><em>book it in minutes.</em></h1>
          <p>Compare hand-picked hotels across India by price, amenities and guest ratings — then manage every booking in one place.</p>
          <SearchBar variant="hero" />
          <div className="hero-links">
            <span>Popular:</span>
            {DESTINATIONS.map((d) => <button key={d.city} onClick={() => goCity(d.city)}>{d.city}</button>)}
          </div>
        </div>
      </section>

      <section className="trust-strip container" aria-label="Why book with us">
        {[[ShieldCheck, "Verified hotels", "Every property is checked"], [Clock, "Instant confirmation", "Reference in seconds"], [Heart, "Free cancellation", "Up to 48 hours before"], [Headphones, "Friendly support", "We're here to help"]].map(([I, t, s]) => (
          <div key={t}><span className="trust-icon"><I size={20} aria-hidden /></span><span><b>{t}</b><small>{s}</small></span></div>
        ))}
      </section>

      <section className="section container">
        <div className="section-head"><div><p className="eyebrow">Destinations</p><h2>Popular places to stay</h2></div><Link to="/search" className="link-arrow">Browse all rooms <ArrowRight size={16} /></Link></div>
        <div className="dest-grid">
          {DESTINATIONS.map((d) => (
            <button key={d.city} className="dest-card" onClick={() => goCity(d.city)}>
              <SafeImage src={d.image} alt="" /><span className="dest-shade" />
              <span className="dest-text"><b>{d.city}</b><small>{d.blurb}</small><em>{cityCount(d.city)} {cityCount(d.city) === 1 ? "room" : "rooms"}</em></span>
            </button>
          ))}
        </div>
      </section>

      <section className="section container" id="catalogue">
        <div className="section-head">
          <div><p className="eyebrow">Room catalogue</p><h2>Rooms guests love</h2></div>
          <div className="catalog-tools">
            <div className="inline-search"><Search size={16} aria-hidden /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hotel, room or city" aria-label="Search catalogue" /></div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort rooms">
              <option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option>
            </select>
          </div>
        </div>
        <div className="chip-row" role="group" aria-label="Filter by category"><SlidersHorizontal size={16} aria-hidden />
          {["All", ...CATEGORIES].map((c) => <button key={c} className={"chip" + (cat === c ? " selected" : "")} onClick={() => setCat(c)} aria-pressed={cat === c}>{c}</button>)}
        </div>
        {list.length ? <div className="room-grid">{list.map((r) => <RoomCard key={r.id} room={r} />)}</div>
          : <EmptyState icon={Search} title="No rooms match your search" text="Try a different keyword or category.">
              <button className="btn btn-outline" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</button></EmptyState>}
        {list.length > 0 && <div className="center"><Link to="/search" className="btn btn-outline">Search with dates & guests <ArrowRight size={16} /></Link></div>}
      </section>

      <section className="section how container">
        <div className="section-head"><div><p className="eyebrow">How it works</p><h2>Three steps to your stay</h2></div></div>
        <div className="steps-grid">
          {[[MousePointerClick, "Search", "Pick a destination, your dates and the number of guests."], [CalendarCheck, "Book", "Choose a room, add guest details and confirm instantly."], [KeyRound, "Stay", "Manage, download or cancel your booking anytime."]].map(([I, t, s], i) => (
            <div className="step" key={t}><span className="step-no">{i + 1}</span><I size={26} aria-hidden /><h3>{t}</h3><p>{s}</p></div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head"><div><p className="eyebrow">Guest stories</p><h2>Loved by travellers</h2></div></div>
        <div className="review-grid">
          {REVIEWS.map((r) => (
            <figure className="review" key={r.name}><Quote size={22} aria-hidden /><blockquote>{r.text}</blockquote><figcaption><span className="avatar">{initials(r.name)}</span><span><b>{r.name}</b><small>{r.city}</small></span></figcaption></figure>
          ))}
        </div>
      </section>

      <section className="container"><div className="cta">
        <div><h2>Your next trip starts here.</h2><p>Dates picked: {search.checkIn} → {search.checkOut}. See what's available.</p></div>
        <Link to="/search" className="btn btn-accent">Check availability <ArrowRight size={16} /></Link>
      </div></section>
    </>
  );
}
