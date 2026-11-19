import React, { useEffect, useRef, useState } from "react";
import { Building2, ClipboardList, LayoutDashboard, UserRound, Menu, X, Search, HelpCircle, Heart, ChevronDown, Mail, Phone, MapPin } from "lucide-react";
import { Link, navigate } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { BRAND } from "../config.js";
import { initials } from "../lib/utils.js";
import { DESTINATIONS } from "../data/rooms.js";

export const Logo = ({ light }) => (
  <Link to="/" className={"brand" + (light ? " brand-light" : "")} aria-label={`${BRAND.name} home`}>
    <span className="brand-mark"><Building2 size={20} aria-hidden /></span>
    <span className="brand-text"><b>Blissful<i>Hotels</i></b><small>{BRAND.tagline}</small></span>
  </Link>
);

const NAV = [["", "Explore", Building2, "/"], ["search", "Rooms", Search, "/search"], ["bookings", "My bookings", ClipboardList, "/bookings"], ["admin", "Admin", LayoutDashboard, "/admin"], ["help", "Help", HelpCircle, "/help"]];

export function Header({ section }) {
  const { profile, bookings, saved } = useStore();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const active = bookings.filter((b) => b.status === "Confirmed").length;
  useEffect(() => { setOpen(false); setMenu(false); }, [section]);
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <header className="topbar">
      <div className="container nav-wrap">
        <Logo />
        <nav className={"nav-links" + (open ? " open" : "")} aria-label="Main">
          {NAV.map(([id, label, Icon, to]) => (
            <Link key={id} to={to} className={"nav-link" + (section === id || (id === "search" && section === "rooms") ? " active" : "")}>
              <Icon size={17} aria-hidden />{label}{id === "bookings" && active > 0 && <span className="count">{active}</span>}
            </Link>
          ))}
        </nav>
        <div className="nav-right">
          <div className="user-menu" ref={menuRef}>
            <button className="user-btn" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-haspopup="menu">
              <span className="avatar">{initials(profile.name)}</span><span className="user-label">{profile.name.split(" ")[0]}</span><ChevronDown size={15} aria-hidden />
            </button>
            {menu && (
              <div className="dropdown" role="menu">
                <div className="dropdown-head"><b>{profile.name}</b><small>{profile.email}</small></div>
                <Link to="/profile" role="menuitem"><UserRound size={16} /> Profile & settings</Link>
                <Link to="/profile/saved" role="menuitem"><Heart size={16} /> Saved stays {saved.length > 0 && <span className="count">{saved.length}</span>}</Link>
                <Link to="/bookings" role="menuitem"><ClipboardList size={16} /> My bookings</Link>
                <Link to="/admin" role="menuitem"><LayoutDashboard size={16} /> Admin dashboard</Link>
              </div>
            )}
          </div>
          <button className="icon-btn mobile-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { setSearch, notify } = useStore();
  const [email, setEmail] = useState("");
  const subscribe = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return notify("Please enter a valid email address.", "error");
    notify("Thanks! You're subscribed to travel offers."); setEmail("");
  };
  const goCity = (city) => { setSearch({ destination: city }); navigate("/search"); };
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-about">{BRAND.system}. Compare rooms, book in minutes and manage every stay in one place.</p>
          <p className="footer-contact"><Mail size={15} /> {BRAND.supportEmail}</p>
          <p className="footer-contact"><Phone size={15} /> {BRAND.supportPhone}</p>
        </div>
        <div><h4>Explore</h4><Link to="/">Home</Link><Link to="/search">All rooms</Link><Link to="/profile/saved">Saved stays</Link><Link to="/help">Help centre</Link></div>
        <div><h4>Destinations</h4>{DESTINATIONS.map((d) => <a key={d.city} href="#/search" onClick={(e) => { e.preventDefault(); goCity(d.city); }}><MapPin size={13} /> {d.city}</a>)}</div>
        <div><h4>Account</h4><Link to="/bookings">My bookings</Link><Link to="/profile">Profile & settings</Link><Link to="/admin">Admin dashboard</Link>
          <form className="newsletter" onSubmit={subscribe} noValidate><label htmlFor="nl">Travel offers</label><div><input id="nl" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" /><button className="btn btn-accent btn-small">Join</button></div></form>
        </div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} {BRAND.name} · {BRAND.system}</span><span>Frontend demo — no real payments are processed.</span></div>
    </footer>
  );
}
