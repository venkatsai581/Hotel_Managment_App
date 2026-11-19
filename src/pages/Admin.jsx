import React, { useMemo, useState } from "react";
import { BedDouble, ClipboardList, LayoutDashboard, CheckCircle2, XCircle, IndianRupee, Plus, Pencil, Trash2, Eye, Search, Hotel, RotateCcw, Ban, Undo2 } from "lucide-react";
import { Link } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { EmptyState, Field, Modal, PageHeader, SafeImage, StatusBadge } from "../components/ui.jsx";
import { BookingDetailModal, CancelBookingModal, ConfirmModal } from "../components/BookingModals.jsx";
import { AMENITY_OPTIONS, CATEGORIES, initialRooms } from "../data/rooms.js";
import { fmtDate, money, plural } from "../lib/utils.js";

const TABS = [["", "Overview", LayoutDashboard], ["rooms", "Rooms & pricing", BedDouble], ["bookings", "Bookings", ClipboardList]];
const blank = { name: "", hotel: "", city: "", area: "", price: "", guests: 2, units: 3, category: "Deluxe", beds: "1 King Bed", size: "350 sq ft", image: "", description: "", amenities: ["Free Wi-Fi", "Air conditioning"], active: true };

export default function Admin({ tab = "" }) {
  return (
    <div className="container page">
      <PageHeader eyebrow="Property control centre" title="Admin dashboard" text="Manage rooms, pricing and guest bookings.">
        <span className="pill"><span className="dot" /> Demo admin</span>
      </PageHeader>
      <div className="tabs tabs-lg" role="tablist">{TABS.map(([k, l, I]) => <Link key={k} to={k ? `/admin/${k}` : "/admin"} className={tab === k ? "on" : ""} role="tab" aria-selected={tab === k}><I size={16} />{l}</Link>)}</div>
      {tab === "rooms" ? <RoomsTab /> : tab === "bookings" ? <BookingsTab /> : <Overview />}
    </div>
  );
}

function Overview() {
  const { rooms, bookings, resetDemo } = useStore();
  const confirmed = bookings.filter((b) => b.status === "Confirmed");
  const cancelled = bookings.filter((b) => b.status === "Cancelled");
  const revenue = confirmed.reduce((s, b) => s + b.total, 0);
  const byCity = useMemo(() => {
    const m = {}; confirmed.forEach((b) => { m[b.city] = (m[b.city] || 0) + b.total; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [confirmed]);
  const max = Math.max(1, ...byCity.map((c) => c[1]));
  const stats = [[IndianRupee, "Sample revenue", money(revenue)], [CheckCircle2, "Confirmed", confirmed.length], [XCircle, "Cancelled", cancelled.length], [Hotel, "Active rooms", `${rooms.filter((r) => r.active).length}/${rooms.length}`]];
  return (
    <>
      <div className="stats-grid">{stats.map(([I, l, v]) => <div className="stat-card" key={l}><span className="stat-icon"><I size={20} /></span><div><small>{l}</small><b>{v}</b></div></div>)}</div>
      <div className="two-col">
        <section className="card"><h2>Revenue by city</h2>
          {byCity.length ? <div className="bars">{byCity.map(([c, v]) => <div key={c}><span>{c}</span><div className="bar"><i style={{ width: `${(v / max) * 100}%` }} /></div><b>{money(v)}</b></div>)}</div>
            : <p className="muted">No confirmed bookings yet.</p>}
        </section>
        <section className="card"><div className="card-head"><h2>Recent bookings</h2><Link to="/admin/bookings" className="link-arrow">View all</Link></div>
          {bookings.length ? <ul className="recent">{bookings.slice(0, 5).map((b) => <li key={b.id}><div><b>{b.name}</b><small>{b.roomName} · {fmtDate(b.checkIn)}</small></div><StatusBadge status={b.status} /></li>)}</ul> : <p className="muted">No bookings yet.</p>}
        </section>
      </div>
      <div className="danger-zone card"><div><b>Reset demo data</b><small>Restore the original sample rooms and bookings.</small></div><button className="btn btn-outline btn-small" onClick={() => window.confirm("Reset all demo data?") && resetDemo()}><RotateCcw size={15} /> Reset demo data</button></div>
    </>
  );
}

function RoomsTab() {
  const { rooms, saveRoom, deleteRoom, notify } = useStore();
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [q, setQ] = useState("");
  const list = rooms.filter((r) => `${r.name} ${r.hotel} ${r.city}`.toLowerCase().includes(q.toLowerCase()));

  const setPrice = (r, v) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 500 || n > 100000) return notify("Price must be between ₹500 and ₹1,00,000.", "error");
    if (n !== r.price) { saveRoom({ ...r, price: Math.round(n) }); notify(`${r.name} is now ${money(n)} / night.`); }
  };
  return (
    <>
      <div className="toolbar">
        <div className="inline-search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rooms" aria-label="Search rooms" /></div>
        <button className="btn btn-primary" onClick={() => setEdit({ ...blank })}><Plus size={16} /> Add room</button>
      </div>
      {list.length ? (
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Room</th><th>Location</th><th>Price / night</th><th>Guests</th><th>Units</th><th>Listed</th><th>Actions</th></tr></thead>
          <tbody>{list.map((r) => (
            <tr key={r.id}>
              <td data-label="Room"><div className="cell-room"><SafeImage src={r.image} alt="" /><div><b>{r.name}</b><small>{r.hotel} · {r.category}</small></div></div></td>
              <td data-label="Location">{r.area}, {r.city}</td>
              <td data-label="Price"><span className="price-input">₹<input key={r.price} type="number" defaultValue={r.price} min="500" aria-label={`Price for ${r.name}`} onBlur={(e) => setPrice(r, e.target.value)} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} /></span></td>
              <td data-label="Guests">{r.guests}</td>
              <td data-label="Units">{r.units}</td>
              <td data-label="Listed"><label className="switch"><input type="checkbox" role="switch" checked={r.active} aria-label={`List ${r.name}`} onChange={(e) => { saveRoom({ ...r, active: e.target.checked }); notify(`${r.name} ${e.target.checked ? "is now listed" : "was hidden from guests"}.`); }} /><span /></label></td>
              <td data-label="Actions"><div className="btn-row"><button className="icon-btn" title="Edit room" aria-label={`Edit ${r.name}`} onClick={() => setEdit({ ...r })}><Pencil size={16} /></button><button className="icon-btn danger" title="Delete room" aria-label={`Delete ${r.name}`} onClick={() => setDel(r)}><Trash2 size={16} /></button></div></td>
            </tr>))}</tbody>
        </table></div>
      ) : <EmptyState icon={BedDouble} title="No rooms found" text={q ? "Try a different search." : "Add your first room to the catalogue."}><button className="btn btn-primary" onClick={() => setEdit({ ...blank })}>Add room</button></EmptyState>}
      {edit && <RoomForm initial={edit} onClose={() => setEdit(null)} />}
      {del && <ConfirmModal title="Delete this room?" danger confirmLabel="Delete room" onConfirm={() => { deleteRoom(del.id); notify("Room removed from catalogue."); setDel(null); }} onClose={() => setDel(null)}><p><b>{del.name}</b> ({del.hotel}) will be removed from the catalogue. Existing bookings are kept.</p></ConfirmModal>}
    </>
  );
}

function RoomForm({ initial, onClose }) {
  const { saveRoom, notify } = useStore();
  const isNew = !initial.id;
  const [f, setF] = useState({ ...initial, price: String(initial.price) });
  const [e, setE] = useState({});
  const set = (p) => { setF({ ...f, ...p }); setE({}); };
  const toggleA = (a) => set({ amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] });
  const submit = (ev) => {
    ev.preventDefault();
    const x = {};
    if (f.name.trim().length < 3) x.name = "Enter a room name.";
    if (f.hotel.trim().length < 2) x.hotel = "Enter the hotel name.";
    if (f.city.trim().length < 2) x.city = "Enter the city.";
    const p = Number(f.price);
    if (!Number.isFinite(p) || p < 500 || p > 100000) x.price = "Price must be ₹500–₹1,00,000.";
    if (!(Number(f.units) >= 1 && Number(f.units) <= 50)) x.units = "Units must be 1–50.";
    if (f.image && !/^https?:\/\//i.test(f.image)) x.image = "Image must be a full http(s) URL.";
    setE(x);
    if (Object.keys(x).length) return notify(Object.values(x)[0], "error");
    saveRoom({ ...f, id: f.id ?? Date.now(), name: f.name.trim(), hotel: f.hotel.trim(), city: f.city.trim(), area: f.area.trim() || f.city.trim(), price: Math.round(p), guests: Number(f.guests), units: Number(f.units), image: f.image.trim() || initialRooms[0].image, rating: f.rating ?? 4.5, reviews: f.reviews ?? 0, amenities: f.amenities.length ? f.amenities : ["Free Wi-Fi"], description: f.description.trim() || "A comfortable room for a relaxed stay." });
    notify(isNew ? "Room added to the catalogue." : "Room updated."); onClose();
  };
  return (
    <Modal title={isNew ? "Add a room" : "Edit room"} onClose={onClose} wide footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" form="room-form" type="submit">{isNew ? "Add room" : "Save changes"}</button></>}>
      <form id="room-form" onSubmit={submit} noValidate className="form-grid cols-2">
        <Field label="Room name *" error={e.name} full><input value={f.name} onChange={(ev) => set({ name: ev.target.value })} placeholder="e.g. Premier King Room" /></Field>
        <Field label="Hotel *" error={e.hotel}><input value={f.hotel} onChange={(ev) => set({ hotel: ev.target.value })} /></Field>
        <Field label="City *" error={e.city}><input value={f.city} onChange={(ev) => set({ city: ev.target.value })} /></Field>
        <Field label="Area"><input value={f.area} onChange={(ev) => set({ area: ev.target.value })} /></Field>
        <Field label="Price per night (₹) *" error={e.price}><input type="number" min="500" value={f.price} onChange={(ev) => set({ price: ev.target.value })} /></Field>
        <Field label="Category"><select value={f.category} onChange={(ev) => set({ category: ev.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Max guests"><select value={f.guests} onChange={(ev) => set({ guests: ev.target.value })}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select></Field>
        <Field label="Rooms available (units)" error={e.units}><input type="number" min="1" max="50" value={f.units} onChange={(ev) => set({ units: ev.target.value })} /></Field>
        <Field label="Bedding"><input value={f.beds} onChange={(ev) => set({ beds: ev.target.value })} /></Field>
        <Field label="Room size"><input value={f.size} onChange={(ev) => set({ size: ev.target.value })} /></Field>
        <Field label="Image URL" error={e.image} full hint="Leave blank to use a default photo"><input value={f.image} onChange={(ev) => set({ image: ev.target.value })} placeholder="https://…" /></Field>
        <Field label="Description" full><textarea rows="3" value={f.description} onChange={(ev) => set({ description: ev.target.value })} /></Field>
        <fieldset className="field full amenity-pick"><legend className="field-label">Amenities</legend>{AMENITY_OPTIONS.map((a) => <label key={a} className="check"><input type="checkbox" checked={f.amenities.includes(a)} onChange={() => toggleA(a)} />{a}</label>)}</fieldset>
      </form>
    </Modal>
  );
}

function BookingsTab() {
  const { bookings, rooms, setBookingStatus, deleteBooking, availability, notify } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState(null);
  const [cancel, setCancel] = useState(null);
  const [del, setDel] = useState(null);
  const list = bookings.filter((b) => (status === "All" || b.status === status) && `${b.id} ${b.name} ${b.email} ${b.roomName} ${b.hotel}`.toLowerCase().includes(q.toLowerCase()));

  const reinstate = (b) => {
    const room = rooms.find((r) => r.id === b.roomId);
    if (room && availability(room, b.checkIn, b.checkOut) === 0) return notify("Cannot reinstate — the room is now sold out for those dates.", "error");
    setBookingStatus(b.id, "Confirmed"); notify(`Booking ${b.id} reinstated.`);
  };
  return (
    <>
      <div className="toolbar">
        <div className="inline-search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guest, reference or room" aria-label="Search bookings" /></div>
        <div className="chip-row">{["All", "Confirmed", "Cancelled"].map((s) => <button key={s} className={"chip" + (status === s ? " selected" : "")} onClick={() => setStatus(s)}>{s} <span className="chip-count">{s === "All" ? bookings.length : bookings.filter((b) => b.status === s).length}</span></button>)}</div>
      </div>
      {list.length ? (
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>Reference</th><th>Guest</th><th>Room</th><th>Dates</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{list.map((b) => (
            <tr key={b.id}>
              <td data-label="Reference"><b>{b.id}</b></td>
              <td data-label="Guest">{b.name}<small>{b.email}</small></td>
              <td data-label="Room">{b.roomName}<small>{b.hotel}</small></td>
              <td data-label="Dates">{fmtDate(b.checkIn)}<small>to {fmtDate(b.checkOut)} · {plural(b.nights, "night")}</small></td>
              <td data-label="Total">{money(b.total)}</td>
              <td data-label="Status"><StatusBadge status={b.status} /></td>
              <td data-label="Actions"><div className="btn-row">
                <button className="icon-btn" title="View" aria-label={`View ${b.id}`} onClick={() => setView(b)}><Eye size={16} /></button>
                {b.status === "Confirmed" ? <button className="icon-btn danger" title="Cancel booking" aria-label={`Cancel ${b.id}`} onClick={() => setCancel(b)}><Ban size={16} /></button>
                  : <button className="icon-btn" title="Reinstate booking" aria-label={`Reinstate ${b.id}`} onClick={() => reinstate(b)}><Undo2 size={16} /></button>}
                <button className="icon-btn danger" title="Delete record" aria-label={`Delete ${b.id}`} onClick={() => setDel(b)}><Trash2 size={16} /></button></div></td>
            </tr>))}</tbody>
        </table></div>
      ) : <EmptyState icon={ClipboardList} title={bookings.length ? "No bookings match" : "No bookings to manage yet"} text={bookings.length ? "Try a different search or status filter." : "New guest bookings will appear here."}>{bookings.length ? <button className="btn btn-outline" onClick={() => { setQ(""); setStatus("All"); }}>Clear filters</button> : <Link to="/search" className="btn btn-primary">Create a booking</Link>}</EmptyState>}
      {view && !cancel && <BookingDetailModal booking={view} onClose={() => setView(null)} onCancel={() => setCancel(view)} />}
      {cancel && <CancelBookingModal booking={cancel} onClose={() => setCancel(null)} onConfirm={() => { setBookingStatus(cancel.id, "Cancelled"); notify(`Booking ${cancel.id} cancelled.`); setCancel(null); setView(null); }} />}
      {del && <ConfirmModal title="Delete booking record?" danger confirmLabel="Delete" onConfirm={() => { deleteBooking(del.id); notify("Booking record deleted."); setDel(null); }} onClose={() => setDel(null)}><p>Permanently remove booking <b>{del.id}</b> for {del.name}?</p></ConfirmModal>}
    </>
  );
}
