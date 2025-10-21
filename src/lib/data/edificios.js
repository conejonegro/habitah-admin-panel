import { getDb } from "@/lib/firebase";

export async function listEdificiosBasic() {
  const db = await getDb();
  const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
  const snap = await getDocs(query(collection(db, "edificios"), orderBy("nombre")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data?.() || d.data()) }));
}

