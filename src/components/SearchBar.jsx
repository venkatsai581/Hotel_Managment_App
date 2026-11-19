import React, { useEffect, useState } from "react";
import { MapPin, CalendarDays, Users, Search } from "lucide-react";
import { useStore } from "../store.jsx";
import { navigate } from "../lib/router.jsx";
import { addDays, nightsBetween, plural, today, validateSearch } from "../lib/utils.js";
import { MAX_GUESTS } from "../config.js";
import { Field } from "./ui.jsx";

export default function SearchBar({ variant = "hero", onSearched }) {
  const { search, setSearch, rooms, notify } = useStore();
  const [d, setD] = useState(search);
  const [errors, setErrors] = useState({});
  useEffect(() => setD(search), [search]);

  const set = (patch) => {
    const next = { ...d, ...patch };
    // Keep check-out valid when check-in moves past it.
    if (patch.checkIn && next.checkOut <= patch.checkIn) next.checkOut = addDays(1, new Date(patch.checkIn + "T00:00:00"));
    setD(next); setErrors({});
  };
  const places = [...new Set(rooms.flatMap((r) => [r.city, r.area]))];
  const nights = nightsBetween(d.checkIn, d.checkOut);

  const submit = (e) => {
    e.preventDefault();
    const errs = validateSearch(d);
    setErrors(errs);
    if (Object.keys(errs).length) { notify(Object.values(errs)[0], "error"); return; }
    setSearch({ ...d, destination: d.destination.trim() });
    onSearched ? onSearched() : navigate("/search");
  };

  return (
    <form className={"search-bar search-" + variant} onSubmit={submit} noValidate>
      <Field label="Destination" error={errors.destination}>
        <span className="input-icon"><MapPin size={17} aria-hidden /><input list="places" value={d.destination} onChange={(e) => set({ destination: e.target.value })} placeholder="City, area or hotel" /></span>
        <datalist id="places">{places.map((p) => <option key={p} value={p} />)}</datalist>
      </Field>
      <Field label="Check-in" error={errors.checkIn}>
        <span className="input-icon"><CalendarDays size={17} aria-hidden /><input type="date" min={today()} value={d.checkIn} onChange={(e) => set({ checkIn: e.target.value })} /></span>
      </Field>
      <Field label="Check-out" error={errors.checkOut} hint={nights > 0 ? plural(nights, "night") : undefined}>
        <span className="input-icon"><CalendarDays size={17} aria-hidden /><input type="date" min={d.checkIn || today()} value={d.checkOut} onChange={(e) => set({ checkOut: e.target.value })} /></span>
      </Field>
      <Field label="Guests" error={errors.guests}>
        <span className="input-icon"><Users size={17} aria-hidden />
          <select value={d.guests} onChange={(e) => set({ guests: Number(e.target.value) })}>
            {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{plural(n, "guest")}</option>)}
          </select></span>
      </Field>
      <button type="submit" className="btn btn-accent search-submit"><Search size={18} aria-hidden /> {variant === "hero" ? "Search stays" : "Update"}</button>
    </form>
  );
}
