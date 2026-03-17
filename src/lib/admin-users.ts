import { httpsCallable } from "firebase/functions";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db, functions } from "@/lib/firebase";

export type ProductSlugViewStat = {
  slug: string;
  count: number;
  lastViewedAtMs: number;
};

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  whatsappNumber: string;
  favoriteProductIds: string[];
  productSlugViews: ProductSlugViewStat[];
  role: "admin" | "customer";
  isBlocked: boolean;
  createdAtMs: number;
};

const normalizePhoneForLink = (value: string) => value.replace(/[^\d]/g, "");

const usersCollection = collection(db, "users");

export const fetchAdminUsers = async () => {
  const snapshot = await getDocs(
    query(usersCollection, orderBy("createdAt", "desc")),
  );

  return Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      const createdAt = data.createdAt as { toMillis?: () => number } | undefined;
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
          const updatedAt = viewData.updatedAt as
            | { toMillis?: () => number }
            | undefined;

          return {
            slug: String(viewData.slug ?? viewDoc.id),
            count: Number(viewData.count ?? 0),
            lastViewedAtMs: updatedAt?.toMillis?.() ?? 0,
          } satisfies ProductSlugViewStat;
        })
        .sort((a, b) => b.count - a.count);

      return {
        id: docSnap.id,
        email: String(data.email ?? "Sin email"),
        displayName: String(data.displayName ?? "Sin nombre"),
        whatsappNumber: String(data.whatsappNumber ?? ""),
        favoriteProductIds,
        productSlugViews,
        role,
        isBlocked,
        createdAtMs: createdAt?.toMillis?.() ?? 0,
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
