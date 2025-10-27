import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TITLE_MAP = [
  { test: (p) => p === "/", title: "Dblue Store – Toko Digital Murah" },
  { test: (p) => p.startsWith("/admin"), title: "Admin Panel · Dblue Store" },
  { test: (p) => p.startsWith("/edit/"), title: "Edit Produk · Dblue Store" },
  { test: (p) => p.startsWith("/products/"), title: "Detail Produk · Dblue Store" },
];

export default function TitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const found = TITLE_MAP.find((r) => r.test(pathname));
    document.title = found ? found.title : "Dblue Store";
  }, [pathname]);

  const found = TITLE_MAP.find((r) => r.test(pathname));
  const title = found ? found.title : "Dblue Store";

  return <title>{title}</title>;
}
