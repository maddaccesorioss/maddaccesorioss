import { ShoppingBag } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/products", label: "Catálogo" },
  { to: "/track", label: "Seguimiento" },
  { to: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const count = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.qty, 0),
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Tienda Minimal
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "text-slate-900" : "transition hover:text-slate-900"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          <ShoppingBag className="h-4 w-4" />
          Carrito
          {count > 0 && (
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
