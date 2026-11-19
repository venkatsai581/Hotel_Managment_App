import React from "react";
import { BedDouble, Users, ArrowRight } from "lucide-react";
import { Link } from "../lib/router.jsx";
import { useStore } from "../store.jsx";
import { money, nightsBetween, plural, priceBreakdown } from "../lib/utils.js";
import { SafeImage, Rating, SaveButton, amenityIcon } from "./ui.jsx";

export default function RoomCard({ room, showTotal = false }) {
  const { search, availability } = useStore();
  const left = availability(room);
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const soldOut = left === 0;
  const tooSmall = showTotal && room.guests < Number(search.guests);
  return (
    <article className={"room-card" + (soldOut ? " is-soldout" : "")}>
      <Link to={`/rooms/${room.id}`} className="room-photo" aria-label={`View ${room.name}`}>
        <SafeImage src={room.image} alt={room.name} />
        <span className="photo-tag">{room.category}</span>
        {soldOut ? <span className="stock stock-out">Sold out</span> : showTotal && left <= 2 && <span className="stock stock-low">Only {left} left</span>}
      </Link>
      <SaveButton id={room.id} />
      <div className="room-info">
        <div className="room-title-row">
          <div><p className="eyebrow">{room.hotel} · {room.city}</p><h3><Link to={`/rooms/${room.id}`}>{room.name}</Link></h3></div>
          <Rating value={room.rating} />
        </div>
        <div className="room-meta"><span><BedDouble size={15} aria-hidden />{room.beds}</span><span><Users size={15} aria-hidden />Up to {room.guests}</span></div>
        <ul className="amenities">{room.amenities.slice(0, 3).map((a) => <li key={a}>{amenityIcon(a, 14)}{a}</li>)}</ul>
        <div className="room-bottom">
          <div>
            <strong>{money(room.price)}</strong><small> / night</small>
            {showTotal && nights > 0 && <p className="total-hint">{money(priceBreakdown(room.price, nights).total)} for {plural(nights, "night")} incl. taxes</p>}
          </div>
          {soldOut || tooSmall
            ? <Link className="btn btn-ghost btn-small" to={`/rooms/${room.id}`}>{soldOut ? "Unavailable" : "Sleeps " + room.guests}</Link>
            : <Link className="btn btn-primary btn-small" to={`/rooms/${room.id}`}>View room <ArrowRight size={15} aria-hidden /></Link>}
        </div>
      </div>
    </article>
  );
}
