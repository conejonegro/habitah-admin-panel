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
        console.log("Error loading tickets:", e);
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
    <div className="w-full max-w-none px-16 text-[16px] text-black space-y-6 bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-base text-black hover:underline"
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
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 text-black placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-black">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-black">Título</th>
              <th className="px-4 py-3 text-left font-medium text-black">Categoría</th>
              <th className="px-4 py-3 text-left font-medium text-black">Prioridad</th>
              <th className="px-4 py-3 text-left font-medium text-black">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-black">Usuario</th>
              <th className="px-4 py-3 text-left font-medium text-black">Creado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-black" colSpan={7}>
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-black" colSpan={7}>
                  No hay tickets.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-black">{t.titulo || t.id}</td>
                  <td className="px-4 py-3 text-black">{t.categoria || "—"}</td>
                  <td className="px-4 py-3 text-black">{t.prioridad || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-base text-black">
                      {t.status || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black">{t.userName || t.userEmail || "—"}</td>
                  <td className="px-4 py-3 text-black">{formatDate(t.fechaCreacion)}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      className="text-black hover:underline"
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
