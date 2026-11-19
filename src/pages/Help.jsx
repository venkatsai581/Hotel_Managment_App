import React, { useState } from "react";
import { ChevronDown, Mail, Phone, Send } from "lucide-react";
import { Link } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { FAQS } from "../data/rooms.js";
import { BRAND } from "../config.js";
import { Field, PageHeader } from "../components/ui.jsx";

export default function Help() {
  const { notify, profile } = useStore();
  const [open, setOpen] = useState(0);
  const [f, setF] = useState({ name: profile.name, email: profile.email, message: "" });
  const [err, setErr] = useState({});
  const send = (e) => {
    e.preventDefault();
    const x = {};
    if (f.name.trim().length < 2) x.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) x.email = "Enter a valid email.";
    if (f.message.trim().length < 10) x.message = "Please write at least 10 characters.";
    setErr(x);
    if (Object.keys(x).length) return notify(Object.values(x)[0], "error");
    notify("Message sent. We'll reply within one business day."); setF({ ...f, message: "" });
  };
  return (
    <div className="container page">
      <PageHeader eyebrow="Help centre" title="How can we help?" text="Answers to common questions, or get in touch with our team." />
      <div className="help-layout">
        <div className="card faq">
          <h2>Frequently asked questions</h2>
          {FAQS.map(([q, a], i) => (
            <div key={q} className={"faq-item" + (open === i ? " open" : "")}>
              <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{q}<ChevronDown size={18} /></button>
              {open === i && <p>{a}</p>}
            </div>
          ))}
          <p className="muted">Looking for your reservation? <Link to="/bookings">Go to My bookings</Link></p>
        </div>
        <form className="card" onSubmit={send} noValidate>
          <h2>Contact us</h2>
          <p className="footer-contact"><Mail size={15} /> {BRAND.supportEmail}</p><p className="footer-contact"><Phone size={15} /> {BRAND.supportPhone}</p>
          <div className="form-grid">
            <Field label="Your name" error={err.name} full><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Email" error={err.email} full><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Message" error={err.message} full><textarea rows="4" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="How can we help?" /></Field>
          </div>
          <button className="btn btn-primary btn-wide" type="submit"><Send size={16} /> Send message</button>
        </form>
      </div>
    </div>
  );
}
