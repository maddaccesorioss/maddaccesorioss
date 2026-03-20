import { httpsCallable } from "firebase/functions";
import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, functions } from "@/lib/firebase";

export type ProductSlugViewStat = {
  slug: string;
  count: number;
  lastViewedAtMs: number;
};

export type LoyaltyHistoryEntry = {
  id: string;
  orderId: string;
  orderNumber: string;
  type: "earned" | "redeemed";
  points: number;
  status: "pending" | "credited" | "redeemed";
  dateMs: number;
  label: string;
};

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  whatsappNumber: string;
  favoriteProductIds: string[];
  productSlugViews: ProductSlugViewStat[];
  loyaltyPoints: number;
  loyaltyHistory: LoyaltyHistoryEntry[];
  role: "admin" | "customer";
  isBlocked: boolean;
  createdAtMs: number;
};

const normalizePhoneForLink = (value: string) => value.replace(/[^\d]/g, "");

const usersCollection = collection(db, "users");
const ordersCollection = collection(db, "orders");

const timestampToMillis = (value: unknown) => {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis?.() ?? 0;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const getLoyaltyHistory = async (
  userId: string,
): Promise<LoyaltyHistoryEntry[]> => {
  const ordersSnapshot = await getDocs(
    query(
      ordersCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ),
  );

  return ordersSnapshot.docs
    .flatMap((orderDoc) => {
      const data = orderDoc.data() as Record<string, unknown>;
      const loyalty = (data.loyalty ?? {}) as Record<string, unknown>;
      const orderNumber = String(data.orderNumber ?? orderDoc.id);
      const pointsEarned = Math.max(0, Number(loyalty.pointsEarned ?? 0));
      const redeemedPoints = Math.max(0, Number(loyalty.redeemedPoints ?? 0));
      const history: LoyaltyHistoryEntry[] = [];
      const paidAtMs = timestampToMillis(loyalty.paidAt);
      const creditedAtMs = timestampToMillis(loyalty.creditedAt);
      const createdAtMs = timestampToMillis(data.createdAt);
      const loyaltyStatus =
        loyalty.status === "credited" ? "credited" : "pending";

      if (pointsEarned > 0) {
        history.push({
          id: `${orderDoc.id}-earned`,
          orderId: orderDoc.id,
          orderNumber,
          type: "earned",
          points: pointsEarned,
          status: loyaltyStatus,
          dateMs: creditedAtMs || paidAtMs || createdAtMs,
          label:
            loyaltyStatus === "credited"
              ? "Puntos acreditados"
              : "Puntos pendientes por acreditar",
        });
      }

      if (redeemedPoints > 0) {
        history.push({
          id: `${orderDoc.id}-redeemed`,
          orderId: orderDoc.id,
          orderNumber,
          type: "redeemed",
          points: redeemedPoints,
          status: "redeemed",
          dateMs: createdAtMs,
          label: "Puntos usados en la compra",
        });
      }

      return history;
    })
    .sort((left, right) => right.dateMs - left.dateMs);
};

export const fetchAdminUsers = async () => {
  const snapshot = await getDocs(
    query(usersCollection, orderBy("createdAt", "desc")),
  );

  return Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const role = data.role === "admin" ? "admin" : "customer";
      const isBlocked = data.isBlocked === true;
      const favoriteProductIds = Array.isArray(data.favoriteProductIds)
        ? data.favoriteProductIds.filter(
            (item): item is string => typeof item === "string",
          )
        : [];

      const productViewsSnapshot = await getDocs(
        collection(docSnap.ref, "productSlugViews"),
      );

      const productSlugViews = productViewsSnapshot.docs
        .map((viewDoc) => {
          const viewData = viewDoc.data() as Record<string, unknown>;

          return {
            slug: String(viewData.slug ?? viewDoc.id),
            count: Number(viewData.count ?? 0),
            lastViewedAtMs: timestampToMillis(viewData.updatedAt),
          } satisfies ProductSlugViewStat;
        })
        .sort((a, b) => b.count - a.count);

      const loyaltyHistory = await getLoyaltyHistory(docSnap.id);

      return {
        id: docSnap.id,
        email: String(data.email ?? "Sin email"),
        displayName: String(data.displayName ?? "Sin nombre"),
        whatsappNumber: String(data.whatsappNumber ?? ""),
        favoriteProductIds,
        productSlugViews,
        loyaltyPoints: Math.max(0, Number(data.loyaltyPoints ?? 0)),
        loyaltyHistory,
        role,
        isBlocked,
        createdAtMs: timestampToMillis(data.createdAt),
      } satisfies AdminUser;
    }),
  );
};

export const makeUserAdmin = async (uid: string) => {
  const makeAdmin = httpsCallable(functions, "setUserAdminRole");
  await makeAdmin({ uid });
};

export const toWhatsAppLink = (phone: string) =>
  `https://wa.me/${normalizePhoneForLink(phone)}`;

export const setUserBlockedStatus = async (uid: string, blocked: boolean) => {
  const setBlockedStatus = httpsCallable(functions, "setUserBlockedStatus");
  await setBlockedStatus({ uid, blocked });
};
