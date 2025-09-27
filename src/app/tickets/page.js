"use client";

import { useEffect, useMemo, useState } from "react";
import { getDb } from "@/lib/firebase";

export default function TicketsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = await getDb();
        const { collection, getDocs, orderBy, query, limit } = await import(
          "firebase/firestore"
        );
        const snap = await getDocs(
          query(
            collection(db, "tickets_mantenimiento"),
            orderBy("fechaCreacion", "desc"),
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

  const formatDate = (ts) => {
    if (!ts) return "—";
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  };

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return items;
    return items.filter((t) =>
      [t.titulo, t.categoria, t.prioridad, t.status, t.userName, t.userEmail, t.id]
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
        <div className="relative max-w-sm">
          <input
            type="search"
            placeholder="Buscar tickets..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Título</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Categoría</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Prioridad</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Usuario</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Creado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-base text-gray-500" colSpan={7}>
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-base text-gray-500" colSpan={7}>
                  No hay tickets.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 text-base font-medium">{t.titulo || t.id}</td>
                  <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">{t.categoria || "—"}</td>
                  <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">{t.prioridad || "—"}</td>
                  <td className="px-4 py-3 text-base">
                    <span className="rounded-full bg-gray-100 dark:bg-gray-900 px-2 py-1 text-base">
                      {t.status || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">{t.userName || t.userEmail || "—"}</td>
                  <td className="px-4 py-3 text-base text-gray-600 dark:text-gray-400">{formatDate(t.fechaCreacion)}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      className="text-base text-gray-900 dark:text-gray-100 hover:underline"
                      href={`/tickets/${encodeURIComponent(t.id)}`}
                    >
                      Ver detalle
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

