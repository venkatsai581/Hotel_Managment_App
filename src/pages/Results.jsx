import React, { useMemo, useState } from "react";
import { SlidersHorizontal, Search, X, CalendarDays, Users, MapPin } from "lucide-react";
import { useStore } from "../store.jsx";
import SearchBar from "../components/SearchBar.jsx";
import RoomCard from "../components/RoomCard.jsx";
import { Breadcrumbs, EmptyState } from "../components/ui.jsx";
import { applyFilters, DEFAULT_FILTERS } from "../lib/filter.js";
import { AMENITY_OPTIONS, CATEGORIES } from "../data/rooms.js";
import { fmtDay, money, nightsBetween, plural, validateSearch } from "../lib/utils.js";
import { Link } from "../lib/router.jsx";

export default function Results() {
  const { rooms, search, setSearch, availability } = useStore();
  const [f, setF] = useState(DEFAULT_FILTERS);
  const [drawer, setDrawer] = useState(false);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const toggle = (key, v) => set({ [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] });
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const invalid = Object.keys(validateSearch(search)).length > 0;

  const results = useMemo(() => applyFilters(rooms, search, f, availability), [rooms, search, f, availability]);
  const activeCount = f.categories.length + f.amenities.length + (f.minRating ? 1 : 0) + (f.maxPrice < 12000 ? 1 : 0) + (f.hideSoldOut ? 1 : 0) + (f.q ? 1 : 0);
  const reset = () => { setF(DEFAULT_FILTERS); setSearch({ destination: "" }); };

  const filters = (
    <div className="filters">
      <div className="filters-head"><h3><SlidersHorizontal size={17} /> Filters</h3>{activeCount > 0 && <button className="text-btn" onClick={() => setF(DEFAULT_FILTERS)}>Clear all</button>}</div>
      <div className="filter-group"><h4>Keyword</h4><div className="inline-search"><Search size={15} /><input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="Room or hotel name" /></div></div>
      <div className="filter-group"><h4>Room type</h4>{CATEGORIES.map((c) => <label className="check" key={c}><input type="checkbox" checked={f.categories.includes(c)} onChange={() => toggle("categories", c)} />{c}</label>)}</div>
      <div className="filter-group"><h4>Max price / night <b>{money(f.maxPrice)}</b></h4><input type="range" min="3000" max="12000" step="500" value={f.maxPrice} onChange={(e) => set({ maxPrice: Number(e.target.value) })} aria-label="Maximum price per night" /></div>
      <div className="filter-group"><h4>Guest rating</h4><div className="chip-row">{[[0, "Any"], [4.5, "4.5+"], [4.7, "4.7+"], [4.9, "4.9"]].map(([v, l]) => <button key={l} className={"chip" + (f.minRating === v ? " selected" : "")} onClick={() => set({ minRating: v })}>{l}</button>)}</div></div>
      <div className="filter-group"><h4>Amenities</h4>{AMENITY_OPTIONS.slice(0, 8).map((a) => <label className="check" key={a}><input type="checkbox" checked={f.amenities.includes(a)} onChange={() => toggle("amenities", a)} />{a}</label>)}</div>
      <div className="filter-group"><label className="check"><input type="checkbox" checked={f.hideSoldOut} onChange={(e) => set({ hideSoldOut: e.target.checked })} />Hide sold-out rooms</label></div>
    </div>
  );

  return (
    <div className="container page">
      <Breadcrumbs items={[["Home", "/"], ["Available rooms"]]} />
      <div className="results-search"><SearchBar variant="compact" /></div>
      <div className="summary-pills">
        <span><MapPin size={14} /> {search.destination || "All destinations"}</span>
        <span><CalendarDays size={14} /> {fmtDay(search.checkIn)} → {fmtDay(search.checkOut)}{nights > 0 && ` · ${plural(nights, "night")}`}</span>
        <span><Users size={14} /> {plural(Number(search.guests), "guest")}</span>
      </div>
      {invalid && <div className="alert alert-warn" role="alert">Your saved dates are no longer valid. Update the search above to see accurate availability.</div>}
      <div className="results-layout">
        <aside className="filter-panel">{filters}</aside>
        <div>
          <div className="results-bar">
            <p><b>{results.length}</b> {results.length === 1 ? "room" : "rooms"} available{search.destination && <> in “{search.destination}”</>}</p>
            <div className="results-actions">
              <button className="btn btn-outline btn-small filter-toggle" onClick={() => setDrawer(true)}><SlidersHorizontal size={15} /> Filters{activeCount > 0 && ` (${activeCount})`}</button>
              <select value={f.sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort results">
                <option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option>
              </select>
            </div>
          </div>
          {results.length
            ? <div className="room-grid room-grid-2">{results.map((r) => <RoomCard key={r.id} room={r} showTotal />)}</div>
            : <EmptyState icon={Search} title="No rooms match these criteria" text="Try another destination, fewer guests or relax your filters.">
                <button className="btn btn-primary" onClick={reset}>Reset search & filters</button><Link to="/" className="btn btn-outline">Back to home</Link></EmptyState>}
        </div>
      </div>
      {drawer && <div className="drawer-backdrop" onClick={() => setDrawer(false)}><div className="drawer" onClick={(e) => e.stopPropagation()}><button className="icon-btn drawer-close" onClick={() => setDrawer(false)} aria-label="Close filters"><X /></button>{filters}<button className="btn btn-primary btn-wide" onClick={() => setDrawer(false)}>Show {results.length} rooms</button></div></div>}
    </div>
  );
}
