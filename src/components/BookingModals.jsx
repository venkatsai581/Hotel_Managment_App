import React from "react";
import { AlertTriangle, CalendarPlus, MapPin, Users, Phone, Mail, StickyNote } from "lucide-react";
import { Modal, SafeImage, StatusBadge } from "./ui.jsx";
import { downloadICS, fmtDate, money, plural } from "../lib/utils.js";

export function ConfirmModal({ title, children, confirmLabel = "Confirm", danger, onConfirm, onClose, cancelLabel = "Keep" }) {
  return (
    <Modal title={title} onClose={onClose} footer={<><button className="btn btn-outline" onClick={onClose}>{cancelLabel}</button><button className={"btn " + (danger ? "btn-danger" : "btn-primary")} onClick={onConfirm}>{confirmLabel}</button></>}>
      <div className="confirm-body"><span className={"warn-icon" + (danger ? " danger" : "")}><AlertTriangle size={22} /></span><div>{children}</div></div>
    </Modal>
  );
}

/** Sample refund rule: full refund if 48h+ before check-in, otherwise the first night is retained. */
export function refundInfo(b) {
  const hours = (new Date(b.checkIn + "T14:00:00") - new Date()) / 36e5;
  if (hours >= 48) return { free: true, refund: b.total, note: "Free cancellation applies — the full amount is refundable." };
  const firstNight = Math.round((b.subtotal ?? b.total) / b.nights * 1.12);
  return { free: false, refund: Math.max(0, b.total - firstNight), note: `Check-in is within 48 hours, so the first night (${money(firstNight)}) is retained.` };
}

export function CancelBookingModal({ booking, onConfirm, onClose }) {
  const r = refundInfo(booking);
  return (
    <ConfirmModal title="Cancel this booking?" danger confirmLabel="Yes, cancel booking" cancelLabel="Keep booking" onConfirm={onConfirm} onClose={onClose}>
      <p><b>{booking.roomName}</b> at {booking.hotel}<br />{fmtDate(booking.checkIn)} → {fmtDate(booking.checkOut)} · Ref {booking.id}</p>
      <p className={r.free ? "ok-text" : "warn-text"}>{r.note}</p>
      <p className="muted">Sample refund: <b>{money(r.refund)}</b>. This action cannot be undone.</p>
    </ConfirmModal>
  );
}

export function BookingDetailModal({ booking: b, onClose, onCancel }) {
  return (
    <Modal title={`Booking ${b.id}`} onClose={onClose} wide footer={<>
      {b.status === "Confirmed" && <button className="btn btn-outline" onClick={() => downloadICS(b)}><CalendarPlus size={16} /> Add to calendar</button>}
      {b.status === "Confirmed" && onCancel && <button className="btn btn-danger-outline" onClick={onCancel}>Cancel booking</button>}
      <button className="btn btn-primary" onClick={onClose}>Done</button></>}>
      <div className="detail-modal">
        <SafeImage src={b.image} alt={b.roomName} />
        <div>
          <StatusBadge status={b.status} />
          <h3>{b.roomName}</h3>
          <p><MapPin size={14} /> {b.hotel}, {b.city}</p>
          <p>{fmtDate(b.checkIn)} → {fmtDate(b.checkOut)} · {plural(b.nights, "night")} · <Users size={14} /> {plural(b.guests, "guest")}</p>
          <hr />
          <p><b>{b.name}</b></p>
          <p><Mail size={14} /> {b.email}</p>
          <p><Phone size={14} /> {b.phone}</p>
          {b.special && <p><StickyNote size={14} /> {b.special}</p>}
          <hr />
          <p>Total (sample): <b>{money(b.total)}</b></p>
          <small className="muted">Booked on {new Date(b.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</small>
        </div>
      </div>
    </Modal>
  );
}
