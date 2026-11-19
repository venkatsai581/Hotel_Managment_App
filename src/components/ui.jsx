import React, { useEffect, useState } from "react";
import { Wifi, Coffee, Waves, Tv, Snowflake, Eye, Briefcase, Car, Dumbbell, Sparkles, Star, CheckCircle2, AlertCircle, X, Utensils, Sofa, Building2, Bell, Heart } from "lucide-react";
import { Link } from "../lib/router.jsx";
import { useStore } from "../store.jsx";

const FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#0f3d45'/><stop offset='1' stop-color='#1f6f78'/></linearGradient></defs><rect width='1200' height='800' fill='url(#g)'/><g fill='none' stroke='#ffffff' stroke-opacity='.35' stroke-width='10'><rect x='420' y='300' width='360' height='220' rx='18'/><path d='M420 420h360M470 300v-50h110v50'/></g></svg>`);

export function SafeImage({ src, alt, ...rest }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  return <img src={bad || !src ? FALLBACK : src} alt={alt} loading="lazy" onError={() => setBad(true)} {...rest} />;
}

export function amenityIcon(name, size = 16) {
  const n = name.toLowerCase();
  const p = { size, "aria-hidden": true };
  if (n.includes("wi-fi") || n.includes("wifi")) return <Wifi {...p} />;
  if (n.includes("breakfast")) return <Coffee {...p} />;
  if (n.includes("pool") || n.includes("sea")) return <Waves {...p} />;
  if (n.includes("tv")) return <Tv {...p} />;
  if (n.includes("air")) return <Snowflake {...p} />;
  if (n.includes("view")) return <Eye {...p} />;
  if (n.includes("desk")) return <Briefcase {...p} />;
  if (n.includes("parking")) return <Car {...p} />;
  if (n.includes("gym")) return <Dumbbell {...p} />;
  if (n.includes("kitchen")) return <Utensils {...p} />;
  if (n.includes("living")) return <Sofa {...p} />;
  if (n.includes("balcony")) return <Building2 {...p} />;
  if (n.includes("service")) return <Bell {...p} />;
  return <Sparkles {...p} />;
}

export const Rating = ({ value, count }) => (
  <span className="rating"><Star size={14} fill="currentColor" aria-hidden /> {value}{count != null && <small> ({count})</small>}</span>
);

export const StatusBadge = ({ status }) => <span className={"badge badge-" + status.toLowerCase()}>{status}</span>;

export function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-icon"><Icon size={28} aria-hidden /></span>
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="empty-actions">{children}</div>
    </div>
  );
}

export function Field({ label, error, children, full, hint }) {
  return (
    <label className={"field" + (full ? " full" : "") + (error ? " has-error" : "")}>
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error" role="alert"><AlertCircle size={13} aria-hidden /> {error}</span>}
    </label>
  );
}

export function PageHeader({ eyebrow, title, text, children }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {text && <p className="muted">{text}</p>}
      </div>
      {children && <div className="page-head-actions">{children}</div>}
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map(([label, to], i) => (
        <React.Fragment key={label}>
          {i > 0 && <span aria-hidden>/</span>}
          {to ? <Link to={to}>{label}</Link> : <span aria-current="page">{label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={"modal" + (wide ? " modal-wide" : "")} role="dialog" aria-modal="true" aria-label={title}>
        <header><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></header>
        <div className="modal-body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </div>
  );
}

export function Toast() {
  const { toast, setToast } = useStore();
  if (!toast) return null;
  const Icon = toast.type === "error" ? AlertCircle : CheckCircle2;
  return (
    <div className={"toast toast-" + toast.type} role="status" aria-live="polite" key={toast.id}>
      <Icon size={18} aria-hidden /><span>{toast.message}</span>
      <button onClick={() => setToast(null)} aria-label="Dismiss"><X size={15} /></button>
    </div>
  );
}

export function SaveButton({ id, className = "" }) {
  const { saved, toggleSaved } = useStore();
  const on = saved.includes(id);
  return (
    <button className={`heart ${on ? "on" : ""} ${className}`} aria-pressed={on} aria-label={on ? "Remove from saved stays" : "Save this stay"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaved(id); }}>
      <Heart size={18} fill={on ? "currentColor" : "none"} />
    </button>
  );
}
