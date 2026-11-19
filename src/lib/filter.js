export const DEFAULT_FILTERS = { q: "", categories: [], maxPrice: 12000, amenities: [], minRating: 0, sort: "recommended", hideSoldOut: false };

export function applyFilters(rooms, { destination = "", guests = 1 }, f, availability, { useGuests = true } = {}) {
  const dest = destination.trim().toLowerCase();
  const q = f.q.trim().toLowerCase();
  const text = (r) => `${r.name} ${r.hotel} ${r.city} ${r.area} ${r.category}`.toLowerCase();
  const list = rooms.filter((r) =>
    r.active &&
    (!dest || text(r).includes(dest)) &&
    (!q || text(r).includes(q)) &&
    (!useGuests || r.guests >= Number(guests)) &&
    r.price <= f.maxPrice &&
    r.rating >= f.minRating &&
    (!f.categories.length || f.categories.includes(r.category)) &&
    f.amenities.every((a) => r.amenities.includes(a)) &&
    (!f.hideSoldOut || availability(r) > 0));
  const by = {
    "price-low": (a, b) => a.price - b.price,
    "price-high": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    recommended: (a, b) => b.rating * Math.log(b.reviews + 2) - a.rating * Math.log(a.reviews + 2),
  };
  return list.sort(by[f.sort] || by.recommended);
}
