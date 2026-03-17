import { doc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const incrementUserProductSlugView = async (uid: string, slug: string) => {
  const normalizedSlug = slug.trim();

  if (!uid || !normalizedSlug) {
    return;
  }

  await setDoc(
    doc(db, "users", uid, "productSlugViews", normalizedSlug),
    {
      slug: normalizedSlug,
      count: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};
