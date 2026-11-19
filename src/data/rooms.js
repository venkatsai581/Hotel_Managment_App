const IMG = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const HERO_IMAGE = IMG("photo-1600210492486-724fe5c67fb0", 2000);

export const AMENITY_OPTIONS = [
  "Free Wi-Fi", "Breakfast", "Air conditioning", "Smart TV", "Pool access", "Sea view",
  "City view", "Balcony", "Work desk", "Kitchenette", "Living area", "Free parking",
  "Gym access", "Room service",
];
export const CATEGORIES = ["Classic", "Deluxe", "Executive", "Premium", "Suite", "Family"];

export const initialRooms = [
  { id: 1, name: "Deluxe King Room", hotel: "Banjara Grand Hotel", city: "Hyderabad", area: "Banjara Hills", price: 5499, rating: 4.9, reviews: 248, beds: "1 King Bed", guests: 2, size: "340 sq ft", category: "Deluxe", units: 4, active: true, image: IMG("photo-1611892440504-42a792e24d32"), amenities: ["Free Wi-Fi", "Breakfast", "Air conditioning", "Smart TV", "Work desk"], description: "A calm, spacious room with warm finishes, a king bed and a thoughtfully designed work area. Ideal for business travellers and couples alike." },
  { id: 2, name: "Executive Twin Room", hotel: "Banjara Grand Hotel", city: "Hyderabad", area: "Banjara Hills", price: 6299, rating: 4.8, reviews: 182, beds: "2 Twin Beds", guests: 3, size: "390 sq ft", category: "Executive", units: 3, active: true, image: IMG("photo-1590490360182-c33d57733427"), amenities: ["Free Wi-Fi", "Breakfast", "City view", "Work desk", "Gym access"], description: "A flexible stay with twin beds, generous space, executive lounge access and quick connections across the city." },
  { id: 3, name: "Garden View Suite", hotel: "Indiranagar Garden Hotel", city: "Bengaluru", area: "Indiranagar", price: 8999, rating: 4.9, reviews: 126, beds: "1 King Bed", guests: 3, size: "560 sq ft", category: "Suite", units: 2, active: true, image: IMG("photo-1618221195710-dd6b41faaea6"), amenities: ["Free Wi-Fi", "Pool access", "Breakfast", "Balcony", "Room service"], description: "A light-filled suite overlooking a peaceful garden, with a separate sitting area. Ideal for a longer city break." },
  { id: 4, name: "Ocean Breeze Room", hotel: "Candolim Beach Resort", city: "Goa", area: "Candolim", price: 7299, rating: 4.7, reviews: 204, beds: "1 Queen Bed", guests: 2, size: "420 sq ft", category: "Premium", units: 3, active: true, image: IMG("photo-1571896349842-33c89424de2d"), amenities: ["Free Wi-Fi", "Pool access", "Sea view", "Breakfast", "Free parking"], description: "A relaxed coastal room with bright interiors, a private sit-out and an easy walk to the beach." },
  { id: 5, name: "Classic Comfort Room", hotel: "T. Nagar Residency", city: "Chennai", area: "T. Nagar", price: 3899, rating: 4.6, reviews: 98, beds: "1 Queen Bed", guests: 2, size: "300 sq ft", category: "Classic", units: 5, active: true, image: IMG("photo-1566665797739-1674de7a421a"), amenities: ["Free Wi-Fi", "Air conditioning", "Smart TV", "Free parking"], description: "A comfortable, practical room with all the essentials for a smooth stay, close to shopping and transit." },
  { id: 6, name: "Family Residence", hotel: "HITEC Lakeside Suites", city: "Hyderabad", area: "HITEC City", price: 9999, rating: 4.8, reviews: 156, beds: "1 King + 2 Twin", guests: 4, size: "680 sq ft", category: "Family", units: 2, active: true, image: IMG("photo-1600607687939-ce8a6c25118c"), amenities: ["Free Wi-Fi", "Kitchenette", "Breakfast", "Living area", "Free parking"], description: "A generous family residence with a separate living space, kitchenette and room for everyone." },
];

// Gallery = the room's own photo plus two others from the catalogue.
export function galleryFor(room) {
  const others = initialRooms.filter((r) => r.image !== room.image).map((r) => r.image);
  const i = Math.abs(Number(room.id) || 0) % others.length;
  return [room.image, others[i], others[(i + 2) % others.length]];
}

export const DESTINATIONS = [
  { city: "Hyderabad", blurb: "Pearls, palaces & tech hubs", image: initialRooms[0].image },
  { city: "Bengaluru", blurb: "Gardens, cafés & startups", image: initialRooms[2].image },
  { city: "Goa", blurb: "Beaches & slow evenings", image: initialRooms[3].image },
  { city: "Chennai", blurb: "Temples, coast & culture", image: initialRooms[4].image },
];

export const REVIEWS = [
  { name: "Ananya Iyer", city: "Chennai", text: "Booking took under two minutes and the room was exactly as pictured. Check-in was effortless." },
  { name: "Rohan Verma", city: "Pune", text: "Loved being able to compare rooms by price and amenities. Cancelling a plan change was just one click." },
  { name: "Meera Nair", city: "Kochi", text: "Clean, quiet and great value. The booking summary made it easy to share details with my family." },
];

export const FAQS = [
  ["How do I book a room?", "Search by destination, dates and guests, open a room you like and choose Reserve. Fill in guest details and confirm — you will get a booking reference instantly."],
  ["Can I cancel my booking?", "Yes. Open My Bookings and choose Cancel. Free cancellation applies up to 48 hours before check-in; after that the first night is retained (sample policy)."],
  ["Do I need to pay online?", "No. This is a frontend demo, so no payment is collected and no card details are requested."],
  ["Where is my booking data stored?", "Bookings, profile and preferences are saved in your browser's local storage on this device. Clearing site data resets the demo."],
  ["Can I change dates after booking?", "Cancel the existing booking and create a new one for the new dates. Rooms are shown as available only when units are free for your selected nights."],
];

export function seedBookings(today) {
  const d = (n) => { const x = new Date(today); x.setDate(x.getDate() + n); return fmtLocal(x); };
  const mk = (id, room, inD, outD, guests, name, email, phone, status) => {
    const nights = outD - inD;
    const sub = room.price * nights;
    return { id, roomId: room.id, roomName: room.name, hotel: room.hotel, city: room.city, image: room.image, checkIn: d(inD), checkOut: d(outD), nights, guests, subtotal: sub, taxes: Math.round(sub * 0.12), total: sub + Math.round(sub * 0.12), name, email, phone, special: "", status, createdAt: new Date(today.getTime() - 86400000 * 3).toISOString() };
  };
  return [
    mk("SH2026041", initialRooms[2], 12, 15, 2, "Kavya Reddy", "kavya.reddy@gmail.com", "+91 98480 11223", "Confirmed"),
    mk("SH2026042", initialRooms[3], 25, 28, 2, "Imran Sheikh", "imran.sheikh@outlook.com", "+91 99890 44556", "Confirmed"),
    mk("SH2026043", initialRooms[0], 6, 8, 1, "Suresh Kumar", "suresh.kumar@gmail.com", "+91 90000 33445", "Cancelled"),
  ];
}
export function fmtLocal(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
