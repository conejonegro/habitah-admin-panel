"use client";

import { useEffect, useMemo, useState } from "react";
import { getDb } from "@/lib/firebase";

export default function InquilinosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = await getDb();
        const { collection, getDocs, orderBy, query, limit, where } = await import(
          "firebase/firestore"
        );
        const snap = await getDocs(
          query(
            collection(db, "usuarios"),
            // Solo activos primero; si no existe el campo, igual listará todo
            // Puedes quitar `where` si prefieres ver todos.
            // where("activo", "==", true),
            orderBy("nombre"),
            limit(100)
          )
        );
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (active) setItems(rows);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const displayValue = (v) => {
    if (!v) return "—";
    // Si es referencia de Firestore, usa su id o path
    if (typeof v === "object") {
      // Firestore DocumentReference suele tener `.id` y `.path`
      const id = v.id || v.path || v._key?.path?.segments?.join("/");
      return id || "—";
    }
    return String(v);
  };

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return items;
    return items.filter((u) =>
      [u.nombre, u.email, displayValue(u.edificioRef), u.depaId, u.uId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [items, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 hover:underline"
          >
            <span aria-hidden>←</span>
            Volver
          </a>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <input
              type="search"
              placeholder="Buscar inquilinos..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
            />
          </div>
          <a
            href="/inquilinos/nuevo"
            className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 text-base font-medium hover:bg-emerald-700"
          >
            + Nuevo inquilino
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Edificio</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Depa</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Cuota mensual</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">uId</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-base text-gray-500" colSpan={6}>
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-base text-gray-500" colSpan={6}>
                  No hay inquilinos.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 text-base font-medium">{u.nombre || "—"}</td>
                  <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">{u.email || "—"}</td>
                  <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">{displayValue(u.edificioRef)}</td>
                  <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">{u.depaId || "—"}</td>
                  <td className="px-4 py-3 text-base">{u.cuotaMensual != null ? `$${u.cuotaMensual}` : "—"}</td>
                  <td className="px-4 py-3 text-base text-gray-500">{u.uId || u.id}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
