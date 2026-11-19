import React, { useMemo, useState } from "react";
import { CalendarDays, Users, Plus, ClipboardList, Search, X, Eye, RotateCcw } from "lucide-react";
import { Link } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { EmptyState, PageHeader, SafeImage, StatusBadge } from "../components/ui.jsx";
import { BookingDetailModal, CancelBookingModal } from "../components/BookingModals.jsx";
import { fmtDate, money, plural, today } from "../lib/utils.js";

const TABS = [["all", "All"], ["upcoming", "Upcoming"], ["past", "Past"], ["cancelled", "Cancelled"]];
const kind = (b) => (b.status === "Cancelled" ? "cancelled" : b.checkOut < today() ? "past" : "upcoming");

export default function MyBookings() {
  const { bookings, setBookingStatus, notify } = useStore();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [viewing, setViewing] = useState(null);

  const counts = useMemo(() => Object.fromEntries(TABS.map(([k]) => [k, k === "all" ? bookings.length : bookings.filter((b) => kind(b) === k).length])), [bookings]);
  const list = bookings.filter((b) => (tab === "all" || kind(b) === tab) && (!q || `${b.id} ${b.hotel} ${b.roomName} ${b.city}`.toLowerCase().includes(q.toLowerCase())));

  const confirmCancel = () => { setBookingStatus(cancelling.id, "Cancelled"); notify(`Booking ${cancelling.id} has been cancelled.`); setCancelling(null); setViewing(null); };

  return (
    <div className="container page">
      <PageHeader eyebrow="Your travel plans" title="My bookings" text="View, manage or cancel your stays."><Link to="/search" className="btn btn-primary"><Plus size={16} /> New booking</Link></PageHeader>
      <div className="toolbar">
        <div className="tabs" role="tablist">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}<span>{counts[k]}</span></button>)}</div>
        <div className="inline-search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by reference or hotel" aria-label="Search bookings" />{q && <button className="icon-btn" onClick={() => setQ("")} aria-label="Clear search"><X size={14} /></button>}</div>
      </div>
      {list.length ? (
        <div className="booking-list">
          {list.map((b) => (
            <article className="booking-item" key={b.id}>
              <SafeImage src={b.image} alt={b.roomName} />
              <div className="booking-main">
                <div className="booking-title"><div><p className="eyebrow">{b.hotel} · {b.city}</p><h3>{b.roomName}</h3></div><StatusBadge status={b.status} /></div>
                <div className="booking-meta"><span><CalendarDays size={15} />{fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}</span><span><Users size={15} />{plural(b.guests, "guest")}</span><span>Ref <b>{b.id}</b></span></div>
                <div className="booking-actions">
                  <p className="booking-total">{money(b.total)} <small>· {plural(b.nights, "night")}</small></p>
                  <div className="btn-row">
                    <button className="btn btn-outline btn-small" onClick={() => setViewing(b)}><Eye size={15} /> Details</button>
                    {kind(b) === "upcoming" && <button className="btn btn-danger-outline btn-small" onClick={() => setCancelling(b)}><X size={15} /> Cancel</button>}
                    {kind(b) !== "upcoming" && <Link to={`/rooms/${b.roomId}`} className="btn btn-ghost btn-small"><RotateCcw size={15} /> Book again</Link>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No bookings yet" text="Your confirmed stays will appear here."><Link to="/search" className="btn btn-primary">Find a stay</Link></EmptyState>
      ) : (
        <EmptyState icon={Search} title="Nothing to show here" text={q ? `No bookings match “${q}”.` : `You have no ${tab} bookings.`}><button className="btn btn-outline" onClick={() => { setQ(""); setTab("all"); }}>Show all bookings</button></EmptyState>
      )}
      {cancelling && <CancelBookingModal booking={cancelling} onConfirm={confirmCancel} onClose={() => setCancelling(null)} />}
      {viewing && !cancelling && <BookingDetailModal booking={viewing} onClose={() => setViewing(null)} onCancel={kind(viewing) === "upcoming" ? () => setCancelling(viewing) : undefined} />}
    </div>
  );
}
