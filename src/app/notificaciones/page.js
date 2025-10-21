"use client";

import { useEffect, useMemo, useState } from "react";
import { getDb } from "@/lib/firebase";

export default function NotificacionesPage() {
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
            collection(db, "notificaciones"),
            orderBy("createdAt", "desc"),
            limit(50)
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
    if (typeof v === "object") {
      const id = v.id || v.path || v._key?.path?.segments?.join("/");
      return id || "—";
    }
    return String(v);
  };

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return items;
    return items.filter((n) =>
      [n.nombre, n.descripcion, displayValue(n.edificioRef), n.estado]
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
            placeholder="Buscar notificaciones..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 text-black placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-black">
            <tr>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Título</th>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Estado</th>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Alcance</th>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-base text-black" colSpan={5}>
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-base text-black" colSpan={5}>
                  No hay notificaciones.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-base font-medium text-black">{n.nombre}</td>
                  <td className="px-4 py-3 text-base">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-base text-black">
                      {n.estado || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base text-black">{displayValue(n.edificioRef)}</td>
                  <td className="px-4 py-3 text-base text-black">{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      className="text-base text-black hover:underline"
                      href={`/notificaciones/${n.id}`}
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
