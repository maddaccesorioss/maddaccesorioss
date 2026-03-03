import { useEffect, useState } from "react";
import { OrderManagementSection } from "@/components/admin/order-management";
import { ProductManagementSection } from "@/components/admin/product-management";
import type {
  AdminOrder,
  AdminOrderStatus,
  ManualSaleInput,
  ManualSaleResult,
  SaveProductInput,
  SaveProductResult,
  StatusChangeResult,
} from "@/components/admin/types";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/types";

const initialOrders: AdminOrder[] = [
  {
    id: "ORD-1024",
    buyer: "Valentina R.",
    email: "valentina@example.com",
    items: [
      {
        productId: "p-a1",
        name: "Buzo Frizado",
        qty: 1,
        unitPrice: 28700,
      },
    ],
    total: 28700,
    status: "pending",
    note: "",
    createdAt: new Date().toISOString(),
    paymentMethod: "manual",
  },
  {
    id: "ORD-1025",
    buyer: "Lucía P.",
    email: "lucia@example.com",
    items: [
      {
        productId: "p-a2",
        name: "Remera Básica",
        qty: 2,
        unitPrice: 9600,
      },
    ],
    total: 19200,
    status: "paid",
    note: "Pago validado por transferencia.",
    createdAt: new Date().toISOString(),
    paymentMethod: "manual",
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export function AdminPage() {
  const { products, loading } = useProducts();
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);

  useEffect(() => {
    if (products.length > 0) {
      setAdminProducts(products);
    }
  }, [products]);

  const onSaveProduct = ({ id, values }: SaveProductInput): SaveProductResult => {
    if (!values.name.trim()) {
      return { ok: false, message: "El nombre es obligatorio." };
    }

    const price = Number(values.price);
    const stock = Number(values.stock);

    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, message: "El precio es inválido." };
    }

    if (!Number.isFinite(stock) || stock < 0) {
      return { ok: false, message: "El stock es inválido." };
    }

    if (id) {
      setAdminProducts((current) =>
        current.map((product) =>
          product.id === id
            ? {
                ...product,
                name: values.name.trim(),
                slug: values.slug || slugify(values.name),
                description: values.description,
                price,
                stock,
                categoryId: values.categoryId,
                badge: values.badge || undefined,
                isActive: values.isActive,
              }
            : product,
        ),
      );

      return { ok: true, message: "Producto actualizado con éxito." };
    }

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: values.name.trim(),
      slug: values.slug || slugify(values.name),
      description: values.description,
      price,
      currency: "ARS",
      categoryId: values.categoryId,
      featured: false,
      isActive: values.isActive,
      badge: values.badge || undefined,
      stock,
      images: [],
    };

    setAdminProducts((current) => [newProduct, ...current]);
    return { ok: true, message: "Producto creado con éxito." };
  };

  const onUpdateOrderStatus = (
    orderId: string,
    status: AdminOrderStatus,
  ): StatusChangeResult => {
    const existing = orders.find((order) => order.id === orderId);
    if (!existing) {
      return { ok: false, message: "No se encontró la orden." };
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );

    return { ok: true, message: `Estado actualizado a ${status}.` };
  };

  const onUpdateOrderNote = (orderId: string, note: string) => {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, note } : order)),
    );
  };

  const onCreateManualSale = ({
    buyer,
    email,
    productId,
    qty,
  }: ManualSaleInput): ManualSaleResult => {
    if (!buyer.trim() || !email.trim()) {
      return { ok: false, message: "Completá cliente y email." };
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      return { ok: false, message: "Cantidad inválida." };
    }

    const product = adminProducts.find((item) => item.id === productId);

    if (!product) {
      return { ok: false, message: "Producto no encontrado." };
    }

    if (product.stock < qty) {
      return { ok: false, message: "No hay stock suficiente." };
    }

    setAdminProducts((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, stock: item.stock - qty } : item,
      ),
    );

    const newOrder: AdminOrder = {
      id: `ORD-${Math.floor(Date.now() / 1000)}`,
      buyer: buyer.trim(),
      email: email.trim(),
      items: [
        {
          productId: product.id,
          name: product.name,
          qty,
          unitPrice: product.price,
        },
      ],
      total: product.price * qty,
      status: "paid",
      note: "Venta manual creada desde admin.",
      createdAt: new Date().toISOString(),
      paymentMethod: "manual",
    };

    setOrders((current) => [newOrder, ...current]);

    return { ok: true, message: "Venta manual registrada." };
  };

  return (
    <section className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold">Panel admin</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gestioná catálogo, stock, órdenes y ventas manuales.
        </p>
      </div>

      <ProductManagementSection
        products={adminProducts}
        loading={loading && adminProducts.length === 0}
        onSaveProduct={onSaveProduct}
      />

      <OrderManagementSection
        orders={orders}
        products={adminProducts}
        onUpdateOrderStatus={onUpdateOrderStatus}
        onUpdateOrderNote={onUpdateOrderNote}
        onCreateManualSale={onCreateManualSale}
      />
    </section>
  );
}
