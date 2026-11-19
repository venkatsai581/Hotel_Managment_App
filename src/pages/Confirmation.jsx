import React from "react";
import { CheckCircle2, CalendarPlus, Printer, Copy, ArrowRight, MapPin, Users, Search } from "lucide-react";
import { Link } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { EmptyState, SafeImage, StatusBadge } from "../components/ui.jsx";
import { downloadICS, fmtDate, money, plural } from "../lib/utils.js";
import { Stepper } from "./Booking.jsx";

export default function Confirmation({ id }) {
  const { bookings, notify } = useStore();
  const b = bookings.find((x) => x.id === id);
  if (!b) return <div className="container page"><EmptyState icon={Search} title="Booking not found" text="We couldn't find that booking reference on this device."><Link to="/bookings" className="btn btn-primary">Go to My bookings</Link></EmptyState></div>;
  const copy = async () => { try { await navigator.clipboard.writeText(b.id); notify("Reference copied."); } catch { notify("Could not copy automatically.", "error"); } };
  const cancelled = b.status === "Cancelled";
  return (
    <div className="container page narrow">
      <Stepper step={3} />
      <div className="confirm-card">
        <span className={"success-icon" + (cancelled ? " muted-icon" : "")}><CheckCircle2 size={44} /></span>
        <p className="eyebrow">{cancelled ? "This booking was cancelled" : "You're all set"}</p>
        <h1>{cancelled ? "Booking cancelled" : `Thank you, ${b.name.split(" ")[0]}!`}</h1>
        <p className="muted">{cancelled ? "No further action is needed." : `Your stay is confirmed. A confirmation would be sent to ${b.email} in a live system.`}</p>
        <div className="ref-box"><span>Booking reference</span><b>{b.id}</b><button className="icon-btn" onClick={copy} aria-label="Copy reference"><Copy size={16} /></button></div>
        <div className="confirm-details">
          <SafeImage src={b.image} alt={b.roomName} />
          <div>
            <StatusBadge status={b.status} />
            <h3>{b.roomName}</h3>
            <p><MapPin size={14} /> {b.hotel}, {b.city}</p>
            <p><Users size={14} /> {plural(b.guests, "guest")} · {plural(b.nights, "night")}</p>
            <p>{fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}</p>
          </div>
        </div>
        <div className="price-lines">
          <div><span>Room charges</span><b>{money(b.subtotal ?? b.total)}</b></div>
          {b.taxes != null && <div><span>Taxes & fees</span><b>{money(b.taxes)}</b></div>}
          <div className="total"><span>Total (sample)</span><b>{money(b.total)}</b></div>
        </div>
        <div className="confirm-actions">
          <Link to="/bookings" className="btn btn-primary">View my bookings <ArrowRight size={16} /></Link>
          {!cancelled && <button className="btn btn-outline" onClick={() => downloadICS(b)}><CalendarPlus size={16} /> Add to calendar</button>}
          <button className="btn btn-outline" onClick={() => window.print()}><Printer size={16} /> Print</button>
          <Link to="/" className="btn btn-ghost">Explore more stays</Link>
        </div>
      </div>
    </div>
  );
}
