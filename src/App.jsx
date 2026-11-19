import React from "react";
import { Compass } from "lucide-react";
import { StoreProvider } from "./store.jsx";
import { Link, useRoute } from "./lib/router.jsx";
import { Footer, Header } from "./components/Layout.jsx";
import { EmptyState, Toast } from "./components/ui.jsx";
import Home from "./pages/Home.jsx";
import Results from "./pages/Results.jsx";
import RoomDetails from "./pages/RoomDetails.jsx";
import Booking from "./pages/Booking.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Admin from "./pages/Admin.jsx";
import Profile from "./pages/Profile.jsx";
import Help from "./pages/Help.jsx";

function Router() {
  const { segs } = useRoute();
  const [s0 = "", s1] = segs;
  let page;
  if (s0 === "") page = <Home />;
  else if (s0 === "search") page = <Results />;
  else if (s0 === "rooms" && s1) page = <RoomDetails id={s1} />;
  else if (s0 === "book" && s1) page = <Booking id={s1} />;
  else if (s0 === "confirmation" && s1) page = <Confirmation id={s1} />;
  else if (s0 === "bookings") page = <MyBookings />;
  else if (s0 === "admin") page = <Admin tab={s1 || ""} />;
  else if (s0 === "profile") page = <Profile tab={s1 || ""} />;
  else if (s0 === "help") page = <Help />;
  else page = <div className="container page"><EmptyState icon={Compass} title="Page not found" text="The page you're looking for doesn't exist."><Link to="/" className="btn btn-primary">Back to home</Link></EmptyState></div>;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}>Skip to content</a>
      <Header section={s0 === "book" || s0 === "confirmation" ? "rooms" : s0} />
      <main id="main" tabIndex={-1} key={segs.join("/")}>{page}</main>
      <Footer /><Toast />
    </div>
  );
}
export default function App() { return <StoreProvider><Router /></StoreProvider>; }
