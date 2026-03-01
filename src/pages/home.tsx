import type { ComponentType, ReactNode } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";

export function HomePage() {
  const { products, loading } = useProducts();

  const featured = products.filter((product) => product.featured).slice(0, 4);
  const latest = products.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Tienda online
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Nueva experiencia de compra moderna y minimalista.
            </h1>
            <p className="max-w-xl text-base text-slate-600">
              Rediseñamos la tienda desde cero para que puedas descubrir,
              comprar y seguir tus pedidos en menos pasos, manteniendo el mismo
              stack y la misma base de datos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/products">Explorar catálogo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/track" className="inline-flex items-center gap-2">
                  Seguir pedido <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Feature icon={Sparkles} title="Catálogo limpio">
              Diseño sobrio con foco en producto, precio y stock real.
            </Feature>
            <Feature icon={Truck} title="Checkout unificado">
              Flujo rápido con entrega a domicilio o retiro en tienda.
            </Feature>
            <Feature icon={ShieldCheck} title="Estado y gestión">
              Seguimiento público para clientes y panel admin para operaciones.
            </Feature>
          </div>
        </div>
      </section>

      <Section
        title="Destacados"
        description="Selección curada con los productos más elegidos."
        loading={loading}
      >
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Section>

      <Section
        title="Novedades"
        description="Ingresos recientes sincronizados desde la base de datos."
        loading={loading}
      >
        {latest.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 inline-flex rounded-lg bg-white p-2 text-slate-700 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
  );
}

function Section({
  title,
  description,
  children,
  loading,
}: {
  title: string;
  description: string;
  children: ReactNode;
  loading: boolean;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/products">Ver todo</Link>
        </Button>
      </div>
      {loading ? (
        <div className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          Cargando productos...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{children}</div>
      )}
    </section>
  );
}
