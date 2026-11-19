import React, { useEffect, useState } from "react";

const parse = () => {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const path = raw.split("?")[0];
  return { path, segs: path.split("/").filter(Boolean) };
};

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const navigate = (to) => { window.location.hash = to; };
export function Link({ to, children, ...rest }) {
  return <a href={"#" + to} {...rest}>{children}</a>;
}
