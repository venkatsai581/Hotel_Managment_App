import React, { useState } from "react";
import { UserRound, Settings, Heart, CheckCircle2, Sparkles, Trash2 } from "lucide-react";
import { Link } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { EmptyState, Field, PageHeader } from "../components/ui.jsx";
import RoomCard from "../components/RoomCard.jsx";
import { initials, validateGuest, firstError } from "../lib/utils.js";

const TABS = [["", "Personal info", UserRound], ["preferences", "Preferences", Settings], ["saved", "Saved stays", Heart]];

export default function Profile({ tab = "" }) {
  const { profile, setProfile, settings, setSettings, saved, rooms, bookings, notify, resetDemo } = useStore();
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState({});
  const savedRooms = rooms.filter((r) => saved.includes(r.id));

  const save = (e) => {
    e.preventDefault();
    const errs = validateGuest(form);
    setErrors(errs);
    if (Object.keys(errs).length) return notify(firstError(errs), "error");
    setProfile({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    notify("Profile saved.");
  };
  const toggle = (k, label) => (v) => { setSettings({ ...settings, [k]: v }); notify(`${label} ${v ? "enabled" : "disabled"}.`); };
  const Switch = ({ k, title, text }) => (
    <div className="settings-row"><div><b>{title}</b><small>{text}</small></div>
      <label className="switch"><input type="checkbox" role="switch" checked={!!settings[k]} onChange={(e) => toggle(k, title)(e.target.checked)} aria-label={title} /><span /></label></div>
  );

  return (
    <div className="container page">
      <PageHeader eyebrow="Your account" title="Profile & settings" text="Manage your details, preferences and saved stays." />
      <div className="profile-layout">
        <aside className="profile-side">
          <div className="profile-card"><span className="profile-avatar">{initials(profile.name)}</span><h3>{profile.name}</h3><p>{profile.email}</p><span className="member-label"><Sparkles size={14} /> Bissful Hotels member</span>
            <div className="profile-stats"><div><b>{bookings.length}</b><small>Bookings</small></div><div><b>{saved.length}</b><small>Saved</small></div></div></div>
          <nav className="side-nav" aria-label="Profile sections">{TABS.map(([k, l, I]) => <Link key={k} to={k ? `/profile/${k}` : "/profile"} className={tab === k ? "on" : ""}><I size={17} />{l}</Link>)}</nav>
        </aside>
        <div>
          {tab === "" && (
            <form className="card" onSubmit={save} noValidate>
              <h2>Personal information</h2>
              <div className="form-grid">
                <Field label="Full name" error={errors.name} full><input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({}); }} /></Field>
                <Field label="Email address" error={errors.email}><input type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({}); }} /></Field>
                <Field label="Phone number" error={errors.phone}><input value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({}); }} /></Field>
                <Field label="Home city" full><input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Hyderabad" /></Field>
              </div>
              <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => { setForm(profile); setErrors({}); }}>Reset</button><button className="btn btn-primary" type="submit">Save changes <CheckCircle2 size={16} /></button></div>
            </form>
          )}
          {tab === "preferences" && (
            <div className="card">
              <h2>Notifications & preferences</h2>
              <Switch k="bookingUpdates" title="Booking updates" text="Confirmation and cancellation messages" />
              <Switch k="smsAlerts" title="SMS alerts" text="Check-in reminders on your phone" />
              <Switch k="offers" title="Offers & recommendations" text="Deals matched to your favourite destinations" />
              <div className="danger-zone"><div><b>Reset demo data</b><small>Restores sample rooms and bookings, and clears saved stays.</small></div><button className="btn btn-danger-outline btn-small" onClick={() => { if (window.confirm("Reset all demo data on this device?")) resetDemo(); }}><Trash2 size={15} /> Reset</button></div>
            </div>
          )}
          {tab === "saved" && (savedRooms.length
            ? <div className="room-grid room-grid-2">{savedRooms.map((r) => <RoomCard key={r.id} room={r} />)}</div>
            : <EmptyState icon={Heart} title="No saved stays yet" text="Tap the heart on any room to keep it here for later."><Link to="/search" className="btn btn-primary">Browse rooms</Link></EmptyState>)}
        </div>
      </div>
    </div>
  );
}
