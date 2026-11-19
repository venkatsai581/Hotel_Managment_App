import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { KEY } from "./config.js";
import { initialRooms, seedBookings } from "./data/rooms.js";
import { addDays, priceBreakdown, nightsBetween, read, unitsLeft, write } from "./lib/utils.js";

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const defaultProfile = { name: "Ketha Venkata Sai Krishna", email: "vsk@gmail.com", phone: "+91 98765 43210", city: "Hyderabad" };
const defaultSettings = { bookingUpdates: true, offers: false, smsAlerts: true, currency: "INR" };
const defaultSearch = () => ({ destination: "", checkIn: addDays(1), checkOut: addDays(3), guests: 2 });

export function StoreProvider({ children }) {
  const [rooms, setRooms] = useState(() => read(KEY("rooms"), initialRooms));
  const [bookings, setBookings] = useState(() => read(KEY("bookings"), null) ?? seedBookings(new Date()));
  const [profile, setProfile] = useState(() => read(KEY("profile"), defaultProfile));
  const [settings, setSettings] = useState(() => read(KEY("settings"), defaultSettings));
  const [saved, setSaved] = useState(() => read(KEY("saved"), []));
  const [search, setSearchRaw] = useState(() => {
    const s = read(KEY("search"), null) || defaultSearch();
    // Roll stale stored dates forward so the form never opens with past dates.
    return s.checkIn < addDays(0) ? defaultSearch() : s;
  });
  const [toast, setToast] = useState(null);

  useEffect(() => write(KEY("rooms"), rooms), [rooms]);
  useEffect(() => write(KEY("bookings"), bookings), [bookings]);
  useEffect(() => write(KEY("profile"), profile), [profile]);
  useEffect(() => write(KEY("settings"), settings), [settings]);
  useEffect(() => write(KEY("saved"), saved), [saved]);
  useEffect(() => write(KEY("search"), search), [search]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = useCallback((message, type = "success") => setToast({ message, type, id: Date.now() }), []);
  const setSearch = useCallback((patch) => setSearchRaw((s) => ({ ...s, ...patch })), []);

  const createBooking = useCallback((room, guest, trip) => {
    const nights = nightsBetween(trip.checkIn, trip.checkOut);
    const { subtotal, taxes, total } = priceBreakdown(room.price, nights);
    const booking = {
      id: "SH" + Date.now().toString().slice(-8), roomId: room.id, roomName: room.name, hotel: room.hotel, city: room.city, image: room.image,
      checkIn: trip.checkIn, checkOut: trip.checkOut, nights, guests: Number(trip.guests), subtotal, taxes, total,
      name: guest.name.trim(), email: guest.email.trim(), phone: guest.phone.trim(), special: (guest.special || "").trim(),
      status: "Confirmed", createdAt: new Date().toISOString(),
    };
    setBookings((p) => [booking, ...p]);
    return booking;
  }, []);

  const setBookingStatus = useCallback((id, status) => {
    setBookings((p) => p.map((b) => (b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b)));
  }, []);
  const deleteBooking = useCallback((id) => setBookings((p) => p.filter((b) => b.id !== id)), []);

  const saveRoom = useCallback((room) => {
    setRooms((p) => (p.some((r) => r.id === room.id) ? p.map((r) => (r.id === room.id ? room : r)) : [room, ...p]));
  }, []);
  const deleteRoom = useCallback((id) => setRooms((p) => p.filter((r) => r.id !== id)), []);
  const toggleSaved = useCallback((id) => {
    setSaved((p) => {
      const on = p.includes(id);
      notify(on ? "Removed from saved stays." : "Saved to your stays.");
      return on ? p.filter((x) => x !== id) : [...p, id];
    });
  }, [notify]);

  const resetDemo = useCallback(() => {
    setRooms(initialRooms); setBookings(seedBookings(new Date())); setSaved([]); setSearchRaw(defaultSearch());
    notify("Demo data has been reset.");
  }, [notify]);

  const availability = useCallback((room, ci = search.checkIn, co = search.checkOut) => unitsLeft(room, bookings, ci, co), [bookings, search.checkIn, search.checkOut]);

  const value = useMemo(() => ({
    rooms, bookings, profile, settings, saved, search, toast,
    setProfile, setSettings, setSearch, notify, setToast, createBooking, setBookingStatus, deleteBooking,
    saveRoom, deleteRoom, toggleSaved, resetDemo, availability,
  }), [rooms, bookings, profile, settings, saved, search, toast, setSearch, notify, createBooking, setBookingStatus, deleteBooking, saveRoom, deleteRoom, toggleSaved, resetDemo, availability]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
